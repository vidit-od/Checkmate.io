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

export interface CastlingRightsByColor {
    kingSide: boolean;
    queenSide: boolean;
}

export interface CastlingRights {
    white: CastlingRightsByColor;
    black: CastlingRightsByColor;
}

export interface SquareProps {
    xPos: number; // X position of the square
    yPos: number; // Y position of the square
    piece: piece|null;
    onClick?: () => void; // Optional click handler
    onPieceDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnter?: (event: React.DragEvent<HTMLDivElement>) => void;
    onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?: () => void;
    draggablePiece?: boolean;
    isDraggingPiece?: boolean;
    isDragTarget?: boolean;
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
    castlingRights: CastlingRights;
    enPassantTarget: Position | null;
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
    castlingRights: CastlingRights;
    enPassantTarget: Position | null;
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
    castlingRights: CastlingRights;
    enPassantTarget: Position | null;
    winnerMessage: string | null;
}

export interface PromotionResolution {
    boardState: BoardType;
    promotion: Position | null;
    underAttack: Position | null;
    gameStatus: GameStatus;
    castlingRights: CastlingRights;
    enPassantTarget: Position | null;
    winnerMessage: string | null;
}

export interface GameEvaluation {
    status: GameStatus;
    underAttack: Position | null;
}
