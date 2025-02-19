import { piece } from "../../types/chess";

function intToChar(num: number): string{
    return String.fromCharCode(97 + num);
}

export const ConvertMoves = (piece:piece, x:number, y:number, Turn: "black"|"white", MoveList: {w:string; b:string|null}[], setMoveList : (movelist: {w:string , b: string|null}[]) => void)=>{

    let Move = "";
    switch(piece.type){
        case "queen":
            Move += 'Q'
            break;
        case "bishop":
            Move += 'B'
            break;
        case "king":
            Move += 'Kg'
            break;
        case "knight":
            Move += 'K'
            break;
        case "rook":
            Move += 'R'
            break; 
    }
    Move += intToChar(y)
    Move += 8-x;

    let m: {
        w: string;
        b: string | null;
      }[] = MoveList;
      
      if (Turn === 'white') {
        // Create a new entry for white's move
        setMoveList([...m, { w: Move, b: null }]);
      } else {
        // Make a copy of the array and update the last element
        const updatedMoveList = [...m];
        updatedMoveList[updatedMoveList.length - 1] = {
          ...updatedMoveList[updatedMoveList.length - 1], // Copy the last object
          b: Move, // Update black's move
        };
        setMoveList(updatedMoveList); // Update the state
      }
}