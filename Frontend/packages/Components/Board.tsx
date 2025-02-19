import { useEffect } from "react";
import Square from "./Square"
import {handleOnClick} from "../Helpers/Onclick"
import {initialBoardState} from "../Helpers/InitialBoard"
import {handlePromotion} from "../Helpers/HandlePromotion"
import { useRecoilState } from "recoil";
import { boardStateAtom, FocusPieceAtom, isPromotedAtom, MoveListAtom, turnAtom, underAttackAtom, validMovesAtom } from "../atoms/atom";

function Board() {
    const [boardState, setBoardstate] = useRecoilState(boardStateAtom);
    const [FocusPiece, setFocusPiece] = useRecoilState(FocusPieceAtom);
    const [validMoves, setValidMoves] = useRecoilState(validMovesAtom);
    const [UnderAttack, setUnderAttack] = useRecoilState<{ x: number, y: number } | null>(underAttackAtom);
    const [Turn, setTurn] = useRecoilState(turnAtom);
    const [isPromoted, setPromoted] = useRecoilState<{x:number, y:number} | null>(isPromotedAtom);
    const [MoveList, setMoveList] = useRecoilState(MoveListAtom);
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
                        onClick={() => handleOnClick(
                            i,
                            j,
                            piece,boardState,
                            setBoardstate,
                            FocusPiece,
                            setFocusPiece,
                            validMoves,
                            setValidMoves,
                            Turn,
                            setTurn,
                            isPromoted,
                            setPromoted,
                            setUnderAttack,
                            MoveList,
                            setMoveList
                        )
                        }
                        piece={piece || null}
                        hint={valid_hint}
                        focus={Focus}
                        attacked={(UnderAttack != null && UnderAttack.x == i && UnderAttack.y == j) ? true : false}
                        promotion = {isPromoted}
                        onPromotion = {handlePromotion}
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

    useEffect(()=>{
        console.log(MoveList);
    },[MoveList])
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