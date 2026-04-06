import { BoardType } from "../../types/chess";
import {isKingInCheck} from "./CheckKing"

export const handlePromotion = (
    type:"rook" | "knight" | "bishop" | "queen",
    isPromoted: { x: number; y: number } | null,
    setPromoted: (promo: { x: number; y: number } | null) => void,
    boardState: BoardType,
    setBoardstate: (newState: BoardType) => void,
    Turn: "black" | "white",
    setUnderAttack: (attack: { x: number; y: number } | null) => void
)=>{
    if(isPromoted == null) return;
    const newBoard: BoardType = {
        ...boardState,
        piece: boardState.piece.map(row => row.map(piece => piece ? { ...piece } : null))
    };
    const newpiece = newBoard.piece[isPromoted.x][isPromoted.y] ;
    if(newpiece == null) return
    newpiece.type = type;
    newBoard.piece[isPromoted.x][isPromoted.y] = newpiece;
    setBoardstate(newBoard)
    setPromoted(null)
    if (!isKingInCheck(Turn, newBoard, false, setUnderAttack)) {
        setUnderAttack(null);
    }
}
