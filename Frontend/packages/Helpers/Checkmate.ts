import { BoardType, GameEvaluation } from "../../types/chess";
import {calculateValidMoves} from "./ValidMoves";
import {getCheckState, isKingInCheck} from "./CheckKing"

export const hasLegalMoves = (board : BoardType, defendingColor : "white"| "black")=>{
    for(let i = 0; i<8; i++){
        for(let j = 0; j <8; j++){
            const currPiece = board.piece[i][j];
            if(currPiece?.color === defendingColor){
                const currMoves = calculateValidMoves(i,j,currPiece,board,true);
                const canEscape = currMoves.some((move) => {
                    const newBoard: BoardType = {
                        ...board,
                        piece: board.piece.map(row => row.map(piece => piece ? { ...piece } : null))
                    };
                    newBoard.piece[i][j] = null;
                    newBoard.piece[move[0]][move[1]] = currPiece;
                    if(!isKingInCheck(defendingColor, newBoard)){
                        return true;
                    }
                    return false;
                })

                if(canEscape) return true;
            }
        }
    }

    return false;
}

export const isCheckmate = (board : BoardType, defendingColor : "white"| "black")=>{
    return isKingInCheck(defendingColor, board) && !hasLegalMoves(board, defendingColor);
}

export const isStalemate = (board : BoardType, defendingColor : "white"| "black")=>{
    return !isKingInCheck(defendingColor, board) && !hasLegalMoves(board, defendingColor);
}

export const getGameStatus = (board : BoardType, defendingColor : "white"| "black"): GameEvaluation => {
    const { inCheck, underAttack } = getCheckState(defendingColor, board);
    const canMove = hasLegalMoves(board, defendingColor);

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
