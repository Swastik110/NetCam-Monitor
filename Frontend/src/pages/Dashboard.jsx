import { useState, useMemo, useEffect } from "react";
import { io } from "socket.io-client";
import CameraList from "../components/CameraList";
import { Activity, Search, LayoutGrid, Loader2, Server, Radio as RadioIcon, Key, Router as RouterIcon, Video, ArrowLeft, ShieldCheck, LogOut, Download, Plus, X, Trash2, Cpu, FolderPlus } from "lucide-react"; 
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import logo from '../assets/Logo.png';
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable'; 

const socket = io("http://localhost:5000");

// --- HELPER FUNCTION: FORMAT MINUTES ---
const formatDuration = (totalMinutes) => {
  if (!totalMinutes || totalMinutes < 1) return '< 1m';
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = Math.floor(totalMinutes % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || parts.length === 0) parts.push(`${m}m`);
  return parts.join(' ');
};

// --- AUTHENTICATION COMPONENT ---
function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsLoading(true);
    const endpoint = isRegistering ? 'register' : 'login';
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      if (isRegistering) {
        setSuccess('Registration successful! Please sign in with your new credentials.');
        setIsRegistering(false); setPassword('');
      } else {
        localStorage.setItem('noc_token', data.token);
        localStorage.setItem('noc_user', data.username);
        window.location.reload(); 
      }
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 to-slate-950">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-24 h-24 bg-slate-900/80 rounded-full border border-slate-700 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex items-center justify-center mb-6 overflow-hidden backdrop-blur-xl">
           <img src={logo} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-slate-100 to-slate-400 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-cyan-500" /> NETWORK OPERATION MONITORING SYSTEM
        </h1>
        <p className="text-xs text-slate-500 mt-3 font-mono uppercase tracking-widest">{isRegistering ? 'New Operator Provisioning' : 'Authorized Personnel Only'}</p>
      </div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-2xl p-8 shadow-2xl">
        {error && <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm font-mono">{error}</div>}
        {success && <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-mono">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Operator ID</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Security Clearance</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm" required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-6 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wide rounded-lg shadow-lg shadow-cyan-900/20 transition-all flex justify-center items-center gap-2 uppercase text-xs cursor-pointer">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRegistering ? 'Register Operator' : 'Initialize Session')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }} className="text-slate-500 hover:text-cyan-400 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer">
            {isRegistering ? '← Back to Secure Login' : 'Provision New Operator →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ADD HARDWARE CLASS MODAL ---
function AddClassModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:5000/api/classes/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      if (!res.ok) throw new Error('Failed to create class. It may already exist.');
      onSuccess(); onClose();
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2"><FolderPlus className="w-4 h-4 text-fuchsia-400" /> New Class</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-mono">{error}</div>}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Hardware Class Name</label>
            <input type="text" placeholder="e.g. Server, Switch, Drone" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-fuchsia-500/50 text-sm" required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold tracking-widest rounded-lg transition-all uppercase text-xs cursor-pointer">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Architecture'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- ADD DEVICE MODAL (Dynamic) ---
function AddDeviceModal({ onClose, onSuccess, customClasses }) {
  const [formData, setFormData] = useState({ type: 'Camera', name: '', ip: '', location: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:5000/api/devices/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error('Failed to add device');
      onSuccess(); onClose();
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-400" /> Provision Node</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-mono">{error}</div>}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Hardware Class</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/50 text-sm cursor-pointer">
              <optgroup label="Standard Core">
                <option value="Camera">Camera</option><option value="NVR">NVR</option>
                <option value="Radio">Radio Link</option><option value="RFID">RFID Controller</option>
                <option value="Router">Network Router</option>
              </optgroup>
              {customClasses.length > 0 && (
                <optgroup label="Custom Topologies">
                  {customClasses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </optgroup>
              )}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Node Designation</label>
            <input type="text" placeholder="e.g. Sector-7 Gateway" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/50 text-sm" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">IPv4 Target</label>
            <input type="text" placeholder="172.22.x.x" value={formData.ip} onChange={e => setFormData({...formData, ip: e.target.value})} className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono text-sm" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Zone / Location</label>
            <input type="text" placeholder="e.g. Mining Pit B" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/50 text-sm" required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-6 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold tracking-widest rounded-lg transition-all flex justify-center items-center uppercase text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Inject to Network'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- UNIVERSAL TELEMETRY MODAL ---
function UniversalTelemetryModal({ device, onClose, onDeleteSuccess }) {
  const [telemetry, setTelemetry] = useState([]);
  const [currentPing, setCurrentPing] = useState(0);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('live');
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    if (activeTab === 'history') {
      const interval = setInterval(() => setLiveTime(new Date()), 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!device) return;
    fetch(`http://localhost:5000/api/history/${device.id || device.deviceId}`)
      .then(res => res.json()).then(data => setHistoryLogs(data)).catch(err => console.error(err));

    if (device.latency && device.latency !== '-') {
      const initialPing = parseInt(device.latency.replace('ms', ''));
      setCurrentPing(initialPing);
      setTelemetry([{ time: new Date().toLocaleTimeString([], { second: '2-digit' }), ping: initialPing }]);
    } else { setTelemetry([]); setCurrentPing(0); }

    const handleLiveTelemetry = (updatedData) => {
      if (updatedData.id === device.id || updatedData.id === device.deviceId) {
        fetch(`http://localhost:5000/api/history/${device.id || device.deviceId}`).then(res => res.json()).then(data => setHistoryLogs(data));
        if (updatedData.latency && updatedData.latency !== '-') {
          const numericPing = parseInt(updatedData.latency.replace('ms', ''));
          setCurrentPing(numericPing);
          setTelemetry(prev => {
            const newData = [...prev, { time: new Date().toLocaleTimeString([], { second: '2-digit' }), ping: numericPing }];
            return newData.length > 20 ? newData.slice(newData.length - 20) : newData;
          });
        } else { setCurrentPing(0); }
      }
    };
    socket.on('cameraStatusUpdate', handleLiveTelemetry);
    return () => socket.off('cameraStatusUpdate', handleLiveTelemetry);
  }, [device]);

  const isOnline = currentPing > 0 || (device && device.status === 'online');

  const handleDelete = async () => {
    if (!window.confirm(`CRITICAL WARNING: Terminate ${device.name || device.id}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/devices/${device.id || device.deviceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      onClose(); onDeleteSuccess(); 
    } catch (error) { alert("Failed to delete."); }
  };

  const exportToPDF = () => {
    if (!device) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(18); doc.text(`NOC Incident Report: ${device.name}`, 14, 22);
      doc.setFontSize(10); doc.setTextColor(100, 116, 139); 
      doc.text(`Device ID: ${device.id || device.deviceId}`, 14, 30); doc.text(`IP: ${device.ip}`, 14, 36);
      doc.text(`Location: ${device.location || device.section || 'N/A'}`, 14, 42); doc.text(`Operator: ${localStorage.getItem('noc_user') || 'Admin'}`, 14, 48);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 54);

      const tableData = historyLogs.map((entry, idx) => {
        const isOngoing = idx === 0 && entry.status === (isOnline ? 'online' : 'offline') && !entry.endTime;
        let mins = entry.durationMinutes || 0;
        if (isOngoing) mins = Math.floor((liveTime - new Date(entry.startTime)) / 60000);
        return [`${new Date(entry.startTime).toLocaleDateString('en-GB')} | ${new Date(entry.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, entry.status.toUpperCase(), formatDuration(mins)];
      });
      autoTable(doc, { startY: 62, head: [['Date & Time', 'State Transition', 'Duration in State']], body: tableData, theme: 'grid', headStyles: { fillColor: [8, 145, 178] }, styles: { fontSize: 9 } });
      doc.save(`${device.id || 'Device'}_Telemetry.pdf`);
    } catch (error) { alert("Failed to generate PDF."); }
  };

  if (!device) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col font-sans backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-8">
             <button onClick={() => setActiveTab('live')} className={`text-[10px] font-bold uppercase tracking-widest transition-all pb-1 cursor-pointer ${activeTab === 'live' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>Live Stream</button>
             <button onClick={() => setActiveTab('history')} className={`text-[10px] font-bold uppercase tracking-widest transition-all pb-1 cursor-pointer ${activeTab === 'history' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>Historical Report</button>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-2 cursor-pointer"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 h-125 overflow-y-auto">
          {activeTab === 'live' ? (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-950/50 border border-white/5 rounded-xl p-5 shadow-inner">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Round-Trip Time</span>
                  <span className={`text-3xl font-bold font-mono ${isOnline ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'text-slate-600'}`}>{isOnline ? `${currentPing} ms` : '--'}</span>
                </div>
                <div className="bg-slate-950/50 border border-white/5 rounded-xl p-5 shadow-inner">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Link State</span>
                  <span className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded uppercase border ${isOnline ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-rose-500 border-rose-500/20 bg-rose-500/10'}`}>
                    {isOnline ? <><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> ACTIVE</> : <><span className="w-2 h-2 rounded-full bg-rose-500 mr-2 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span> DOWN</>}
                  </span>
                </div>
                <div className="bg-slate-950/50 border border-white/5 rounded-xl p-5 shadow-inner">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">System Diagnostics</span>
                  <span className={`text-sm font-semibold block truncate ${isOnline ? 'text-slate-300' : 'text-rose-400'}`}>{isOnline ? (device.rootCause || 'OPERATING NORMALLY') : (device.rootCause || 'CONNECTION TIMEOUT')}</span>
                </div>
              </div>

              <div className="bg-slate-950/50 border border-white/5 rounded-xl p-5 shadow-inner">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest"><Activity className="w-4 h-4 text-cyan-500" /> Live Telemetry Feed</span>
                </div>
                <div className="h-60 w-full">
                  {telemetry.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={telemetry}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '12px' }} />
                        <Line type="stepAfter" dataKey="ping" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono uppercase tracking-widest">Awaiting Link...</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/50 border border-white/5 rounded-xl p-5 shadow-inner animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                <button onClick={handleDelete} className="flex items-center gap-2 text-[10px] font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2 rounded uppercase tracking-widest transition-all cursor-pointer">
                  <Trash2 className="w-4 h-4" /> Terminate Node
                </button>
                <button onClick={exportToPDF} className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-4 py-2 rounded uppercase tracking-widest transition-all cursor-pointer">
                  <Download className="w-4 h-4" /> Export Report
                </button>
              </div>
              <table className="w-full text-left text-xs text-slate-400 font-mono">
                <thead className="text-slate-500 uppercase border-b border-white/5 tracking-widest">
                  <tr><th className="pb-4 px-3">Date & Time</th><th className="pb-4 px-3">State Transition</th><th className="pb-4 px-3 text-right">Duration in State</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historyLogs.length > 0 ? historyLogs.map((entry, idx) => {
                    const isOngoing = idx === 0 && entry.status === (isOnline ? 'online' : 'offline') && !entry.endTime;
                    let mins = entry.durationMinutes || 0;
                    if (isOngoing) mins = Math.floor((liveTime - new Date(entry.startTime)) / 60000);
                    return (
                      <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-4 px-3 text-slate-300">{new Date(entry.startTime).toLocaleDateString('en-GB')} <span className="text-slate-700 mx-2">|</span> {new Date(entry.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td className={`py-4 px-3 font-bold text-xs ${entry.status === 'offline' ? 'text-rose-500' : 'text-emerald-500'}`}>{entry.status.toUpperCase()}</td>
                        <td className="py-4 px-3 text-right text-xs"><span className={isOngoing ? "text-cyan-400 font-bold" : "text-slate-400"}>{formatDuration(mins)}</span></td>
                      </tr>
                    )
                  }) : <tr><td colSpan="3" className="py-12 text-center text-slate-600 uppercase tracking-widest">No status transitions recorded yet.</td></tr>}
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
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('noc_token'));
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [cameras, setCameras] = useState([]);
  const [nvrs, setNvrs] = useState([]);
  const [radios, setRadios] = useState([]);
  const [rfids, setRfids] = useState([]);
  const [routers, setRouters] = useState([]);
  const [customClasses, setCustomClasses] = useState([]);
  const [customDevices, setCustomDevices] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [activeCategoryType, setActiveCategoryType] = useState("Camera");
  const [inspectedDevice, setInspectedDevice] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      fetch("http://localhost:5000/api/cameras").then(res => res.json()),
      fetch("http://localhost:5000/api/nvr").then(res => res.json()),
      fetch("http://localhost:5000/api/radio").then(res => res.json()),
      fetch("http://localhost:5000/api/rfid").then(res => res.json()),
      fetch("http://localhost:5000/api/router").then(res => res.json()),
      fetch("http://localhost:5000/api/classes").then(res => res.json()),
      fetch("http://localhost:5000/api/custom-devices").then(res => res.json())
    ]).then(([camData, nvrData, radioData, rfidData, routerData, classData, customDevData]) => {
      setCameras(camData.map(c => ({ ...c, id: c.deviceId })));
      setNvrs(nvrData.map(n => ({ ...n, id: n.deviceId, status: n.status || 'offline' })));
      setRadios(radioData.map(r => ({ ...r, id: r.deviceId, name: r.linkName, ip: r.ipEndpoints, status: r.status || 'offline' })));
      setRfids(rfidData.map(r => ({ ...r, id: r.deviceId, name: r.barrierName, ip: r.controllerIp, status: r.status || 'offline' })));
      setRouters(routerData.map(r => ({ ...r, id: r.deviceId, name: r.gatewayName, status: r.status || 'offline' })));
      setCustomClasses(classData || []);
      setCustomDevices((customDevData || []).map(d => ({ ...d, id: d.deviceId, status: d.status || 'offline' })));
      setIsLoading(false);
    }).catch(err => { console.error(err); setIsLoading(false); });
  }, [isAuthenticated, refreshTrigger]);

  useEffect(() => {
    const handleStatusUpdate = (u) => {
      setCameras(p => p.map(c => c.id === u.id ? { ...c, ...u } : c));
      setNvrs(p => p.map(n => n.id === u.id ? { ...n, ...u } : n));
      setRadios(p => p.map(r => r.id === u.id ? { ...r, ...u } : r));
      setRfids(p => p.map(r => r.id === u.id ? { ...r, ...u } : r));
      setRouters(p => p.map(r => r.id === u.id ? { ...r, ...u } : r));
      setCustomDevices(p => p.map(d => d.id === u.id ? { ...d, ...u } : d));
    };
    socket.on("cameraStatusUpdate", handleStatusUpdate);
    socket.on("deviceStatusUpdate", handleStatusUpdate); 
    return () => { socket.off("cameraStatusUpdate", handleStatusUpdate); socket.off("deviceStatusUpdate", handleStatusUpdate); };
  }, []);

  if (!isAuthenticated) return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;

  // --- DYNAMIC INFRASTRUCTURE COMPILER ---
  const infrastructureCategories = [
    { name: 'Cameras', type: 'Camera', icon: Video, color: 'text-cyan-500', data: cameras },
    { name: 'NVRs', type: 'NVR', icon: Server, color: 'text-emerald-500', data: nvrs },
    { name: 'Radios', type: 'Radio', icon: RadioIcon, color: 'text-amber-500', data: radios },
    { name: 'RFIDs', type: 'RFID', icon: Key, color: 'text-purple-500', data: rfids },
    { name: 'Routers', type: 'Router', icon: RouterIcon, color: 'text-rose-500', data: routers },
    ...customClasses.map(cls => ({
      name: cls.name + 's', type: cls.name, icon: Cpu, color: 'text-fuchsia-400', 
      data: customDevices.filter(d => d.type === cls.name)
    }))
  ];

  // --- PIE CHART 0 FIX ---
  const rawPieData = infrastructureCategories.map(cat => ({ 
    name: cat.name, 
    value: cat.data.filter(d => d.status === 'online').length, 
    color: cat.color.replace('text-', 'bg-').replace('-500', '-500').replace('-400', '-400') 
  }));
  
  const chartColors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#e879f9', '#a3e635', '#2dd4bf'];
  rawPieData.forEach((d, i) => d.chartColor = chartColors[i % chartColors.length]);

  const totalActiveDevices = rawPieData.reduce((a, b) => a + b.value, 0);
  
  const pieData = totalActiveDevices === 0 
    ? [{ name: 'All Systems Offline', value: 1, chartColor: '#1e293b' }] 
    : rawPieData.filter(d => d.value > 0);

  // --- ULTRA-SAFE CAMERA SECTOR DATA FIX ---
  // This prevents blank crashes if a camera in the database is missing a section or status
  const sectionData = useMemo(() => {
    const sections = {};
    cameras.forEach(cam => {
      const sName = cam.section || cam.location || 'Unassigned Sector';
      const sStatus = cam.status || 'offline';
      
      if (!sections[sName]) sections[sName] = { name: sName, total: 0, online: 0, offline: 0, warning: 0 };
      sections[sName].total += 1;
      
      if (sections[sName][sStatus] !== undefined) {
          sections[sName][sStatus] += 1;
      } else {
          sections[sName]['offline'] += 1; // Fallback
      }
    });
    return Object.values(sections);
  }, [cameras]);

  // --- RESTORED CAMERA LIST FILTER ---
  // Fixes the logic so CameraList receives the specific cameras it expects
  const filteredCameras = useMemo(() => {
    let filtered = cameras;
    if (activeSection) {
      filtered = filtered.filter(cam => {
        const sName = cam.section || cam.location || 'Unassigned Sector';
        return sName === activeSection;
      });
    }
    return filtered.filter((cam) => {
      const matchesSearch = (cam.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (cam.ip || '').includes(searchTerm);
      return matchesSearch;
    });
  }, [searchTerm, activeSection, cameras]);

  // Table Helpers for NVRs, Routers, etc.
  const activeCategoryData = infrastructureCategories.find(c => c.type === activeCategoryType)?.data || [];
  const filteredTableData = activeCategoryData.filter(d => (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (d.ip || '').includes(searchTerm));

  const handleDeleteClass = async () => {
    if(!window.confirm(`WIPE ARCHITECTURE: This will permanently delete the "${activeCategoryType}" class AND all devices inside it. Proceed?`)) return;
    try {
      await fetch(`http://localhost:5000/api/classes/${activeCategoryType}`, { method: 'DELETE' });
      setRefreshTrigger(p => p+1); setCurrentPage("dashboard");
    } catch(err) { alert("Failed to delete class."); }
  };

  const StatusBadge = ({ status }) => {
    if (status === 'online') return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(52,211,153,0.1)]">Online</span>;
    if (status === 'warning') return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(251,191,36,0.1)]">Warn</span>;
    return <span className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(244,63,94,0.1)]">Offline</span>;
  };

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-500 font-mono text-xs tracking-widest uppercase"><Loader2 className="w-8 h-8 animate-spin mb-6" /> Establishing Telemetry Link...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-900 selection:text-cyan-100 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="max-w-[1600px] mx-auto p-6 md:p-8">
        
        <UniversalTelemetryModal device={inspectedDevice} onClose={() => setInspectedDevice(null)} onDeleteSuccess={() => setRefreshTrigger(prev => prev + 1)} />
        {isAddDeviceOpen && <AddDeviceModal onClose={() => setIsAddDeviceOpen(false)} onSuccess={() => setRefreshTrigger(prev => prev + 1)} customClasses={customClasses} />}
        {isAddClassOpen && <AddClassModal onClose={() => setIsAddClassOpen(false)} onSuccess={() => setRefreshTrigger(prev => prev + 1)} />}

        {/* --- TIER 1: COMMAND CENTER --- */}
        {currentPage === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/5 pb-8 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900/80 rounded-full border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shrink-0 backdrop-blur-md">
                  <img src={logo} alt="Company Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-slate-100 to-slate-400 tracking-tight flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-cyan-500" /> NETWORK OPERATION MONITORING SYSTEM 
                  </h1>
                  <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-widest">Dudhichua Area , Northern CoalFields Limited</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <button onClick={() => setIsAddClassOpen(true)} className="flex items-center gap-2 text-[10px] font-bold text-fuchsia-400 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/20 px-4 py-2.5 rounded-full uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(192,38,211,0.1)] cursor-pointer">
                  <FolderPlus className="w-4 h-4" /> Add Class
                </button>
                <button onClick={() => setIsAddDeviceOpen(true)} className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-4 py-2.5 rounded-full uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(52,211,153,0.1)] cursor-pointer">
                  <Plus className="w-4 h-4" /> Provision Node
                </button>
                <div className="text-[10px] font-mono text-slate-300 flex items-center gap-3 bg-slate-900/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/5 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span> NETWORK SECURE
                </div>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center gap-2 text-[10px] font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2.5 rounded-full uppercase tracking-widest transition-all cursor-pointer">
                  <LogOut className="w-4 h-4" /> End Session
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              
              {/* PIE CHART */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col items-center justify-center relative col-span-1 p-8 min-h-87.5 shadow-2xl">
                <div className="absolute top-6 left-6 text-slate-500 text-[10px] font-bold tracking-widest uppercase">Grid Health</div>
                <div className="h-64 w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={85} outerRadius={115} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={4}>
                        {pieData.map((e, idx) => <Cell key={idx} fill={e.chartColor} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '12px', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                  <span className="text-5xl font-bold text-slate-100 drop-shadow-md">{totalActiveDevices}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Active Nodes</span>
                </div>
              </div>

              {/* DYNAMIC METRIC CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 col-span-1 xl:col-span-3">
                {infrastructureCategories.map(cat => {
                  const Icon = cat.icon;
                  const activeCount = cat.data.filter(d => d.status === 'online').length;
                  const offlineCount = cat.data.length - activeCount;
                  return (
                    <div key={cat.name} onClick={() => { setActiveCategoryType(cat.type); setCurrentPage("category"); setActiveSection(null); }} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-white/20 hover:bg-slate-800/40 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer group shadow-xl">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-xl bg-slate-950/50 border border-white/5 shadow-inner ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-950/80 px-3 py-1.5 rounded-full border border-white/5">{cat.data.length} total</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase block mb-3 drop-shadow-sm">{cat.name}</span>
                        <div className="flex items-baseline gap-3">
                          <span className="text-5xl font-bold text-slate-100 group-hover:text-white transition-colors">{activeCount}</span>
                          <span className="text-[10px] text-emerald-400 font-mono tracking-widest font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">UP</span>
                        </div>
                        {offlineCount > 0 && <div className="text-[10px] text-rose-500 font-mono tracking-widest font-bold mt-3 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">{offlineCount} DOWN</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* --- TIER 2: CATEGORY DASHBOARD --- */}
        {currentPage === "category" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
              <div className="flex items-center gap-6">
                <button onClick={() => setCurrentPage("dashboard")} className="text-slate-400 hover:text-slate-100 p-3 border border-white/5 rounded-xl bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 transition-all shadow-lg cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-widest flex items-center gap-3">
                    {activeCategoryType} Topology
                    {/* Show Delete Class button if it's a Custom Class */}
                    {customClasses.some(c => c.name === activeCategoryType) && (
                       <button onClick={handleDeleteClass} className="text-[9px] px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-md hover:bg-rose-500 hover:text-white transition-colors tracking-widest cursor-pointer">Wipe Class</button>
                    )}
                  </h1>
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-2">Grid Diagnostic View</p>
                </div>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <input type="text" className="block w-full pl-12 pr-4 py-3.5 border border-white/5 rounded-xl bg-slate-900/60 backdrop-blur-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm font-mono shadow-inner transition-all" placeholder={`Query ${activeCategoryType} registry...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            {/* Special Render for Cameras (The grouped sector view) */}
            {activeCategoryType === "Camera" && (
              <div className="space-y-6">
                 {!activeSection ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {sectionData.map((sec) => (
                       <div key={sec.name} onClick={() => setActiveSection(sec.name)} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-all cursor-pointer group shadow-xl">
                         <h3 className="font-bold text-slate-300 text-sm tracking-widest uppercase mb-5 truncate group-hover:text-cyan-400">{sec.name}</h3>
                         <div className="flex justify-between text-[10px] font-mono mb-3 font-bold uppercase tracking-widest"><span className="text-emerald-400">{sec.online} UP</span><span className="text-rose-500">{sec.offline} DOWN</span></div>
                         <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex shadow-inner border border-white/5"><div style={{ width: `${(sec.online/sec.total)*100}%` }} className="bg-emerald-500"></div><div style={{ width: `${(sec.offline/sec.total)*100}%` }} className="bg-rose-500"></div></div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="animate-in slide-in-from-right-4 duration-300">
                     <div className="mb-6 flex justify-between items-center">
                       <button onClick={() => setActiveSection(null)} className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-2 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)] cursor-pointer">
                         <LayoutGrid className="w-3 h-3"/> Sector: {activeSection} ✕
                       </button>
                     </div>
                     <CameraList cameras={filteredCameras} onClick={(cam) => setInspectedDevice(cam)} />
                   </div>
                 )}
              </div>
            )}

            {/* Universal Table Renderer for EVERYTHING else (NVR, Radio, Custom, etc) */}
            {activeCategoryType !== "Camera" && (
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 border-b border-white/5 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    <tr><th className="px-8 py-5">Node Designation</th><th className="px-8 py-5">IPv4 Socket</th><th className="px-8 py-5">Topology Zone</th><th className="px-8 py-5">State</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredTableData.length > 0 ? filteredTableData.map((row) => (
                      <tr key={row.id} onClick={() => setInspectedDevice(row)} className="hover:bg-slate-800/40 cursor-pointer transition-colors group">
                        <td className="px-8 py-5 font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{row.name}</td>
                        <td className="px-8 py-5 font-mono text-slate-400">{row.ip}</td>
                        <td className="px-8 py-5 text-slate-400">{row.location || row.chain || 'N/A'}</td>
                        <td className="px-8 py-5"><StatusBadge status={row.status} /></td>
                      </tr>
                    )) : <tr><td colSpan="4" className="text-center py-12 text-slate-500 text-xs font-mono uppercase tracking-widest">No nodes found in registry.</td></tr>}
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