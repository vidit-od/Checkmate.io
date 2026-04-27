import type {
  BoardState,
  CastlingRights,
  Color,
  GameStatus,
  GameWinner,
  LegalMove,
  MoveAttempt,
  MoveRecord,
  Piece,
  Position,
  PromotionPieceType,
} from "./types";

interface AppliedBoardMove {
  board: BoardState;
  capturedPiece: Piece | null;
  capturePosition: Position | null;
}

export interface MoveOutcome {
  board: BoardState;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  nextTurn: Color;
  status: GameStatus;
  winner: GameWinner;
  moveRecord: MoveRecord;
}

const PROMOTION_OPTIONS: PromotionPieceType[] = ["queen", "rook", "bishop", "knight"];

const createPiece = (type: Piece["type"], color: Color): Piece => ({ type, color });

export const initialCastlingRights = (): CastlingRights => ({
  white: { kingSide: true, queenSide: true },
  black: { kingSide: true, queenSide: true },
});

export const createInitialBoard = (): BoardState => ({
  piece: [
    [
      createPiece("rook", "black"),
      createPiece("knight", "black"),
      createPiece("bishop", "black"),
      createPiece("queen", "black"),
      createPiece("king", "black"),
      createPiece("bishop", "black"),
      createPiece("knight", "black"),
      createPiece("rook", "black"),
    ],
    Array.from({ length: 8 }, () => createPiece("pawn", "black")),
    ...Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => null)),
    Array.from({ length: 8 }, () => createPiece("pawn", "white")),
    [
      createPiece("rook", "white"),
      createPiece("knight", "white"),
      createPiece("bishop", "white"),
      createPiece("queen", "white"),
      createPiece("king", "white"),
      createPiece("bishop", "white"),
      createPiece("knight", "white"),
      createPiece("rook", "white"),
    ],
  ],
});

export const cloneBoard = (board: BoardState): BoardState => ({
  piece: board.piece.map((row) => row.map((piece) => (piece ? { ...piece } : null))),
});

export const clonePosition = (position: Position | null): Position | null =>
  position ? { ...position } : null;

export const createSnapshotBoard = (board: BoardState): BoardState => cloneBoard(board);

export const isInsideBoard = (x: number, y: number): boolean => x >= 0 && x < 8 && y >= 0 && y < 8;

export const isPromotionSquare = (piece: Piece, to: Position): boolean =>
  piece.type === "pawn" && ((piece.color === "white" && to.x === 0) || (piece.color === "black" && to.x === 7));

export const findKing = (color: Color, board: BoardState): Position | null => {
  for (let x = 0; x < 8; x += 1) {
    for (let y = 0; y < 8; y += 1) {
      const piece = board.piece[x][y];
      if (piece?.type === "king" && piece.color === color) {
        return { x, y };
      }
    }
  }

  return null;
};

export const isSquareAttacked = (target: Position, attackerColor: Color, board: BoardState): boolean => {
  const pawnForward = attackerColor === "white" ? -1 : 1;
  const pawnAttackers = [
    { x: target.x - pawnForward, y: target.y - 1 },
    { x: target.x - pawnForward, y: target.y + 1 },
  ];

  for (const position of pawnAttackers) {
    if (isInsideBoard(position.x, position.y)) {
      const piece = board.piece[position.x][position.y];
      if (piece?.color === attackerColor && piece.type === "pawn") {
        return true;
      }
    }
  }

  const knightOffsets: [number, number][] = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];

  for (const [dx, dy] of knightOffsets) {
    const x = target.x + dx;
    const y = target.y + dy;
    if (isInsideBoard(x, y)) {
      const piece = board.piece[x][y];
      if (piece?.color === attackerColor && piece.type === "knight") {
        return true;
      }
    }
  }

  const kingOffsets: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  for (const [dx, dy] of kingOffsets) {
    const x = target.x + dx;
    const y = target.y + dy;
    if (isInsideBoard(x, y)) {
      const piece = board.piece[x][y];
      if (piece?.color === attackerColor && piece.type === "king") {
        return true;
      }
    }
  }

  const slidingDirections: { dx: number; dy: number; attackers: ReadonlyArray<Piece["type"]> }[] = [
    { dx: 1, dy: 0, attackers: ["rook", "queen"] },
    { dx: -1, dy: 0, attackers: ["rook", "queen"] },
    { dx: 0, dy: 1, attackers: ["rook", "queen"] },
    { dx: 0, dy: -1, attackers: ["rook", "queen"] },
    { dx: 1, dy: 1, attackers: ["bishop", "queen"] },
    { dx: 1, dy: -1, attackers: ["bishop", "queen"] },
    { dx: -1, dy: 1, attackers: ["bishop", "queen"] },
    { dx: -1, dy: -1, attackers: ["bishop", "queen"] },
  ];

  for (const direction of slidingDirections) {
    let x = target.x + direction.dx;
    let y = target.y + direction.dy;

    while (isInsideBoard(x, y)) {
      const piece = board.piece[x][y];
      if (piece) {
        if (piece.color === attackerColor && direction.attackers.includes(piece.type)) {
          return true;
        }
        break;
      }
      x += direction.dx;
      y += direction.dy;
    }
  }

  return false;
};

export const isKingInCheck = (color: Color, board: BoardState): boolean => {
  const king = findKing(color, board);
  if (!king) {
    return false;
  }

  const opponent = color === "white" ? "black" : "white";
  return isSquareAttacked(king, opponent, board);
};

export const applyMoveToBoard = (
  board: BoardState,
  from: Position,
  to: Position,
  movingPiece: Piece,
  enPassantTarget: Position | null,
): AppliedBoardMove => {
  const nextBoard = cloneBoard(board);
  let capturedPiece = nextBoard.piece[to.x][to.y];
  let capturePosition: Position | null = capturedPiece ? { x: to.x, y: to.y } : null;

  nextBoard.piece[from.x][from.y] = null;

  if (
    movingPiece.type === "pawn" &&
    enPassantTarget &&
    to.x === enPassantTarget.x &&
    to.y === enPassantTarget.y &&
    capturedPiece === null &&
    from.y !== to.y
  ) {
    const capturedPawnX = movingPiece.color === "white" ? to.x + 1 : to.x - 1;
    capturedPiece = nextBoard.piece[capturedPawnX][to.y];
    capturePosition = { x: capturedPawnX, y: to.y };
    nextBoard.piece[capturedPawnX][to.y] = null;
  }

  nextBoard.piece[to.x][to.y] = { ...movingPiece };

  if (movingPiece.type === "king" && Math.abs(to.y - from.y) === 2) {
    const rookFromY = to.y > from.y ? 7 : 0;
    const rookToY = to.y > from.y ? to.y - 1 : to.y + 1;
    const rook = nextBoard.piece[from.x][rookFromY];
    nextBoard.piece[from.x][rookFromY] = null;
    nextBoard.piece[from.x][rookToY] = rook ? { ...rook } : null;
  }

  return {
    board: nextBoard,
    capturedPiece,
    capturePosition,
  };
};

export const getNextEnPassantTarget = (from: Position, to: Position, movingPiece: Piece): Position | null => {
  if (movingPiece.type !== "pawn" || Math.abs(to.x - from.x) !== 2) {
    return null;
  }

  return {
    x: (from.x + to.x) / 2,
    y: from.y,
  };
};

export const getUpdatedCastlingRights = (
  castlingRights: CastlingRights,
  movingPiece: Piece,
  from: Position,
  capturedPiece: Piece | null,
  capturePosition: Position | null,
): CastlingRights => {
  const nextRights: CastlingRights = {
    white: { ...castlingRights.white },
    black: { ...castlingRights.black },
  };

  if (movingPiece.type === "king") {
    nextRights[movingPiece.color].kingSide = false;
    nextRights[movingPiece.color].queenSide = false;
  }

  if (movingPiece.type === "rook") {
    if (movingPiece.color === "white" && from.x === 7 && from.y === 0) {
      nextRights.white.queenSide = false;
    }
    if (movingPiece.color === "white" && from.x === 7 && from.y === 7) {
      nextRights.white.kingSide = false;
    }
    if (movingPiece.color === "black" && from.x === 0 && from.y === 0) {
      nextRights.black.queenSide = false;
    }
    if (movingPiece.color === "black" && from.x === 0 && from.y === 7) {
      nextRights.black.kingSide = false;
    }
  }

  if (capturedPiece?.type === "rook" && capturePosition) {
    if (capturedPiece.color === "white" && capturePosition.x === 7 && capturePosition.y === 0) {
      nextRights.white.queenSide = false;
    }
    if (capturedPiece.color === "white" && capturePosition.x === 7 && capturePosition.y === 7) {
      nextRights.white.kingSide = false;
    }
    if (capturedPiece.color === "black" && capturePosition.x === 0 && capturePosition.y === 0) {
      nextRights.black.queenSide = false;
    }
    if (capturedPiece.color === "black" && capturePosition.x === 0 && capturePosition.y === 7) {
      nextRights.black.kingSide = false;
    }
  }

  return nextRights;
};

export const calculateValidMoves = (
  x: number,
  y: number,
  piece: Piece,
  board: BoardState,
  enforceCheckRules: boolean,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null,
): Position[] => {
  const moves: Position[] = [];
  const directions: [number, number][] = [];

  switch (piece.type) {
    case "pawn": {
      const forward = piece.color === "white" ? -1 : 1;
      const startRank = piece.color === "white" ? 6 : 1;

      if (isInsideBoard(x + forward, y) && !board.piece[x + forward][y]) {
        moves.push({ x: x + forward, y });
      }

      if (
        x === startRank &&
        isInsideBoard(x + forward, y) &&
        isInsideBoard(x + 2 * forward, y) &&
        !board.piece[x + forward][y] &&
        !board.piece[x + 2 * forward][y]
      ) {
        moves.push({ x: x + 2 * forward, y });
      }

      if (
        isInsideBoard(x + forward, y - 1) &&
        board.piece[x + forward][y - 1] &&
        board.piece[x + forward][y - 1]?.color !== piece.color
      ) {
        moves.push({ x: x + forward, y: y - 1 });
      }

      if (
        isInsideBoard(x + forward, y + 1) &&
        board.piece[x + forward][y + 1] &&
        board.piece[x + forward][y + 1]?.color !== piece.color
      ) {
        moves.push({ x: x + forward, y: y + 1 });
      }

      if (enPassantTarget && enPassantTarget.x === x + forward && Math.abs(enPassantTarget.y - y) === 1) {
        moves.push({ x: enPassantTarget.x, y: enPassantTarget.y });
      }

      break;
    }
    case "rook":
      directions.push([1, 0], [-1, 0], [0, 1], [0, -1]);
      break;
    case "bishop":
      directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
      break;
    case "queen":
      directions.push([1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]);
      break;
    case "knight": {
      const knightMoves: [number, number][] = [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2],
      ];

      for (const [dx, dy] of knightMoves) {
        const nextX = x + dx;
        const nextY = y + dy;
        if (isInsideBoard(nextX, nextY) && board.piece[nextX][nextY]?.color !== piece.color) {
          moves.push({ x: nextX, y: nextY });
        }
      }
      break;
    }
    case "king": {
      const kingDirections: [number, number][] = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];

      for (const [dx, dy] of kingDirections) {
        const nextX = x + dx;
        const nextY = y + dy;
        if (isInsideBoard(nextX, nextY) && board.piece[nextX][nextY]?.color !== piece.color) {
          moves.push({ x: nextX, y: nextY });
        }
      }

      if (!isKingInCheck(piece.color, board)) {
        const rights = castlingRights[piece.color];
        const opponent = piece.color === "white" ? "black" : "white";

        if (
          rights.kingSide &&
          board.piece[x][7]?.type === "rook" &&
          board.piece[x][7]?.color === piece.color &&
          board.piece[x][5] === null &&
          board.piece[x][6] === null &&
          !isSquareAttacked({ x, y: 5 }, opponent, board) &&
          !isSquareAttacked({ x, y: 6 }, opponent, board)
        ) {
          moves.push({ x, y: 6 });
        }

        if (
          rights.queenSide &&
          board.piece[x][0]?.type === "rook" &&
          board.piece[x][0]?.color === piece.color &&
          board.piece[x][1] === null &&
          board.piece[x][2] === null &&
          board.piece[x][3] === null &&
          !isSquareAttacked({ x, y: 3 }, opponent, board) &&
          !isSquareAttacked({ x, y: 2 }, opponent, board)
        ) {
          moves.push({ x, y: 2 });
        }
      }
      break;
    }
  }

  for (const [dx, dy] of directions) {
    let nextX = x + dx;
    let nextY = y + dy;

    while (isInsideBoard(nextX, nextY)) {
      const occupant = board.piece[nextX][nextY];
      if (occupant) {
        if (occupant.color !== piece.color) {
          moves.push({ x: nextX, y: nextY });
        }
        break;
      }
      moves.push({ x: nextX, y: nextY });
      nextX += dx;
      nextY += dy;
    }
  }

  if (!enforceCheckRules) {
    return moves;
  }

  const legalMoves: Position[] = [];
  for (const move of moves) {
    const { board: nextBoard } = applyMoveToBoard(board, { x, y }, move, piece, enPassantTarget);
    if (!isKingInCheck(piece.color, nextBoard)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
};

export const getAllLegalMoves = (
  board: BoardState,
  color: Color,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null,
): LegalMove[] => {
  const moves: LegalMove[] = [];

  for (let x = 0; x < 8; x += 1) {
    for (let y = 0; y < 8; y += 1) {
      const piece = board.piece[x][y];
      if (!piece || piece.color !== color) {
        continue;
      }

      const pieceMoves = calculateValidMoves(x, y, piece, board, true, castlingRights, enPassantTarget);
      for (const move of pieceMoves) {
        if (isPromotionSquare(piece, move)) {
          for (const promotion of PROMOTION_OPTIONS) {
            moves.push({
              from: { x, y },
              to: move,
              promotion,
              piece: { ...piece },
            });
          }
        } else {
          moves.push({
            from: { x, y },
            to: move,
            piece: { ...piece },
          });
        }
      }
    }
  }

  return moves;
};

export const getGameStatus = (
  board: BoardState,
  defendingColor: Color,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null,
): GameStatus => {
  const legalMoves = getAllLegalMoves(board, defendingColor, castlingRights, enPassantTarget);
  const inCheck = isKingInCheck(defendingColor, board);

  if (legalMoves.length === 0) {
    return inCheck ? "checkmate" : "stalemate";
  }

  return inCheck ? "check" : "playing";
};

export const matchesMoveAttempt = (legalMove: LegalMove, attempt: MoveAttempt): boolean =>
  legalMove.from.x === attempt.from.x &&
  legalMove.from.y === attempt.from.y &&
  legalMove.to.x === attempt.to.x &&
  legalMove.to.y === attempt.to.y &&
  (legalMove.promotion ?? null) === (attempt.promotion ?? null);

export const resolvePlayerMove = (legalMoves: LegalMove[], attempt: MoveAttempt): LegalMove | null => {
  const exactMatch = legalMoves.find((move) => matchesMoveAttempt(move, attempt));
  if (exactMatch) {
    return exactMatch;
  }

  const promotionCandidates = legalMoves.filter(
    (move) =>
      move.from.x === attempt.from.x &&
      move.from.y === attempt.from.y &&
      move.to.x === attempt.to.x &&
      move.to.y === attempt.to.y,
  );

  if (promotionCandidates.length === 0) {
    return null;
  }

  // If the client omits a promotion choice, default to queen so the move still resolves.
  if (!attempt.promotion) {
    return promotionCandidates.find((move) => move.promotion === "queen") ?? promotionCandidates[0];
  }

  return null;
};

export const pickRandomMove = (legalMoves: LegalMove[]): LegalMove | null => {
  if (legalMoves.length === 0) {
    return null;
  }

  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const index = buffer[0] % legalMoves.length;
  return legalMoves[index] ?? null;
};

export const applyLegalMove = (
  board: BoardState,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null,
  move: LegalMove,
): MoveOutcome => {
  const movingPiece = board.piece[move.from.x][move.from.y];
  if (!movingPiece) {
    throw new Error("Cannot apply a move from an empty square.");
  }

  const { board: nextBoard, capturedPiece, capturePosition } = applyMoveToBoard(
    board,
    move.from,
    move.to,
    movingPiece,
    enPassantTarget,
  );

  if (move.promotion) {
    nextBoard.piece[move.to.x][move.to.y] = {
      type: move.promotion,
      color: movingPiece.color,
    };
  }

  const nextCastlingRights = getUpdatedCastlingRights(
    castlingRights,
    movingPiece,
    move.from,
    capturedPiece,
    capturePosition,
  );

  const nextEnPassantTarget = getNextEnPassantTarget(move.from, move.to, movingPiece);
  const nextTurn: Color = movingPiece.color === "white" ? "black" : "white";
  const status = getGameStatus(nextBoard, nextTurn, nextCastlingRights, nextEnPassantTarget);
  const winner: GameWinner =
    status === "checkmate" ? movingPiece.color : status === "stalemate" ? "draw" : null;

  return {
    board: nextBoard,
    castlingRights: nextCastlingRights,
    enPassantTarget: nextEnPassantTarget,
    nextTurn,
    status,
    winner,
    moveRecord: {
      color: movingPiece.color,
      piece: movingPiece.type,
      from: { ...move.from },
      to: { ...move.to },
      capturedPiece: capturedPiece?.type ?? null,
      promotion: move.promotion ?? null,
    },
  };
};
