import { BoardType, PromotionHandlerArgs, PromotionResolution } from "../../types/chess";
import {getGameStatus} from "./Checkmate"

export const handlePromotion = ({
    type,
    isPromoted,
    boardState,
    turn,
}: PromotionHandlerArgs): PromotionResolution | null =>{
    if(isPromoted == null) return null;
    const newBoard: BoardType = {
        ...boardState,
        piece: boardState.piece.map(row => row.map(piece => piece ? { ...piece } : null))
    };
    const newpiece = newBoard.piece[isPromoted.x][isPromoted.y] ;
    if(newpiece == null) return null;
    newpiece.type = type;
    newBoard.piece[isPromoted.x][isPromoted.y] = newpiece;
    const evaluation = getGameStatus(newBoard, turn);
    return {
        boardState: newBoard,
        promotion: null,
        underAttack: evaluation.underAttack,
        gameStatus: evaluation.status,
        winnerMessage: evaluation.status === "checkmate" ? `${turn === "white" ? "black" : "white"} won` : evaluation.status === "stalemate" ? "Draw" : null,
    };
}
