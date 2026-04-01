import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Cpu, 
  Database, 
  Activity, 
  Zap, 
  Shield, 
  HardDrive, 
  Thermometer, 
  Settings,
  Terminal as TerminalIcon,
  Folder,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  MoreVertical,
  Search,
  Plus
} from 'lucide-react';

export const System: React.FC = () => {
  const [stats, setStats] = useState({
    cpu: 42,
    ram: 68,
    disk: 84,
    temp: 52
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
        ram: Math.max(10, Math.min(95, prev.ram + (Math.random() * 4 - 2))),
        disk: prev.disk,
        temp: Math.max(30, Math.min(85, prev.temp + (Math.random() * 6 - 3)))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [files] = useState([
    { name: 'Neural_Core.sys', type: 'system', size: '4.2 GB' },
    { name: 'Shafqat_Memories.db', type: 'database', size: '1.8 GB' },
    { name: 'God_Mode_Protocol.sh', type: 'script', size: '12 KB' },
    { name: 'Sweetie_Voice_Model.bin', type: 'model', size: '850 MB' },
    { name: 'Tactical_Analysis.pdf', type: 'document', size: '2.4 MB' },
    { name: 'Project_Stonic.zip', type: 'archive', size: '124 MB' },
  ]);

  return (
    <div className="h-full flex flex-col bg-black text-matrix-green font-mono p-8 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b border-matrix-border pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-matrix-green/10 rounded-xl border border-matrix-green/30">
              <Monitor className="text-matrix-green w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-[0.2em] text-white uppercase">System Interface</h2>
              <p className="text-[10px] text-matrix-green/40 uppercase tracking-widest">Laptop Access Protocol: ACTIVE</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-matrix-green/5 border border-matrix-green/20">
              <div className="w-2 h-2 rounded-full bg-matrix-green animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest">Link: Stable</span>
            </div>
            <button className="p-2 rounded-lg border border-matrix-border hover:bg-matrix-green/10 transition-all">
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
          {/* Left Column: System Stats */}
          <div className="space-y-6 overflow-y-auto custom-scrollbar pr-4">
            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-white mb-4">Hardware Telemetry</h3>
            
            {[
              { label: 'Neural CPU', value: stats.cpu, icon: Cpu, color: 'text-matrix-green' },
              { label: 'Memory RAM', value: stats.ram, icon: Database, color: 'text-blue-400' },
              { label: 'Disk Storage', value: stats.disk, icon: HardDrive, color: 'text-purple-400' },
              { label: 'Core Temp', value: stats.temp, icon: Thermometer, color: 'text-orange-400', unit: '°C' },
            ].map((stat) => (
              <div key={stat.label} className="p-6 bg-matrix-surface border border-matrix-border rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <stat.icon size={18} className={stat.color} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">{stat.label}</span>
                  </div>
                  <span className={`text-sm font-black ${stat.color}`}>{Math.round(stat.value)}{stat.unit || '%'}</span>
                </div>
                <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    className={`h-full ${stat.color.replace('text-', 'bg-')} shadow-[0_0_10px_rgba(0,255,65,0.3)]`}
                  />
                </div>
              </div>
            ))}

            <div className="p-6 bg-matrix-green/5 border border-matrix-green/20 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={64} className="text-matrix-green" />
              </div>
              <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-matrix-green mb-2">God Mode Status</h4>
              <p className="text-xs text-white/60 leading-relaxed">System-wide administrative privileges granted. Neural link is operating at peak efficiency.</p>
            </div>

            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
              <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400">PC Control Center</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-white/40">Spotify Link</span>
                  <span className="text-green-400">READY</span>
                </div>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-white/40">VS Code Link</span>
                  <span className="text-blue-400">READY</span>
                </div>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-white/40">Chrome Link</span>
                  <span className="text-orange-400">READY</span>
                </div>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-white/40">Neural Architect</span>
                  <span className="text-purple-400">ACTIVE</span>
                </div>
              </div>
              <p className="text-[9px] text-white/30 leading-relaxed italic">
                Commands like "Open Spotify" or "Create code in VS Code" use custom protocols to interact with your PC hardware.
              </p>
            </div>
          </div>

          {/* Middle Column: File Explorer Simulation */}
          <div className="lg:col-span-2 flex flex-col bg-matrix-surface border border-matrix-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-matrix-border bg-black/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white">
                  <Folder size={14} className="text-matrix-green" />
                  <span>File Explorer</span>
                </div>
                <div className="h-4 w-[1px] bg-matrix-border" />
                <span className="text-[9px] font-mono text-matrix-green/40 uppercase">C:/Users/Shafqat/Stonic_AI</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-matrix-green/20" size={12} />
                  <input 
                    type="text" 
                    placeholder="Search files..." 
                    className="bg-black border border-matrix-border rounded-md py-1 pl-7 pr-2 text-[10px] text-matrix-green outline-none focus:border-matrix-green/40 transition-all w-32"
                  />
                </div>
                <button className="p-1 rounded bg-matrix-green text-black">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10">
                  <tr className="border-b border-matrix-border">
                    <th className="p-4 text-[10px] font-mono text-matrix-green/40 uppercase tracking-widest">Name</th>
                    <th className="p-4 text-[10px] font-mono text-matrix-green/40 uppercase tracking-widest">Type</th>
                    <th className="p-4 text-[10px] font-mono text-matrix-green/40 uppercase tracking-widest">Size</th>
                    <th className="p-4 text-[10px] font-mono text-matrix-green/40 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-matrix-border/30">
                  {files.map((file) => (
                    <tr key={file.name} className="hover:bg-matrix-green/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {file.type === 'system' && <Cpu size={14} className="text-red-500" />}
                          {file.type === 'database' && <Database size={14} className="text-blue-400" />}
                          {file.type === 'script' && <TerminalIcon size={14} className="text-matrix-green" />}
                          {file.type === 'model' && <Activity size={14} className="text-purple-400" />}
                          {file.type === 'document' && <FileText size={14} className="text-orange-400" />}
                          {file.type === 'archive' && <Folder size={14} className="text-yellow-400" />}
                          <span className="text-[11px] text-white/80 group-hover:text-matrix-green transition-colors">{file.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[10px] font-mono text-matrix-green/40 uppercase">{file.type}</td>
                      <td className="p-4 text-[10px] font-mono text-matrix-green/40">{file.size}</td>
                      <td className="p-4">
                        <button className="p-1 rounded hover:bg-matrix-green/20 text-matrix-green/40 hover:text-matrix-green transition-all">
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-matrix-border bg-black/20 flex items-center justify-between text-[9px] font-mono text-matrix-green/20 uppercase tracking-widest">
              <span>6 Items Selected</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-matrix-green" />
                  <span>Sync Complete</span>
                </div>
                <span>7.2 GB Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
