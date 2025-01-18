import './App.css'
import ChessBoard from "../packages/ChessBoard"
import SideBar from "../packages/SideBar"
function App() {
  return (
    <>
      <div className="h-screen w-screen flex bg-red-500">
        <div className='grow-0'><SideBar/></div>
        <div className='grow'><ChessBoard/></div>
        
      </div>
    </>
  )
}

export default App
