import { useRecoilValue } from "recoil"
import { backendSessionAtom } from "./atoms/atom";

function SideBar(){
    const backendSession = useRecoilValue(backendSessionAtom);
    return (
       <div className="w-full h-full flex flex-col justify-between p-2">
            <button className="w-full h-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </button>
            <button className="w-full h-fit opacity-40 cursor-not-allowed" disabled title={backendSession ? "Resign is not wired to the backend yet." : "Waiting for game session"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="Red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-flag-icon lucide-flag"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/></svg>
            </button>
        </div>
    )
}

export default SideBar
