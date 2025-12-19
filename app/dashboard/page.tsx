"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  // STATE UNTUK MENAMPUNG DATA DINAMIS
  const [stats, setStats] = useState({
    score: 0,
    xp: 0,
    missionStatus: "BELUM SELESAI",
    chance: 0
  });

  // MEMBACA MEMORI (LOCAL STORAGE) SAAT HALAMAN DIBUKA
  useEffect(() => {
    // Cek apakah kode dijalankan di browser
    if (typeof window !== 'undefined') {
      const savedScore = parseInt(localStorage.getItem('lastScore') || '0');
      const savedXP = parseInt(localStorage.getItem('cadetXP') || '0');
      const missionDone = localStorage.getItem('missionAlpha') === 'DONE';

      // Hitung Peluang Lulus (Rumus Sederhana: Skor / 15 * 100)
      const chanceCalc = Math.min(Math.round((savedScore / 15) * 100), 100);

      setStats({
        score: savedScore,
        xp: savedXP,
        missionStatus: missionDone ? "1/50" : "0/50",
        chance: chanceCalc
      });
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* HEADER DINAMIS */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-sans text-white tracking-wider">COMMAND CENTER</h1>
          <p className="text-gray-400 font-mono text-sm mt-1">
            Status Operasi: {stats.xp > 0 ? "ACTIVE DUTY" : "STANDBY"}
          </p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-3xl font-bold text-white font-mono">
             XP: {stats.xp.toLocaleString()}
           </div>
        </div>
      </div>

      {/* STATS ROW (DATA REAL-TIME) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-laser transition-colors">
            <div className="text-xs font-bold text-gray-500 mb-1 font-mono">TERAKHIR SKOR</div>
            <div className="text-3xl font-bold text-white font-sans">{stats.score}</div>
         </div>
         <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-laser transition-colors">
            <div className="text-xs font-bold text-gray-500 mb-1 font-mono">RANKING NASIONAL</div>
            <div className="text-3xl font-bold text-white font-sans">#{stats.xp > 100 ? '842' : '1,204'}</div>
         </div>
         <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-laser transition-colors">
            <div className="text-xs font-bold text-gray-500 mb-1 font-mono">MISI SELESAI</div>
            <div className="text-3xl font-bold text-white font-sans">{stats.missionStatus}</div>
         </div>
         <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-laser transition-colors">
            <div className="text-xs font-bold text-gray-500 mb-1 font-mono">PELUANG LULUS</div>
            <div className={`text-3xl font-bold font-sans ${stats.chance > 70 ? 'text-green-500' : 'text-yellow-500'}`}>
              {stats.chance}%
            </div>
         </div>
      </div>

      {/* MAIN MISSION AREA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Next Mission */}
        <div className="md:col-span-2 bg-gradient-to-br from-white/5 to-black border border-white/10 rounded-2xl p-8 relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-64 h-64 bg-laser/20 blur-[100px] rounded-full group-hover:bg-laser/30 transition-all"></div>
           <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-6 font-sans">MISI PRIORITAS</h2>
              
              <div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-4 flex justify-between items-center">
                 <div>
                    <div className="text-xs text-gray-400 font-mono mb-1">DAILY QUEST</div>
                    <div className="text-white font-bold">Simulasi TIU: Logika Aritmatika</div>
                 </div>
                 <Link href="/dashboard/mission">
                    <button className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:scale-105 transition-transform">MULAI</button>
                 </Link>
              </div>

              <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex justify-between items-center opacity-50">
                 <div>
                    <div className="text-xs text-gray-500 font-mono mb-1">WEEKLY QUEST</div>
                    <div className="text-gray-400 font-bold">Try Out Akbar SKD Batch 2</div>
                 </div>
                 <button className="border border-white/20 text-gray-500 px-4 py-2 rounded text-xs font-bold cursor-not-allowed">LOCKED</button>
              </div>
           </div>
        </div>

        {/* Right: Progress Circle (DINAMIS) */}
        <div className="bg-black border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative">
           <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center relative">
              {/* Lingkaran Progress sesuai Chance */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" 
                  className={stats.chance > 70 ? "text-green-500" : "text-laser"}
                  strokeDasharray="377" 
                  strokeDashoffset={377 - (377 * stats.chance) / 100} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-2xl font-bold text-white relative z-10">{stats.chance}%</div>
           </div>
           <h3 className="text-white font-bold mt-6">PELUANG LULUS</h3>
           <p className="text-gray-500 text-xs mt-2 max-w-[200px]">
             {stats.chance > 80 ? "Siap Tempur! Pertahankan performa." : "Tingkatkan skor Anda untuk menembus zona aman."}
           </p>
        </div>

      </div>
    </div>
  );
}