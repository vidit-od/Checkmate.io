import React from "react";
import Square from "./Square"

function Board(){

    const handleOnClick = (i:number,j:number, piece)=>{
        console.log(i,j, piece);
    } 

    const initialBoardState = [
        // Row 0 (Black's back rank)
        [
          { type: "rook", color: "black", hints: [] },
          { type: "knight", color: "black", hints: [] },
          { type: "bishop", color: "black", hints: [] },
          { type: "queen", color: "black", hints: [] },
          { type: "king", color: "black", hints: [] },
          { type: "bishop", color: "black", hints: [] },
          { type: "knight", color: "black", hints: [] },
          { type: "rook", color: "black", hints: [] },
        ],
        // Row 1 (Black's pawns)
        Array(8).fill({ type: "pawn", color: "black", hints: [] }),
        // Rows 2-5 (Empty squares)
        ...Array(4).fill(Array(8).fill(null)),
        // Row 6 (White's pawns)
        Array(8).fill({ type: "pawn", color: "white", hints: [] }),
        // Row 7 (White's back rank)
        [
          { type: "rook", color: "white", hints: [] },
          { type: "knight", color: "white", hints: [] },
          { type: "bishop", color: "white", hints: [] },
          { type: "queen", color: "white", hints: [] },
          { type: "king", color: "white", hints: [] },
          { type: "bishop", color: "white", hints: [] },
          { type: "knight", color: "white", hints: [] },
          { type: "rook", color: "white", hints: [] },
        ],
      ];

    const renderSquares = () =>{
        const square:JSX.Element[][] = []
        for(let i = 0; i < 8; i++){
            const row:JSX.Element[] = []
            for(let j = 0; j < 8; j++){
                const piece = initialBoardState[i][j];
                row.push(
                <Square 
                    key={i*8 + j}
                    xPos={i}
                    yPos={j}
                    onClick={()=> handleOnClick(i,j, piece)}
                    piece= {piece || null}
                />);
            }
            square.push(row);
        }
        return square;
    }
    return (
       <div className="bg-cover bg-ChessBoard w-fit h-fit">
            {renderSquares().map((row,rowIndex) =>(
                <div className="flex" key={rowIndex}>
                    {row}
                </div>
            ))}
       </div> 
    )
}

export default Board