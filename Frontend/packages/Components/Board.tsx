import React, { useEffect, useState } from "react";
import Square from "./Square"

function Board(){
    const calculateHints = (i:number,j:number, piece)=>{
        let hint:{
            x:number,
            y:number
        }[] = []

        if(piece.type == "pawn" && piece.color == 'white'){
            hint.push({
                x: i-1,
                y:j
            })
            
            hint.push({
                 x:i-2,
                 y:j
             })
            
            if(boardState[i-1][j-1] != null && boardState[i-1][j-1].piece != null && boardState[i-1][j-1].piece.type == 'black'){
                hint.push({
                    x:i-1,
                    y:j-1
                })
            }
            if(boardState[i-1][j+1] != null && boardState[i-1][j+1].piece != null &&  boardState[i-1][j+1].piece == 'black'){
                hint.push({
                    x:i-1,
                    y:j+1
                })
            }
        }
        return hint
    }

    const handleOnClick = (i:number,j:number, piece)=>{
        const FocusPiece = boardState[i][j];

        if(FocusPiece){
            const allHints:{
                x:number,
                y:number
            }[] = calculateHints(i,j,piece);

            const updatedBoard = boardState.map((row, rowIndex) =>
                row.map((square, colIndex) => {
                    if (allHints.some((hint) => hint.x == rowIndex && hint.y == colIndex)) {
                        return { ...square, hint: !square?.hint || false };
                    }
                    else {
                        return { ...square, hint: false};
                   }
                })
              );
            setBoardstate(updatedBoard);
        }
    } 

    const initialBoardState = [
        // Row 0 (Black's back rank)
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
        ...Array(3).fill(Array(8).fill(null)),
        // Row 6 (White's pawns)
        Array(8).fill({ type: "pawn", color: "white", hint: false }),
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
      ];

    const [boardState,setBoardstate] = useState(initialBoardState);
    const renderSquares = () =>{
        const square:JSX.Element[][] = []
        for(let i = 0; i < 8; i++){
            const row:JSX.Element[] = []
            for(let j = 0; j < 8; j++){
                const piece = boardState[i][j];
                row.push(
                <Square 
                    key={i*8 + j}
                    xPos={i}
                    yPos={j}
                    onClick={()=> handleOnClick(i,j,piece)}
                    piece= {piece || null}
                    hint={piece?.hint || false}
                />);
            }
            square.push(row);
        }
        return square;
    }

    useEffect(()=>{
        renderSquares();
    },[boardState])

    useEffect(()=>{
        setBoardstate(initialBoardState);
    },[])
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