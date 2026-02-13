'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, ShieldAlert, Terminal } from 'lucide-react';

export default function AdminVerifySUH() {
  const [pendingLogs, setPendingLogs] = useState<any[]>([]);

  useEffect(() => {
    // Ambil log yang statusnya PENDING
    fetch('/api/admin/pending-logs').then(res => res.json()).then(setPendingLogs);
  }, []);

  const handleAction = async (id: string, action: 'VERIFIED' | 'REJECTED') => {
    await fetch(`/api/admin/verify-log`, {
      method: 'POST',
      body: JSON.stringify({ id, action })
    });
    setPendingLogs(prev => prev.filter(log => log.id !== id));
  };

  return (
    <div className="p-8 bg-black min-h-screen font-mono">
      <div className="flex items-center gap-4 mb-10 border-b border-red-900 pb-4">
        <ShieldAlert className="w-8 h-8 text-red-600" />
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">SUH_VERIFICATION_CENTER</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingLogs.map((log) => (
          <div key={log.id} className="bg-[#0A0A0A] border border-gray-800 p-5 group hover:border-red-600 transition">
            <div className="aspect-video mb-4 overflow-hidden border border-gray-900 relative">
              <img src={log.evidenceUrl} alt="Bukti" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 text-[8px] text-red-500 border border-red-900">PENDING_AUDIT</div>
            </div>
            
            <div className="mb-6">
              <p className="text-xs font-bold text-white uppercase">{log.user.name}</p>
              <p className="text-[10px] text-gray-500 uppercase">{new Date(log.date).toLocaleString()}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleAction(log.id, 'VERIFIED')} className="flex-1 py-2 bg-green-900/20 border border-green-900 text-green-500 text-[10px] font-black hover:bg-green-600 hover:text-white transition uppercase">Confirm</button>
              <button onClick={() => handleAction(log.id, 'REJECTED')} className="flex-1 py-2 bg-red-900/20 border border-red-900 text-red-500 text-[10px] font-black hover:bg-red-600 hover:text-white transition uppercase">Reject</button>
            </div>
          </div>
        ))}
      </div>
      
      {pendingLogs.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-900">
          <Terminal className="w-10 h-10 mx-auto text-gray-800 mb-4" />
          <p className="text-gray-600 text-xs uppercase tracking-widest">No Pending Evidence in Queue</p>
        </div>
      )}
    </div>
  );
}