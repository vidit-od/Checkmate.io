import { useRecoilState } from "recoil"
import { MoveListAtom } from "./atoms/atom"

type MovesProps = {
    sideBySide: boolean;
};

function Moves({ sideBySide }: MovesProps){
    const [MoveList] = useRecoilState(MoveListAtom);

    return (
        <div className={`bg-slate-700 w-full rounded-md shadow-lg text-center p-2 flex flex-col ${sideBySide ? "sticky top-4 h-[calc(100vh-3rem)]" : "h-[50vh]"}`}>
            <h1 className="text-base sm:text-xl md:text-3xl h-[40px] font-bold bg-white bg-clip-text text-transparent">
                Level 0
            </h1>
            <div className="flex-1 min-h-0">
            <div className="w-full h-full border border-gray-600 rounded-lg overflow-hidden overflow-y-auto pr-1 custom-scrollbar">
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
        </div>
    )
}

export default Moves
