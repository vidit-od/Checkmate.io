import { useEffect, useState } from "react"
import React from "react";

interface piece{
    type: "pawn"|"rook"|"knight"|"bishop"|"queen"|"king";
    color : "black"|"white";
    hints : {
        x: Number,
        y: Number,
    }[];
}

interface SquareProps {
    xPos: number; // X position of the square
    yPos: number; // Y position of the square
    piece?: piece;
    onClick?: () => void; // Optional click handler
  }

const Square: React.FC<SquareProps> = ({xPos,yPos,onClick,piece}) =>{
    const [size,setSize] = useState<number>(0)

    useEffect(()=>{
        const TotalWidth = window.innerWidth;
        const TotalHeight = window.innerHeight - 70;
        const SquareSize = Math.min(TotalHeight,TotalWidth)/8; 
        setSize(SquareSize);
        
    },[])
    
    let colorCode = "";
    if(piece){
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
                backgroundImage : `url('./src/assets/${colorCode}.png')`
            }}></div>}
        </div> 
    
    )
}

export default Square