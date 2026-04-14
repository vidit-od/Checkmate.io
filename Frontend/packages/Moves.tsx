import { useRecoilState } from "recoil"
import { MoveListAtom } from "./atoms/atom"

type MovesProps = {
    sideBySide: boolean;
};

function Moves({ sideBySide }: MovesProps){
    const [MoveList] = useRecoilState(MoveListAtom);

    return (
        <div className={`bg-slate-700 w-full rounded-md shadow-lg text-center px-2 ${sideBySide ? "sticky top-4 h-[calc(100vh-3rem)]" : "h-[50vh]"}`}>
            <h1 className="text-base sm:text-xl md:text-3xl h-[40px] font-bold bg-white bg-clip-text text-transparent">
                Level 0
            </h1>
                <div className={`w-full border border-gray-600 rounded-lg overflow-hidden overflow-y-auto pr-1 custom-scrollbar ${sideBySide ? "max-h-[calc(100vh-8rem)]" : "max-h-[280px]"}`}>
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
