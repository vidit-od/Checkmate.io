import React from "react"
import Board from "./Components/Board"
import NameCard from "./Components/NameCard"

function ChessBoard(){
    return (
       <div className="flex-col h-screen px-5 bg-gray-600">
        <NameCard/>      
        <Board/>
        <NameCard/>
       </div> 
    )
}

export default ChessBoard