import {BoardType, Position } from "../../types/chess";

export const FindKing = (color: 'white' | 'black', board: BoardType) => {
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
export const getCheckState = (color: 'white' | 'black', board: BoardType): { inCheck: boolean; underAttack: Position | null } => {
    const kingPosition = FindKing(color, board);
    if (!kingPosition) {
        return { inCheck: false, underAttack: null };
    }

    const attackerColor = color === "white" ? "black" : "white";
    if (isSquareAttacked({ x: kingPosition[0], y: kingPosition[1] }, attackerColor, board)) {
        return {
            inCheck: true,
            underAttack: { x: kingPosition[0], y: kingPosition[1] },
        };
    }

    return { inCheck: false, underAttack: null };
}

export const isKingInCheck = (color: 'white' | 'black', board: BoardType) => {
    return getCheckState(color, board).inCheck;
}

export const isSquareAttacked = (target: Position, attackerColor: "white" | "black", board: BoardType): boolean => {
    const pawnForward = attackerColor === "white" ? -1 : 1;
    const pawnAttackers = [
        { x: target.x - pawnForward, y: target.y - 1 },
        { x: target.x - pawnForward, y: target.y + 1 },
    ];

    for (const position of pawnAttackers) {
        if (position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8) {
            const piece = board.piece[position.x][position.y];
            if (piece?.color === attackerColor && piece.type === "pawn") {
                return true;
            }
        }
    }

    const knightOffsets = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2],
    ];

    for (const [dx, dy] of knightOffsets) {
        const x = target.x + dx;
        const y = target.y + dy;
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            const piece = board.piece[x][y];
            if (piece?.color === attackerColor && piece.type === "knight") {
                return true;
            }
        }
    }

    const kingOffsets = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [1, -1], [-1, 1], [-1, -1],
    ];

    for (const [dx, dy] of kingOffsets) {
        const x = target.x + dx;
        const y = target.y + dy;
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            const piece = board.piece[x][y];
            if (piece?.color === attackerColor && piece.type === "king") {
                return true;
            }
        }
    }

    const slidingDirections = [
        { dx: 1, dy: 0, attackers: ["rook", "queen"] },
        { dx: -1, dy: 0, attackers: ["rook", "queen"] },
        { dx: 0, dy: 1, attackers: ["rook", "queen"] },
        { dx: 0, dy: -1, attackers: ["rook", "queen"] },
        { dx: 1, dy: 1, attackers: ["bishop", "queen"] },
        { dx: 1, dy: -1, attackers: ["bishop", "queen"] },
        { dx: -1, dy: 1, attackers: ["bishop", "queen"] },
        { dx: -1, dy: -1, attackers: ["bishop", "queen"] },
    ] as const;

    for (const direction of slidingDirections) {
        let x = target.x + direction.dx;
        let y = target.y + direction.dy;

        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            const piece = board.piece[x][y];
            if (piece) {
                const attackers: readonly string[] = direction.attackers;
                if (
                    piece.color === attackerColor &&
                    attackers.includes(piece.type)
                ) {
                    return true;
                }
                break;
            }
            x += direction.dx;
            y += direction.dy;
        }
    }

    return false;
}
