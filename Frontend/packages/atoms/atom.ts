import {atom} from 'recoil'
import {initialBoardState} from "../Helpers/InitialBoard"
import { CastlingRights, piece, Position } from '../../types/chess';
import { initialCastlingRights } from '../Helpers/MoveEngine';

export const getMaxSquareSize = () => {
    if (typeof window === "undefined") {
        return 64;
    }

    const totalHeight = window.innerHeight;
    const totalWidth = window.innerWidth;
    const squareSize = Math.max(Math.min(totalHeight - 80, totalWidth - 100) / 8, 0);
    return squareSize;
};

export const boardStateAtom = atom({
    key: "boardStateAtom",
    default: initialBoardState,
});

export const FocusPieceAtom = atom<{x: number , y: number, piece: piece} | null>({
    key: "FocusPieceAtom",
    default: null,
});

export const validMovesAtom = atom<[x: number , y: number][]| null>({
    key: "validMovesAtom",
    default:null
});

export const turnAtom = atom<"black" | "white">({
    key: "turnAtom",
    default: "white",
});

export const underAttackAtom = atom<{ x: number; y: number } | null>({
    key: "underAttackAtom",
    default: null,
  });

export const isPromotedAtom = atom<{ x: number; y: number } | null>({
    key: "isPromotedAtom",
    default: null,
  });

export const MoveListAtom = atom<{ w: string; b: string | null}[]>({
    key : "MovesAtom",
    default:[],
})

export const gameStatusAtom = atom<"playing" | "check" | "checkmate" | "stalemate" | "Resigned">({
    key: "gameStatusAtom",
    default: "playing",
});

export const castlingRightsAtom = atom<CastlingRights>({
    key: "castlingRightsAtom",
    default: initialCastlingRights,
});

export const enPassantTargetAtom = atom<Position | null>({
    key: "enPassantTargetAtom",
    default: null,
});

export const SquareSize = atom<number>({
    key : "squareSize",
    default: getMaxSquareSize(),
})

export const backendSessionAtom = atom<{ gameId: string; playerToken: string } | null>({
    key: "backendSessionAtom",
    default: null,
});

export const currentPlyAtom = atom<number>({
    key: "currentPlyAtom",
    default: 0,
});

export const boardLoadingAtom = atom<boolean>({
    key: "boardLoadingAtom",
    default: true,
});

export const boardErrorAtom = atom<string | null>({
    key: "boardErrorAtom",
    default: null,
});
