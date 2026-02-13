'use client';

import { useState, useEffect } from 'react';
import { Heart, ShieldCheck, ChevronLeft, Globe } from 'lucide-react';
import Link from 'next/link';

export default function AmnestyLogPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/user/amnesty-log').then(res => res.json()).then(setLogs);
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <Link href="/tryout" className="flex items-center gap-2 text-orange-500 mb-8 hover:text-white transition uppercase text-[10px] font-bold">
          <ChevronLeft className="w-4 h-4" /> kembali_ke_pusat_informasi
        </Link>

        {/* HEADER SISTEM ASIH [cite: 2026-01-05 083827] */}
        <div className="border-l-4 border-orange-600 pl-6 mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-orange-500 animate-pulse" />
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Log Amnesti Praja</h1>
          </div>
          <p className="text-[10px] text-orange-500 tracking-[0.4em] font-bold uppercase italic">Sistem "Asih" - Manifestasi Kebijaksanaan Komandan</p>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-[#0A0A0A] border border-orange-900/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-orange-600/50 transition-all">
              <div className="flex gap-4 items-start">
                <div className="bg-orange-950/20 p-3 border border-orange-900/50 rounded shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                  <ShieldCheck className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase text-sm">{log.user.name}</h3>
                  <p className="text-[10px] text-orange-500 font-bold tracking-widest">{log.user.rank}</p> {/* Pangkat IPDN [cite: 2026-01-05] */}
                </div>
              </div>

              <div className="flex-1 bg-black/50 p-4 border-l-2 border-orange-600 font-mono italic">
                <p className="text-[11px] text-gray-400">"{log.reason.split(']')[1]?.trim() || 'Amnesti diberikan berdasarkan pertimbangan strategis.'}"</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">{new Date(log.issuedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <div className="mt-1 flex items-center justify-end gap-1 text-[8px] text-orange-500 font-black tracking-widest uppercase">
                  <Globe className="w-3 h-3" /> Status: Restored
                </div>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-gray-900">
            <p className="text-gray-700 uppercase tracking-[0.5em] text-xs">Belum ada catatan amnesti yang diterbitkan.</p>
          </div>
        )}
      </div>
    </div>
  );
}