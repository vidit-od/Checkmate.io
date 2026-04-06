import { piece } from "../../types/chess";

function intToChar(num: number): string{
    return String.fromCharCode(97 + num);
}

export const ConvertMoves = (piece:piece, x:number, y:number, Turn: "black"|"white", MoveList: {w:string; b:string|null}[])=>{

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

    const m: {
        w: string;
        b: string | null;
      }[] = MoveList;
      
      if (Turn === 'white') {
        return [...m, { w: Move, b: null }];
      }

      const updatedMoveList = [...m];
      updatedMoveList[updatedMoveList.length - 1] = {
        ...updatedMoveList[updatedMoveList.length - 1],
        b: Move,
      };
      return updatedMoveList;
}
