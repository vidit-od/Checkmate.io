export interface piece{
    type: "pawn"|"rook"|"knight"|"bishop"|"queen"|"king";
    color : "black"|"white";
}

export interface Position {
    x: number;
    y: number;
}

export interface FocusedPiece extends Position {
    piece: piece;
}

export interface SquareProps {
    xPos: number; // X position of the square
    yPos: number; // Y position of the square
    piece: piece|null;
    onClick?: () => void; // Optional click handler
    hint?: boolean;
    focus?: boolean;
    attacked?: boolean;
    promotion: Position | null;
    onPromotion: (args: PromotionHandlerArgs) => PromotionResolution | null;

  }

export interface BoardType{
    piece: (piece|null)[][];
}

export interface MoveList{
    list : {w:string, b: string|null}[]
}

export type GameStatus = "playing" | "check" | "checkmate" | "stalemate";

export interface PromotionHandlerArgs {
    type: "rook" | "knight" | "bishop" | "queen";
    isPromoted: Position | null;
    boardState: BoardType;
    turn: "black" | "white";
}

export interface ClickHandlerArgs {
    x: number;
    y: number;
    piece: piece | null;
    boardState: BoardType;
    focusPiece: FocusedPiece | null;
    validMoves: [number, number][] | null;
    turn: "black" | "white";
    isPromoted: Position | null;
    moveList: {w:string, b:string|null}[];
    gameStatus: GameStatus;
}

export interface ClickResolution {
    boardState: BoardType;
    focusPiece: FocusedPiece | null;
    validMoves: [number, number][] | null;
    turn: "black" | "white";
    promotion: Position | null;
    underAttack: Position | null;
    moveList: {w:string, b:string|null}[];
    gameStatus: GameStatus;
    winnerMessage: string | null;
}

export interface PromotionResolution {
    boardState: BoardType;
    promotion: Position | null;
    underAttack: Position | null;
    gameStatus: GameStatus;
    winnerMessage: string | null;
}

export interface GameEvaluation {
    status: GameStatus;
    underAttack: Position | null;
}
