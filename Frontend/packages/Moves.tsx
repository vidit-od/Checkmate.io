import { useRecoilState } from "recoil"
import { MoveListAtom } from "./atoms/atom"
import React from "react";

function Moves(){
    const [MoveList] = useRecoilState(MoveListAtom);

    return (
        <div className="bg-slate-700 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-md shadow-lg text-center p-2 overflow-y-scroll custom-scrollbar">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-white bg-clip-text text-transparent mb-4">
                Checkmate.io
            </h1>
                <div className="w-full border border-gray-600 rounded-lg overflow-hidden">
                {MoveList.map((move, index) => (
                <div key={index} 
                    className={`flex justify-evenly text-white p-2 border-b border-gray-600 
                    ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}`}>
                    <p className="w-1/2 text-center">{move.w}</p>
                    <p className="w-1/2 text-center">{move.b}</p>
                </div>
            ))}
            </div>
        </div>
    )
}

export default Moves