import { piece, BoardType} from "../../types/chess";
import {calculateValidMoves} from "./ValidMoves"
import {getGameStatus} from "./Checkmate"
import {ConvertMoves} from "./ConvertMoves"

export const handleOnClick = (i: number,
    j: number,
    piece: piece | null,
    boardState: BoardType,
    setBoardstate: (newState: BoardType) => void,
    FocusPiece: { x: number; y: number; piece: piece } | null,
    setFocusPiece: (focus: { x: number; y: number; piece: piece } | null) => void,
    validMoves: [number, number][] | null,
    setValidMoves: (moves: [number, number][] | null) => void,
    Turn: 'black' | 'white',
    setTurn: (turn: "black" | "white") => void,
    isPromoted: { x: number; y: number } | null,
    setPromoted: (promo: { x: number; y: number } | null) => void,
    setUnderAttack: (attack: { x: number; y: number } | null) => void,
    MoveList: {w:string, b:string|null}[],
    setMoveList : (movelist: {w:string , b: string|null}[]) => void) => {
       
    
    // do not allow out of turn moves;
    if ((FocusPiece == null && piece?.color != Turn) || isPromoted != null) {
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
            const moves = calculateValidMoves(i, j, curr, boardState, true, setUnderAttack);
            setValidMoves(moves);
        }
        // click empty square -> make move
        else if (FocusPiece != null) {
            let isCurrValid = false;
            validMoves?.map((coord, _index) => {
                if (i == coord[0] && j == coord[1]) {
                    isCurrValid = true;
                }
            })
            // if valid move then play; else reset Focus
            // Change turn after each valid move played;
            if (isCurrValid) {
                const opponentColor = Turn === 'black' ? 'white' : 'black';
                const newBoard = {
                    ...boardState,
                    piece: [...boardState.piece.map(row => [...row])]
                };

                newBoard.piece[FocusPiece.x][FocusPiece.y] = null;
                newBoard.piece[i][j] = FocusPiece.piece;
                ConvertMoves(FocusPiece.piece, i,j, Turn, MoveList, setMoveList);
                if(FocusPiece.piece.type == 'pawn' && ((FocusPiece.piece.color == 'white' && i == 0) || (FocusPiece.piece.color == 'black' && i == 7))){
                    setPromoted({x:i, y:j})
                }
                setBoardstate(newBoard);
                setTurn(opponentColor);
                const gameStatus = getGameStatus(newBoard, opponentColor, setUnderAttack);
                if (gameStatus === "checkmate") {
                    console.log(Turn, 'won');
                } else if (gameStatus === "stalemate") {
                    console.log("Draw");
                }
            }
            setFocusPiece(null);
            setValidMoves(null);
        }
    }
}
