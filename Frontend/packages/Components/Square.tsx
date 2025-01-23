import { useEffect, useState } from "react"
import React from "react";
import { SquareProps } from "../../types/chess";
const Square: React.FC<SquareProps> = ({xPos,yPos,onClick,piece,hint}) =>{
    const [size,setSize] = useState<number>(0)

    useEffect(()=>{
        const TotalWidth = window.innerWidth;
        const TotalHeight = window.innerHeight - 70;
        const SquareSize = Math.min(TotalHeight,TotalWidth)/8; 
        setSize(SquareSize);
        
    },[])
    
    let colorCode = "";
    if(piece?.color != undefined){
        colorCode = piece.color;
        colorCode = colorCode + piece.type
    }
    return (   
        <div className="bg-transparent relative text-xxl" style={{
            width:size,
            height:size,
        }} onClick={onClick}>
            {yPos == 0 && <div className="text-sm absolute top-0 left-1" style={{
                color: (Math.abs(8 - 1 - xPos) % 2 == 0)?"white":"green"
            }}>{Math.abs(8 - 1 - xPos) + 1}</div>}
            
            {xPos == 7 && <div className="text-sm absolute bottom-1 right-1" style={{
                color: ( yPos % 2 == 0)? "white" : "green"
            }}>
                {String.fromCharCode('a'.charCodeAt(0) + yPos)}
            </div>}
            
            {colorCode != "" && <div className="absolute w-full h-full left-0 top-0 bg-cover" style={{
                backgroundImage : `url('./src/assets/${colorCode}.png')`,
                zIndex:1
            }}></div>}

            {hint && colorCode != "" && <div className=" absolute h-full w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-8 z-0 border-slate-700 opacity-30"></div> }
            {hint && colorCode == "" && <div className=" absolute h-1/3 w-1/3 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-700 opacity-30 rounded-full"> </div>}
        </div> 
    
    )
}

export default Square