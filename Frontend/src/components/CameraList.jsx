import { Video, VideoOff, AlertTriangle, Activity, MapPin, Hash, ChevronRight } from "lucide-react";

export default function CameraList({ cameras, onClick }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <Video className="w-3.5 h-3.5" /> Online
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <VideoOff className="w-3.5 h-3.5" /> Offline
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> High Latency
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-900/50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 w-32">Status</th>
              <th className="px-6 py-4">Device Name & Location</th>
              <th className="px-6 py-4">Network Info</th>
              <th className="px-6 py-4">Health</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {cameras.map((camera) => (
              <tr 
                key={camera.id} 
                onClick={() => onClick(camera)}
                className="hover:bg-slate-750 transition-colors cursor-pointer group"
              >
                {/* Status Column */}
                <td className="px-6 py-4 flex flex-col items-start gap-1">
                  {getStatusBadge(camera.status)}
                  {camera.status !== 'online' && (
                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-37.5" title={camera.rootCause}>
                      ↳ {camera.rootCause || 'Unreachable'}
                    </span>
                  )}
                </td>

                {/* Name & Location Column */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {camera.name}
                    </span>
                    <span className="flex items-center text-xs text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" /> {camera.location}
                    </span>
                  </div>
                </td>

                {/* Network Info Column */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs text-slate-300 flex items-center">
                      <ServerIcon className="w-3 h-3 mr-1.5 text-slate-500" /> {camera.ip}
                    </span>
                    <span className="font-mono text-xs text-slate-500 flex items-center">
                      <Hash className="w-3 h-3 mr-1.5 text-slate-600" /> {camera.id}
                    </span>
                  </div>
                </td>

                {/* Health/Latency Column */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="flex items-center text-slate-300">
                      <Activity className={`w-4 h-4 mr-1.5 ${camera.status === 'offline' ? 'text-slate-600' : 'text-indigo-400'}`} /> 
                      <span className="font-mono">{camera.latency}</span>
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      Seen: {camera.lastSeen}
                    </span>
                  </div>
                </td>

                {/* Action Column */}
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Quick helper icon for the IP address
function ServerIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/>
      <line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  );
}