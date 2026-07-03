import { Video, VideoOff, AlertTriangle, Activity, MapPin, Hash } from "lucide-react";

export default function CameraCard({ camera, onClick }) {
  const statusConfig = {
    online: { color: "text-green-400", bgColor: "bg-green-400/10", borderColor: "border-green-400/20", icon: <Video className="w-5 h-5 text-green-400" />, label: "Online" },
    offline: { color: "text-red-400", bgColor: "bg-red-400/10", borderColor: "border-red-400/20", icon: <VideoOff className="w-5 h-5 text-red-400" />, label: "Offline" },
    warning: { color: "text-yellow-400", bgColor: "bg-yellow-400/10", borderColor: "border-yellow-400/20", icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />, label: "High Latency" }
  };

  const config = statusConfig[camera.status];

  return (
    // Added cursor-pointer, transform on hover, and onClick handler
    <div 
      onClick={() => onClick(camera)}
      className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-5 hover:border-slate-500 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 truncate">{camera.name}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color} ${config.borderColor} border mt-1`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-4 border-t border-slate-700 pt-4">
        <div className="flex items-center text-sm text-slate-400">
          <Hash className="w-4 h-4 mr-2 text-slate-500" />
          <span className="font-mono text-xs">{camera.id}</span>
          <span className="mx-2 text-slate-600">|</span>
          <span className="font-mono text-xs text-slate-300">{camera.ip}</span>
        </div>
        
        <div className="flex items-center text-sm text-slate-400">
          <MapPin className="w-4 h-4 mr-2 text-slate-500" />
          {camera.location}
        </div>

        <div className="flex justify-between items-center text-sm pt-2">
          <div className="flex items-center text-slate-400">
            <Activity className="w-4 h-4 mr-1 text-slate-500" />
            <span className="font-mono text-xs">{camera.latency}</span>
          </div>
          <span className="text-xs text-slate-500">Seen: {camera.lastSeen}</span>
        </div>
      </div>
    </div>
  );
}