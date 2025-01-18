import { useEffect, useState } from "react"


interface SquareProps {
    xPos: number; // X position of the square
    yPos: number; // Y position of the square
    piece?: string; // Chess piece on the square (e.g., "pawn", "knight")
    color?: "black" | "white"; // Color of the square
    hints?: boolean; // Highlight the square if it's a hint
    onClick?: () => void; // Optional click handler
  }

const Square: React.FC<SquareProps> = ({xPos,yPos,piece,color,hints,onClick}) =>{
    const [size,setSize] = useState<number>(0)

    useEffect(()=>{
        const TotalWidth = window.innerWidth;
        const TotalHeight = window.innerHeight - 70;
        const SquareSize = Math.min(TotalHeight,TotalWidth)/8; 
        setSize(SquareSize);
    },[])
    
    return (   
        <div className="bg-transparent relative text-xxl" style={{
            width:size,
            height:size,
            border: "1px solid black"
        }} onClick={onClick}>
            {yPos == 0 && <div className="text-sm absolute top-0 left-1">{Math.abs(8 - 1 - xPos) + 1}</div>}
            
            {xPos == 7 && <div className="text-sm absolute bottom-1 right-1">
                {String.fromCharCode('a'.charCodeAt(0) + yPos)}
            </div>}
            
            <div className="bg-WRook absolute w-full h-full left-0 top-0 bg-cover"></div>
        </div> 
    
    )
}

export default Square