import React, { useState } from 'react';
import { Lock, Unlock, Key, Copy, RefreshCw } from 'lucide-react';

export const Encryption: React.FC = () => {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let k = '';
    for (let i = 0; i < 32; i++) k += chars.charAt(Math.floor(Math.random() * chars.length));
    setKey(k);
  };

  const mockEncrypt = () => {
    if (!text || !key) return;
    // Simple XOR mock for visual effect
    const encrypted = btoa(text.split('').map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join(''));
    setResult(encrypted);
  };

  const mockDecrypt = () => {
    if (!text || !key) return;
    try {
      const decoded = atob(text);
      const decrypted = decoded.split('').map((c, i) => 
        String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
      ).join('');
      setResult(decrypted);
    } catch (e) {
      setResult('DECRYPTION FAILED: INVALID PAYLOAD');
    }
  };

  return (
    <div className="p-4 lg:p-8 font-mono h-full overflow-y-auto">
      <h2 className="text-xl lg:text-2xl font-bold tracking-widest terminal-glow mb-8 uppercase">ENCRYPTION TOOLKIT</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-4 lg:space-y-6">
          <div>
            <label className="block text-[10px] opacity-50 mb-2 uppercase tracking-tighter">INPUT PAYLOAD</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 lg:h-40 bg-black border border-matrix-border p-3 lg:p-4 text-sm text-matrix-green focus:outline-none focus:border-matrix-green rounded"
              placeholder="Enter text to encrypt/decrypt..."
            />
          </div>

          <div>
            <label className="block text-[10px] opacity-50 mb-2 uppercase tracking-tighter">SECRET KEY (AES-256 MOCK)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="flex-1 bg-black border border-matrix-border p-2 text-sm text-matrix-green focus:outline-none focus:border-matrix-green rounded"
                placeholder="Key..."
              />
              <button
                onClick={generateKey}
                className="p-2 border border-matrix-border hover:bg-matrix-green/10 text-matrix-green rounded"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <button
              onClick={mockEncrypt}
              className="flex-1 bg-matrix-green text-black py-2.5 lg:py-3 rounded font-bold flex items-center justify-center gap-2 hover:bg-matrix-green/90 text-sm"
            >
              <Lock size={18} /> ENCRYPT
            </button>
            <button
              onClick={mockDecrypt}
              className="flex-1 border border-matrix-green text-matrix-green py-2.5 lg:py-3 rounded font-bold flex items-center justify-center gap-2 hover:bg-matrix-green/10 text-sm"
            >
              <Unlock size={18} /> DECRYPT
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] opacity-50 mb-2 uppercase tracking-tighter">OUTPUT BUFFER</label>
          <div className="w-full h-32 lg:h-40 bg-matrix-surface border border-matrix-border p-3 lg:p-4 rounded relative group overflow-y-auto">
            <div className="break-all text-xs lg:text-sm">
              {result || 'AWAITING OPERATION...'}
            </div>
            {result && (
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="absolute top-2 right-2 p-2 bg-black/50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity rounded"
              >
                <Copy size={16} />
              </button>
            )}
          </div>
          
          <div className="mt-6 lg:mt-8 p-3 lg:p-4 border border-matrix-green/20 bg-matrix-green/5 rounded text-[9px] lg:text-[10px] leading-relaxed">
            <div className="flex items-center gap-2 mb-2 text-matrix-green font-bold uppercase">
              <Key size={12} /> MILITARY-GRADE PROTOCOL
            </div>
            This module implements advanced cryptographic primitives. All payloads are processed through
            Sweetie's neural encryption engine. SHAFQAT BALOCH has full authority over this toolkit.
          </div>
        </div>
      </div>
    </div>
  );
};
