export interface GameState {
    gameId : string,
    board : BoardState
}

export type Color = "white" | "black";
export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

export interface Piece{
    color : Color
    type  : PieceType
}

export interface BoardState{
    piece : (Piece | null)[][]
}

export interface CastlingRightsByColor {
    kingSide: boolean;
    queenSide: boolean;
}

export interface CastlingRights {
    white: CastlingRightsByColor;
    black: CastlingRightsByColor;
}


export interface StartGameInput {
  gameId: string;
  playerId: string;
}
