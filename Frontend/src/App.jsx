import Dashboard from "./pages/Dashboard";
import { ShieldAlert } from "lucide-react";
import userLogo from "./assets/logo.png"; // <-- Added import

function App() {
  return (
    <div className="min-h-screen font-sans bg-slate-900">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-xl text-slate-100 tracking-tight">NetCam Monitor</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;