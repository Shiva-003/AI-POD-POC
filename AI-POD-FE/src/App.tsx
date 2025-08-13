import { Outlet } from 'react-router-dom'
import './App.css'

function App() {

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 border-b pb-6">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            ✓
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Proceedix</h1>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default App
