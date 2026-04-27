import { SquareProps } from "../../types/chess";
import Promotion from "./Promotion";
import { useRecoilState } from "recoil";
import { SquareSize, gameStatusAtom } from "../atoms/atom";
const Square: React.FC<SquareProps> = ({
    xPos,
    yPos,
    onClick,
    onPieceDragStart,
    onDragOver,
    onDragEnter,
    onDrop,
    onDragEnd,
    draggablePiece,
    isDraggingPiece,
    isDragTarget,
    piece,
    hint,
    focus,
    attacked,
    promotion,
    promotionColor,
    onPromotion
}) =>{
    const [size] = useRecoilState(SquareSize);
    const [gameStatus] = useRecoilState(gameStatusAtom);

    const isGameOver = gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "Resigned";

    const handlePieceSelect = (pieceType: "rook" | "knight" | "bishop" | "queen")=>{
        if (isGameOver) return;
        void onPromotion(pieceType);
    }

    const handleSquareClick = () => {
        if (isGameOver) return;
        onClick?.();
    }

    let colorCode = "";
    if(piece?.color != undefined){
        colorCode = piece.color;
        colorCode = colorCode + piece.type
    }

    const notationFontSize = Math.max(size * 0.16, 8);

    return (
        <div className="bg-transparent relative text-xxl" style={{
            width:size,
            height:size,
        }} onClick={handleSquareClick} onDragOver={onDragOver} onDragEnter={onDragEnter} onDrop={onDrop}>
            {yPos == 0 && <div className="absolute top-0 left-1" style={{
                fontSize: notationFontSize,
                lineHeight: 1,
                color: (Math.abs(8 - 1 - xPos) % 2 == 0)?"white":"green"
            }}>{Math.abs(8 - 1 - xPos) + 1}</div>}

            {xPos == 7 && <div className="absolute bottom-1 right-1" style={{
                fontSize: notationFontSize,
                lineHeight: 1,
                color: ( yPos % 2 == 0)? "white" : "green"
            }}>
                {String.fromCharCode('a'.charCodeAt(0) + yPos)}
            </div>}

            {colorCode != "" && <div
                className={`absolute w-full h-full left-0 top-0 bg-cover ${draggablePiece ? "cursor-grab active:cursor-grabbing" : ""} ${isDraggingPiece ? "opacity-40 scale-95" : ""} transition-all duration-150`}
                style={{
                backgroundImage : `url('/assets/${colorCode}.png')`,
                backgroundColor:(focus)
                ?'rgba(255, 255, 51, 0.5)':
                (attacked)
                ?'rgba(255, 0, 0, 0.5)'
                :'transparent',
                zIndex:1
            }}
                onDragStart={onPieceDragStart}
                onDragEnd={onDragEnd}
                draggable={draggablePiece}
            ></div>}

            {hint && colorCode != "" && <div className=" absolute h-full w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-8 z-10 border-slate-700 opacity-30"></div> }
            {hint && colorCode == "" && <div className=" absolute h-1/3 w-1/3 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-700 opacity-30 rounded-full"> </div>}
            {isDragTarget && <div className="absolute inset-0 border-[0.4em] border-gray-200/85 shadow-[0_0_18px_rgba(252,211,77,0.35)] pointer-events-none z-1"></div>}

            {promotion != null && xPos == promotion.x && yPos == promotion.y && promotionColor && <Promotion color = {promotionColor} onPieceSelect={handlePieceSelect}/>}
        </div>

    )
}

export default Square
