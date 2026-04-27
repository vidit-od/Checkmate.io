export type Color = "white" | "black";

export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

export type PromotionPieceType = "rook" | "knight" | "bishop" | "queen";

export type GameStatus = "playing" | "check" | "checkmate" | "stalemate" | "resigned";

export type GameWinner = Color | "draw" | null;

export interface Piece {
  type: PieceType;
  color: Color;
}

export interface Position {
  x: number;
  y: number;
}

export interface CastlingRightsByColor {
  kingSide: boolean;
  queenSide: boolean;
}

export interface CastlingRights {
  white: CastlingRightsByColor;
  black: CastlingRightsByColor;
}

export interface BoardState {
  piece: (Piece | null)[][];
}

export interface MoveAttempt {
  from: Position;
  to: Position;
  promotion?: PromotionPieceType;
}

export interface LegalMove extends MoveAttempt {
  piece: Piece;
}

export interface MoveRecord {
  color: Color;
  piece: PieceType;
  from: Position;
  to: Position;
  capturedPiece: PieceType | null;
  promotion: PromotionPieceType | null;
}

export interface GameState {
  gameId: string;
  playerToken: string;
  playerColor: "white";
  board: BoardState;
  turn: Color;
  status: GameStatus;
  winner: GameWinner;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  ply: number;
  moveHistory: MoveRecord[];
  createdAt: number;
  updatedAt: number;
}

export interface GameSnapshot {
  gameId: string;
  playerColor: "white";
  board: BoardState;
  turn: Color;
  status: GameStatus;
  winner: GameWinner;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  ply: number;
  moveHistory: MoveRecord[];
  createdAt: number;
  updatedAt: number;
}

export interface StartGameInput {
  gameId: string;
  playerToken: string;
  now: number;
}

export interface StartGameResponse {
  playerToken: string;
  snapshot: GameSnapshot;
}

export interface SubmitMoveInput extends MoveAttempt {
  expectedPly?: number;
}

export interface SubmitMoveResponse {
  snapshot: GameSnapshot;
  playerMove: MoveRecord;
  botMove: MoveRecord | null;
}

export interface RpcSuccess<T> {
  ok: true;
  data: T;
}

export interface RpcFailure {
  ok: false;
  error: {
    status: number;
    code: string;
    message: string;
  };
}

export type RpcResult<T> = RpcSuccess<T> | RpcFailure;
