import { BoardType, CastlingRights, GameEvaluation, Position } from "../../types/chess";
import {calculateValidMoves} from "./ValidMoves";
import {getCheckState, isKingInCheck} from "./CheckKing"

export const hasLegalMoves = (
    board : BoardType,
    defendingColor : "white"| "black",
    castlingRights: CastlingRights,
    enPassantTarget: Position | null
)=>{
    for(let i = 0; i<8; i++){
        for(let j = 0; j <8; j++){
            const currPiece = board.piece[i][j];
            if(currPiece?.color === defendingColor){
                const currMoves = calculateValidMoves(i,j,currPiece,board,true, castlingRights, enPassantTarget);
                if(currMoves.length > 0) return true;
            }
        }
    }

    return false;
}

export const isCheckmate = (
    board : BoardType,
    defendingColor : "white"| "black",
    castlingRights: CastlingRights,
    enPassantTarget: Position | null
)=>{
    return isKingInCheck(defendingColor, board) && !hasLegalMoves(board, defendingColor, castlingRights, enPassantTarget);
}

export const isStalemate = (
    board : BoardType,
    defendingColor : "white"| "black",
    castlingRights: CastlingRights,
    enPassantTarget: Position | null
)=>{
    return !isKingInCheck(defendingColor, board) && !hasLegalMoves(board, defendingColor, castlingRights, enPassantTarget);
}

export const getGameStatus = (
    board : BoardType,
    defendingColor : "white"| "black",
    castlingRights: CastlingRights,
    enPassantTarget: Position | null
): GameEvaluation => {
    const { inCheck, underAttack } = getCheckState(defendingColor, board);
    const canMove = hasLegalMoves(board, defendingColor, castlingRights, enPassantTarget);

    if (!canMove) {
        return {
            status: inCheck ? "checkmate" : "stalemate",
            underAttack: inCheck ? underAttack : null,
        };
    }

    return {
        status: inCheck ? "check" : "playing",
        underAttack: inCheck ? underAttack : null,
    };
}
