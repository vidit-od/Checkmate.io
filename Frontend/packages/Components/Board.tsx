import React, { useEffect, useState } from "react";
import Square from "./Square"
import { piece, BoardType } from "../../types/chess";

function Board() {
    const isValidMove = (x: number, y: number): boolean => {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    };

    const calculateValidMoves = (x: number, y: number, piece: piece, board: BoardType, flag: boolean): [number, number][] => {
        const moves: [number, number][] = [];
        const directions: [number, number][] = [];
        switch (piece.type) {
            case 'pawn':
                const forward = piece.color === 'white' ? -1 : 1;
                if (isValidMove(x + forward, y) && !board.piece[x + forward][y]) {
                    moves.push([x + forward, y]);
                }
                if (board.piece[x + forward][y] == null && (x == 1 || x == 6) && isValidMove(x + 2 * forward, y) && !board.piece[x + 2 * forward][y]) {
                    moves.push([x + 2 * forward, y]);
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
                Kingdirections.forEach(([dx, dy]) => {
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
        // handle checks by opponent
        if (flag) {
            const newmoves: [number, number][] = [];
            
            // make deep copy; try the move; if causes no check voilation then add to new list;
            moves.map(i => {
                const TempBoard = {
                    ...boardState,
                    piece: [...boardState.piece.map(row => [...row])]
                };

                TempBoard.piece[x][y] = null;
                TempBoard.piece[i[0]][i[1]] = piece;
                if (!isKingInCheck(Turn,TempBoard,true)) {
                    newmoves.push(i);
                }
            });
            return newmoves;
        };
        return moves;
    };
    const FindKing = (color: 'white' | 'black', board: BoardType) => {
        let kingPosition: [number, number] | null = null;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board.piece[i][j]?.type === "king" && board.piece[i][j]?.color === color) {
                    kingPosition = [i, j];
                    break;
                }
            }
            if (kingPosition) break;
        }

        return kingPosition;
    }
    const isKingInCheck = (color: 'white' | 'black', board: BoardType, SelfCheck: Boolean) => {
        let kingPosition: [number, number] | null = null;

        kingPosition = FindKing(color, board);
        if (!kingPosition) return false;

        // Check if any opponent piece can attack the king
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board.piece[i][j];
                if (piece && piece.color !== color) {
                    const moves = calculateValidMoves(i, j, piece, board, false);
                    if (moves.some(([x, y]) => x === kingPosition![0] && y === kingPosition![1])) {
                        if(!SelfCheck) setUnderAttack({ x: kingPosition![0], y: kingPosition![1] });
                        return true;
                    }
                }
            }
        }

        return false;
    }
    const handleOnClick = (i: number, j: number, piece: piece | null) => {
        // do not allow out of turn moves;
        if (FocusPiece == null && piece?.color != Turn) {
            setFocusPiece(null);
            setValidMoves(null);
            return;
        }
        const curr = boardState.piece[i][j];
        // if Click same piece then deselect
        if (FocusPiece != null && FocusPiece.piece == curr && FocusPiece.x == i && FocusPiece.y == j) {
            setFocusPiece(null);
            setValidMoves(null);
        }
        // click different square
        else {
            // click another piece;
            if (curr && piece?.color == Turn) {
                setFocusPiece({ x: i, y: j, piece: curr });
                const moves = calculateValidMoves(i, j, curr, boardState, true);
                setValidMoves(moves);
            }
            // click empty square -> make move
            else if (FocusPiece != null) {
                let isCurrValid = false;
                validMoves?.map((coord, index) => {
                    if (i == coord[0] && j == coord[1]) {
                        isCurrValid = true;
                    }
                })
                // if valid move then play; else reset Focus
                // Change turn after each valid move played;
                if (isCurrValid) {
                    const newBoard = {
                        ...boardState,
                        piece: [...boardState.piece.map(row => [...row])]
                    };

                    newBoard.piece[FocusPiece.x][FocusPiece.y] = null;
                    newBoard.piece[i][j] = FocusPiece.piece;
                    setBoardstate(newBoard);
                    setTurn((T) => (T == 'black') ? 'white' : 'black');
                    if (!isKingInCheck(Turn === 'black' ? 'white' : 'black', newBoard, false)) {
                        setUnderAttack(null);
                    }
                    else if(isCheckmate(newBoard)){
                        console.log(Turn, 'won');
                    }
                }
                setFocusPiece(null);
                setValidMoves(null);

                //isStalemate();
            }
        }
    }
    const isCheckmate = (board : BoardType)=>{
        const color = (Turn === 'black') ? 'white' : 'black';
        for(let i = 0; i<8; i++){
            for(let j = 0; j <8; j++){
                const currPiece = board.piece[i][j];
                if(currPiece?.color === color){
                    console.log(i,j);
                    const currMoves = calculateValidMoves(i,j,currPiece,board,true);
                    const canEscape = currMoves.some((move) => {
                        const newBoard: BoardType = {
                            ...board,
                            piece: board.piece.map(row => row.map(piece => piece ? { ...piece } : null))
                        };
                        newBoard.piece[i][j] = null;
                        newBoard.piece[move[0]][move[1]] = currPiece;
                        if(!isKingInCheck(color,newBoard,true)){
                            return true;
                        }
                    })

                    if(canEscape) return false;
                }
            }
        }

        return true;
    }
    const initialBoardState: BoardType = {
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

    const [boardState, setBoardstate] = useState(initialBoardState);
    const [FocusPiece, setFocusPiece] = useState<{ x: number, y: number, piece: piece } | null>(null);
    const [validMoves, setValidMoves] = useState<[x: number, y: number][] | null>(null);
    const [Turn, setTurn] = useState<"black" | "white">("white");
    const [UnderAttack, setUnderAttack] = useState<{ x: number, y: number } | null>(null);

    const renderSquares = () => {
        const square: JSX.Element[][] = []
        for (let i = 0; i < 8; i++) {
            const row: JSX.Element[] = []
            for (let j = 0; j < 8; j++) {
                const piece = boardState.piece[i][j];
                // show all valid moves;
                let valid_hint: boolean = false;
                validMoves?.map((move) => {
                    if (move[0] == i && move[1] == j) valid_hint = true;
                })

                let Focus: boolean = false;
                if (i == FocusPiece?.x && j == FocusPiece.y) {
                    Focus = true;
                }
                row.push(
                    <Square
                        key={i * 8 + j}
                        xPos={i}
                        yPos={j}
                        onClick={() => handleOnClick(i, j, piece)}
                        piece={piece || null}
                        hint={valid_hint}
                        focus={Focus}
                        attacked={(UnderAttack != null && UnderAttack.x == i && UnderAttack.y == j) ? true : false}
                    />);
            }
            square.push(row);
        }
        return square;
    }

    useEffect(() => {
        renderSquares();
    }, [boardState, validMoves])

    useEffect(() => {
        setBoardstate(initialBoardState);
    }, [])
    return (
        <div className="bg-cover bg-ChessBoard w-fit h-fit">
            {renderSquares().map((row, rowIndex) => (
                <div className="flex" key={rowIndex}>
                    {row}
                </div>
            ))}
        </div>
    )
}

export default Board