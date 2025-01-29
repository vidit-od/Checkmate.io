import React, { useEffect, useState } from "react";
import Square from "./Square"
import { piece,BoardType } from "../../types/chess";

function Board(){
    const isValidMove = (x: number, y: number): boolean => {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    };
    
    const calculateValidMoves = (x: number, y: number, piece: piece, board: BoardType): [number, number][] => {
        const moves: [number,number][] = [];
        const directions: [number, number][] = [];
    
        switch (piece.type) {
            case 'pawn':
                const forward = piece.color === 'white' ? -1 : 1;
                if (isValidMove(x + forward, y) && !board.piece[x + forward][y]) {
                    moves.push([x + forward, y]);
                }
                if ( board.piece[x + forward][y] == null && (x == 1 || x == 6) && isValidMove(x + 2*forward, y) && !board.piece[x + 2*forward][y]) {
                    moves.push([x + 2*forward, y]);
                }
                if (isValidMove(x + forward, y - 1) && board.piece[x + forward][y - 1] != null && board.piece[x + forward][y - 1]?.color !== piece.color) {
                    moves.push([x + forward, y - 1]);
                }
                if (isValidMove(x + forward, y + 1) && board.piece[x + forward][y + 1] != null && board.piece[x + forward][y + 1]?.color !== piece.color) {
                    moves.push([x + forward, y + 1]);
                }
                break;
    
            case 'rook':
                directions.push([1, 0], [-1, 0], [0, 1], [0, -1]);
                break;
    
            case 'bishop':
                directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
                break;
    
            case 'queen':
                directions.push([1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]);
                break;
    
            case 'knight':
                const knightMoves = [
                    [2, 1], [2, -1], [-2, 1], [-2, -1],
                    [1, 2], [1, -2], [-1, 2], [-1, -2],
                ];
                knightMoves.forEach(([dx, dy]) => {
                    if (isValidMove(x + dx, y + dy) && board.piece[x + dx][y + dy]?.color !== piece.color) {
                        moves.push([x + dx, y + dy]);
                    }
                });
                break;
    
            case 'king':
                const Kingdirections = [
                    [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]
                ];
                Kingdirections.forEach(([dx, dy])=>{
                    if (isValidMove(x + dx, y + dy) && board.piece[x + dx][y + dy]?.color !== piece.color) {
                        moves.push([x + dx, y + dy]);
                    }
                });
                break;
        }
    
        // For sliding pieces (rook, bishop, queen)
        directions.forEach(([dx, dy]) => {
            let nx = x + dx;
            let ny = y + dy;
            while (isValidMove(nx, ny)) {
                if (board.piece[nx][ny]) {
                    if (board.piece[nx][ny]?.color !== piece.color) {
                        moves.push([nx, ny]);
                    }
                    break;
                }
                moves.push([nx, ny]);
                nx += dx;
                ny += dy;
            }
        });
    
        return moves;
    };
    const handleOnClick = (i:number,j:number, piece:piece|null)=>{
        const curr = boardState.piece[i][j];
        // if Click same piece then deselect
        if(FocusPiece != null && FocusPiece.piece == curr && FocusPiece.x == i && FocusPiece.y == j){
            setFocusPiece(null);
            setValidMoves(null);
        }
        // click different square
        else{
            // click another piece;
            if(curr){
                setFocusPiece({x:i,y:j,piece:curr});
                const moves = calculateValidMoves(i,j,curr,boardState);
                setValidMoves(moves);
            }
            // click empty square -> make move
            else if(FocusPiece != null){
                let isCurrValid = false;
                validMoves?.map((coord,index) =>{
                    if(i == coord[0] && j == coord[1]){
                        isCurrValid = true;
                    }
                })
                if(isCurrValid) {
                    const newBoard = {
                        ...boardState,
                        piece: [...boardState.piece.map(row => [... row])]};

                    newBoard.piece[FocusPiece.x][FocusPiece.y] = null;
                    newBoard.piece[i][j] = FocusPiece.piece;
                    setBoardstate(newBoard);
                }
                setFocusPiece(null);
                setValidMoves(null);
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
    const [validMoves,setValidMoves] = useState<[x:number , y : number][] | null>(null);

    const renderSquares = () =>{
        const square:JSX.Element[][] = []
        for(let i = 0; i < 8; i++){
            const row:JSX.Element[] = []
            for(let j = 0; j < 8; j++){
                const piece = boardState.piece[i][j];
                // show all valid moves;
                let valid_hint:boolean = false;
                validMoves?.map((move)=>{
                    if(move[0] == i && move[1] == j)valid_hint = true;
                })

                let Focus:boolean = false;
                if(i == FocusPiece?.x && j == FocusPiece.y){
                    Focus = true;
                }
                row.push(
                <Square 
                    key={i*8 + j}
                    xPos={i}
                    yPos={j}
                    onClick={()=> handleOnClick(i,j,piece)}
                    piece= {piece || null}
                    hint={valid_hint}
                    focus={Focus}
                />);
            }
            square.push(row);
        }
        return square;
    }

    useEffect(()=>{
        renderSquares();
    },[boardState,validMoves])

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