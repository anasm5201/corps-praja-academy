"use client";

import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle, PlayCircle, CheckCircle2 } from 'lucide-react';

// Definisi Tipe Data (Sesuai dengan yang diminta page.tsx)
interface EngineProps {
  packageId: string;
  config: {
    mode: string;
    durationPerTable: number;
    totalTables: number;
    symbols: string[];
    distractors: string[];
  };
}

export default function KecermatanEngine({ packageId, config }: EngineProps) {
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'FINISHED'>('IDLE');
  const [timeLeft, setTimeLeft] = useState(config.durationPerTable || 60);
  const [currentTable, setCurrentTable] = useState(1);

  // Simulasi Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'RUNNING' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Pindah kolom atau selesai
      if (currentTable < (config.totalTables || 10)) {
        setCurrentTable(prev => prev + 1);
        setTimeLeft(config.durationPerTable);
      } else {
        setStatus('FINISHED');
      }
    }
    return () => clearInterval(interval);
  }, [status, timeLeft, currentTable, config]);

  // TAMPILAN 1: BELUM MULAI (LOBBY)
  if (status === 'IDLE') {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <PlayCircle size={40} />
        </div>
        <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">SIAP MELAKSANAKAN TES?</h2>
            <p className="text-zinc-500 text-sm mt-2">Mode: {config.mode} | Durasi: {config.durationPerTable}s / Kolom</p>
        </div>
        <button 
            onClick={() => setStatus('RUNNING')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all w-full md:w-auto"
        >
            MULAI TES SEKARANG
        </button>
      </div>
    );
  }

  // TAMPILAN 2: SELESAI
  if (status === 'FINISHED') {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-green-900/10 border border-green-500/30 rounded-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">TES SELESAI</h2>
        <p className="text-zinc-400">Data hasil tes telah direkam ke server pusat.</p>
        <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-zinc-700 hover:bg-zinc-800 text-white rounded-lg text-sm transition-all"
        >
            KEMBALI KE MENU
        </button>
      </div>
    );
  }

  // TAMPILAN 3: SEDANG BERJALAN (SIMULASI SOAL)
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* HUD ATAS */}
      <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-2 text-yellow-500 font-mono font-bold">
            <Timer size={18} />
            <span className="text-xl">{timeLeft}s</span>
        </div>
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            KOLOM {currentTable} / {config.totalTables}
        </div>
        <div className="px-3 py-1 bg-red-900/20 text-red-500 text-xs font-bold rounded border border-red-900/30 flex items-center gap-2">
            <AlertTriangle size={12} /> FOKUS
        </div>
      </div>

      {/* AREA SOAL (DUMMY GRID) */}
      <div className="grid grid-cols-5 gap-2 md:gap-4 p-6 bg-white rounded-xl text-black font-mono text-2xl font-black text-center min-h-[300px] items-center justify-center bg-grid-pattern">
          {/* Ini simulasi baris soal huruf hilang/angka hilang */}
          {config.symbols.map((char, i) => (
              <div key={i} className="p-4 border-2 border-black rounded hover:bg-zinc-100 cursor-pointer transition-colors">
                  {char}
              </div>
          ))}
          <div className="col-span-5 text-sm text-zinc-400 font-sans font-normal mt-4">
              (Area Simulasi Soal Kecermatan)
          </div>
      </div>

      {/* INPUT BUTTONS */}
      <div className="grid grid-cols-5 gap-2">
          {['A', 'B', 'C', 'D', 'E'].map((btn) => (
              <button key={btn} className="py-4 bg-zinc-800 hover:bg-blue-600 border border-zinc-700 rounded-xl text-white font-bold text-xl transition-all active:scale-95">
                  {btn}
              </button>
          ))}
      </div>

    </div>
  );
}