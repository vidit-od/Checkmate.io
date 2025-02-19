import './App.css'
import ChessBoard from "../packages/ChessBoard"
import SideBar from "../packages/SideBar"
function App() {
  return (
    <>
      <div className="h-screen w-screen flex">
        <div className='grow-0 bg-red-500'><SideBar/></div>
        <div className='grow'><ChessBoard/></div>
        
      </div>
    </>
  )
}

export default App
