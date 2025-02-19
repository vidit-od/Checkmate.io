import React from "react"
import Board from "./Components/Board"
import NameCard from "./Components/NameCard"
import Moves from "./Moves";
function ChessBoard(){
    return (
        <div className="flex bg-gray-600">
       <div className="flex-col h-screen px-5 bg-gray-600">
        <NameCard/>      
        <Board/>
        <NameCard/>
       </div>
       <div className="w-full relative my-8 mx-3">
         <Moves/>
       </div>
       </div> 
    )
}

export default ChessBoard