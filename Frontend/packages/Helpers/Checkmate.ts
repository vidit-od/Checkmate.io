import { BoardType } from "../../types/chess";
import {calculateValidMoves} from "./ValidMoves";
import {isKingInCheck} from "./CheckKing"

export const isCheckmate = (board : BoardType, defendingColor : "white"| "black", setUnderAttack: (attack: { x: number; y: number } | null) => void)=>{
    for(let i = 0; i<8; i++){
        for(let j = 0; j <8; j++){
            const currPiece = board.piece[i][j];
            if(currPiece?.color === defendingColor){
                const currMoves = calculateValidMoves(i,j,currPiece,board,true, setUnderAttack);
                const canEscape = currMoves.some((move) => {
                    const newBoard: BoardType = {
                        ...board,
                        piece: board.piece.map(row => row.map(piece => piece ? { ...piece } : null))
                    };
                    newBoard.piece[i][j] = null;
                    newBoard.piece[move[0]][move[1]] = currPiece;
                    if(!isKingInCheck(defendingColor, newBoard, true, setUnderAttack)){
                        return true;
                    }
                    return false;
                })

                if(canEscape) return false;
            }
        }
    }

    return true;
}
