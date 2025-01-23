import React, { useEffect, useState } from "react";
import Square from "./Square"
import { piece,BoardType } from "../../types/chess";

function Board(){

    const handleOnClick = (i:number,j:number, piece:piece|null)=>{
        const curr = boardState.piece[i][j];
        // if Click same piece then deselect
        if(FocusPiece != null && FocusPiece.piece == curr && FocusPiece.x == i && FocusPiece.y == j){
            setFocusPiece(null);
            console.log(null);
        }
        // click different square
        else{
            // 
            if(curr){
                setFocusPiece({x:i,y:j,piece:curr});
                console.log(curr.color, curr.type);
            }
            else if(FocusPiece != null){
                console.log(`Move played from ${FocusPiece.x} , ${FocusPiece.y} to ${i},${j}`);
                const newBoard = {
                    ...boardState,
                    piece: [...boardState.piece.map(row => [... row])]};
                    
                newBoard.piece[FocusPiece.x][FocusPiece.y] = null;
                newBoard.piece[i][j] = FocusPiece.piece;
                setBoardstate(newBoard);
                setFocusPiece(null);
                renderSquares();
            }
        }
    } 

    const initialBoardState:BoardType = {
        // Row 0 (Black's back rank)
        piece : [
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
        ]};

    const [boardState,setBoardstate] = useState(initialBoardState);
    const [FocusPiece,setFocusPiece] = useState<{x:number , y : number , piece:piece}|null>(null);
    const renderSquares = () =>{
        const square:JSX.Element[][] = []
        for(let i = 0; i < 8; i++){
            const row:JSX.Element[] = []
            for(let j = 0; j < 8; j++){
                const piece = boardState.piece[i][j];
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
        console.log(initialBoardState.piece);
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