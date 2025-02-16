import React, { useEffect, useState } from "react";

interface PromotionProps{
    color: "white" | "black";
    onPieceSelect: (piece: "rook" | "knight" | "bishop" | "queen") => void;
}
const Promotion: React.FC<PromotionProps> = ({color, onPieceSelect})=>{
    return (
        <div className=" absolute bg-white top-0 w-full h-max z-50 shadow-lg rounded-md shadow-black">
            <div className=" p-0" onClick={() => onPieceSelect(`queen`)}>
                <img src={`./src/assets/${color}queen.png`} alt="" />
            </div>
            <div className=" p-0" onClick={() => onPieceSelect(`knight`)}>
                <img src={`./src/assets/${color}knight.png`} alt="" />
            </div>
            <div className=" p-0" onClick={() => onPieceSelect(`rook`)}>
                <img src={`./src/assets/${color}rook.png`} alt="" />
            </div>
            <div className=" p-0" onClick={() => onPieceSelect(`bishop`)}>
                <img src={`./src/assets/${color}bishop.png`} alt="" />
            </div>
        </div>
    )
}

export default Promotion