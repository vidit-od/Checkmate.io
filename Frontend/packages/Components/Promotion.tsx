import React, {  } from "react";

interface PromotionProps{
    color: "white" | "black";
    onPieceSelect: (piece: "rook" | "knight" | "bishop" | "queen") => void;
}
const Promotion: React.FC<PromotionProps> = ({color, onPieceSelect})=>{
    const handleOptionClick = (
        event: React.MouseEvent<HTMLDivElement>,
        piece: "rook" | "knight" | "bishop" | "queen"
    ) => {
        event.stopPropagation();
        onPieceSelect(piece);
    };

    return (
        <div className={`absolute bg-white ${
            color === "white"? "top-0" : "bottom-0"
        }
        bottom-0 w-full h-max z-50 shadow-lg rounded-md shadow-black`}>
            <div className=" p-0" onClick={(event) => handleOptionClick(event, "queen")}>
                <img src={`/assets/${color}queen.png`} alt="" />
            </div>
            <div className=" p-0" onClick={(event) => handleOptionClick(event, "knight")}>
                <img src={`/assets/${color}knight.png`} alt="" />
            </div>
            <div className=" p-0" onClick={(event) => handleOptionClick(event, "rook")}>
                <img src={`/assets/${color}rook.png`} alt="" />
            </div>
            <div className=" p-0" onClick={(event) => handleOptionClick(event, "bishop")}>
                <img src={`/assets/${color}bishop.png`} alt="" />
            </div>
        </div>
    )
}

export default Promotion
