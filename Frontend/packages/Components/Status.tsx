import { useRecoilValue } from "recoil";
import {boardErrorAtom, boardLoadingAtom, gameStatusAtom, turnAtom} from "../atoms/atom"

function Status(){
    const gameStatus = useRecoilValue(gameStatusAtom);
    const turn = useRecoilValue(turnAtom);
    const boardLoading = useRecoilValue(boardLoadingAtom);
    const boardError = useRecoilValue(boardErrorAtom);

    if (boardLoading) {
        return (
            <div className=" absolute w-full h-full backdrop-blur-sm bg-white/10 flex justify-center items-center z-10">
                <div className="bg-slate-700 p-4 rounded-md flex flex-col items-center text-white">
                    <div className="text-lg font-bold">Starting game</div>
                    <div>Syncing with backend...</div>
                </div>
            </div>
        )
    }

    if (boardError) {
        return (
            <div className=" absolute w-full h-full backdrop-blur-sm bg-white/10 flex justify-center items-center z-10">
                <div className="bg-slate-700 p-4 rounded-md flex flex-col items-center text-white">
                    <div className="text-lg font-bold">Backend error</div>
                    <div>{boardError}</div>
                </div>
            </div>
        )
    }

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
