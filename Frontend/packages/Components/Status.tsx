import { useRecoilValue } from "recoil";
import {gameStatusAtom, turnAtom} from "../atoms/atom"

function Status(){
    const gameStatus = useRecoilValue(gameStatusAtom);
    const turn = useRecoilValue(turnAtom);

    if(gameStatus == "playing" || gameStatus == "check") return (<></>);
    let winningColor : "white" | "black" | null = null;

    if(gameStatus == "checkmate" || gameStatus == "Resigned"){
        winningColor = turn === "white" ? "black" : "white";
    }

    return(
        <div className=" absolute w-full h-full backdrop-blur-sm bg-white/10 flex justify-center items-center z-10">
            <div className="absolute w-full h-full backdrop-blur-sm bg-white/10 flex justify-center items-center z-10">
                <div className="bg-slate-700 p-4 rounded-md flex flex-col items-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-bold">Game Over</div>
                            {(gameStatus === "checkmate" || gameStatus === "Resigned") ? (
                                <div>{winningColor} won by {gameStatus} </div>
                            ) : (
                                <div> Draw by Stalemate </div>
                            )}
                    </div>
                </div>
        </div>
        </div>
    )
}

export default Status;
