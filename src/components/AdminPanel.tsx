import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User, Check, X, AlertCircle, Cpu, Zap, Plus, Key, Mail, Search, Trash2, Users } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc, deleteDoc, Timestamp, addDoc } from 'firebase/firestore';

interface AccessRequest {
  id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: any;
  accessId?: string;
}

export const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'accessRequests'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AccessRequest[];
      setRequests(reqs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'accessRequests');
    });

    return () => unsubscribe();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const accessId = status === 'approved' ? Math.random().toString(36).substring(2, 10).toUpperCase() : null;
      await updateDoc(doc(db, 'accessRequests', id), { 
        status,
        ...(accessId && { accessId })
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `accessRequests/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteDoc(doc(db, 'accessRequests', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `accessRequests/${id}`);
    }
  };

  const registerMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;

    try {
      const accessId = Math.random().toString(36).substring(2, 10).toUpperCase();
      await addDoc(collection(db, 'accessRequests'), {
        email: newMemberEmail,
        status: 'approved',
        timestamp: Timestamp.now(),
        accessId
      });
      setNewMemberEmail('');
      alert(`Member registered successfully! Access ID: ${accessId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'accessRequests');
    }
  };

  const generateNewId = () => {
    const id = Math.random().toString(36).substring(2, 12).toUpperCase();
    setGeneratedId(id);
  };

  const filteredRequests = requests.filter(r => 
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.accessId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-black text-matrix-green font-mono p-4 lg:p-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-matrix-green/10 p-3 rounded border border-matrix-green/30 shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <Shield className="text-matrix-green w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-[0.2em] text-white uppercase">Admin Control Panel</h1>
            <p className="text-[10px] text-matrix-green/60 uppercase tracking-widest">Neural Access Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-matrix-green/5 border border-matrix-green/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-matrix-green animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Core Online</span>
          </div>
          <button 
            onClick={() => setIsRefreshing(true)}
            className={`p-2 rounded border border-matrix-green/30 hover:bg-matrix-green/10 transition-all ${isRefreshing ? 'animate-spin text-white' : ''}`}
          >
            <Zap size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-matrix-surface border border-matrix-border p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={40} />
          </div>
          <div className="text-[10px] text-matrix-green/40 uppercase tracking-widest mb-2">Total Users</div>
          <div className="text-4xl font-black text-white">{requests.length}</div>
        </div>
        <div className="bg-matrix-surface border border-matrix-border p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle size={40} />
          </div>
          <div className="text-[10px] text-matrix-green/40 uppercase tracking-widest mb-2">Pending Sync</div>
          <div className="text-4xl font-black text-yellow-500">{requests.filter(r => r.status === 'pending').length}</div>
        </div>
        <div className="bg-matrix-surface border border-matrix-border p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Check size={40} />
          </div>
          <div className="text-[10px] text-matrix-green/40 uppercase tracking-widest mb-2">Authorized</div>
          <div className="text-4xl font-black text-matrix-green">{requests.filter(r => r.status === 'approved').length}</div>
        </div>
        <div className="bg-matrix-surface border border-matrix-border p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <X size={40} />
          </div>
          <div className="text-[10px] text-matrix-green/40 uppercase tracking-widest mb-2">Blacklisted</div>
          <div className="text-4xl font-black text-red-500">{requests.filter(r => r.status === 'rejected').length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Registration Form */}
        <div className="bg-matrix-surface border border-matrix-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="text-matrix-green" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Manual Registration</h2>
          </div>
          <form onSubmit={registerMember} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-matrix-green/40" size={16} />
              <input 
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Enter member email..."
                className="w-full bg-black border border-matrix-border rounded-lg py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-matrix-green transition-colors"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-matrix-green text-black font-black uppercase tracking-[0.2em] rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,65,0.3)]"
            >
              Authorize Member
            </button>
          </form>
        </div>

        {/* ID Generator */}
        <div className="bg-matrix-surface border border-matrix-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="text-matrix-green" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Access ID Generator</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-black border border-matrix-border rounded-lg py-3 px-4 text-center font-mono text-lg font-bold text-matrix-green tracking-widest">
                {generatedId || '--------'}
              </div>
              <button 
                onClick={generateNewId}
                className="p-3 bg-matrix-green/10 border border-matrix-green/30 rounded-lg text-matrix-green hover:bg-matrix-green hover:text-black transition-all"
              >
                <Zap size={20} />
              </button>
            </div>
            <p className="text-[10px] text-matrix-green/40 uppercase tracking-widest text-center">
              Generate unique neural keys for manual distribution
            </p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-matrix-surface border border-matrix-border rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-matrix-border bg-black/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest">Neural Access Logs</span>
            <div className="flex items-center gap-2 text-[10px] text-matrix-green/40">
              <AlertCircle size={12} />
              Real-time Sync Active
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-matrix-green/40" size={14} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="bg-black border border-matrix-border rounded-lg py-2 pl-9 pr-4 text-[10px] text-white outline-none focus:border-matrix-green transition-colors w-full sm:w-64"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <div className="divide-y divide-matrix-border">
            <AnimatePresence mode="popLayout">
              {filteredRequests.map((req) => (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-matrix-green/5 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      req.status === 'approved' ? 'border-matrix-green/30 bg-matrix-green/5' : 
                      req.status === 'rejected' ? 'border-red-500/30 bg-red-500/5' : 
                      'border-yellow-500/30 bg-yellow-500/5'
                    }`}>
                      <User size={24} className={
                        req.status === 'approved' ? 'text-matrix-green' : 
                        req.status === 'rejected' ? 'text-red-500' : 
                        'text-yellow-500'
                      } />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white mb-1 truncate">{req.email}</div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[9px] text-matrix-green/40 uppercase tracking-widest">
                          {req.timestamp?.toDate ? req.timestamp.toDate().toLocaleString() : new Date(req.timestamp).toLocaleString()}
                        </span>
                        {req.accessId && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-matrix-green/10 border border-matrix-green/20">
                            <Key size={8} className="text-matrix-green" />
                            <span className="text-[9px] font-bold text-matrix-green">{req.accessId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction(req.id, 'approved')}
                          className="flex items-center gap-2 px-4 py-2 rounded bg-matrix-green/10 border border-matrix-green/30 text-matrix-green hover:bg-matrix-green hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest"
                        >
                          <Check size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'rejected')}
                          className="flex items-center gap-2 px-4 py-2 rounded bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </>
                    ) : (
                      <div className={`px-4 py-2 rounded border text-[10px] font-bold uppercase tracking-widest ${
                        req.status === 'approved' ? 'bg-matrix-green/20 border-matrix-green text-matrix-green' : 'bg-red-500/20 border-red-500 text-red-500'
                      }`}>
                        {req.status}
                      </div>
                    )}
                    <button 
                      onClick={() => handleDelete(req.id)}
                      className="p-2 text-matrix-green/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredRequests.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-matrix-green/20 uppercase tracking-[0.5em] text-[10px]">No Neural Records Found</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-6 bg-matrix-green/5 border border-matrix-border rounded-xl flex items-center gap-4">
        <Cpu className="text-matrix-green w-6 h-6 shrink-0" />
        <p className="text-[11px] leading-relaxed text-matrix-green/60">
          <span className="text-matrix-green font-bold uppercase tracking-widest">Neural Directive:</span> Access management is absolute. All authorizations are cryptographically signed and logged to the immutable ledger. Jani's core maintains supreme oversight.
        </p>
      </div>
    </div>
  );
};
