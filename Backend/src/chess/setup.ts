// This file contiains all code to setup initial board positions

import { BoardState, Color, Piece, PieceType } from "./types";

const createPiece = (type : PieceType, color: Color): Piece =>(
    {type , color}
)

export const createInitialBoard = (): BoardState => ({
  piece: [
    [
      createPiece("rook", "black"),
      createPiece("knight", "black"),
      createPiece("bishop", "black"),
      createPiece("queen", "black"),
      createPiece("king", "black"),
      createPiece("bishop", "black"),
      createPiece("knight", "black"),
      createPiece("rook", "black"),
    ],
    Array.from({ length: 8 }, () => createPiece("pawn", "black")),
    ...Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => null)),
    Array.from({ length: 8 }, () => createPiece("pawn", "white")),
    [
      createPiece("rook", "white"),
      createPiece("knight", "white"),
      createPiece("bishop", "white"),
      createPiece("queen", "white"),
      createPiece("king", "white"),
      createPiece("bishop", "white"),
      createPiece("knight", "white"),
      createPiece("rook", "white"),
    ],
  ],
});
