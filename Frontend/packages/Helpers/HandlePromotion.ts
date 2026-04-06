import { BoardType, GameStatus } from "../../types/chess";
import {getGameStatus} from "./Checkmate"

export const handlePromotion = (
    type:"rook" | "knight" | "bishop" | "queen",
    isPromoted: { x: number; y: number } | null,
    setPromoted: (promo: { x: number; y: number } | null) => void,
    boardState: BoardType,
    setBoardstate: (newState: BoardType) => void,
    Turn: "black" | "white",
    setUnderAttack: (attack: { x: number; y: number } | null) => void,
    setGameStatus: (status: GameStatus) => void
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
    const gameStatus = getGameStatus(newBoard, Turn, setUnderAttack);
    setGameStatus(gameStatus);
    if (gameStatus === "checkmate") {
        console.log(Turn === "white" ? "black" : "white", "won");
    } else if (gameStatus === "stalemate") {
        console.log("Draw");
    }
}
