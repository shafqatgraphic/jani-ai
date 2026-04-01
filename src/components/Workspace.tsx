import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Play, 
  Save, 
  RotateCcw, 
  Terminal as TerminalIcon, 
  Layout, 
  Eye, 
  Cpu,
  Zap,
  Globe,
  Monitor,
  Share2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { gemini } from '../services/geminiService';

interface File {
  name: string;
  content: string;
  language: string;
}

export const Workspace: React.FC = () => {
  const [files, setFiles] = useState<File[]>([
    {
      name: 'index.html',
      language: 'html',
      content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Jani AI Preview</title>\n    <script src="https://cdn.tailwindcss.com"></script>\n    <style>\n        body { background: #000; color: #00ff41; font-family: monospace; }\n        .matrix-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; opacity: 0.1; }\n    </style>\n</head>\n<body class="flex items-center justify-center h-screen">\n    <div class="text-center p-8 border border-[#00ff41]/30 rounded-2xl bg-black/50 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,65,0.1)]">\n        <h1 class="text-4xl font-black tracking-widest mb-4">JANI AI</h1>\n        <p class="text-sm opacity-60">Neural Interface Active</p>\n        <div class="mt-8 flex gap-4 justify-center">\n            <button class="px-6 py-2 bg-[#00ff41] text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all">INITIALIZE</button>\n            <button class="px-6 py-2 border border-[#00ff41]/30 rounded-lg hover:bg-[#00ff41]/10 transition-all">SYSTEMS</button>\n        </div>\n    </div>\n</body>\n</html>'
    }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Workspace initialized.', '[SYSTEM] Neural Core connected.']);

  const activeFile = files[activeFileIndex];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setLogs(prev => [...prev, `[USER] Requesting: ${prompt}`]);
    
    try {
      const response = await gemini.chat(
        `Jani, I am creating the code you asked for. Please provide ONLY the code for a full-stack login page or whatever you requested. Format it as a single HTML file with embedded CSS and JS if possible for easy preview. Request: ${prompt}`,
        []
      );
      
      const responseText = typeof response === 'string' ? response : response.text;

      // Extract code from response
      const codeMatch = responseText.match(/```(?:html|javascript|typescript|css)?\s*([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[1] : responseText;

      const newFile: File = {
        name: `generated_${Date.now()}.html`,
        language: 'html',
        content: extractedCode
      };

      setFiles(prev => [...prev, newFile]);
      setActiveFileIndex(files.length);
      setLogs(prev => [...prev, '[SYSTEM] Code generation successful.', '[SYSTEM] New file added to workspace.']);
      setPrompt('');
    } catch (error) {
      setLogs(prev => [...prev, '[ERROR] Generation failed. Check neural link.']);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRun = () => {
    setLogs(prev => [...prev, `[SYSTEM] Executing ${activeFile.name}...`]);
    // In a real app, this would update an iframe srcdoc
  };

  return (
    <div className="h-full flex flex-col bg-black text-matrix-green font-mono overflow-hidden">
      {/* Workspace Header */}
      <div className="h-12 border-b border-matrix-border bg-matrix-surface flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Layout size={16} className="text-matrix-green" />
            <span className="text-xs font-black tracking-widest uppercase">Developer Studio</span>
          </div>
          <div className="h-4 w-[1px] bg-matrix-border" />
          <div className="flex gap-1">
            {files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFileIndex(idx)}
                className={`px-3 py-1 rounded-t-md text-[10px] border-x border-t transition-all ${
                  activeFileIndex === idx 
                    ? 'bg-black border-matrix-border text-matrix-green' 
                    : 'bg-matrix-surface border-transparent text-matrix-green/40 hover:text-matrix-green/60'
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className={`p-2 rounded-md transition-all ${isPreviewOpen ? 'bg-matrix-green text-black' : 'text-matrix-green/40 hover:bg-matrix-green/10'}`}
            title="Toggle Preview"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={handleRun}
            className="p-2 rounded-md text-matrix-green hover:bg-matrix-green/10 transition-all"
            title="Run Code"
          >
            <Play size={16} />
          </button>
          <button className="p-2 rounded-md text-matrix-green hover:bg-matrix-green/10 transition-all" title="Save">
            <Save size={16} />
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor Area */}
        <div className={`flex-1 flex flex-col border-r border-matrix-border transition-all ${isPreviewOpen ? 'w-1/2' : 'w-full'}`}>
          <div className="flex-1 overflow-auto p-4 bg-black/50">
            <pre className="text-sm leading-relaxed">
              <code className="block whitespace-pre-wrap">
                {activeFile.content}
              </code>
            </pre>
          </div>
          
          {/* AI Prompt Input */}
          <div className="p-4 border-t border-matrix-border bg-matrix-surface">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Ask Sweetie to write code for you... (e.g., 'Create a login page')"
                  className="w-full bg-black border border-matrix-border rounded-lg py-2 pl-10 pr-4 text-sm text-matrix-green placeholder:text-matrix-green/20 outline-none focus:border-matrix-green transition-all"
                />
                <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-matrix-green/40" />
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-matrix-green text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Code size={14} />}
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Area */}
        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '50%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col bg-white"
            >
              <div className="h-8 bg-gray-100 border-b flex items-center px-4 gap-2 shrink-0">
                <Globe size={12} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 font-sans">https://stonic.preview/live-demo</span>
              </div>
              <div className="flex-1 relative overflow-hidden">
                <iframe 
                  srcDoc={activeFile.content}
                  title="Live Preview"
                  className="w-full h-full border-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Workspace Footer / Logs */}
      <div className="h-32 border-t border-matrix-border bg-black/80 flex flex-col shrink-0">
        <div className="h-8 border-b border-matrix-border flex items-center px-4 gap-2">
          <TerminalIcon size={12} className="text-matrix-green/40" />
          <span className="text-[9px] font-black tracking-widest uppercase text-matrix-green/40">System Logs</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {logs.map((log, i) => (
            <div key={i} className={`text-[10px] ${
              log.includes('[ERROR]') ? 'text-red-500' : 
              log.includes('[USER]') ? 'text-blue-400' : 
              'text-matrix-green/60'
            }`}>
              <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
