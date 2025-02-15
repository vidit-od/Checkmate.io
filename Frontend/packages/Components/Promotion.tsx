import React, { useEffect, useState } from "react";

interface PromotionProps{
    color: "white" | "black";
}
const Promotion: React.FC<PromotionProps> = ({color})=>{
    return (
        <div className=" absolute bg-white top-0 w-full h-max z-50 shadow-lg rounded-md shadow-black">
            <div className=" p-0">
                <img src={`./src/assets/${color}queen.png`} alt="" />
            </div>
            <div className=" p-0">
                <img src={`./src/assets/${color}knight.png`} alt="" />
            </div>
            <div className=" p-0">
                <img src={`./src/assets/${color}rook.png`} alt="" />
            </div>
            <div className=" p-0">
                <img src={`./src/assets/${color}bishop.png`} alt="" />
            </div>
        </div>
    )
}

export default Promotion