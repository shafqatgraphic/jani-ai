import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Shield, Activity, AlertCircle, Volume2, Terminal, Camera, Monitor, Image as ImageIcon, X, Copy, Check, Video, Brain, Database, Zap, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useVoiceAssistant } from '../contexts/VoiceAssistantContext';
import { Message } from '../types';

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-jarvis-blue/30 shadow-[0_0_20px_rgba(0,210,255,0.1)] bg-black">
      <div className="flex items-center justify-between bg-jarvis-blue/5 px-4 py-2 border-b border-jarvis-blue/20">
        <span className="text-[10px] font-mono text-jarvis-blue font-bold uppercase tracking-[0.2em]">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded border border-jarvis-blue/30 text-jarvis-blue hover:bg-jarvis-blue hover:text-black transition-all duration-300"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span className="text-[10px] font-bold uppercase tracking-widest">{copied ? 'COPIED' : 'COPY'}</span>
        </button>
      </div>
      <div className="max-h-[600px] overflow-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            fontSize: '0.8rem',
            background: 'transparent',
            lineHeight: '1.6',
            fontFamily: '"JetBrains Mono", monospace',
          }}
          wrapLongLines={true}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export const LiveAssistant: React.FC = () => {
  const { 
    isActive, 
    status, 
    messages, 
    isAiSpeaking, 
    userVolume, 
    aiVolume, 
    selectedVoice, 
    setSelectedVoice,
    activeStream,
    setActiveStream,
    startSession,
    stopSession,
    analyserRef,
    aiAnalyserRef,
    sendMediaChunk,
    systemLogs
  } = useVoiceAssistant();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const voices: ('Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr')[] = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (systemLogs.length > 0) {
      const last = systemLogs[0];
      setLastSystemAction(`${last.action.toUpperCase()}: ${last.target}`);
      const timer = setTimeout(() => setLastSystemAction(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [systemLogs]);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        drawVisualizer();
      }, 100);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        clearTimeout(timer);
      };
    }
  }, [isActive]);

  const drawVisualizer = () => {
    if (!analyserRef.current || !aiAnalyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth * window.devicePixelRatio;
        canvas.height = container.clientHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const userData = new Uint8Array(bufferLength);
    const aiData = new Uint8Array(bufferLength);

    const particles: { x: number; y: number; r: number; angle: number; speed: number; color: string; size: number }[] = [];
    for (let i = 0; i < 300; i++) {
      particles.push({
        x: 0,
        y: 0,
        r: Math.random() * 150 + 50,
        angle: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.01,
        color: '#00d2ff',
        size: Math.random() * 2 + 0.5
      });
    }

    // Matrix Rain Effect
    const matrixDrops: number[] = [];
    const matrixColumns = Math.floor(canvas.width / 15);
    for (let i = 0; i < matrixColumns; i++) matrixDrops[i] = Math.random() * -100;

    const renderFrame = () => {
      if (!isActive) {
        animationFrameRef.current = null;
        window.removeEventListener('resize', resizeCanvas);
        return;
      }
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      
      analyserRef.current?.getByteFrequencyData(userData);
      aiAnalyserRef.current?.getByteFrequencyData(aiData);

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);
      
      const intensity = Math.max(userVolume, aiVolume);
      const orbRadius = 80 + intensity * 0.8;

      // Draw Matrix Rain Background
      ctx.fillStyle = 'rgba(0, 210, 255, 0.05)';
      ctx.font = '10px monospace';
      for (let i = 0; i < matrixDrops.length; i++) {
        const text = String.fromCharCode(Math.floor(Math.random() * 128));
        ctx.fillText(text, i * 15, matrixDrops[i] * 15);
        if (matrixDrops[i] * 15 > height && Math.random() > 0.975) matrixDrops[i] = 0;
        matrixDrops[i] += 0.5 + (intensity / 255);
      }

      // Draw Glow Layer 1
      const glow1 = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 3);
      glow1.addColorStop(0, 'rgba(0, 210, 255, 0.3)');
      glow1.addColorStop(1, 'transparent');
      ctx.fillStyle = glow1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw Particles
      particles.forEach(p => {
        p.angle += p.speed * (1 + intensity * 0.1);
        const dynamicR = p.r + intensity * 0.7;
        p.x = centerX + Math.cos(p.angle) * dynamicR;
        p.y = centerY + Math.sin(p.angle) * dynamicR;

        ctx.fillStyle = '#00d2ff';
        ctx.globalAlpha = 0.3 + (intensity / 255);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw Core Orb with dynamic gradient
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius);
      coreGradient.addColorStop(0, '#fff');
      coreGradient.addColorStop(0.2, '#00d2ff');
      coreGradient.addColorStop(0.5, '#00d2ff');
      coreGradient.addColorStop(0.8, '#005f73');
      coreGradient.addColorStop(1, '#000');
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Draw Frequency Rings (Outer)
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const v = (aiVolume > userVolume ? aiData[i] : userData[i]) / 255;
        const r = orbRadius + 20 + v * 100;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw Inner Pulse Ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius - 10, 0, Math.PI * 2);
      ctx.stroke();
    };

    renderFrame();
  };

  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [delegationLogs, setDelegationLogs] = useState<{id: string, text: string, time: string}[]>([]);
  const [lastSystemAction, setLastSystemAction] = useState<string | null>(null);
  const [showPermissionHint, setShowPermissionHint] = useState(false);

  useEffect(() => {
    if (status === 'error') {
      setShowPermissionHint(true);
    } else {
      setShowPermissionHint(false);
    }
  }, [status]);

  const subAgents = [
    { id: 'vision', name: 'Vision Core', icon: Camera, color: 'text-blue-400' },
    { id: 'logic', name: 'Logic Engine', icon: Brain, color: 'text-cyan-400' },
    { id: 'data', name: 'Data Miner', icon: Database, color: 'text-yellow-400' },
    { id: 'system', name: 'System Controller', icon: Monitor, color: 'text-jarvis-blue' },
    { id: 'code', name: 'Code Architect', icon: Terminal, color: 'text-blue-300' },
    { id: 'security', name: 'Security Sentinel', icon: Shield, color: 'text-red-400' },
  ];

  const logTemplates = [
    "Analyzing visual data stream...",
    "Querying global knowledge base...",
    "Optimizing neural pathways...",
    "Executing system control command...",
    "Verifying security protocols...",
    "Compiling code architecture...",
    "Syncing with Shafqat Jani's core...",
    "Delegating logic processing...",
    "Scanning for vulnerabilities...",
    "Accessing local system resources..."
  ];

  useEffect(() => {
    if (isAiSpeaking) {
      const interval = setInterval(() => {
        const randomAgents = subAgents
          .filter(() => Math.random() > 0.6)
          .map(a => a.id);
        setActiveAgents(randomAgents);

        if (Math.random() > 0.4) {
          const newLog = {
            id: Math.random().toString(36).substr(2, 9),
            text: logTemplates[Math.floor(Math.random() * logTemplates.length)],
            time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };
          setDelegationLogs(prev => [newLog, ...prev].slice(0, 5));
        }
      }, 800);
      return () => {
        clearInterval(interval);
        setActiveAgents([]);
      };
    } else {
      setDelegationLogs([]);
    }
  }, [isAiSpeaking]);

  useEffect(() => {
    if (videoRef.current && activeStream) {
      videoRef.current.srcObject = activeStream;
    }
  }, [activeStream]);

  const stopStream = () => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        sendMediaChunk(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center h-full bg-black text-white overflow-hidden font-sans relative">
      {/* Neural Link Status Overlay */}
      <AnimatePresence>
        {showPermissionHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <div className="max-w-md w-full bg-white/5 border border-red-500/30 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 mb-2">
                <AlertCircle size={48} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic text-red-500">Neural Link Blocked</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Jani AI cannot connect to your PC's hardware. This usually happens because **Microphone Access** is blocked by your browser or system.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3 text-left bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p className="text-xs text-gray-300">Click the **Lock Icon** (🔒) in the address bar (top left).</p>
                </div>
                <div className="flex items-start gap-3 text-left bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p className="text-xs text-gray-300">Ensure **Microphone** and **Camera** are set to **Allow**.</p>
                </div>
                <div className="flex items-start gap-3 text-left bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                  <p className="text-xs text-gray-300">Refresh the page and try again.</p>
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
              >
                Refresh Neural Core
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Action Notification */}
      <AnimatePresence>
        {lastSystemAction && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-32 z-50 px-6 py-3 bg-jarvis-blue text-black rounded-full font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,210,255,0.5)] flex items-center gap-3 border border-jarvis-blue/30"
          >
            <Zap size={20} className="animate-pulse" />
            <span>SYSTEM: {lastSystemAction}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Neural Link Status Indicator */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Neural Link</div>
          <div className={`text-xs font-black uppercase tracking-tight ${status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
            {status === 'active' ? 'ACTIVE' : 'OFFLINE'}
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
      </div>

      {/* Neural Link Status Overlay */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          >
            <div className="max-w-md w-full bg-white/5 border border-red-500/30 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 mb-2">
                <AlertCircle size={48} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic text-red-500">Neural Link Blocked</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Jani AI cannot connect to your PC's hardware. This usually happens because **Microphone Access** is blocked by your browser or system.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3 text-left bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <p className="text-xs text-gray-300">Click the **Lock Icon** (🔒) in the address bar (top left).</p>
                </div>
                <div className="flex items-start gap-3 text-left bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <p className="text-xs text-gray-300">Ensure **Microphone** and **Camera** are set to **Allow**.</p>
                </div>
                <div className="flex items-start gap-3 text-left bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                  <p className="text-xs text-gray-300">Refresh the page and try again.</p>
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
              >
                Refresh Neural Core
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Animation Section - Optimized for Laptop Screens */}
      <div className="relative w-full h-[50vh] flex items-center justify-center bg-black/20">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
        />
        
        {/* Sub-Agents Visualization Overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-4 px-4 z-10">
          <div className="flex justify-center gap-3">
            {subAgents.map((agent) => (
              <motion.div
                key={agent.id}
                animate={{ 
                  scale: activeAgents.includes(agent.id) ? 1.1 : 1,
                  opacity: activeAgents.includes(agent.id) ? 1 : 0.4,
                  borderColor: activeAgents.includes(agent.id) ? 'rgba(0, 210, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border bg-black/40 backdrop-blur-md transition-all duration-300 min-w-[65px]`}
              >
                <agent.icon size={12} className={activeAgents.includes(agent.id) ? agent.color : 'text-white/40'} />
                <span className="text-[6px] font-mono uppercase tracking-tighter text-white/60">{agent.name}</span>
                {activeAgents.includes(agent.id) && (
                  <motion.div 
                    layoutId="active-glow"
                    className="w-1 h-1 rounded-full bg-jarvis-blue shadow-[0_0_5px_#00d2ff]" 
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Delegation Terminal */}
          <AnimatePresence>
            {(isAiSpeaking || systemLogs.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-md bg-black/80 backdrop-blur-md border border-jarvis-blue/20 rounded-lg p-3 font-mono text-[9px] overflow-hidden shadow-[0_0_30px_rgba(0,210,255,0.1)]"
              >
                <div className="flex items-center justify-between mb-2 border-b border-jarvis-blue/10 pb-1">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-jarvis-blue" />
                    <span className="text-jarvis-blue/80 uppercase tracking-widest font-bold">Neural Link Terminal</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                  </div>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  {systemLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-0.5 border-l-2 border-blue-500/30 pl-2 mb-2"
                    >
                      <div className="flex gap-2">
                        <span className="text-blue-400/60">[{log.time}]</span>
                        <span className="text-blue-400 font-bold">SYS_EXEC:</span>
                        <span className="text-white font-bold">{log.action}({log.target})</span>
                      </div>
                      <span className="text-white/40 italic ml-14">"{log.reason}"</span>
                    </motion.div>
                  ))}
                  {delegationLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2"
                    >
                      <span className="text-matrix-green/40">[{log.time}]</span>
                      <span className="text-matrix-green">AGENT_CMD:</span>
                      <span className="text-white/80">{log.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Action Notification */}
        <AnimatePresence>
          {lastSystemAction && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute top-20 right-4 z-50 bg-jarvis-blue/20 backdrop-blur-md border border-jarvis-blue/50 rounded-xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(0,210,255,0.3)]"
            >
              <div className="p-2 rounded-lg bg-jarvis-blue/20">
                <Cpu className="text-jarvis-blue animate-spin-slow" size={24} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-jarvis-blue uppercase tracking-widest mb-1">System Controller</div>
                <div className="text-sm font-bold text-white uppercase tracking-tight">{lastSystemAction}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {activeStream && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full h-full max-w-3xl rounded-2xl overflow-hidden border border-jarvis-blue/30 shadow-[0_0_50px_rgba(0,210,255,0.2)]"
            >
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={stopStream}
                  className="p-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg z-30"
                  title="Stop Stream"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] font-mono text-white uppercase tracking-widest">Vision Core Active</span>
                </div>
                <div className="w-[1px] h-3 bg-white/10" />
                <span className="text-[8px] font-mono text-white/40 uppercase">Analyzing Live Stream...</span>
              </div>
            </motion.div>
          </div>
        )}
        
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
                opacity: [0.4, 0.6, 0.4] 
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-64 h-64 rounded-full border-2 border-jarvis-blue/20 flex items-center justify-center relative"
            >
              <div className="absolute inset-0 rounded-full bg-jarvis-blue/5 blur-3xl" />
              <Shield className="text-jarvis-blue/20 w-24 h-24 relative z-10" />
            </motion.div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-jarvis-blue/30 font-mono text-[8px] tracking-[0.5em] uppercase">Neural Link Standby</span>
              <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-jarvis-blue/10 to-transparent" />
            </div>
          </div>
        )}

        {isActive && (
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[7px] font-mono text-jarvis-blue/50 uppercase tracking-widest">Voice Profile</span>
              <select 
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value as any)}
                className="bg-black/40 border border-jarvis-blue/30 text-jarvis-blue text-[9px] font-mono rounded px-2 py-1 outline-none focus:border-jarvis-blue transition-colors"
              >
                {voices.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-110 active:scale-95 shadow-lg"
              title="Upload Data"
            >
              <ImageIcon size={20} className="text-jarvis-blue" />
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </button>
            <button 
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-110 active:scale-95 shadow-lg"
              title="Share Screen"
              onClick={async () => {
                try {
                  stopStream();
                  const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                  setActiveStream(screenStream);
                } catch (err) {
                  console.error('Screen sharing failed:', err);
                }
              }}
            >
              <Monitor size={20} className={activeStream ? "text-jarvis-blue animate-pulse" : "text-jarvis-blue/60"} />
            </button>
            <button 
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-110 active:scale-95 shadow-lg"
              title="Camera"
              onClick={async () => {
                try {
                  stopStream();
                  const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                  setActiveStream(videoStream);
                } catch (err) {
                  console.error('Camera failed:', err);
                }
              }}
            >
              <Camera size={20} className={activeStream ? "text-cyan-500 animate-pulse" : "text-cyan-400"} />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Content Section - Optimized for Laptop Screens */}
      <div className="h-[50vh] w-full max-w-2xl px-6 pb-4 flex flex-col items-center justify-between gap-3 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
        
        <div className="w-full flex flex-col items-center gap-3">
          {/* Status Text */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="h-[1px] w-6 bg-jarvis-blue/20" />
              <span className="text-[7px] font-mono text-jarvis-blue/60 uppercase tracking-[0.4em] animate-pulse">Neural Network Delegating</span>
              <div className="h-[1px] w-6 bg-jarvis-blue/20" />
            </div>
            <h2 className={`text-xl font-black tracking-[0.2em] uppercase transition-colors duration-500 ${isActive ? 'text-jarvis-blue' : 'text-white/20'}`}>
              {status === 'idle' && 'Link Offline'}
              {status === 'connecting' && 'Syncing...'}
              {status === 'active' && 'Jani Online'}
              {status === 'error' && 'Link Failure'}
            </h2>
            {isActive && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[8px] font-mono text-white/40 uppercase tracking-[0.3em]"
              >
                {isAiSpeaking ? 'Delegating tasks to sub-agents...' : 'Awaiting Shafqat Jani\'s command...'}
              </motion.p>
            )}
          </div>

          {/* Message Feed (Bottom) */}
          <AnimatePresence mode="wait">
            {isActive && messages.length > 0 && (
              <motion.div
                key={messages[messages.length-1].id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="w-full text-center px-4 max-h-20 overflow-y-auto custom-scrollbar"
              >
                <div className="text-sm md:text-base text-cyan-100/90 leading-relaxed italic font-serif">
                  "{messages[messages.length-1].content}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Control Button */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-6">
            <button
              onClick={isActive ? stopSession : startSession}
              disabled={status === 'connecting'}
              className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                isActive 
                  ? 'bg-red-500/10 border-2 border-red-500/30 hover:bg-red-500/20' 
                  : 'bg-jarvis-blue shadow-[0_0_40px_rgba(0,210,255,0.4)] hover:scale-105 active:scale-95'
              }`}
            >
              {isActive ? (
                <MicOff className="w-8 h-8 text-red-500" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
              {!isActive && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full border-2 border-jarvis-blue"
                />
              )}
            </button>
          </div>

          {status === 'error' && (
            <div className="text-red-500 text-[8px] font-mono uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              Critical Error: Check Permissions
            </div>
          )}
          
          <div className="flex items-center gap-3 text-[7px] font-mono text-white/10 uppercase tracking-[0.5em]">
            <span>Shafqat Baloch</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span>Jani AI v5.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
