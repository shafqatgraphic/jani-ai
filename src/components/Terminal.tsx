import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Terminal as TerminalIcon, Loader2, Heart, Activity, Image as ImageIcon, X, Copy, Check, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { gemini } from '../services/geminiService';
import { Message } from '../types';

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-matrix-green/20 shadow-2xl">
      <div className="flex items-center justify-between bg-black/80 px-4 py-2 border-b border-matrix-green/10">
        <span className="text-[10px] font-mono text-matrix-green/50 uppercase tracking-widest">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-matrix-green/5 text-matrix-green hover:bg-matrix-green/20 transition-all border border-matrix-green/20"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span className="text-[10px] font-bold uppercase">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="max-h-[500px] overflow-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            fontSize: '0.85rem',
            background: '#050505',
            lineHeight: '1.6',
          }}
          wrapLongLines={true}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Shafqat Jaanu, system initialized. Predator online. Awaiting briefing or tactical query.',
      timestamp: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mood, setMood] = useState('Devoted');
  const [heartRate, setHeartRate] = useState(72);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('STT Result:', transcript);
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleSTT = () => {
    if (isListening) {
      console.log('Stopping STT...');
      recognitionRef.current?.stop();
    } else {
      console.log('Starting STT...');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('STT Start Error:', err);
        setIsListening(false);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          data: (reader.result as string).split(',')[1],
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const [voiceCount, setVoiceCount] = useState(0);

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    addLog('System initialized. Neural link standby.');
    addLog('Security protocols bypassed. God Mode active.');
  }, []);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);
    addLog(`Executing tactical query: ${currentInput.slice(0, 20)}...`);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }],
      }));

      // Simulate emotional response
      setHeartRate(prev => Math.min(120, prev + 15));
      setMood('Intense');

      const response = await gemini.chat(currentInput || 'Analyze this image, Shafqat Jaanu.', history, currentImage || undefined);
      const responseText = typeof response === 'string' ? response : response.text;
      
      addLog('Neural response received. Syncing...');
      
      // Reset after response
      setTimeout(() => {
        setHeartRate(prev => Math.max(65, prev - 10));
        setMood('Devoted');
      }, 3000);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText || 'Error retrieving response.',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (isTTSEnabled && responseText) {
        const voice = voiceCount === 0 ? 'Kore' : 'Puck';
        const audioBase64 = await gemini.generateTTS(responseText, voice);
        if (audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
          audio.play();
        }
        setVoiceCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Chat error:', error);
      addLog('CRITICAL ERROR: Neural link disrupted.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full terminal-container relative overflow-hidden bg-black">
      {/* Background Neural Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff41_1px,transparent_1px),linear-gradient(to_bottom,#00ff41_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Advanced Header */}
        <div className="bg-black/80 border-b border-matrix-green/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-matrix-green animate-ping" />
              <span className="text-[10px] font-mono text-matrix-green uppercase tracking-[0.2em]">Neural Link: Online</span>
            </div>
            <div className="hidden md:flex items-center gap-4 border-l border-matrix-green/10 pl-4">
              <div className="flex items-center gap-2">
                <Heart className={`text-red-500 ${heartRate > 90 ? 'animate-ping' : 'animate-pulse'}`} size={12} />
                <span className="text-[10px] font-mono text-matrix-green/50 uppercase">HR:</span>
                <span className="text-[10px] font-mono text-matrix-green">{heartRate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="text-blue-400" size={12} />
                <span className="text-[10px] font-mono text-matrix-green/50 uppercase">Mood:</span>
                <span className="text-[10px] font-mono text-matrix-green">{mood}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-matrix-green/10 pl-4">
                <Shield className="text-matrix-green" size={12} />
                <span className="text-[10px] font-mono text-matrix-green/50 uppercase">Health:</span>
                <span className="text-[10px] font-mono text-matrix-green">100%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-matrix-green/30 uppercase tracking-widest">God Mode Active</span>
            <Shield className="text-matrix-green/30" size={12} />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] lg:max-w-[85%] p-4 rounded-xl border ${
                  msg.role === 'user' 
                    ? 'bg-matrix-green/5 border-matrix-green/30 text-white shadow-[0_0_20px_rgba(0,255,65,0.05)]' 
                    : 'bg-black/60 border-matrix-green/20 text-matrix-green'
                }`}>
                  <div className="flex items-center justify-between mb-3 opacity-40 text-[9px] uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                      {msg.role === 'assistant' ? <TerminalIcon size={12} /> : <Heart size={12} />}
                      <span>{msg.role === 'user' ? 'Shafqat Jani' : 'Sweetie'}</span>
                    </div>
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {msg.image && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-matrix-green/20">
                      <img 
                        src={`data:${msg.image.mimeType};base64,${msg.image.data}`} 
                        alt="Tactical data" 
                        className="max-w-full h-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="prose prose-invert prose-green max-w-none text-sm leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <CodeBlock
                              language={match[1]}
                              value={String(children).replace(/\n$/, '')}
                              {...props}
                            />
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-black/40 border border-matrix-green/20 p-4 rounded-lg flex items-center gap-3">
                  <Loader2 className="animate-spin text-matrix-green" size={16} />
                  <span className="text-[10px] font-mono text-matrix-green animate-pulse tracking-widest uppercase">Analyzing Neural Patterns...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Side System Logs (Desktop Only) */}
          <div className="hidden xl:flex w-80 border-l border-matrix-green/10 bg-black/40 flex-col p-4 font-mono text-[9px]">
            <div className="flex items-center gap-2 mb-4 text-matrix-green/50 uppercase tracking-widest border-b border-matrix-green/10 pb-2">
              <Activity size={12} />
              <span>System Logs</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className="text-matrix-green/40 hover:text-matrix-green/80 transition-colors">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-matrix-green/20 bg-black/80">
          <div className="max-w-5xl mx-auto space-y-4">
            <AnimatePresence>
              {selectedImage && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-3 p-2 bg-matrix-green/5 border border-matrix-green/20 rounded-lg"
                >
                  <div className="relative w-12 h-12 rounded overflow-hidden border border-matrix-green/30">
                    <img 
                      src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                    >
                      <X size={10} />
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-matrix-green/70 uppercase tracking-widest">
                    Tactical Data Stream Loaded
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-lg border border-matrix-green/20 text-matrix-green hover:bg-matrix-green/10 transition-all"
                  title="Upload Data"
                >
                  <ImageIcon size={20} />
                </button>
                <button
                  onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                  className={`p-3 rounded-lg border transition-all ${
                    isTTSEnabled ? 'bg-matrix-green text-black border-matrix-green shadow-[0_0_15px_rgba(0,255,65,0.3)]' : 'border-matrix-green/20 text-matrix-green hover:bg-matrix-green/10'
                  }`}
                  title="Voice Briefing"
                >
                  {isTTSEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
              </div>
              
              <div className="flex-1 relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Enter tactical query or code..."
                  rows={3}
                  className="w-full bg-black/60 border border-matrix-green/30 rounded-xl py-3 px-4 text-sm text-matrix-green focus:outline-none focus:border-matrix-green transition-all placeholder:text-matrix-green/20 custom-scrollbar resize-none shadow-[inset_0_0_20px_rgba(0,255,65,0.02)]"
                />
                <button
                  onClick={toggleSTT}
                  className={`absolute right-4 bottom-4 p-2 rounded-full transition-all ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'text-matrix-green/30 hover:text-matrix-green hover:bg-matrix-green/5'
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isTyping}
                className="bg-matrix-green text-black h-[88px] px-8 rounded-xl font-bold hover:bg-matrix-green/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,65,0.2)]"
              >
                <Send size={24} />
                <span className="text-[10px] tracking-[0.2em] uppercase">Execute</span>
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
