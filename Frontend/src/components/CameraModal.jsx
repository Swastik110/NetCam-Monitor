import { useState, useEffect } from "react";
import { X, Activity, Server, MapPin, Hash, Clock, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client'; 

export default function CameraModal({ camera, onClose }) {
  const [chartData, setChartData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // <-- NEW: Local state so the modal can update its own text live 
  const [liveCamera, setLiveCamera] = useState(camera); 

  // Fetch initial 12-hour history when modal opens
  useEffect(() => {
    if (camera) {
      setLiveCamera(camera); 
      setIsLoadingHistory(true);
      fetch(`http://localhost:5000/api/cameras/${camera.id}/history`)
        .then(res => res.json())
        .then(data => {
          setChartData(data);
          setIsLoadingHistory(false);
        })
        .catch(err => {
          console.error("Failed to load history", err);
          setIsLoadingHistory(false);
        });
    }
  }, [camera]);

  // <-- NEW: Real-Time Socket Listener
  useEffect(() => {
    if (!camera) return;

    // Connect to your backend
    const socket = io("http://localhost:5000");

    socket.on('cameraStatusUpdate', (updatedData) => {
      // Only update if the broadcast is for the camera we are currently looking at
      // Note: check if your frontend uses camera.id or camera.deviceId
      if (updatedData.id === camera.id || updatedData.id === camera.deviceId) { 
        
        // 1. Update the text boxes (Status, Latency, Root Cause)
        setLiveCamera(prev => ({
          ...prev,
          status: updatedData.status,
          latency: updatedData.latency,
          rootCause: updatedData.rootCause
        }));

        // 2. Append the new latency point to the live graph
        if (updatedData.latency !== '-') {
          const numericLatency = parseInt(updatedData.latency.replace('ms', ''));
          const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          setChartData(prevData => {
            const newData = [...prevData, { time: now, latency: numericLatency }];
            // Keep graph from growing infinitely (e.g., keep the last 50 points)
            return newData.length > 50 ? newData.slice(newData.length - 50) : newData; 
          });
        }
      }
    });

    // Cleanup: Disconnect socket when modal closes so we don't leak memory
    return () => socket.disconnect();
  }, [camera]);

  if (!liveCamera) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          <p className="text-indigo-400 font-bold text-sm">
            {payload[0].value} ms
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - NOW USING liveCamera */}
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            {liveCamera.name} 
            <span className={`text-xs font-normal px-2 py-0.5 rounded-full border transition-colors duration-500 ${
              liveCamera.status === 'online' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
              liveCamera.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {liveCamera.status.toUpperCase()}
            </span>
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Info Grid - NOW USING liveCamera */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center text-slate-400 mb-1 text-sm"><Hash className="w-4 h-4 mr-2" /> Device ID</div>
              <div className="text-slate-100 font-mono">{liveCamera.id || liveCamera.deviceId}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center text-slate-400 mb-1 text-sm"><Server className="w-4 h-4 mr-2" /> IP Address</div>
              <div className="text-slate-100 font-mono">{liveCamera.ip}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center text-slate-400 mb-1 text-sm"><MapPin className="w-4 h-4 mr-2" /> Location</div>
              <div className="text-slate-100">{liveCamera.location}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center text-slate-400 mb-1 text-sm"><Activity className="w-4 h-4 mr-2" /> Current Latency</div>
              <div className="text-slate-100 font-mono transition-all duration-300">{liveCamera.latency}</div>
            </div>
            {/* New Diagnostic Status Box */}
            <div className={`col-span-2 p-4 rounded-xl border transition-colors duration-500 ${liveCamera.status === 'online' ? 'bg-slate-900/50 border-slate-700/50' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-center text-slate-400 mb-1 text-sm">
                <Activity className="w-4 h-4 mr-2" /> Diagnostic Status
              </div>
              <div className={`font-semibold ${liveCamera.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                {liveCamera.rootCause || 'System Operating Normally'}
              </div>
            </div>
          </div>

          {/* Historical Uptime Graph */}
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-400" />
                Network Latency History
              </span>
              {isLoadingHistory && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
            </h3>
            <div className="h-48 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}ms`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="latency" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                  {isLoadingHistory ? 'Loading data...' : 'Awaiting ping data...'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}