import { DurableObject } from "cloudflare:workers";

import {
  applyLegalMove,
  clonePosition,
  createInitialBoard,
  createSnapshotBoard,
  getAllLegalMoves,
  initialCastlingRights,
  pickRandomMove,
  resolvePlayerMove,
} from "./chess/engine";
import type {
  GameSnapshot,
  GameState,
  RpcResult,
  StartGameInput,
  StartGameResponse,
  SubmitMoveInput,
  SubmitMoveResponse,
} from "./chess/types";
import { GameError, toRpcFailure } from "./errors";

interface Env {
  CHESS_GAME: DurableObjectNamespace<ChessGame>;
}

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });

const getBearerToken = (request: Request): string | null => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

const parseJson = async <T>(request: Request): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    throw new GameError(400, "invalid_json", "Request body must be valid JSON.");
  }
};

const unwrapRpc = <T>(result: RpcResult<T>): T => {
  if (!result.ok) {
    throw new GameError(result.error.status, result.error.code, result.error.message);
  }

  return result.data;
};

export class ChessGame extends DurableObject {
  private stateValue: GameState | null = null;
  private readonly stateReady: Promise<void>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.stateReady = this.loadState();
  }

  async initializeGame(input: StartGameInput): Promise<RpcResult<StartGameResponse>> {
    try {
      await this.stateReady;
      if (this.stateValue) {
        throw new GameError(409, "game_exists", "This game already exists.");
      }

      this.stateValue = {
        gameId: input.gameId,
        playerToken: input.playerToken,
        playerColor: "white",
        board: createInitialBoard(),
        turn: "white",
        status: "playing",
        winner: null,
        castlingRights: initialCastlingRights(),
        enPassantTarget: null,
        ply: 0,
        moveHistory: [],
        createdAt: input.now,
        updatedAt: input.now,
      };

      await this.persistState();

      return {
        ok: true,
        data: {
          playerToken: input.playerToken,
          snapshot: this.snapshot(),
        },
      };
    } catch (error) {
      return toRpcFailure(error);
    }
  }

  async getGame(playerToken: string): Promise<RpcResult<GameSnapshot>> {
    try {
      await this.stateReady;
      this.assertAuthorized(playerToken);
      return {
        ok: true,
        data: this.snapshot(),
      };
    } catch (error) {
      return toRpcFailure(error);
    }
  }

  async submitMove(playerToken: string, input: SubmitMoveInput): Promise<RpcResult<SubmitMoveResponse>> {
    try {
      await this.stateReady;
      this.assertAuthorized(playerToken);

      const state = this.requireState();

      if (state.status === "checkmate" || state.status === "stalemate" || state.status === "resigned") {
        throw new GameError(409, "game_over", "This game is already over.");
      }

      if (state.turn !== "white") {
        throw new GameError(409, "not_player_turn", "It is not the player's turn.");
      }

      if (typeof input.expectedPly === "number" && input.expectedPly !== state.ply) {
        throw new GameError(409, "stale_state", "The move was based on an outdated game state.");
      }

      const whiteMoves = getAllLegalMoves(state.board, "white", state.castlingRights, state.enPassantTarget);
      const playerMove = resolvePlayerMove(whiteMoves, input);
      if (!playerMove) {
        throw new GameError(400, "illegal_move", "That move is not legal in the current position.");
      }

      const afterPlayerMove = applyLegalMove(state.board, state.castlingRights, state.enPassantTarget, playerMove);
      const committedPlayerMove = afterPlayerMove.moveRecord;

      if (afterPlayerMove.status === "checkmate" || afterPlayerMove.status === "stalemate") {
        this.commitMove(afterPlayerMove, state.updatedAt);
        await this.persistState();
        return {
          ok: true,
          data: {
            snapshot: this.snapshot(),
            playerMove: committedPlayerMove,
            botMove: null,
          },
        };
      }

      const blackMoves = getAllLegalMoves(
        afterPlayerMove.board,
        "black",
        afterPlayerMove.castlingRights,
        afterPlayerMove.enPassantTarget,
      );
      const botMove = pickRandomMove(blackMoves);
      if (!botMove) {
        throw new GameError(500, "missing_bot_move", "The bot could not find a legal move.");
      }

      const afterBotMove = applyLegalMove(
        afterPlayerMove.board,
        afterPlayerMove.castlingRights,
        afterPlayerMove.enPassantTarget,
        botMove,
      );

      this.commitMove(afterPlayerMove, state.updatedAt);
      this.commitMove(afterBotMove, this.requireState().updatedAt);
      await this.persistState();

      return {
        ok: true,
        data: {
          snapshot: this.snapshot(),
          playerMove: committedPlayerMove,
          botMove: afterBotMove.moveRecord,
        },
      };
    } catch (error) {
      return toRpcFailure(error);
    }
  }

  private async loadState(): Promise<void> {
    this.stateValue = (await this.ctx.storage.get<GameState>("state")) ?? null;
  }

  private requireState(): GameState {
    if (!this.stateValue) {
      throw new GameError(404, "game_not_found", "Game state was not found.");
    }

    return this.stateValue;
  }

  private assertAuthorized(playerToken: string): void {
    const state = this.requireState();
    if (state.playerToken !== playerToken) {
      throw new GameError(401, "unauthorized", "The supplied game token is invalid.");
    }
  }

  private commitMove(
    moveResult: ReturnType<typeof applyLegalMove>,
    previousUpdatedAt: number,
  ): void {
    const state = this.requireState();
    state.board = moveResult.board;
    state.castlingRights = moveResult.castlingRights;
    state.enPassantTarget = moveResult.enPassantTarget;
    state.turn = moveResult.nextTurn;
    state.status = moveResult.status;
    state.winner = moveResult.winner;
    state.ply += 1;
    state.updatedAt = Math.max(Date.now(), previousUpdatedAt + 1);
    state.moveHistory.push(moveResult.moveRecord);
  }

  private async persistState(): Promise<void> {
    const state = this.requireState();
    await this.ctx.storage.put("state", state);
  }

  private snapshot(): GameSnapshot {
    const state = this.requireState();
    return {
      gameId: state.gameId,
      playerColor: state.playerColor,
      board: createSnapshotBoard(state.board),
      turn: state.turn,
      status: state.status,
      winner: state.winner,
      castlingRights: {
        white: { ...state.castlingRights.white },
        black: { ...state.castlingRights.black },
      },
      enPassantTarget: clonePosition(state.enPassantTarget),
      ply: state.ply,
      moveHistory: state.moveHistory.map((move) => ({
        ...move,
        from: { ...move.from },
        to: { ...move.to },
      })),
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: jsonHeaders,
        });
      }

      const url = new URL(request.url);
      const pathSegments = url.pathname.split("/").filter(Boolean);

      if (request.method === "POST" && pathSegments.length === 2 && pathSegments[0] === "game" && pathSegments[1] === "start") {
        const gameId = crypto.randomUUID();
        const playerToken = crypto.randomUUID();
        const stub = env.CHESS_GAME.getByName(gameId);
        const result = await stub.initializeGame({
          gameId,
          playerToken,
          now: Date.now(),
        });

        return json(unwrapRpc(result), 201);
      }

      if (pathSegments.length === 2 && pathSegments[0] === "game" && request.method === "GET") {
        const playerToken = getBearerToken(request);
        if (!playerToken) {
          throw new GameError(401, "missing_token", "A Bearer token is required for this request.");
        }

        const stub = env.CHESS_GAME.getByName(pathSegments[1]);
        const result = await stub.getGame(playerToken);
        return json(unwrapRpc(result));
      }

      if (pathSegments.length === 3 && pathSegments[0] === "game" && pathSegments[2] === "move" && request.method === "POST") {
        const playerToken = getBearerToken(request);
        if (!playerToken) {
          throw new GameError(401, "missing_token", "A Bearer token is required for this request.");
        }

        const payload = await parseJson<SubmitMoveInput>(request);
        const stub = env.CHESS_GAME.getByName(pathSegments[1]);
        const result = await stub.submitMove(playerToken, payload);
        return json(unwrapRpc(result));
      }

      return json(
        {
          error: {
            code: "not_found",
            message: "Route not found.",
          },
        },
        404,
      );
    } catch (error) {
      const failure = toRpcFailure(error);
      return json(
        {
          error: failure.error,
        },
        failure.error.status,
      );
    }
  },
};
