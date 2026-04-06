import { useEffect, useLayoutEffect, useState } from "react";
import Square from "./Square"
import {handleOnClick} from "../Helpers/Onclick"
import {initialBoardState} from "../Helpers/InitialBoard"
import {handlePromotion} from "../Helpers/HandlePromotion"
import { useRecoilState } from "recoil";
import { boardStateAtom, castlingRightsAtom, enPassantTargetAtom, FocusPieceAtom, gameStatusAtom, getMaxSquareSize, isPromotedAtom, MoveListAtom, SquareSize, turnAtom, underAttackAtom, validMovesAtom } from "../atoms/atom";
import { initialCastlingRights } from "../Helpers/MoveEngine";
import { FocusedPiece, piece } from "../../types/chess";

function Board() {
    const [boardState, setBoardstate] = useRecoilState(boardStateAtom);
    const [FocusPiece, setFocusPiece] = useRecoilState(FocusPieceAtom);
    const [validMoves, setValidMoves] = useRecoilState(validMovesAtom);
    const [UnderAttack, setUnderAttack] = useRecoilState<{ x: number, y: number } | null>(underAttackAtom);
    const [Turn, setTurn] = useRecoilState(turnAtom);
    const [isPromoted, setPromoted] = useRecoilState<{x:number, y:number} | null>(isPromotedAtom);
    const [MoveList, setMoveList] = useRecoilState(MoveListAtom);
    const [gameStatus, setGameStatus] = useRecoilState(gameStatusAtom);
    const [castlingRights, setCastlingRights] = useRecoilState(castlingRightsAtom);
    const [enPassantTarget, setEnPassantTarget] = useRecoilState(enPassantTargetAtom);
    const [squareSize, setSquareSize] = useRecoilState(SquareSize);
    const [draggedPiece, setDraggedPiece] = useState<FocusedPiece | null>(null);
    const [dragOverSquare, setDragOverSquare] = useState<{ x: number; y: number } | null>(null);

    const applyResolution = (resolution: ReturnType<typeof handleOnClick>) => {
        setBoardstate(resolution.boardState);
        setFocusPiece(resolution.focusPiece);
        setValidMoves(resolution.validMoves);
        setTurn(resolution.turn);
        setPromoted(resolution.promotion);
        setUnderAttack(resolution.underAttack);
        setMoveList(resolution.moveList);
        setGameStatus(resolution.gameStatus);
        setCastlingRights(resolution.castlingRights);
        setEnPassantTarget(resolution.enPassantTarget);

        if (resolution.winnerMessage) {
            console.log(resolution.winnerMessage);
        }
    };

    const handlePieceDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        x: number,
        y: number,
        piece: piece | null
    ) => {
        if (!piece || piece.color !== Turn || gameStatus === "checkmate" || gameStatus === "stalemate" || isPromoted != null) {
            event.preventDefault();
            return;
        }

        const resolution = handleOnClick({
            x,
            y,
            piece,
            boardState,
            focusPiece: FocusPiece,
            validMoves,
            turn: Turn,
            isPromoted,
            moveList: MoveList,
            gameStatus,
            castlingRights,
            enPassantTarget,
        });

        applyResolution(resolution);

        if (resolution.focusPiece) {
            setDraggedPiece(resolution.focusPiece);
            setDragOverSquare(null);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", `${x},${y}`);
            const draggedChessPiece = resolution.focusPiece.piece;
            const dragGhost = document.createElement("div");
            dragGhost.style.width = `${squareSize}px`;
            dragGhost.style.height = `${squareSize}px`;
            dragGhost.style.position = "absolute";
            dragGhost.style.top = "-9999px";
            dragGhost.style.left = "-9999px";
            dragGhost.style.backgroundImage = `url('/assets/${draggedChessPiece.color}${draggedChessPiece.type}.png')`;
            dragGhost.style.backgroundSize = "contain";
            dragGhost.style.backgroundRepeat = "no-repeat";
            dragGhost.style.backgroundPosition = "center";
            dragGhost.style.pointerEvents = "none";
            document.body.appendChild(dragGhost);
            event.dataTransfer.setDragImage(dragGhost, squareSize / 2, squareSize / 2);
            requestAnimationFrame(() => {
                document.body.removeChild(dragGhost);
            });
        } else {
            event.preventDefault();
        }
    };

    const handleSquareDrop = (event: React.DragEvent<HTMLDivElement>, x: number, y: number, piece: piece | null) => {
        event.preventDefault();
        setDragOverSquare(null);
        if (!draggedPiece) return;

        const resolution = handleOnClick({
            x,
            y,
            piece,
            boardState,
            focusPiece: draggedPiece,
            validMoves,
            turn: Turn,
            isPromoted,
            moveList: MoveList,
            gameStatus,
            castlingRights,
            enPassantTarget,
        });

        applyResolution(resolution);
        setDraggedPiece(null);
    };

    const handleSquareDragOver = (event: React.DragEvent<HTMLDivElement>, x: number, y: number) => {
        if (!draggedPiece) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDragOverSquare((current) => {
            if (current?.x === x && current?.y === y) return current;
            return { x, y };
        });
    };

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
                        draggablePiece={Boolean(piece && piece.color === Turn && gameStatus !== "checkmate" && gameStatus !== "stalemate" && isPromoted == null)}
                        isDraggingPiece={Boolean(draggedPiece && draggedPiece.x === i && draggedPiece.y === j)}
                        isDragTarget={Boolean(
                            draggedPiece &&
                            dragOverSquare &&
                            dragOverSquare.x === i &&
                            dragOverSquare.y === j &&
                            validMoves?.some((move) => move[0] === i && move[1] === j)
                        )}
                        onPieceDragStart={(event) => handlePieceDragStart(event, i, j, piece)}
                        onDragOver={(event) => handleSquareDragOver(event, i, j)}
                        onDragEnter={(event) => handleSquareDragOver(event, i, j)}
                        onDrop={(event) => handleSquareDrop(event, i, j, piece)}
                        onDragEnd={() => {
                            setDraggedPiece(null);
                            setDragOverSquare(null);
                        }}
                        onClick={() => {
                            const resolution = handleOnClick({
                                x: i,
                                y: j,
                                piece,
                                boardState,
                                focusPiece: FocusPiece,
                                validMoves,
                                turn: Turn,
                                isPromoted,
                                moveList: MoveList,
                                gameStatus,
                                castlingRights,
                                enPassantTarget,
                            });

                            applyResolution(resolution);
                        }}
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

    useLayoutEffect(() => {
        const updateSquareSize = () => {
            setSquareSize(getMaxSquareSize());
        };

        updateSquareSize();
        window.addEventListener("resize", updateSquareSize);
        return () => window.removeEventListener("resize", updateSquareSize);
    }, [setSquareSize]);

    useEffect(() => {
        setBoardstate(initialBoardState);
        setGameStatus("playing");
        setCastlingRights(initialCastlingRights);
        setEnPassantTarget(null);
        setDraggedPiece(null);
        setDragOverSquare(null);
    }, [setBoardstate, setCastlingRights, setEnPassantTarget, setGameStatus])

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
