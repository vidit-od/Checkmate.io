import {atom} from 'recoil'
import {initialBoardState} from "../Helpers/InitialBoard"
import { CastlingRights, piece, Position } from '../../types/chess';
import { initialCastlingRights } from '../Helpers/MoveEngine';
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

export const gameStatusAtom = atom<"playing" | "check" | "checkmate" | "stalemate">({
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
