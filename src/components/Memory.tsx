import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Brain, Trash2, Save, Search, Zap, Clock, User } from 'lucide-react';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { collection, onSnapshot, query, where, orderBy, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';

interface MemoryItem {
  id: string;
  content: string;
  timestamp: any;
  uid: string;
}

export const Memory: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'memories'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemoryItem[];
      setMemories(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'memories');
    });

    return () => unsubscribe();
  }, []);

  const clearMemory = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(collection(db, 'memories'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'memories');
    }
  };

  const filteredMemories = memories.filter(m => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-black text-matrix-green font-mono p-8 overflow-hidden">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-matrix-border pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-matrix-green/10 rounded-xl border border-matrix-green/30">
              <Brain className="text-matrix-green w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-[0.2em] text-white uppercase">Neural Memory</h2>
              <p className="text-[10px] text-matrix-green/40 uppercase tracking-widest">Stored facts and user preferences</p>
            </div>
          </div>
          <button 
            onClick={clearMemory}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all text-xs uppercase tracking-widest font-bold"
          >
            <Trash2 size={14} />
            Purge All
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-matrix-green/40" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search neural patterns..."
            className="w-full bg-matrix-surface border border-matrix-border rounded-xl py-4 pl-12 pr-4 text-matrix-green placeholder:text-matrix-green/20 outline-none focus:border-matrix-green transition-all"
          />
        </div>

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-4">
          <AnimatePresence mode="popLayout">
            {filteredMemories.length > 0 ? (
              filteredMemories.map((memory, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 bg-matrix-surface border border-matrix-border rounded-2xl hover:border-matrix-green/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-matrix-green/20 group-hover:bg-matrix-green transition-colors" />
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-matrix-green/5 rounded-lg border border-matrix-green/10">
                      <Zap size={14} className="text-matrix-green/40 group-hover:text-matrix-green transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold text-matrix-green/40 uppercase tracking-widest">Pattern #{idx + 1}</span>
                        <div className="h-[1px] flex-1 bg-matrix-border" />
                        <Clock size={10} className="text-matrix-green/20" />
                        <span className="text-[9px] text-matrix-green/20 uppercase">Synced</span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{memory.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <Database size={64} className="mb-4" />
                <p className="text-sm uppercase tracking-widest">No neural patterns detected</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 pt-6 border-t border-matrix-border flex items-center justify-between text-[10px] font-mono text-matrix-green/40 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-matrix-green animate-pulse" />
              <span>Storage: {memories.length} Clusters</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={12} />
              <span>Owner: Shafqat Jani</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={12} />
            <span>Encrypted Link Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Shield: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
