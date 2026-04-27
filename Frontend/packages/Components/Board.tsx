import { useEffect, useLayoutEffect, useState } from "react";
import Square from "./Square"
import {handleOnClick} from "../Helpers/Onclick"
import { useRecoilState } from "recoil";
import { backendSessionAtom, boardErrorAtom, boardLoadingAtom, boardStateAtom, castlingRightsAtom, currentPlyAtom, enPassantTargetAtom, FocusPieceAtom, gameStatusAtom, getMaxSquareSize, isPromotedAtom, MoveListAtom, SquareSize, turnAtom, underAttackAtom, validMovesAtom } from "../atoms/atom";
import { getCheckState } from "../Helpers/CheckKing";
import { ConvertMoves } from "../Helpers/ConvertMoves";
import { clearStoredSession, fetchGame, getStoredSession, startGame, storeSession, submitMove } from "../api/gameApi";
import { BackendGameSnapshot, BackendMoveRecord, FocusedPiece, piece, Position } from "../../types/chess";

const mapBackendStatus = (status: BackendGameSnapshot["status"]) => {
    if (status === "resigned") {
        return "Resigned" as const;
    }

    return status;
};

const buildMoveList = (moveHistory: BackendMoveRecord[]) => {
    return moveHistory.reduce<{w:string; b:string|null}[]>((moveList, move) => {
        return ConvertMoves(
            { type: move.piece, color: move.color },
            move.to.x,
            move.to.y,
            move.color,
            moveList,
        );
    }, []);
};

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
    const [, setBackendSession] = useRecoilState(backendSessionAtom);
    const [currentPly, setCurrentPly] = useRecoilState(currentPlyAtom);
    const [boardLoading, setBoardLoading] = useRecoilState(boardLoadingAtom);
    const [, setBoardError] = useRecoilState(boardErrorAtom);
    const [draggedPiece, setDraggedPiece] = useState<FocusedPiece | null>(null);
    const [dragOverSquare, setDragOverSquare] = useState<{ x: number; y: number } | null>(null);
    const [pendingPromotionMove, setPendingPromotionMove] = useState<{ from: Position; to: Position } | null>(null);

    const syncSnapshot = (snapshot: BackendGameSnapshot) => {
        setBoardstate(snapshot.board);
        setTurn(snapshot.turn);
        setGameStatus(mapBackendStatus(snapshot.status));
        setCastlingRights(snapshot.castlingRights);
        setEnPassantTarget(snapshot.enPassantTarget);
        setMoveList(buildMoveList(snapshot.moveHistory));
        setCurrentPly(snapshot.ply);
        setFocusPiece(null);
        setValidMoves(null);
        setPromoted(null);
        setDraggedPiece(null);
        setDragOverSquare(null);
        setPendingPromotionMove(null);

        const shouldShowCheck = snapshot.status === "check" || snapshot.status === "checkmate";
        if (shouldShowCheck) {
            const checkState = getCheckState(snapshot.turn, snapshot.board);
            setUnderAttack(checkState.underAttack);
            return;
        }

        setUnderAttack(null);
    };

    const ensureSession = async () => {
        const storedSession = getStoredSession();
        if (storedSession) {
            try {
                const snapshot = await fetchGame(storedSession);
                setBackendSession(storedSession);
                syncSnapshot(snapshot);
                return;
            } catch {
                clearStoredSession();
            }
        }

        const response = await startGame();
        const nextSession = {
            gameId: response.snapshot.gameId,
            playerToken: response.playerToken,
        };

        storeSession(nextSession);
        setBackendSession(nextSession);
        syncSnapshot(response.snapshot);
    };

    const submitServerMove = async (from: Position, to: Position, promotion?: "rook" | "knight" | "bishop" | "queen") => {
        const session = getStoredSession();
        if (!session) {
            throw new Error("No backend game session is available.");
        }

        setBoardLoading(true);
        setBoardError(null);

        try {
            const response = await submitMove(session, {
                from,
                to,
                promotion,
                expectedPly: currentPly,
            });
            syncSnapshot(response.snapshot);
        } finally {
            setBoardLoading(false);
        }
    };

    const attemptMove = async (from: Position, to: Position) => {
        const movingPiece = boardState.piece[from.x][from.y];
        if (!movingPiece) {
            return;
        }

        const isPromotionMove = movingPiece.type === "pawn" && ((movingPiece.color === "white" && to.x === 0) || (movingPiece.color === "black" && to.x === 7));

        if (isPromotionMove) {
            setPendingPromotionMove({ from, to });
            setPromoted({ ...to });
            setFocusPiece({ x: from.x, y: from.y, piece: movingPiece });
            return;
        }

        await submitServerMove(from, to);
    };

    const applyResolution = (resolution: ReturnType<typeof handleOnClick>) => {
        setFocusPiece(resolution.focusPiece);
        setValidMoves(resolution.validMoves);
        if (resolution.focusPiece == null) {
            setPromoted(null);
            setPendingPromotionMove(null);
        }
    };

    const handlePieceDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        x: number,
        y: number,
        piece: piece | null
    ) => {
        if (!piece || piece.color !== Turn || gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "Resigned" || isPromoted != null || boardLoading) {
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

    const handleSquareDrop = (event: React.DragEvent<HTMLDivElement>, x: number, y: number) => {
        event.preventDefault();
        setDragOverSquare(null);
        if (!draggedPiece) return;

        if (validMoves?.some((move) => move[0] === x && move[1] === y)) {
            void attemptMove(
                { x: draggedPiece.x, y: draggedPiece.y },
                { x, y }
            ).catch((error: Error) => {
                setBoardError(error.message);
            });
        } else {
            setFocusPiece(null);
            setValidMoves(null);
        }
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
                        draggablePiece={Boolean(piece && piece.color === Turn && gameStatus !== "checkmate" && gameStatus !== "stalemate" && gameStatus !== "Resigned" && isPromoted == null && !boardLoading)}
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
                        onDrop={(event) => handleSquareDrop(event, i, j)}
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

                            if (
                                FocusPiece &&
                                validMoves?.some((move) => move[0] === i && move[1] === j) &&
                                (!piece || piece.color !== Turn)
                            ) {
                                void attemptMove(
                                    { x: FocusPiece.x, y: FocusPiece.y },
                                    { x: i, y: j }
                                ).catch((error: Error) => {
                                    setBoardError(error.message);
                                });
                                return;
                            }

                            applyResolution(resolution);
                        }}
                        piece={piece || null}
                        hint={valid_hint}
                        focus={Focus}
                        attacked={(UnderAttack != null && UnderAttack.x == i && UnderAttack.y == j) ? true : false}
                        promotion = {isPromoted}
                        promotionColor={pendingPromotionMove ? Turn : null}
                        onPromotion = {(promotionPiece) => {
                            if (!pendingPromotionMove) return;
                            void submitServerMove(pendingPromotionMove.from, pendingPromotionMove.to, promotionPiece).catch((error: Error) => {
                                setBoardError(error.message);
                            });
                        }}
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
        let cancelled = false;

        const initializeBoard = async () => {
            setBoardLoading(true);
            setBoardError(null);

            try {
                await ensureSession();
            } catch (error) {
                if (!cancelled) {
                    setBoardError(error instanceof Error ? error.message : "Could not connect to the backend.");
                }
            } finally {
                if (!cancelled) {
                    setBoardLoading(false);
                }
            }
        };

        void initializeBoard();

        return () => {
            cancelled = true;
        };
    }, [setBackendSession, setBoardError, setBoardLoading, setBoardstate, setCastlingRights, setCurrentPly, setEnPassantTarget, setFocusPiece, setGameStatus, setMoveList, setPromoted, setTurn, setUnderAttack, setValidMoves])

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
