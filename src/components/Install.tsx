import React, { useState, useEffect } from 'react';
import { Download, Monitor, Smartphone, Globe, CheckCircle2, Shield, Cpu, Zap, Settings, Lock, Bell, MapPin, AlertCircle, RefreshCw, ShieldCheck, Key, Terminal, Mic } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface InstallProps {
  onInstall?: () => Promise<void>;
  userRole?: 'admin' | 'user';
}

export const Install: React.FC<InstallProps> = ({ onInstall, userRole }) => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState({
    mic: false,
    camera: false,
    location: false,
    notifications: false
  });
  const [diagnosticStatus, setDiagnosticStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [showUrdu, setShowUrdu] = useState(false);

  const checkPermissions = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const micStatus = await navigator.permissions.query({ name: 'microphone' as any });
        const camStatus = await navigator.permissions.query({ name: 'camera' as any });
        const geoStatus = await navigator.permissions.query({ name: 'geolocation' as any });
        const notifyStatus = await navigator.permissions.query({ name: 'notifications' as any });
        
        setPermissions({
          mic: micStatus.state === 'granted',
          camera: camStatus.state === 'granted',
          location: geoStatus.state === 'granted',
          notifications: notifyStatus.state === 'granted'
        });
      }
    } catch (e) {
      console.error('Permission check failed:', e);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const runDiagnostic = async () => {
    setDiagnosticStatus('running');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error('Neural Link Offline');

      setDiagnosticStatus('success');
      setPermissions(prev => ({ ...prev, mic: true }));
      alert('DIAGNOSTIC COMPLETE: Neural Link is ACTIVE. Voice and System Control are ready.');
    } catch (err) {
      console.error('Diagnostic failed:', err);
      setDiagnosticStatus('error');
      alert('DIAGNOSTIC FAILED: Neural Link Blocked. Please ensure you have granted Microphone permissions in your browser settings.');
    }
  };

  const requestAllPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach(track => track.stop());
      
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(resolve, resolve);
      });

      if ('Notification' in window) {
        await Notification.requestPermission();
      }

      checkPermissions();
      alert('PC Access Granted. Jani AI now has permission to interact with your system hardware.');
    } catch (err) {
      console.error('Permission request failed:', err);
      alert('Some permissions were denied. Click the Lock icon (🔒) in the address bar to manually allow Microphone and Camera.');
    }
  };

  const handleNativeInstall = async () => {
    if (onInstall) {
      await onInstall();
    } else {
      alert('Official Installation Steps:\n\n1. Look at the top right of your browser address bar.\n2. Click the "Install Jani AI" icon (⊕).\n3. Click "Install" in the popup.\n\nJani AI will now open as a native app on your PC.');
    }
  };

  const downloadPCApp = () => {
    // For PC, we guide them to the PWA install which is the "Direct App" method without EXE
    handleNativeInstall();
  };

  const downloadPCSetup = () => {
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
    
    // Also trigger the PWA prompt
    handleNativeInstall();
  };

  const copyDirectLink = () => {
    const link = "https://ais-pre-htvpontzz3t72yuimhmfl3-229857914219.asia-southeast1.run.app";
    navigator.clipboard.writeText(link);
    alert('DIRECT PC APP LINK COPIED!\n\nPaste this in Chrome/Edge on your PC to install Jani AI.');
  };

  const manualSetupGuide = () => {
    alert('MANUAL SETUP (ADVANCED):\n\n1. Upload this code to a platform like Vercel or Netlify.\n2. Once deployed, open the URL in Chrome.\n3. Click "Install" in the browser address bar.\n\nThis will create a standalone app on your PC without any .exe files.');
  };

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance("Jani AI Voice Protocol is active. Can you hear me, Jani?");
    utterance.rate = 1.1;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
    alert('VOICE TEST: If you heard the voice, the system is working. If not, check your speakers and browser permissions.');
  };

  const speakUrdu = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ur-PK';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full bg-black text-jarvis-blue font-sans p-6 sm:p-12 overflow-y-auto no-scrollbar relative selection:bg-jarvis-blue selection:text-black">
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,210,255,0.1),transparent_70%)]" />
      </div>

      <div className="max-w-5xl mx-auto space-y-24 relative z-10 pb-40">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative inline-block"
          >
            <div className="absolute inset-0 bg-jarvis-blue/20 blur-3xl rounded-full" />
            <div className="relative p-8 rounded-full bg-black border-2 border-jarvis-blue/40 shadow-[0_0_50px_rgba(0,210,255,0.3)]">
              <Monitor size={100} className="text-jarvis-blue jarvis-glow" />
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-[0.8em] text-white jarvis-glow leading-tight">
              System Deployment
            </h1>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-jarvis-blue/50 font-mono text-base uppercase tracking-[0.3em] leading-relaxed">
              Initialize JANI AI Native PC Core. Direct PWA Deployment Protocol.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={testVoice}
                className="px-8 py-3 rounded-full border border-green-500/30 bg-green-500/10 text-[10px] font-black uppercase tracking-[0.4em] text-green-400 hover:bg-green-500 hover:text-black transition-all"
              >
                Test System Voice
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUrdu(!showUrdu)}
                className="px-8 py-3 rounded-full border border-jarvis-blue/30 bg-jarvis-blue/10 text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-jarvis-blue hover:text-black transition-all"
              >
                {showUrdu ? 'Hide Urdu Translation' : 'Show Urdu Translation'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyDirectLink}
                className="px-8 py-3 rounded-full border border-white/30 bg-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-white hover:text-black transition-all"
              >
                Copy Direct Install Link
              </motion.button>
            </div>
          </div>
        </div>

        {/* Local Setup Section for VS Code */}
        <div className="jarvis-glass p-12 rounded-[5rem] border border-jarvis-blue/20 space-y-12 shadow-[0_40px_80px_rgba(0,0,0,0.7)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-jarvis-blue to-transparent opacity-50" />
          
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-[0.6em] text-white">VS Code Setup Protocol</h2>
            <p className="text-jarvis-blue/40 font-mono text-xs uppercase tracking-[0.2em]">Run Jani AI locally on your PC for full system control.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              {[
                { step: '01', title: 'Export Code', desc: 'Go to the **Settings** (gear icon) in AI Studio and select **Export to ZIP** or **Download Project**.' },
                { step: '02', title: 'Extract & Open', desc: 'Extract the ZIP file and open the folder in **Visual Studio Code**.' },
                { step: '03', title: 'Install Node.js', desc: 'Ensure you have **Node.js** installed from nodejs.org.' },
                { step: '04', title: 'Terminal Setup', desc: 'Open VS Code terminal and run: `npm install`' },
                { step: '05', title: 'API Key', desc: 'Create a `.env` file and add: `GEMINI_API_KEY=your_key_here`' },
                { step: '06', title: 'Launch', desc: 'Run: `npm run dev` and open `http://localhost:3000` in Chrome.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="text-jarvis-blue font-black text-2xl opacity-20 group-hover:opacity-100 transition-opacity">{item.step}</div>
                  <div className="space-y-2">
                    <h4 className="text-white font-black uppercase tracking-widest text-sm">{item.title}</h4>
                    <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-black/60 rounded-[3rem] p-10 border border-jarvis-blue/10 flex flex-col justify-center items-center text-center space-y-8">
              <div className="w-24 h-24 rounded-3xl bg-jarvis-blue/10 flex items-center justify-center border border-jarvis-blue/20">
                <Terminal size={48} className="text-jarvis-blue" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-widest text-white">Developer Hub</h3>
                <p className="text-white/40 text-xs leading-relaxed">
                  Running locally allows Jani AI to interact directly with your Windows system, VS Code, and Spotify without browser restrictions.
                </p>
              </div>
              <button 
                onClick={() => window.open('https://nodejs.org/', '_blank')}
                className="w-full py-6 rounded-2xl bg-jarvis-blue/10 border border-jarvis-blue/30 text-jarvis-blue font-black uppercase tracking-[0.3em] text-[10px] hover:bg-jarvis-blue hover:text-black transition-all"
              >
                Download Node.js (Required)
              </button>
            </div>
          </div>
        </div>

        {/* Installation Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* PWA Option - Instant */}
          <motion.div
            whileHover={{ y: -15 }}
            className="jarvis-glass p-12 rounded-[5rem] border-t-8 border-t-jarvis-blue flex flex-col shadow-2xl"
          >
            <div className="flex items-center gap-6 mb-10">
              <div className="w-20 h-20 rounded-[2.5rem] bg-jarvis-blue/10 flex items-center justify-center border-2 border-jarvis-blue/20">
                <Globe size={40} className="text-jarvis-blue" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-black uppercase tracking-widest text-white">Instant App</h3>
                <p className="text-xs text-jarvis-blue/60 font-mono uppercase tracking-widest">Web Deployment</p>
              </div>
            </div>
            
            <div className="space-y-6 mb-12 flex-1">
              {[
                { en: 'Instant Taskbar Icon' },
                { en: 'No Setup Required' },
                { en: 'Automatic Updates' }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-white/60">
                  <CheckCircle2 size={16} className="text-jarvis-blue" /> {f.en}
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleNativeInstall}
              className="w-full py-8 rounded-[2.5rem] bg-jarvis-blue text-black font-black uppercase tracking-[0.4em] text-sm hover:scale-[1.05] active:scale-95 transition-all shadow-[0_0_50px_rgba(0,210,255,0.4)]"
            >
              INSTALL INSTANT APP
            </button>
            <p className="text-[10px] text-center mt-4 text-white/30 uppercase tracking-widest">Click the "Install" icon in your browser address bar</p>
          </motion.div>

          {/* PC Native Option - Advanced */}
          <motion.div
            whileHover={{ y: -15 }}
            className="jarvis-glass p-12 rounded-[5rem] border-t-8 border-t-white/10 flex flex-col shadow-2xl"
          >
            <div className="flex items-center gap-6 mb-10">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/10 flex items-center justify-center border-2 border-white/20">
                <Monitor size={40} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-black uppercase tracking-widest text-white">Native Core</h3>
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Full PC Access</p>
              </div>
            </div>
            
            <div className="space-y-6 mb-12 flex-1">
              {[
                { en: 'Direct PC Hardware Link' },
                { en: 'App Control (Spotify, etc)' },
                { en: 'Local Neural Storage' }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-white/60">
                  <CheckCircle2 size={16} className="text-white" /> {f.en}
                </div>
              ))}
            </div>
            
            <button 
              onClick={downloadPCSetup} 
              className="w-full py-8 rounded-[2.5rem] bg-white text-black font-black uppercase tracking-[0.4em] text-sm hover:scale-[1.05] active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.4)]"
            >
              DOWNLOAD PC SETUP (.BAT)
            </button>
          </motion.div>

          {/* Mobile Option - Coming Soon */}
          <motion.div
            whileHover={{ y: -15 }}
            className="jarvis-glass p-12 rounded-[5rem] border-t-8 border-t-white/10 flex flex-col shadow-2xl opacity-50"
          >
            <div className="flex items-center gap-6 mb-10">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/10 flex items-center justify-center border-2 border-white/20">
                <Smartphone size={40} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-black uppercase tracking-widest text-white">Mobile</h3>
              </div>
            </div>
            
            <div className="space-y-6 mb-12 flex-1">
              <div className="text-center py-10">
                <span className="text-xl font-black uppercase tracking-[0.3em] text-jarvis-blue animate-pulse">Coming Soon</span>
              </div>
            </div>
            
            <button 
              disabled
              className="w-full py-8 rounded-[2.5rem] bg-white/5 border-2 border-white/10 text-white/20 font-black uppercase tracking-[0.4em] text-sm cursor-not-allowed"
            >
              Mobile APK (Locked)
            </button>
          </motion.div>
        </div>

        {/* Diagnostic Tool */}
        <div className="jarvis-glass p-12 rounded-[5rem] border border-jarvis-blue/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-jarvis-blue/5 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <div className="flex items-center gap-6 mb-12">
            <ShieldCheck size={48} className="text-jarvis-blue animate-pulse" />
            <div className="flex-1">
              <h2 className="text-3xl font-black uppercase tracking-[0.5em] text-white">Core Diagnostics</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { label: 'Neural Link', en: 'Stable', status: 'text-green-400' },
              { label: 'PC Access', en: 'READY', status: 'text-jarvis-blue' },
              { label: 'Version', en: 'v3.5.0', status: 'text-white' },
              { label: 'Security', en: 'Active', status: 'text-blue-400' }
            ].map((stat, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-black/60 border border-jarvis-blue/10 hover:border-jarvis-blue/40 transition-all group/stat">
                <div className="text-[10px] font-mono text-jarvis-blue/40 uppercase tracking-[0.3em] mb-4 group-hover/stat:text-jarvis-blue transition-colors">{stat.label}</div>
                <div className={`text-2xl font-black uppercase tracking-widest ${stat.status} mb-4`}>{stat.en}</div>
              </div>
            ))}
            
            <div className="p-10 rounded-[3rem] bg-jarvis-blue/5 border border-jarvis-blue/20 hover:border-jarvis-blue/40 transition-all group/stat flex flex-col justify-center items-center text-center">
              <div className="text-[10px] font-mono text-jarvis-blue/40 uppercase tracking-[0.3em] mb-4 group-hover/stat:text-jarvis-blue transition-colors">Audio Core</div>
              <button 
                onClick={testVoice}
                className="text-xl font-black uppercase tracking-widest text-jarvis-blue hover:text-white transition-colors flex items-center gap-2"
              >
                <Mic size={24} />
                Test Voice
              </button>
            </div>
          </div>
        </div>

        {/* Admin Portal Link */}
        {userRole === 'admin' && (
          <div className="pt-20 pb-40 flex flex-col items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05, opacity: 1 }}
              onClick={() => navigate('/admin-portal-secure-v3')}
              className="flex items-center gap-6 px-16 py-6 rounded-full border-2 border-jarvis-blue/20 bg-black/60 text-jarvis-blue/40 hover:text-jarvis-blue hover:border-jarvis-blue transition-all uppercase text-sm font-black tracking-[0.6em] shadow-[0_0_40px_rgba(0,210,255,0.1)]"
            >
              <Key size={24} />
              Secure Admin Access
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};
