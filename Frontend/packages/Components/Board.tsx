import Square from "./Square"
function Board(){

    const handleOnClick = (i:number,j:number)=>{
        console.log(i*8 + j);
    } 
    const renderSquares = () =>{
        const square:JSX.Element[][] = [[]]
        for(let i = 0; i < 8; i++){
            const row:JSX.Element[] = []
            for(let j = 0; j < 8; j++){
                row.push(
                <div className="flex-row">
                <Square 
                    key={i*8 + j}
                    xPos={i}
                    yPos={j}
                    onClick={()=> handleOnClick(i,j)}
                />
                </div>);
            }
            square.push(row);
        }
        return square;
    }
    return (
       <div className="bg-cover bg-ChessBoard w-fit h-fit">
            {renderSquares().map((row,rowIndex) =>(
                <div className="flex" key={rowIndex}>
                    {row}
                </div>
            ))}
       </div> 
    )
}

export default Board