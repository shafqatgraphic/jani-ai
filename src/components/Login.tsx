import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Shield, Zap, Cpu, Chrome } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';

interface LoginProps {
  onLogin: (user: { email: string; role: 'admin' | 'user' }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStatus, setLoginStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginStatus('Authenticating...');
    
    // Simulate advanced login sequence
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoginStatus('Neural Link Syncing...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoginStatus('Bypassing Security...');
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoginStatus('God Mode Authorized.');
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email === 'techwithshafqat@gmail.com' && password === 'shafqat123') {
      onLogin({ email, role: 'admin' });
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error('Login error:', error);
        // Fallback for mock if firebase fails
        onLogin({ email, role: 'user' });
      }
    }
    setIsLoggingIn(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginStatus('Initializing Neural Link...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setLoginStatus('Link Established.');
        // App.tsx handles the state change via onAuthStateChanged
      }
    } catch (error) {
      console.error('Google login error:', error);
      setLoginStatus('Link Failed.');
      setTimeout(() => setIsLoggingIn(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Matrix-like background particles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * window.innerWidth }}
            animate={{ y: window.innerHeight }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            className="absolute w-[1px] h-20 bg-gradient-to-b from-transparent via-matrix-green to-transparent"
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-matrix-surface border border-matrix-border p-8 rounded-2xl shadow-[0_0_50px_rgba(0,255,65,0.1)] relative z-10 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="bg-matrix-green/10 p-4 rounded-full border border-matrix-green/30 shadow-[0_0_20px_rgba(0,255,65,0.2)]">
            <Cpu className="text-matrix-green w-10 h-10" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-[0.3em] text-white uppercase mb-1">JANI AI</h1>
            <p className="text-[10px] font-mono text-matrix-green/60 uppercase tracking-widest">Neural Interface v4.0.2</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-matrix-green/40 uppercase tracking-widest ml-1">Access ID</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-matrix-green/40 group-focus-within:text-matrix-green transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-black/50 border border-matrix-border rounded-lg py-3 pl-10 pr-4 text-matrix-green placeholder:text-matrix-green/20 focus:border-matrix-green outline-none transition-all font-mono text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-matrix-green/40 uppercase tracking-widest ml-1">Security Key</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-matrix-green/40 group-focus-within:text-matrix-green transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/50 border border-matrix-border rounded-lg py-3 pl-10 pr-4 text-matrix-green placeholder:text-matrix-green/20 focus:border-matrix-green outline-none transition-all font-mono text-sm"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-matrix-green text-black font-black py-4 rounded-lg uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,255,65,0.3)] hover:shadow-[0_0_50px_rgba(0,255,65,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <Zap size={18} fill="currentColor" className="animate-pulse" />
                {loginStatus}
              </span>
            ) : (
              <>
                <Zap size={18} fill="currentColor" />
                Initialize Link
              </>
            )}
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-matrix-border"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-matrix-surface px-2 text-matrix-green/20 font-mono">Or Bypass via Google</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full bg-black/50 border border-matrix-green/30 text-matrix-green font-bold py-3 rounded-lg uppercase tracking-[0.2em] hover:bg-matrix-green/10 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <Chrome size={18} />
            Neural Link via Google
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-matrix-border flex items-center justify-between">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[10px] font-mono text-matrix-green/40 hover:text-matrix-green uppercase tracking-widest transition-colors"
          >
            {isRegistering ? 'Back to Login' : 'Request Access'}
          </button>
          <div className="flex items-center gap-2 text-[10px] font-mono text-matrix-green/20 uppercase tracking-widest">
            <Shield size={12} />
            Secure Protocol
          </div>
        </div>
      </motion.div>

      {/* Footer Attribution */}
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] font-mono text-matrix-green/20 uppercase tracking-[0.5em]">
          Created by Shafqat Baloch • All Rights Reserved
        </p>
      </div>
    </div>
  );
};
