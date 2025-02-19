import { useRecoilState } from "recoil"
import { MoveListAtom } from "./atoms/atom"

function Moves(){
    const [MoveList] = useRecoilState(MoveListAtom);

    return (
        <div className=" bg-slate-700 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-md shadow-lg text-center">
            Checkmate.io
            {MoveList.map((move, index) =>(
                <div key={index} className="flex justify-evenly text-white">
                    <p>{move.w}</p>
                    <p>{move.b}</p>
                </div>
            ))}
        </div>
    )
}

export default Moves