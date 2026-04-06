export interface piece{
    type: "pawn"|"rook"|"knight"|"bishop"|"queen"|"king";
    color : "black"|"white";
}

export interface SquareProps {
    xPos: number; // X position of the square
    yPos: number; // Y position of the square
    piece: piece|null;
    onClick?: () => void; // Optional click handler
    hint?: boolean;
    focus?: boolean;
    attacked?: boolean;
    promotion: {x:number , y:number} | null;onPromotion: (
        type: "rook" | "knight" | "bishop" | "queen",
        isPromoted: { x: number; y: number } | null,
        setPromoted: (promo: { x: number; y: number } | null) => void,
        boardState: BoardType,
        setBoardState: (newState: BoardType) => void,
        Turn: "black" | "white",
        setUnderAttack: (attack: { x: number; y: number } | null) => void,
        setGameStatus: (status: GameStatus) => void
    ) => void;
    
  }

export interface BoardType{
    piece: (piece|null)[][];
}

export interface MoveList{
    list : {w:string, b: string|null}[]
}

export type GameStatus = "playing" | "check" | "checkmate" | "stalemate";
