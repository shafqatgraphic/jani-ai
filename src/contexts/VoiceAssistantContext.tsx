import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { Message } from '../types';

interface VoiceAssistantContextType {
  isActive: boolean;
  status: 'idle' | 'connecting' | 'active' | 'error';
  messages: Message[];
  isAiSpeaking: boolean;
  userVolume: number;
  aiVolume: number;
  selectedVoice: string;
  setSelectedVoice: (voice: any) => void;
  activeStream: MediaStream | null;
  startSession: () => Promise<void>;
  stopSession: () => void;
  stopStream: () => void;
  setActiveStream: (stream: MediaStream | null) => void;
  setIsSharing: (sharing: boolean) => void;
  isSharing: boolean;
  sessionRef: React.MutableRefObject<any>;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  aiAnalyserRef: React.MutableRefObject<AnalyserNode | null>;
  sendMediaChunk: (data: string, mimeType: string) => void;
  systemLogs: { id: string; action: string; target: string; reason: string; time: string }[];
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [userVolume, setUserVolume] = useState(0);
  const [aiVolume, setAiVolume] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'>('Kore');
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [systemLogs, setSystemLogs] = useState<{ id: string; action: string; target: string; reason: string; time: string }[]>([]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextScheduleTimeRef = useRef<number>(0);
  const audioBufferQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const aiAnalyserRef = useRef<AnalyserNode | null>(null);
  const videoCaptureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoCaptureIntervalRef = useRef<number | null>(null);

  const sendMediaChunk = (data: string, mimeType: string) => {
    if (sessionRef.current) {
      sessionRef.current.sendRealtimeInput({
        media: { data, mimeType }
      });
    }
  };

  useEffect(() => {
    if (isActive && activeStream && status === 'active') {
      // Start video capture loop
      const video = document.createElement('video');
      video.srcObject = activeStream;
      video.play();

      const canvas = document.createElement('canvas');
      videoCaptureCanvasRef.current = canvas;
      const ctx = canvas.getContext('2d');

      const captureFrame = () => {
        if (!isActive || !activeStream || !sessionRef.current) {
          if (videoCaptureIntervalRef.current) {
            clearInterval(videoCaptureIntervalRef.current);
            videoCaptureIntervalRef.current = null;
          }
          return;
        }

        if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
          // Set canvas size to match video
          canvas.width = 640;
          canvas.height = 480;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
          sessionRef.current.sendRealtimeInput({
            video: { data: base64, mimeType: 'image/jpeg' }
          });
        }
      };

      videoCaptureIntervalRef.current = window.setInterval(captureFrame, 1000); // Capture every 1 second for efficiency
    } else {
      if (videoCaptureIntervalRef.current) {
        clearInterval(videoCaptureIntervalRef.current);
        videoCaptureIntervalRef.current = null;
      }
    }

    return () => {
      if (videoCaptureIntervalRef.current) {
        clearInterval(videoCaptureIntervalRef.current);
      }
    };
  }, [isActive, activeStream, status]);

  const stopAudioPlayback = () => {
    audioBufferQueueRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    audioBufferQueueRef.current = [];
    nextScheduleTimeRef.current = audioContextRef.current?.currentTime || 0;
  };

  const playAudio = async (base64: string) => {
    if (!audioContextRef.current || !aiAnalyserRef.current) return;
    
    // Ensure context is running (browsers often suspend it)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

    const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(aiAnalyserRef.current);
    aiAnalyserRef.current.connect(audioContextRef.current.destination);
    
    const startTime = Math.max(audioContextRef.current.currentTime, nextScheduleTimeRef.current);
    source.start(startTime);
    
    // Update AI volume while playing
    const updateAiVolume = () => {
      if (!aiAnalyserRef.current || !isActive) return;
      const data = new Uint8Array(aiAnalyserRef.current.frequencyBinCount);
      aiAnalyserRef.current.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      setAiVolume(sum / data.length);
      if (audioContextRef.current && audioContextRef.current.currentTime < startTime + buffer.duration) {
        requestAnimationFrame(updateAiVolume);
      } else {
        setAiVolume(0);
      }
    };
    updateAiVolume();

    nextScheduleTimeRef.current = startTime + buffer.duration;
    audioBufferQueueRef.current.push(source);
    
    source.onended = () => {
      audioBufferQueueRef.current = audioBufferQueueRef.current.filter(s => s !== source);
    };
  };

  const convertFloat32ToInt16 = (buffer: Float32Array) => {
    let l = buffer.length;
    let buf = new Int16Array(l);
    while (l--) buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
    return buf;
  };

  const callPCBridge = async (endpoint: string, data: any) => {
    // Check if running in Electron
    if (window && (window as any).ipcRenderer) {
      console.log(`[NATIVE CORE] Using Electron IPC for: ${endpoint}`);
      return new Promise((resolve) => {
        const ipc = (window as any).ipcRenderer;
        
        // Map endpoints to Electron commands
        let command = 'RUN_SHELL';
        let args = {};
        let payload = '';

        if (endpoint === 'open') {
          command = 'OPEN_APP';
          args = { appName: data.target };
        } else if (endpoint === 'vscode' || data.action === 'write_file') {
          command = 'WRITE_CODE';
          args = { filename: data.filename || 'generated_code.tsx' };
          payload = data.content;
        } else if (data.action === 'extract_zip') {
          command = 'EXTRACT_ZIP';
          args = { zipPath: data.target };
        } else if (data.action === 'build_app') {
          command = 'BUILD_APP';
          args = { projectPath: data.target, appName: 'JaniAI_Built_App' };
        }

        ipc.send('system-command', { command, args, payload });
        
        // One-time listener for the reply
        ipc.once('system-reply', (_: any, response: any) => {
          resolve(response);
        });
      });
    }

    // Fallback to browser fetch (for dev/web mode)
    try {
      const response = await fetch(`/api/pc/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (err) {
      console.error(`[NEURAL CORE] Bridge call failed: ${endpoint}`, err);
      return { error: 'Bridge connection failed' };
    }
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      setIsActive(true);

      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      aiAnalyserRef.current = audioContextRef.current.createAnalyser();
      aiAnalyserRef.current.fftSize = 256;

      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error('Mic access error:', err);
        setStatus('error');
        return;
      }
      
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      try {
        sessionRef.current = await gemini.connectLive({
          onopen: () => {
            console.log('Neural Link Established');
            setStatus('active');
            if (audioContextRef.current) {
              nextScheduleTimeRef.current = audioContextRef.current.currentTime;
            }
          },
          onmessage: async (message) => {
            console.log('Neural Link Message Received:', message);
            
            if (message.serverContent?.modelTurn?.parts) {
              console.log('AI is replying with parts:', message.serverContent.modelTurn.parts.length);
              setIsAiSpeaking(true);
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  console.log('AI Audio Part Received');
                  playAudio(part.inlineData.data);
                }
                if (part.text) {
                  console.log('AI Text Part:', part.text);
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'assistant') {
                      return [...prev.slice(0, -1), { ...last, content: (last.content || '') + part.text }];
                    }
                    return [...prev, { id: Date.now().toString(), role: 'assistant', content: part.text, timestamp: Date.now() }];
                  });
                }
              }
            }
            
            if (message.serverContent?.interrupted) {
              console.log('AI Interrupted');
              stopAudioPlayback();
              setIsAiSpeaking(false);
            }
            if (message.toolCall) {
              for (const call of message.toolCall.functionCalls) {
                const { name, args, id } = call;
                let response = { output: "Command executed successfully." };

                if (name === 'openSpotify') {
                  const { searchQuery } = args;
                  const url = `spotify:search:${encodeURIComponent(searchQuery)}`;
                  await callPCBridge('open', { target: url });
                  response = { output: `Opening Spotify search for: ${searchQuery}` };
                } 
                else if (name === 'controlPC') {
                  const { action, target } = args;
                  await callPCBridge('open', { target });
                  response = { output: `Executing ${action} on ${target}` };
                }
                else if (name === 'generateUI') {
                  const { componentType, description } = args;
                  // If it's a login page, let's actually write the code to a file!
                  if (componentType === 'login_page') {
                    const code = `import React from 'react';\n\nexport const LoginPage = () => (\n  <div className="min-h-screen flex items-center justify-center bg-black text-white">\n    <div className="p-8 rounded-3xl border border-white/10 bg-white/5">\n      <h1 className="text-2xl font-bold mb-4">Login</h1>\n      <input className="block w-full p-2 mb-4 bg-white/10 rounded" placeholder="Email" />\n      <button className="w-full p-2 bg-blue-500 rounded">Sign In</button>\n    </div>\n  </div>\n);`;
                    await callPCBridge('vscode', { 
                      action: 'write_file', 
                      folder: 'src/components', 
                      filename: 'LoginPage.tsx', 
                      content: code 
                    });
                    response = { output: `Neural Architect has generated your LoginPage.tsx and opened it in VS Code.` };
                  } else {
                    response = { output: `Neural Architect is designing your ${componentType}. Check the chat for the full code and implementation details.` };
                  }
                  
                  const newLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    action: 'UI_GEN',
                    target: componentType,
                    reason: description,
                    time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  };
                  setSystemLogs(prev => [newLog, ...prev].slice(0, 10));
                }
                else if (name === 'system_control') {
                  const { action, target, reason } = args;
                  const newLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    action,
                    target,
                    reason,
                    time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  };
                  setSystemLogs(prev => [newLog, ...prev].slice(0, 10));
                  
                  try {
                    if (action === 'open_app' || action === 'play_music' || action === 'open_url') {
                      await callPCBridge('open', { target });
                    } else if (action === 'vscode_cmd') {
                      await callPCBridge('open', { target: `code "${target}"` });
                    } else if (action === 'extract_zip') {
                      const res = await callPCBridge('system', { action: 'extract_zip', target });
                      response = { output: res.success ? `ZIP extracted to ${res.path}` : `Extraction failed: ${res.message}` };
                    } else if (action === 'build_app') {
                      const res = await callPCBridge('system', { action: 'build_app', target });
                      response = { output: res.success ? `Build started for ${target}` : `Build failed: ${res.message}` };
                    }
                  } catch (e) {
                    console.error('Protocol execution failed:', e);
                  }
                  response = { output: `Successfully executed ${action} on ${target}.` };
                }

                if (sessionRef.current) {
                  sessionRef.current.sendToolResponse({
                    functionResponses: [{
                      name,
                      id,
                      response
                    }]
                  });
                }
              }
            }
            
            if (message.serverContent?.turnComplete) {
              setIsAiSpeaking(false);
            }
          },
          onerror: (err) => {
            console.error('Neural Link Error:', err);
            setStatus('error');
            stopSession();
          },
          onclose: () => {
            console.log('Neural Link Closed');
            if (isActive) stopSession();
          }
        }, selectedVoice);
      } catch (err) {
        console.error('Failed to connect to Jani AI Neural Core:', err);
        setStatus('error');
        stopSession();
        return;
      }

      source.connect(analyserRef.current);
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      processorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate user volume
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        setUserVolume(Math.sqrt(sum / inputData.length) * 1000);

        const pcmData = convertFloat32ToInt16(inputData);
        const uint8 = new Uint8Array(pcmData.buffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
        const base64Data = btoa(binary);
        
        if (sessionRef.current) {
          sessionRef.current.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' }
          });
        }
      };

    } catch (err) {
      console.error('Failed to start live session:', err);
      setStatus('error');
      setIsActive(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    setIsAiSpeaking(false);
    
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    stopAudioPlayback();

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    audioContextRef.current = null;

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
  };

  const stopStream = () => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
      setIsSharing(false);
    }
  };

  return (
    <VoiceAssistantContext.Provider value={{
      isActive, status, messages, isAiSpeaking, userVolume, aiVolume,
      selectedVoice, setSelectedVoice, activeStream, startSession, stopSession,
      stopStream, setActiveStream, setIsSharing, isSharing, sessionRef,
      analyserRef, aiAnalyserRef, sendMediaChunk, systemLogs
    }}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  return context;
};
