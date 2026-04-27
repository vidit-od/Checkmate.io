import './App.css'
import ChessBoard from "../packages/ChessBoard"
import SideBar from "../packages/SideBar"
function App() {
  return (
    <>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <div className='grow-0 bg-slate-700'><SideBar/></div>
        <div className='grow bg-gray-600 min-h-screen'><ChessBoard/></div>

      </div>
    </>
  )
}

export default App
