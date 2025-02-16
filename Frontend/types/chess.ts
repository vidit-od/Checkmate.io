export interface piece{
    type: "pawn"|"rook"|"knight"|"bishop"|"queen"|"king";
    color : "black"|"white";
}

export interface SquareProps {
    xPos: number; // X position of the square
    yPos: number; // Y position of the square
    piece: piece|null;
    onClick?: () => void; // Optional click handler
    hint?: Boolean;
    focus?: Boolean;
    attacked?: Boolean;
    promotion: {x:number , y:number} | null;
    onPromotion: (newPiece: "rook" | "knight" | "bishop" | "queen")=> void;
  }

export interface BoardType{
    piece: (piece|null)[][];
}