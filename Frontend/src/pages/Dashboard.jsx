import { useState, useMemo, useEffect } from "react";
import { io } from "socket.io-client";
import CameraList from "../components/CameraList";
import { Activity, Search, LayoutGrid, Loader2, Server, Radio as RadioIcon, Key, Router as RouterIcon, Video, ArrowLeft, Terminal, ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import logo from '../assets/Logo.png';

const socket = io("http://localhost:5000");

// --- UNIVERSAL REAL-TIME TELEMETRY MODAL COMPONENT ---
function UniversalTelemetryModal({ device, onClose }) {
  const [telemetry, setTelemetry] = useState([]);
  const [currentPing, setCurrentPing] = useState(0);
  
  const [historyLogs, setHistoryLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('live');
  
  // NEW: Live clock to calculate ongoing outage durations in real-time
  const [liveTime, setLiveTime] = useState(new Date());

  // NEW: Ticker that updates the clock every 10 seconds while staring at the history tab
  useEffect(() => {
    if (activeTab === 'history') {
      const interval = setInterval(() => setLiveTime(new Date()), 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!device) return;

    fetch(`http://localhost:5000/api/history/${device.id || device.deviceId}`)
      .then(res => res.json())
      .then(data => setHistoryLogs(data))
      .catch(err => console.error("History fetch error:", err));

    if (device.latency && device.latency !== '-') {
      const initialPing = parseInt(device.latency.replace('ms', ''));
      setCurrentPing(initialPing);
      setTelemetry([{
        time: new Date().toLocaleTimeString([], { second: '2-digit' }),
        ping: initialPing
      }]);
    } else {
      setTelemetry([]);
      setCurrentPing(0);
    }

    const handleLiveTelemetry = (updatedData) => {
      if (updatedData.id === device.id || updatedData.id === device.deviceId) {
        
        // Auto-refresh logs silently in the background
        fetch(`http://localhost:5000/api/history/${device.id || device.deviceId}`)
            .then(res => res.json())
            .then(data => setHistoryLogs(data));

        if (updatedData.latency && updatedData.latency !== '-') {
          const numericPing = parseInt(updatedData.latency.replace('ms', ''));
          setCurrentPing(numericPing);

          setTelemetry(prev => {
            const newPoint = {
              time: new Date().toLocaleTimeString([], { second: '2-digit' }),
              ping: numericPing
            };
            const newData = [...prev, newPoint];
            return newData.length > 20 ? newData.slice(newData.length - 20) : newData;
          });
        } else {
          setCurrentPing(0);
        }
      }
    };

    socket.on('cameraStatusUpdate', handleLiveTelemetry);
    return () => socket.off('cameraStatusUpdate', handleLiveTelemetry);
  }, [device]);

  if (!device) return null;

  const isOnline = currentPing > 0 || device.status === 'online';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col font-sans">
        
        <div className="px-6 py-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-8">
             <button 
                onClick={() => setActiveTab('live')} 
                className={`text-xs font-bold uppercase tracking-widest transition-colors pb-1 cursor-pointer ${activeTab === 'live' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Live Stream
              </button>
             <button 
                onClick={() => setActiveTab('history')} 
                className={`text-xs font-bold uppercase tracking-widest transition-colors pb-1 cursor-pointer ${activeTab === 'history' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Historical Report
              </button>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer p-2">
            ✕
          </button>
        </div>

        <div className="p-6 h-125 overflow-y-auto">
          {activeTab === 'live' ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Round-Trip Time</span>
                  <span className={`text-3xl font-bold font-mono ${isOnline ? 'text-cyan-400' : 'text-slate-600'}`}>
                    {isOnline ? `${currentPing} ms` : '--'}
                  </span>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Link State</span>
                  <span className={`inline-flex items-center text-sm font-bold px-3 py-1.5 rounded border uppercase ${isOnline ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-500 border-rose-500/30 bg-rose-500/10'}`}>
                    {isOnline ? (
                      <><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span> ACTIVE</>
                    ) : (
                      <><span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span> DOWN</>
                    )}
                  </span>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">System Diagnostics</span>
                  <span className={`text-base font-semibold block truncate ${isOnline ? 'text-slate-300' : 'text-rose-400'}`}>
                    {isOnline ? (device.rootCause || 'OPERATING NORMALLY') : (device.rootCause || 'CONNECTION TIMEOUT')}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                    <Activity className="w-4 h-4 text-cyan-500" /> Live Telemetry Feed
                  </span>
                </div>
                <div className="h-60 w-full">
                  {telemetry.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={telemetry}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '14px' }} />
                        <Line type="stepAfter" dataKey="ping" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono uppercase tracking-widest">
                      ERR_NO_TELEMETRY_DATA
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-950 px-5 py-4 border border-slate-800 flex justify-between text-xs text-slate-500 font-mono tracking-wider rounded-lg">
                <span>LOC: {device.location || device.section || 'N/A'}</span>
                <span>PROTO: TCP/IP</span>
                <span className={`${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>SYS: {device.status ? device.status.toUpperCase() : 'UNKNOWN'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 animate-in fade-in duration-200">
              <table className="w-full text-left text-xs text-slate-400 font-mono">
                <thead className="text-slate-500 uppercase border-b border-slate-800 tracking-widest">
                  <tr>
                    <th className="pb-4 px-3">Date & Time</th>
                    <th className="pb-4 px-3">State Transition</th>
                    <th className="pb-4 px-3 text-right">Duration in State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {historyLogs.length > 0 ? historyLogs.map((entry, idx) => {
                    
                    // --- LIVE CALCULATION LOGIC ---
                    // If this is the most recent log, and the device is currently experiencing it, calculate the time live!
                    const isOngoingCurrentEvent = idx === 0 && entry.status === (isOnline ? 'online' : 'offline') && !entry.endTime;
                    
                    let displayMinutes = entry.durationMinutes || 0;
                    if (isOngoingCurrentEvent) {
                      displayMinutes = Math.floor((liveTime - new Date(entry.startTime)) / 60000);
                    }

                    return (
                      <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-4 px-3 text-slate-300">
                          {new Date(entry.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} 
                          <span className="text-slate-700 mx-3">|</span> 
                          {new Date(entry.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className={`py-4 px-3 font-bold text-sm ${entry.status === 'offline' ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {entry.status.toUpperCase()}
                        </td>
                        <td className="py-4 px-3 text-right text-sm">
                          {displayMinutes > 0 ? (
                            <span className={isOngoingCurrentEvent ? "text-cyan-400 font-bold animate-pulse" : "text-slate-300"}>
                              {displayMinutes} mins {isOngoingCurrentEvent && "(Live)"}
                            </span>
                          ) : (
                            <span className="text-slate-500">&lt; 1 min</span>
                          )}
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-slate-600 uppercase tracking-widest">No status transitions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MASTER DASHBOARD CONTROLLER ---
export default function Dashboard() {
  const [cameras, setCameras] = useState([]);
  const [nvrs, setNvrs] = useState([]);
  const [radios, setRadios] = useState([]);
  const [rfids, setRfids] = useState([]);
  const [routers, setRouters] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [activeSection, setActiveSection] = useState(null);
  
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [activeCategoryType, setActiveCategoryType] = useState("Camera");
  const [inspectedDevice, setInspectedDevice] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/cameras").then(res => res.json()),
      fetch("http://localhost:5000/api/nvr").then(res => res.json()),
      fetch("http://localhost:5000/api/radio").then(res => res.json()),
      fetch("http://localhost:5000/api/rfid").then(res => res.json()),
      fetch("http://localhost:5000/api/router").then(res => res.json())
    ])
    .then(([camData, nvrData, radioData, rfidData, routerData]) => {
      setCameras(camData.map(c => ({ ...c, id: c.deviceId })));
      setNvrs(nvrData.map(n => ({ ...n, id: n.deviceId, status: n.status || 'offline', uptime: n.uptime || '-' })));
      setRadios(radioData.map(r => ({ ...r, id: r.deviceId, name: r.linkName, ip: r.ipEndpoints, status: r.status || 'offline', signal: '-' })));
      setRfids(rfidData.map(r => ({ ...r, id: r.deviceId, name: r.barrierName, ip: r.controllerIp, chain: r.hardwareChain, provider: 'Internal', status: r.status || 'offline' })));
      setRouters(routerData.map(r => ({ ...r, id: r.deviceId, name: r.gatewayName, status: r.status || 'offline', load: '-' })));
      setIsLoading(false);
    })
    .catch((err) => console.error("Error fetching data:", err));

    const handleStatusUpdate = (updatedDev) => {
      setCameras(prev => prev.map(c => c.id === updatedDev.id ? { ...c, ...updatedDev } : c));
      setNvrs(prev => prev.map(n => n.id === updatedDev.id ? { ...n, ...updatedDev } : n));
      setRadios(prev => prev.map(r => r.id === updatedDev.id ? { ...r, ...updatedDev } : r));
      setRfids(prev => prev.map(r => r.id === updatedDev.id ? { ...r, ...updatedDev } : r));
      setRouters(prev => prev.map(r => r.id === updatedDev.id ? { ...r, ...updatedDev } : r));
    };

    socket.on("cameraStatusUpdate", handleStatusUpdate);
    socket.on("deviceStatusUpdate", handleStatusUpdate); 

    return () => {
      socket.off("cameraStatusUpdate", handleStatusUpdate);
      socket.off("deviceStatusUpdate", handleStatusUpdate);
    };
  }, []);

  const activeStats = {
    Camera: cameras.filter(c => c.status === "online").length,
    NVR: nvrs.filter(d => d.status === "online").length,
    Radio: radios.filter(d => d.status === "online").length,
    RFID: rfids.filter(d => d.status === "online").length,
    Router: routers.filter(d => d.status === "online").length,
  };

  const totalActiveDevices = Object.values(activeStats).reduce((a, b) => a + b, 0);

  const pieData = [
    { name: 'Cameras', value: activeStats.Camera || 0.1, color: '#0ea5e9' }, 
    { name: 'NVRs', value: activeStats.NVR || 0.1, color: '#10b981' },
    { name: 'Radios', value: activeStats.Radio || 0.1, color: '#f59e0b' },
    { name: 'RFIDs', value: activeStats.RFID || 0.1, color: '#8b5cf6' },
    { name: 'Routers', value: activeStats.Router || 0.1, color: '#f43f5e' },
  ];

  const sectionData = useMemo(() => {
    const sections = {};
    cameras.forEach(cam => {
      if (!sections[cam.section]) sections[cam.section] = { name: cam.section, total: 0, online: 0, offline: 0, warning: 0 };
      sections[cam.section].total += 1;
      sections[cam.section][cam.status] += 1;
    });
    return Object.values(sections);
  }, [cameras]);

  const filteredCameras = useMemo(() => {
    let filtered = cameras;
    if (activeSection) filtered = filtered.filter(cam => cam.section === activeSection);
    return filtered.filter((cam) => {
      const matchesSearch = cam.name.toLowerCase().includes(searchTerm.toLowerCase()) || cam.ip.includes(searchTerm);
      const matchesFilter = statusFilter === "all" || cam.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, statusFilter, activeSection, cameras]);

  const navigateToCategoryPage = (category) => {
    setActiveCategoryType(category);
    setCurrentPage("category");
    setActiveSection(null); 
  };

  const StatusBadge = ({ status }) => {
    if (status === 'online') return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold uppercase tracking-wider">Online</span>;
    if (status === 'warning') return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-bold uppercase tracking-wider">Warn</span>;
    return <span className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-xs font-bold uppercase tracking-wider">Offline</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 font-mono text-sm tracking-widest uppercase">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mb-6" />
        Establishing Telemetry Link...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 font-sans text-slate-200">
      {/* FIXED: Changed from max-w-350 to max-w-[1600px] to utilize full screen width */}
      <div className="max-w-[1600px] mx-auto">
        <UniversalTelemetryModal device={inspectedDevice} onClose={() => setInspectedDevice(null)} />

        {/* --- PAGE TIER 1: COMMAND CENTER HUB --- */}
        {currentPage === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Header section with Circular Logo Placeholder */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-8 gap-4">
              <div className="flex items-center gap-6">
                
                
                <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-lg cursor-pointer shrink-0">
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    className="w-full h-full object-cover" 
                  />
                  
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-cyan-500" /> NOC Command Center
                  </h1>
                  <p className="text-sm text-slate-500 mt-2 font-mono uppercase tracking-widest">Dudhichua Enterprise Telemetry Hub // Global View</p>
                </div>
              </div>
              
              <div className="text-xs font-mono text-slate-400 flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]"></span> 
                SYSTEM ACTIVE
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              
              {/* Scaled-up Stats Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center relative col-span-1 p-8 min-h-87.5">
                <div className="absolute top-6 left-6 text-slate-500 text-xs font-bold tracking-widest uppercase flex items-center">
                  Health Mix
                </div>
                <div className="h-64 w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none">
                        {pieData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '14px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                  <span className="text-5xl font-bold text-slate-100">{totalActiveDevices}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Total Nodes</span>
                </div>
              </div>

              {/* Scaled-up Grid Nodes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 col-span-1 xl:col-span-3">
                {[
                  { name: 'Cameras', icon: Video, count: cameras.length, color: 'text-cyan-500', active: activeStats.Camera },
                  { name: 'NVRs', icon: Server, count: nvrs.length, color: 'text-emerald-500', active: activeStats.NVR },
                  { name: 'Radios', icon: RadioIcon, count: radios.length, color: 'text-amber-500', active: activeStats.Radio },
                  { name: 'RFIDs', icon: Key, count: rfids.length, color: 'text-purple-500', active: activeStats.RFID },
                  { name: 'Routers', icon: RouterIcon, count: routers.length, color: 'text-rose-500', active: activeStats.Router }
                ].map(cat => {
                  const Icon = cat.icon;
                  const offline = cat.count - cat.active;
                  return (
                    <div
                      key={cat.name}
                      onClick={() => navigateToCategoryPage(cat.name.replace('s', ''))}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/50 rounded-xl p-8 flex flex-col justify-between transition-all cursor-pointer group min-h-45"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <Icon className={`w-8 h-8 ${cat.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded-full">{cat.count} total</span>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-400 tracking-widest uppercase block mb-2">{cat.name}</span>
                        <div className="flex items-baseline gap-3">
                          <span className="text-5xl font-bold text-slate-100">{cat.active}</span>
                          <span className="text-xs text-emerald-500 font-mono tracking-wider font-bold">UP</span>
                        </div>
                        {offline > 0 && (
                          <div className="text-xs text-rose-500 font-mono tracking-wider font-bold mt-2">{offline} DOWN</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* --- PAGE TIER 2: CATEGORY DASHBOARD --- */}
        {currentPage === "category" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setCurrentPage("dashboard")}
                  className="text-slate-400 hover:text-slate-100 p-3 border border-slate-800 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-wide">
                    {activeCategoryType} Topology
                  </h1>
                  <p className="text-xs text-slate-500 font-mono tracking-widest uppercase mt-1">System diagnostic view</p>
                </div>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-3 h-5 w-5 text-slate-600" />
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-3 border border-slate-800 rounded-lg bg-slate-900 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm font-mono shadow-inner transition-colors"
                  placeholder={`Search ${activeCategoryType} registry...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {activeCategoryType === "Camera" && (
              <div className="space-y-6">
                 {!activeSection ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {sectionData.map((sec) => (
                       <div 
                         key={sec.name}
                         onClick={() => setActiveSection(sec.name)}
                         className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-600 transition-colors cursor-pointer group"
                       >
                         <h3 className="font-bold text-slate-300 text-lg mb-4 truncate group-hover:text-cyan-400">{sec.name}</h3>
                         <div className="flex justify-between text-xs font-mono mb-3 font-bold">
                           <span className="text-emerald-500">{sec.online} UP</span>
                           <span className="text-rose-500">{sec.offline} DOWN</span>
                         </div>
                         <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                           <div style={{ width: `${(sec.online/sec.total)*100}%` }} className="bg-emerald-500"></div>
                           <div style={{ width: `${(sec.offline/sec.total)*100}%` }} className="bg-rose-500"></div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div>
                     <div className="mb-6">
                       <button onClick={() => setActiveSection(null)} className="text-xs font-mono font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-widest flex items-center gap-2 cursor-pointer p-2 -ml-2 rounded hover:bg-cyan-500/10 transition-colors">
                         <LayoutGrid className="w-4 h-4"/> Viewing Sector: {activeSection} (Click to clear)
                       </button>
                     </div>
                     <CameraList cameras={filteredCameras} onClick={(cam) => setInspectedDevice(cam)} />
                   </div>
                 )}
              </div>
            )}

            {/* Standardized Data Tables for Infrastructure */}
            {["NVR", "Radio", "RFID", "Router"].includes(activeCategoryType) && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-500 text-xs uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Device Target</th>
                      <th className="px-6 py-4">IPv4 Socket</th>
                      <th className="px-6 py-4">Zone / Topology</th>
                      <th className="px-6 py-4">Primary Metric</th>
                      <th className="px-6 py-4">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {eval(activeCategoryType.toLowerCase() + 's')
                      .filter(d => (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (d.ip || '').includes(searchTerm))
                      .map((row) => (
                      <tr key={row.id} onClick={() => setInspectedDevice(row)} className="hover:bg-slate-800/60 cursor-pointer transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-200 group-hover:text-cyan-400">{row.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-400">{row.ip}</td>
                        <td className="px-6 py-4 text-slate-400">{row.location || row.chain}</td>
                        <td className="px-6 py-4 font-mono text-slate-400">
                          {row.status === 'offline' ? '--' : (row.uptime || row.signal || row.load || row.provider)}
                        </td>
                        <td className="px-6 py-4">
                           <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}