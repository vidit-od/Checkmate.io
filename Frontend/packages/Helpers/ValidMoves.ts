import {piece, BoardType, CastlingRights, Position } from "../../types/chess";
import {isKingInCheck} from "./CheckKing"
import { applyMoveToBoard } from "./MoveEngine";
import { isSquareAttacked } from "./CheckKing";

export const isValidMove = (x: number, y: number): boolean => {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
};

export const calculateValidMoves = (
    x: number,
    y: number,
    piece: piece,
    board: BoardType,
    flag: boolean,
    castlingRights?: CastlingRights,
    enPassantTarget?: Position | null
): [number, number][] => {
    const moves: [number, number][] = [];
    const directions: [number, number][] = [];

    switch (piece.type) {
        case 'pawn': {
            const forward = piece.color === 'white' ? -1 : 1;
            if (isValidMove(x + forward, y) && !board.piece[x + forward][y]) {
                moves.push([x + forward, y]);
            }
            if ( x + forward >= 0 &&
                x + forward < board.piece.length &&
                board.piece[x + forward][y] == null &&
                (x == 1 || x == 6) && (x + 2*forward >=0) && 
                (x + 2*forward < 8)&& isValidMove(x + 2 * forward, y) && 
                !board.piece[x + 2 * forward][y]
            ) {
                moves.push([x + 2 * forward, y]);
            }
            if (isValidMove(x + forward, y - 1) && board.piece[x + forward][y - 1] != null && board.piece[x + forward][y - 1]?.color !== piece.color) {
                moves.push([x + forward, y - 1]);
            }
            if (isValidMove(x + forward, y + 1) && board.piece[x + forward][y + 1] != null && board.piece[x + forward][y + 1]?.color !== piece.color) {
                moves.push([x + forward, y + 1]);
            }
            if (enPassantTarget && enPassantTarget.x === x + forward && Math.abs(enPassantTarget.y - y) === 1) {
                moves.push([enPassantTarget.x, enPassantTarget.y]);
            }
            break;
        }

        case 'rook':
            directions.push([1, 0], [-1, 0], [0, 1], [0, -1]);
            break;

        case 'bishop':
            directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
            break;

        case 'queen':
            directions.push([1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]);
            break;

        case 'knight': {
            const knightMoves = [
                [2, 1], [2, -1], [-2, 1], [-2, -1],
                [1, 2], [1, -2], [-1, 2], [-1, -2],
            ];
            knightMoves.forEach(([dx, dy]) => {
                if (isValidMove(x + dx, y + dy) && board.piece[x + dx][y + dy]?.color !== piece.color) {
                    moves.push([x + dx, y + dy]);
                }
            });
            break;
        }

        case 'king': {
            const Kingdirections = [
                [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]
            ];
            Kingdirections.forEach(([dx, dy]) => {
                if (isValidMove(x + dx, y + dy) && board.piece[x + dx][y + dy]?.color !== piece.color) {
                    moves.push([x + dx, y + dy]);
                }
            });

            if (castlingRights && !isKingInCheck(piece.color, board)) {
                const rights = castlingRights[piece.color];
                const opponentColor = piece.color === "white" ? "black" : "white";

                if (
                    rights.kingSide &&
                    board.piece[x][7]?.type === "rook" &&
                    board.piece[x][7]?.color === piece.color &&
                    board.piece[x][5] == null &&
                    board.piece[x][6] == null &&
                    !isSquareAttacked({ x, y: 5 }, opponentColor, board) &&
                    !isSquareAttacked({ x, y: 6 }, opponentColor, board)
                ) {
                    moves.push([x, 6]);
                }

                if (
                    rights.queenSide &&
                    board.piece[x][0]?.type === "rook" &&
                    board.piece[x][0]?.color === piece.color &&
                    board.piece[x][1] == null &&
                    board.piece[x][2] == null &&
                    board.piece[x][3] == null &&
                    !isSquareAttacked({ x, y: 3 }, opponentColor, board) &&
                    !isSquareAttacked({ x, y: 2 }, opponentColor, board)
                ) {
                    moves.push([x, 2]);
                }
            }
            break;
        }
    }

    // For sliding pieces (rook, bishop, queen)
    directions.forEach(([dx, dy]) => {
        let nx = x + dx;
        let ny = y + dy;
        while (isValidMove(nx, ny)) {
            if (board.piece[nx][ny]) {
                if (board.piece[nx][ny]?.color !== piece.color) {
                    moves.push([nx, ny]);
                }
                break;
            }
            moves.push([nx, ny]);
            nx += dx;
            ny += dy;
        }
    });
    // handle checks by opponent
    if (flag) {
        const newmoves: [number, number][] = [];
        
        // make deep copy; try the move; if causes no check voilation then add to new list;
        moves.map(i => {
            const { board: TempBoard } = applyMoveToBoard(
                board,
                { x, y },
                { x: i[0], y: i[1] },
                piece,
                enPassantTarget ?? null
            );
            if (!isKingInCheck(piece.color, TempBoard)) {
                newmoves.push(i);
            }
        });
        return newmoves;
    };
    return moves;
};
