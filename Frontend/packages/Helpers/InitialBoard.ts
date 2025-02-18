import { BoardType } from "../../types/chess";

export const initialBoardState: BoardType = {
    // Row 0 (Black's back rank)
    piece: [
        [
            { type: "rook", color: "black", hint: false },
            { type: "knight", color: "black", hint: false },
            { type: "bishop", color: "black", hint: false },
            { type: "queen", color: "black", hint: false },
            { type: "king", color: "black", hint: false },
            { type: "bishop", color: "black", hint: false },
            { type: "knight", color: "black", hint: false },
            { type: "rook", color: "black", hint: false },
        ],
        // Row 1 (Black's pawns)
        Array(8).fill({ type: "pawn", color: "black", hint: false }),
        // Rows 2-5 (Empty squares)
        ...Array(4).fill(Array(8).fill(null)),
        // Row 6 (White's pawns)
        Array(8).fill({ type: "pawn", color: "white", hint: false }),
        // Row 7 (White's back rank)
        [
            { type: "rook", color: "white", hint: false },
            { type: "knight", color: "white", hint: false },
            { type: "bishop", color: "white", hint: false },
            { type: "queen", color: "white", hint: false },
            { type: "king", color: "white", hint: false },
            { type: "bishop", color: "white", hint: false },
            { type: "knight", color: "white", hint: false },
            { type: "rook", color: "white", hint: false },
        ],
    ]
};