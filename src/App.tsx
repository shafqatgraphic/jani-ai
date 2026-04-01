/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Mic, 
  ShieldCheck, 
  Lock, 
  Menu, 
  X, 
  Cpu,
  Zap,
  MoreVertical,
  Brain,
  Database,
  Settings,
  Users,
  Layout,
  Monitor,
  Camera as CameraIcon,
  LogOut,
  User,
  Download,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Terminal } from './components/Terminal';
import { LiveAssistant } from './components/LiveAssistant';
import { VulnerabilityScan } from './components/VulnerabilityScan';
import { Encryption } from './components/Encryption';
import { AdminPanel } from './components/AdminPanel';
import { Workspace } from './components/Workspace';
import { Memory } from './components/Memory';
import { System } from './components/System';
import { Login } from './components/Login';
import { Install } from './components/Install';
import { MusicPlayer } from './components/MusicPlayer';
import { Module } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00d2ff';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-10 z-0" />;
};

import { VoiceAssistantProvider, useVoiceAssistant } from './contexts/VoiceAssistantContext';

const GlobalVoiceOrb = () => {
  const { isActive, isAiSpeaking, status, stopSession, startSession } = useVoiceAssistant();
  const navigate = useNavigate();
  const location = useLocation();

  const fixVoice = async () => {
    if (isActive) {
      stopSession();
      setTimeout(() => startSession(), 500);
    } else {
      startSession();
    }
  };

  if (location.pathname === '/' || !isActive) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-4"
    >
      <div className="flex items-center gap-6 jarvis-glass px-8 py-4 rounded-full shadow-[0_0_50px_rgba(0,210,255,0.2)]">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Neural Link</span>
          <span className={`text-[8px] font-mono uppercase ${isAiSpeaking ? 'text-white animate-pulse' : 'text-jarvis-blue'}`}>
            {isAiSpeaking ? 'Jani Speaking...' : 'Awaiting Command'}
          </span>
        </div>
        
        <button
          onClick={() => navigate('/voice')}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
            isAiSpeaking 
              ? 'bg-jarvis-blue/40 border-white shadow-[0_0_40px_rgba(0,210,255,0.6)]' 
              : 'bg-jarvis-blue/20 border-jarvis-blue shadow-[0_0_30px_rgba(0,210,255,0.4)]'
          }`}
        >
          <div className="absolute inset-0 rounded-full border border-white/10 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-white/5 animate-spin-slow" />
          <Mic size={32} className={isAiSpeaking ? 'text-white' : 'text-jarvis-blue'} />
        </button>

        <div className="flex flex-col items-start">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">System Status</span>
          <button onClick={fixVoice} className="text-[8px] font-mono text-green-400 uppercase hover:text-white transition-colors">
            Optimal (Fix Voice)
          </button>
        </div>
      </div>
      
      <div className="px-4 py-1 bg-black/60 rounded-full border border-jarvis-blue/20">
        <span className="text-[7px] font-mono text-jarvis-blue uppercase tracking-[0.5em]">Jarvis Protocol Active</span>
      </div>
    </motion.div>
  );
};

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootLogs = [
    "INITIALIZING JANI AI CORE...",
    "ACCESSING NEURAL NETWORK...",
    "LOADING JARVIS PROTOCOL v3.0.0...",
    "CALIBRATING VOICE INTERFACE...",
    "ESTABLISHING SECURE LINK...",
    "BYPASSING SANDBOX RESTRICTIONS...",
    "HARDWARE ACCELERATION ENABLED.",
    "SYSTEM OPTIMIZED FOR NATIVE PERFORMANCE.",
    "JANI AI IS ONLINE."
  ];

  useEffect(() => {
    let currentLog = 0;
    const logInterval = setInterval(() => {
      if (currentLog < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentLog]]);
        setProgress(((currentLog + 1) / bootLogs.length) * 100);
        
        // Voice feedback for key steps
        if (currentLog === 0) {
          const utterance = new SpeechSynthesisUtterance("Initializing Jani AI Core.");
          utterance.rate = 1.2;
          utterance.pitch = 0.8;
          window.speechSynthesis.speak(utterance);
        }
        if (currentLog === bootLogs.length - 1) {
          const utterance = new SpeechSynthesisUtterance("Jani AI is online. Welcome back, Admin.");
          utterance.rate = 1.1;
          utterance.pitch = 0.9;
          window.speechSynthesis.speak(utterance);
        }
        
        currentLog++;
      } else {
        clearInterval(logInterval);
        setTimeout(onComplete, 1000);
      }
    }, 400);

    return () => {
      clearInterval(logInterval);
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center p-8 font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl space-y-8"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 hud-circle border-4 border-jarvis-blue animate-spin-slow" />
            <Brain size={64} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-jarvis-blue jarvis-glow animate-pulse" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-[0.5em] text-white jarvis-glow">
            JANI AI CORE
          </h1>
        </div>

        <div className="jarvis-glass p-6 rounded-2xl h-64 overflow-hidden flex flex-col gap-2">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-[10px] uppercase tracking-widest text-jarvis-blue/80"
            >
              <span className="text-white/40 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </motion.div>
          ))}
        </div>

        <div className="w-full bg-jarvis-blue/10 h-1 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-jarvis-blue shadow-[0_0_20px_#00d2ff]"
          />
        </div>
        <div className="flex justify-between text-[8px] uppercase tracking-widest text-jarvis-blue/40">
          <span>Loading Neural Assets...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </motion.div>
    </div>
  );
};

function AppContent() {
  const { stopSession, startSession, isActive } = useVoiceAssistant();
  const [user, setUser] = useState<{ email: string; role: 'admin' | 'user'; uid: string } | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isAgentic, setIsAgentic] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [agentStatuses, setAgentStatuses] = useState([
    'Jarvis Protocol Active',
    'Optimal Performance',
    'Encrypted Link Stable',
    'Syncing Data...',
    'Neural Core Ready',
    'Theme Engine Online',
    'Voice Hub Active',
    'Security Shield Up'
  ]);
  const [taskLogs, setTaskLogs] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState<string[]>([]);

  const [isNativeMode, setIsNativeMode] = useState(false);

  useEffect(() => {
    if (window && (window as any).ipcRenderer) {
      setIsNativeMode(true);
    }
  }, []);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.toLowerCase();
    setCommandOutput(prev => [`> ${command}`, ...prev]);
    
    if (cmd.includes('vs code') || cmd.includes('vscode')) {
      setCommandOutput(prev => ["SYSTEM: ACCESSING NATIVE FILE SYSTEM...", "SYSTEM: LAUNCHING VISUAL STUDIO CODE...", "SYSTEM: CREATING LOGIN_PAGE.TSX...", "SUCCESS: VS CODE OPENED. FILE CREATED.", ...prev]);
      const utterance = new SpeechSynthesisUtterance("Opening Visual Studio Code and creating the login page as requested.");
      window.speechSynthesis.speak(utterance);
    } else if (cmd.includes('theme') || cmd.includes('change')) {
      setCommandOutput(prev => ["SYSTEM: ANALYZING FEEDBACK...", "SYSTEM: OPTIMIZING JARVIS UI...", "SYSTEM: APPLYING NEURAL THEME UPDATES...", "SUCCESS: THEME MODIFIED.", ...prev]);
      const utterance = new SpeechSynthesisUtterance("Analyzing your feedback. Optimizing the Jarvis interface now.");
      window.speechSynthesis.speak(utterance);
    } else {
      setCommandOutput(prev => ["SYSTEM: COMMAND RECEIVED. PROCESSING VIA NEURAL AGENTS...", ...prev]);
    }
    
    setCommand('');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const logs = [
        "Optimizing CPU cycles...",
        "Scanning for vulnerabilities...",
        "Encrypting neural pathways...",
        "Syncing with cloud core...",
        "Managing background processes...",
        "Updating security protocols...",
        "Calibrating voice recognition...",
        "Analyzing system health..."
      ];
      setTaskLogs(prev => [logs[Math.floor(Math.random() * logs.length)], ...prev].slice(0, 5));
      
      setAgentStatuses(prev => prev.map(status => {
        const statuses = [
          'Scanning System...',
          'Optimizing Core...',
          'Neural Link Stable',
          'Processing Request...',
          'Hardware Sync OK',
          'Security Check Passed',
          'Awaiting Command'
        ];
        return Math.random() > 0.7 ? statuses[Math.floor(Math.random() * statuses.length)] : status;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isNative = new URLSearchParams(window.location.search).get('mode') === 'native';
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // Navigate to install page for full instructions
    navigate('/install');

    // Create a robust, interactive setup script for Windows
    const setupContent = `@echo off
setlocal enabledelayedexpansion
title JANI AI - NEURAL CORE DEPLOYMENT
color 0b

:MENU
cls
echo ============================================================
echo           JANI AI NEURAL CORE - PC SETUP PROTOCOL
echo ============================================================
echo.
echo [SYSTEM STATUS]
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo  NODE.JS: NOT FOUND (CRITICAL ERROR)
    echo  ACTION: Please install Node.js from https://nodejs.org
    set NODE_READY=0
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
    echo  NODE.JS: FOUND (!NODE_VER!)
    set NODE_READY=1
)

npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo  NPM: NOT FOUND (CRITICAL ERROR)
    set NPM_READY=0
) else (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
    echo  NPM: FOUND (!NPM_VER!)
    set NPM_READY=1
)
echo.
echo ============================================================
echo  DEPLOYMENT STEPS:
echo ============================================================
echo  1. INSTALL NODE.JS: https://nodejs.org (LTS Version)
echo  2. RESTART YOUR PC (Crucial step)
echo  3. EXPORT ZIP: AI Studio Settings -^> Export to ZIP
echo  4. RUN THIS SCRIPT: Select Option [1] then [3]
echo ============================================================
echo.
echo  [1] INSTALL NEURAL DEPENDENCIES (npm install)
echo  [2] LAUNCH FULL-STACK CORE (npm run dev)
echo  [3] BUILD NATIVE PC APP (.EXE) (npm run electron:build)
echo  [4] DOWNLOAD NODE.JS (Opens Browser)
echo  [5] FIX POWERSHELL PERMISSIONS (Run as Admin)
echo  [6] EXIT
echo.
set /p choice="SELECT PROTOCOL [1-6]: "

if "%choice%"=="1" goto INSTALL
if "%choice%"=="2" goto LAUNCH
if "%choice%"=="3" goto BUILDEXE
if "%choice%"=="4" goto GETNODE
if "%choice%"=="5" goto FIXPERMS
if "%choice%"=="6" exit
goto MENU

:GETNODE
echo.
echo [SYSTEM] OPENING NODE.JS DOWNLOAD PAGE...
start https://nodejs.org/en/download/prebuilt-installer
echo Please install the LTS version and RESTART your PC.
pause
goto MENU

:BUILDEXE
if %NODE_READY%==0 goto GETNODE
if %NPM_READY%==0 goto GETNODE
echo.
echo [SYSTEM] BUILDING NATIVE PC EXECUTABLE...
echo This will create a standalone .exe in the 'dist-native' folder.
call npm run electron:build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed. Did you run Option [1] first?
) else (
    echo.
    echo [SYSTEM] BUILD COMPLETE. Check the 'dist-native' folder.
)
pause
goto MENU

:FIXPERMS
echo.
echo [SYSTEM] ATTEMPTING TO FIX POWERSHELL EXECUTION POLICY...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
echo [SYSTEM] PERMISSIONS UPDATED.
pause
goto MENU

:INSTALL
if %NODE_READY%==0 goto GETNODE
echo.
echo [SYSTEM] INSTALLING NEURAL DEPENDENCIES...
call npm install
echo.
echo [SYSTEM] INSTALL COMPLETE.
pause
goto MENU

:LAUNCH
if %NODE_READY%==0 goto GETNODE
echo.
echo [SYSTEM] STARTING NEURAL CORE...
echo Jani AI will open at http://localhost:3000
start http://localhost:3000
call npm run dev
pause
goto MENU

:GETNODE
echo.
echo [SYSTEM] REDIRECTING TO NODE.JS DOWNLOAD...
start https://nodejs.org/
echo.
echo Please install Node.js (LTS version) and RESTART this script.
pause
goto MENU`;

    const blob = new Blob([setupContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'JANI_AI_PC_SETUP.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              email: firebaseUser.email || '',
              role: userData.role as 'admin' | 'user',
              uid: firebaseUser.uid
            });
          } else {
            setUser({
              email: firebaseUser.email || '',
              role: 'user',
              uid: firebaseUser.uid
            });
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          if (firebaseUser.email === 'techwithshafqat@gmail.com') {
            setUser({ email: firebaseUser.email, role: 'admin', uid: firebaseUser.uid });
          } else {
            setUser({ email: firebaseUser.email || '', role: 'user', uid: firebaseUser.uid });
          }
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const modules = [
    { id: 'live', name: 'Voice Assistant', icon: Mic, path: '/voice' },
    { id: 'terminal', name: 'Terminal', icon: TerminalIcon, path: '/terminal' },
    { id: 'scan', name: 'Vulnerability Scan', icon: ShieldCheck, path: '/scan' },
    { id: 'encrypt', name: 'Encryption', icon: Lock, path: '/encrypt' },
    { id: 'memory', name: 'Memory', icon: Database, path: '/memory' },
    { id: 'music', name: 'Music', icon: Music, path: '/music' },
    ...(!isNative ? [{ id: 'install', name: 'Install', icon: Download, path: '/install' }] : []),
    { id: 'system', name: 'System', icon: Monitor, path: '/system' },
    { id: 'workspace', name: 'PC Core Control', icon: Layout, path: '/workspace' },
  ];

  const handleLogout = async () => {
    try {
      // Stop voice session on logout
      stopSession();
      
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="text-jarvis-blue animate-spin" size={48} />
          <span className="text-jarvis-blue font-mono text-xs uppercase tracking-[0.5em]">Syncing Neural Link...</span>
        </div>
      </div>
    );
  }

  if (isBooting) {
    return <BootSequence onComplete={() => setIsBooting(false)} />;
  }

  if (!user) {
    return <Login onLogin={(u) => setUser({ ...u, uid: 'mock-uid' })} />;
  }

  const activeModule = modules.find(m => m.path === location.pathname)?.id || 'desktop';

  return (
    <div className="flex h-screen bg-black overflow-hidden relative text-jarvis-blue select-none font-sans">
      <MatrixBackground />
      <div className="scanline" />
      <GlobalVoiceOrb />

      {/* Sidebar - Permanent on Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="hidden md:flex flex-col h-full jarvis-glass border-r border-jarvis-blue/20 z-[120] relative overflow-hidden"
      >
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-jarvis-blue/10 flex items-center justify-center border border-jarvis-blue/20">
              <Brain size={28} className="text-jarvis-blue" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-[0.3em]">Jani AI</h1>
              <div className="text-[8px] font-mono text-jarvis-blue/40 uppercase tracking-widest">Neural OS v3.5</div>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInstallClick}
              className="w-full flex flex-col items-center gap-2 p-6 rounded-[2rem] bg-white text-black font-black shadow-[0_0_40px_rgba(255,255,255,0.3)] mb-8 group animate-pulse"
            >
              <Download size={24} className="text-black" />
              <span className="text-[10px] uppercase tracking-[0.3em]">Download PC App</span>
            </motion.button>
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => navigate(mod.path)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                  activeModule === mod.id 
                    ? 'bg-jarvis-blue text-black font-bold shadow-[0_0_20px_rgba(0,210,255,0.3)]' 
                    : 'text-jarvis-blue/60 hover:bg-jarvis-blue/10 hover:text-white'
                }`}
              >
                <mod.icon size={20} className={activeModule === mod.id ? 'text-black' : 'group-hover:text-jarvis-blue'} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{mod.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-jarvis-blue/10 mt-auto">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-jarvis-blue/10">
              <div className="w-10 h-10 rounded-full bg-jarvis-blue/10 flex items-center justify-center border border-jarvis-blue/20">
                <User size={20} className="text-jarvis-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-white uppercase tracking-widest truncate">{user.email.split('@')[0]}</div>
                <div className="text-[8px] font-mono text-jarvis-blue/40 uppercase tracking-widest">{user.role}</div>
              </div>
              <button onClick={handleLogout} className="text-red-500/60 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Desktop Environment */}
      <div className="flex-1 relative flex flex-col h-full z-10 pt-12 overflow-y-auto no-scrollbar">
        {/* Top Header Section - Assistant & Command */}
        <div className="px-10 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black text-white uppercase tracking-[0.4em] jarvis-glow">Jani AI Assistant</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isNativeMode ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`} />
              <span className="text-[10px] font-mono text-jarvis-blue uppercase tracking-widest">
                {isNativeMode ? 'Native Neural Core Active' : 'Neural Link Synchronized'}
              </span>
            </div>
          </div>

          {/* Command Bar - Integrated at Top */}
          <div className="w-full md:w-96 flex items-center gap-4">
            <div className="flex-1 jarvis-glass p-3 rounded-2xl border border-jarvis-blue/30">
              <form onSubmit={handleCommand} className="relative">
                <input 
                  type="text" 
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Command System..."
                  className="w-full bg-black/40 border border-jarvis-blue/20 rounded-xl px-4 py-3 text-xs text-white placeholder:text-jarvis-blue/30 focus:outline-none focus:border-jarvis-blue transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-jarvis-blue hover:text-white">
                  <Zap size={16} />
                </button>
              </form>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/music')}
              className="w-14 h-14 rounded-2xl jarvis-glass border border-jarvis-blue/30 flex items-center justify-center text-jarvis-blue hover:text-white transition-all"
            >
              <Music size={24} />
            </motion.button>
          </div>
        </div>

        {/* Neural Agents Section - "Working Agents" */}
        <div className="px-10 mb-12 flex flex-col gap-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
              <Cpu size={14} className="text-jarvis-blue" /> Active Neural Agents
            </h3>
            <div className="h-[1px] flex-1 mx-4 bg-jarvis-blue/10" />
            <span className="text-[8px] font-mono text-jarvis-blue/60 uppercase tracking-widest">System Load: 24%</span>
          </div>
          
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            {/* Task Log Agent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 jarvis-glass p-4 rounded-2xl min-w-[300px] border-l-4 border-l-white shadow-xl bg-white/5"
            >
              <div className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
                <Zap size={10} className="text-white animate-pulse" />
                Live Activity Stream
              </div>
              <div className="space-y-1 h-16 overflow-hidden">
                {taskLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1 - i * 0.2, x: 0 }}
                    className="text-[9px] font-mono uppercase text-white/70 truncate flex items-center gap-2"
                  >
                    <span className="text-jarvis-blue/40">»</span> {log}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {[
              { name: 'Neural Core', color: 'text-jarvis-blue', icon: Brain },
              { name: 'System Eye', color: 'text-green-400', icon: CameraIcon },
              { name: 'Shield Link', color: 'text-blue-400', icon: ShieldCheck },
              { name: 'Data Flow', color: 'text-yellow-400', icon: Database }
            ].map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 jarvis-glass p-4 rounded-2xl min-w-[200px] border-l-4 border-l-jarvis-blue shadow-lg group hover:bg-jarvis-blue/5 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/40">Agent {i + 1}</div>
                  <agent.icon size={12} className="text-jarvis-blue/40 group-hover:text-jarvis-blue transition-colors" />
                </div>
                <div className="text-sm font-black text-white mb-1 uppercase tracking-tighter">{agent.name}</div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-jarvis-blue animate-pulse" />
                  <div className={`text-[9px] font-mono uppercase tracking-widest ${agent.color} truncate`}>
                    {agentStatuses[i] || 'Standby'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Controls - Screen & Camera Share */}
        <div className="px-10 mb-12 flex gap-4 max-w-7xl mx-auto w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/voice')}
            className="flex-1 jarvis-glass p-6 rounded-3xl border border-jarvis-blue/20 flex items-center justify-center gap-4 group hover:border-jarvis-blue/50 transition-all bg-jarvis-blue/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-jarvis-blue/10 flex items-center justify-center border border-jarvis-blue/20 group-hover:bg-jarvis-blue group-hover:text-black transition-all">
              <Monitor size={24} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-black uppercase tracking-widest text-white group-hover:jarvis-glow">Share Screen</span>
              <span className="text-[8px] font-mono text-jarvis-blue/40 uppercase">Broadcast Neural Display</span>
            </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/voice')}
            className="flex-1 jarvis-glass p-6 rounded-3xl border border-jarvis-blue/20 flex items-center justify-center gap-4 group hover:border-jarvis-blue/50 transition-all bg-jarvis-blue/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-jarvis-blue/10 flex items-center justify-center border border-jarvis-blue/20 group-hover:bg-jarvis-blue group-hover:text-black transition-all">
              <CameraIcon size={24} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-black uppercase tracking-widest text-white group-hover:jarvis-glow">Share Camera</span>
              <span className="text-[8px] font-mono text-jarvis-blue/40 uppercase">Activate Vision Core</span>
            </div>
          </motion.button>
        </div>

        {/* Desktop Icons Grid - Options below Agents */}
        <div className="flex-1 px-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 content-start max-w-7xl mx-auto w-full pb-40">
          {modules.map((mod) => (
            <motion.button
              key={mod.id}
              whileHover={{ scale: 1.02, y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(mod.path)}
              className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] transition-all group relative border-2 ${
                activeModule === mod.id 
                  ? 'bg-jarvis-blue/20 border-jarvis-blue shadow-[0_0_50px_rgba(0,210,255,0.4)]' 
                  : 'bg-black/40 border-jarvis-blue/10 hover:border-jarvis-blue/50 hover:bg-jarvis-blue/5'
              }`}
            >
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all border-2 ${
                activeModule === mod.id 
                  ? 'bg-jarvis-blue text-black shadow-[0_0_40px_rgba(0,210,255,0.6)]' 
                  : 'text-jarvis-blue group-hover:text-white border-jarvis-blue/20'
              }`}>
                <mod.icon size={36} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] text-center jarvis-glow ${
                  activeModule === mod.id ? 'text-white' : 'text-jarvis-blue/60 group-hover:text-white'
                }`}>
                  {mod.name}
                </span>
                <div className="w-8 h-1 rounded-full bg-jarvis-blue/20 group-hover:bg-jarvis-blue transition-all" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Active Module Container (Window) */}
        <AnimatePresence>
          {!isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl"
            >
              <div className="max-w-md w-full text-center space-y-10">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="relative inline-block"
                >
                  <div className="absolute inset-0 bg-jarvis-blue/20 blur-3xl rounded-full" />
                  <div className="relative p-10 rounded-full bg-black border-2 border-jarvis-blue/40 shadow-[0_0_50px_rgba(0,210,255,0.3)]">
                    <Brain size={80} className="text-jarvis-blue jarvis-glow" />
                  </div>
                </motion.div>
                
                <div className="space-y-4">
                  <h2 className="text-4xl font-black uppercase tracking-[0.4em] text-white jarvis-glow">Sync Neural Link</h2>
                  <p className="text-jarvis-blue/60 text-sm font-mono uppercase tracking-widest leading-relaxed">
                    Click below to authorize audio output and establish secure link with Shafqat Jani's PC.
                  </p>
                </div>

                <button 
                  onClick={startSession}
                  className="w-full py-6 rounded-full bg-jarvis-blue text-black font-black uppercase tracking-[0.5em] text-sm hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(0,210,255,0.5)]"
                >
                  Establish Connection
                </button>
                
                <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.5em]">
                  Protocol v5.1 Stable Build
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Module Container (Window) */}
        <AnimatePresence mode="wait">
          {location.pathname !== '/desktop' && (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              className="fixed inset-6 sm:inset-12 top-24 bottom-28 jarvis-glass rounded-[3rem] z-50 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,210,255,0.2)]"
            >
              {/* Window Header */}
              <div className="h-16 border-b border-jarvis-blue/20 flex items-center justify-between px-8 bg-black/40">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60 hover:bg-red-500 cursor-pointer transition-colors" onClick={() => navigate('/')} />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="h-6 w-[1px] bg-jarvis-blue/20 mx-2" />
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-white jarvis-glow">
                    {modules.find(m => m.path === location.pathname)?.name || 'System'}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-jarvis-blue animate-ping" />
                    <span className="text-[9px] font-mono text-jarvis-blue uppercase tracking-widest">Protocol Active</span>
                  </div>
                  <button onClick={() => navigate('/')} className="text-jarvis-blue/60 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Window Content */}
              <div className="flex-1 overflow-hidden relative">
                <Routes>
                  <Route path="/voice" element={<LiveAssistant />} />
                  <Route path="/terminal" element={<Terminal />} />
                  <Route path="/scan" element={<VulnerabilityScan />} />
                  <Route path="/encrypt" element={<Encryption />} />
                  <Route path="/memory" element={<Memory />} />
                  <Route path="/music" element={<MusicPlayer />} />
                  <Route path="/install" element={<Install onInstall={handleInstallClick} userRole={user.role} />} />
                  <Route path="/system" element={<System />} />
                  <Route path="/workspace" element={<Workspace />} />
                  <Route 
                    path="/admin-portal-secure-v3" 
                    element={user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} 
                  />
                  <Route path="/desktop" element={<div />} />
                  <Route path="/" element={<Navigate to="/desktop" />} />
                  <Route path="*" element={<Navigate to="/desktop" />} />
                </Routes>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Taskbar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 h-20 px-6 jarvis-glass rounded-full z-[100] flex items-center gap-4 shadow-[0_0_50px_rgba(0,210,255,0.3)]">
          {/* Start Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 ${
              isSidebarOpen 
                ? 'bg-jarvis-blue border-white text-black shadow-[0_0_30px_#fff]' 
                : 'bg-black/40 border-jarvis-blue/30 text-jarvis-blue hover:border-jarvis-blue hover:shadow-[0_0_20px_rgba(0,210,255,0.5)]'
            }`}
          >
            <Brain size={28} />
          </button>

          <div className="h-10 w-[1px] bg-jarvis-blue/20 mx-2" />

          {/* System Tray */}
          <div className="flex items-center gap-6 px-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-white tracking-widest jarvis-glow">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[10px] font-mono text-jarvis-blue/50 uppercase">
                {new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Start Menu (Mobile/Desktop Sidebar) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <motion.aside
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-black/90 backdrop-blur-3xl border border-matrix-border rounded-[2.5rem] z-[130] flex flex-col p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-matrix-green/10 flex items-center justify-center border border-matrix-green/20">
                    <User size={24} className="text-matrix-green" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white uppercase tracking-widest">{user.email.split('@')[0]}</div>
                    <div className="text-[10px] font-mono text-matrix-green/40 uppercase tracking-widest">{user.role}</div>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-matrix-green/40 hover:text-matrix-green transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {modules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      navigate(mod.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      activeModule === mod.id 
                        ? 'bg-matrix-green text-black font-bold' 
                        : 'bg-white/5 text-matrix-green/60 hover:bg-matrix-green/10 hover:text-matrix-green'
                    }`}
                  >
                    <mod.icon size={20} />
                    <span className="font-mono text-[10px] uppercase tracking-widest">{mod.name}</span>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-matrix-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-matrix-green/40 uppercase tracking-widest">Neural Link Active</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut size={14} />
                  <span>Shutdown</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <VoiceAssistantProvider>
      <AppContent />
    </VoiceAssistantProvider>
  );
}
