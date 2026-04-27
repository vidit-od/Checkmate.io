import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import Board from "./Components/Board"
import NameCard from "./Components/NameCard"
import Moves from "./Moves";
import Status from "./Components/Status"
import { SquareSize } from "./atoms/atom";
import { gameStatusAtom } from "./atoms/atom";

function ChessBoard(){
    const squareSize = useRecoilValue(SquareSize);
    const [viewportWidth, setViewportWidth] = useState(() =>
        typeof window === "undefined" ? 0 : window.innerWidth
    );
    const gameStatus = useRecoilValue(gameStatusAtom);

    useEffect(() => {
        const updateViewportWidth = () => setViewportWidth(window.innerWidth);

        updateViewportWidth();
        window.addEventListener("resize", updateViewportWidth);

        return () => {
            window.removeEventListener("resize", updateViewportWidth);
        };
    }, []);

    const isDesktopLayout = viewportWidth >= 1024;
    const keepFixedDesktopWidths = viewportWidth > 1024;
    const boardWidth = Math.round(squareSize * 8);

    return (
        <div
          className={` relative flex justify-center overflow-x-hidden bg-gray-600 px-4 ${
            isDesktopLayout ? "flex-nowrap items-start" : "flex-wrap"
          }`}
        >
          { (gameStatus !== "playing") && <Status/>}
          <div className="flex-col px-2 lg:px-5">
           <NameCard color = "black"/>
           <Board/>
           <NameCard color = "white"/>
          </div>
          <div
            className={`${
              isDesktopLayout
                ? keepFixedDesktopWidths
                  ? "my-auto w-[300px] shrink-0 xl:w-[380px]"
                  : "my-auto min-w-[300px] flex-1"
                : "my-6"
            }`}
            style={
              isDesktopLayout
                ? undefined
                : {
                    width: boardWidth ? `${boardWidth}px` : "100%",
                    maxWidth: "100%",
                  }
            }
          >
            <Moves sideBySide={isDesktopLayout}/>
          </div>
       </div>
    )
}

export default ChessBoard
