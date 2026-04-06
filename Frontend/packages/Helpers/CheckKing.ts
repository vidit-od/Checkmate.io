import {BoardType, Position } from "../../types/chess";
import {calculateValidMoves} from "./ValidMoves";

export const FindKing = (color: 'white' | 'black', board: BoardType) => {
    let kingPosition: [number, number] | null = null;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board.piece[i][j]?.type === "king" && board.piece[i][j]?.color === color) {
                kingPosition = [i, j];
                break;
            }
        }
        if (kingPosition) break;
    }

    return kingPosition;
}
export const getCheckState = (color: 'white' | 'black', board: BoardType): { inCheck: boolean; underAttack: Position | null } => {
    const kingPosition = FindKing(color, board);
    if (!kingPosition) {
        return { inCheck: false, underAttack: null };
    }

    // Check if any opponent piece can attack the king
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board.piece[i][j];
            if (piece && piece.color !== color) {
                const moves = calculateValidMoves(i, j, piece, board, false);
                if (moves.some(([x, y]) => x === kingPosition![0] && y === kingPosition![1])) {
                    return {
                        inCheck: true,
                        underAttack: { x: kingPosition[0], y: kingPosition[1] },
                    };
                }
            }
        }
    }

    return { inCheck: false, underAttack: null };
}

export const isKingInCheck = (color: 'white' | 'black', board: BoardType) => {
    return getCheckState(color, board).inCheck;
}
