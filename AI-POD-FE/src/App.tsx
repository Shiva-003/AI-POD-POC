import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./App.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 flex justify-center">
      <div
        className={`w-full max-w-5xl bg-white rounded-xl shadow-lg 
          ${isHome ? "px-6 py-6" : "p-10"} 
          flex flex-col`}
        style={{
          maxHeight: isHome ? "650px" : "none",
        }}
      >
        {/* Header */}
        <div
          onClick={() => !isHome && navigate("/")}
          className="flex items-center gap-4 mb-8 border-b pb-4 cursor-pointer select-none"
        >
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Proceedix</h1>
        </div>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
