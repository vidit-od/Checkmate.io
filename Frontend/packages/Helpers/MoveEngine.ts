import { BoardType, CastlingRights, Position, piece } from "../../types/chess";

interface AppliedMove {
    board: BoardType;
    capturedPiece: piece | null;
    capturePosition: Position | null;
}

export const initialCastlingRights: CastlingRights = {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true },
};

export const cloneBoard = (board: BoardType): BoardType => ({
    ...board,
    piece: board.piece.map((row) => row.map((currentPiece) => (currentPiece ? { ...currentPiece } : null))),
});

export const applyMoveToBoard = (
    board: BoardType,
    from: Position,
    to: Position,
    movingPiece: piece,
    enPassantTarget: Position | null
): AppliedMove => {
    const newBoard = cloneBoard(board);
    let capturedPiece = newBoard.piece[to.x][to.y];
    let capturePosition: Position | null = capturedPiece ? { x: to.x, y: to.y } : null;

    newBoard.piece[from.x][from.y] = null;

    if (
        movingPiece.type === "pawn" &&
        enPassantTarget &&
        to.x === enPassantTarget.x &&
        to.y === enPassantTarget.y &&
        capturedPiece == null &&
        from.y !== to.y
    ) {
        const capturedPawnX = movingPiece.color === "white" ? to.x + 1 : to.x - 1;
        capturedPiece = newBoard.piece[capturedPawnX][to.y];
        capturePosition = { x: capturedPawnX, y: to.y };
        newBoard.piece[capturedPawnX][to.y] = null;
    }

    newBoard.piece[to.x][to.y] = { ...movingPiece };

    if (movingPiece.type === "king" && Math.abs(to.y - from.y) === 2) {
        const rookFromY = to.y > from.y ? 7 : 0;
        const rookToY = to.y > from.y ? to.y - 1 : to.y + 1;
        const rook = newBoard.piece[from.x][rookFromY];
        newBoard.piece[from.x][rookFromY] = null;
        newBoard.piece[from.x][rookToY] = rook ? { ...rook } : null;
    }

    return {
        board: newBoard,
        capturedPiece,
        capturePosition,
    };
};

export const getNextEnPassantTarget = (
    from: Position,
    to: Position,
    movingPiece: piece
): Position | null => {
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
    movingPiece: piece,
    from: Position,
    capturedPiece: piece | null,
    capturePosition: Position | null
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
