import { BoardType } from "../../types/chess";
import {calculateValidMoves} from "./ValidMoves";
import {isKingInCheck} from "./CheckKing"

export const isCheckmate = (board : BoardType, Turn : "white"| "black", setUnderAttack: (attack: { x: number; y: number } | null) => void)=>{
    const color = (Turn === 'black') ? 'white' : 'black';
    for(let i = 0; i<8; i++){
        for(let j = 0; j <8; j++){
            const currPiece = board.piece[i][j];
            if(currPiece?.color === color){
                const currMoves = calculateValidMoves(i,j,currPiece,board,true, Turn, setUnderAttack);
                const canEscape = currMoves.some((move) => {
                    const newBoard: BoardType = {
                        ...board,
                        piece: board.piece.map(row => row.map(piece => piece ? { ...piece } : null))
                    };
                    newBoard.piece[i][j] = null;
                    newBoard.piece[move[0]][move[1]] = currPiece;
                    if(!isKingInCheck(color,newBoard,true,Turn,setUnderAttack)){
                        return true;
                    }
                })

                if(canEscape) return false;
            }
        }
    }

    return true;
}