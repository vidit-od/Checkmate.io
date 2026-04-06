import { ClickHandlerArgs, ClickResolution } from "../../types/chess";
import {calculateValidMoves} from "./ValidMoves"
import {getGameStatus} from "./Checkmate"
import {ConvertMoves} from "./ConvertMoves"
import { applyMoveToBoard, getNextEnPassantTarget, getUpdatedCastlingRights } from "./MoveEngine";

export const handleOnClick = ({
    x,
    y,
    piece,
    boardState,
    focusPiece,
    validMoves,
    turn,
    isPromoted,
    moveList,
    gameStatus,
    castlingRights,
    enPassantTarget,
}: ClickHandlerArgs): ClickResolution => {
    const resetSelection = (): ClickResolution => ({
        boardState,
        focusPiece: null,
        validMoves: null,
        turn,
        promotion: isPromoted,
        underAttack: null,
        moveList,
        gameStatus,
        castlingRights,
        enPassantTarget,
        winnerMessage: null,
    });

    // if Game is over we do nothing;
    if (gameStatus === "checkmate" || gameStatus === "stalemate") {
        return {
            ...resetSelection(),
            underAttack: null,
        };
    }
    // do not allow out of turn moves;
    if ((focusPiece == null && piece?.color != turn) || isPromoted != null) {
        return resetSelection();
    }
    const curr = boardState.piece[x][y];
    // if Click same piece then deselect
    if (focusPiece != null && focusPiece.piece == curr && focusPiece.x == x && focusPiece.y == y) {
        return {
            ...resetSelection(),
            underAttack: null,
        };
    }
    // click different square
    // click another piece;
    if (curr && piece?.color == turn) {
        return {
            boardState,
            focusPiece: { x, y, piece: curr },
            validMoves: calculateValidMoves(x, y, curr, boardState, true, castlingRights, enPassantTarget),
            turn,
            promotion: isPromoted,
            underAttack: null,
            moveList,
            gameStatus,
            castlingRights,
            enPassantTarget,
            winnerMessage: null,
        };
    }
    // click empty square -> make move
    if (focusPiece != null) {
        const isCurrValid = validMoves?.some((coord) => x == coord[0] && y == coord[1]) ?? false;
        // if valid move then play; else reset Focus
        // Change turn after each valid move played;
        if (isCurrValid) {
            const opponentColor = turn === 'black' ? 'white' : 'black';
            const { board: newBoard, capturedPiece, capturePosition } = applyMoveToBoard(
                boardState,
                { x: focusPiece.x, y: focusPiece.y },
                { x, y },
                focusPiece.piece,
                enPassantTarget
            );

            const nextMoveList = ConvertMoves(focusPiece.piece, x, y, turn, moveList);
            const isPromotionMove = focusPiece.piece.type == 'pawn' && ((focusPiece.piece.color == 'white' && x == 0) || (focusPiece.piece.color == 'black' && x == 7));
            const nextCastlingRights = getUpdatedCastlingRights(
                castlingRights,
                focusPiece.piece,
                { x: focusPiece.x, y: focusPiece.y },
                capturedPiece,
                capturePosition
            );
            const nextEnPassantTarget = getNextEnPassantTarget(
                { x: focusPiece.x, y: focusPiece.y },
                { x, y },
                focusPiece.piece
            );
            const evaluation = getGameStatus(newBoard, opponentColor, nextCastlingRights, nextEnPassantTarget);

            return {
                boardState: newBoard,
                focusPiece: null,
                validMoves: null,
                turn: opponentColor,
                promotion: isPromotionMove ? {x, y} : null,
                underAttack: evaluation.underAttack,
                moveList: nextMoveList,
                gameStatus: evaluation.status,
                castlingRights: nextCastlingRights,
                enPassantTarget: nextEnPassantTarget,
                winnerMessage: evaluation.status === "checkmate" ? `${turn} won` : evaluation.status === "stalemate" ? "Draw" : null,
            };
        }

        return {
            ...resetSelection(),
            underAttack: null,
        };
    }

    return {
        ...resetSelection(),
        underAttack: null,
    };
}
