"use client";

import Link from "next/link";

interface Props {
  id: string;
  title: string;
  desc: string;
  difficulty: string;
  duration: number;
  xp: number;
  questionCount: number;
}

export default function MissionCard({ id, title, desc, difficulty, duration, xp, questionCount }: Props) {
  
  // Kode Warna Berdasarkan Kesulitan
  let color = "border-gray-500 text-gray-400"; // Default
  let bgGlow = "hover:shadow-gray-500/20";
  
  if (difficulty === "EASY") { color = "border-green-500 text-green-500"; bgGlow = "hover:shadow-green-500/40"; }
  if (difficulty === "NORMAL") { color = "border-yellow-500 text-yellow-500"; bgGlow = "hover:shadow-yellow-500/40"; }
  if (difficulty === "HARD" || difficulty === "INSANE") { color = "border-red-600 text-red-600"; bgGlow = "hover:shadow-red-600/40"; }

  return (
    <div className={`relative group bg-black/40 border-l-4 ${color} p-6 rounded-r-xl border-y border-r border-white/10 hover:bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${bgGlow}`}>
      
      {/* Label Kesulitan (Stempel) */}
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-black px-2 py-1 rounded bg-black border ${color} uppercase tracking-widest`}>
          {difficulty} MODE
        </span>
        <div className="text-right">
           <span className="text-xs font-bold text-yellow-500">🏆 +{xp} XP</span>
        </div>
      </div>

      {/* Judul & Deskripsi */}
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2">
        {desc}
      </p>

      {/* Info Teknis Grid */}
      <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-400 font-mono border-t border-white/10 pt-4 mb-6">
        <div className="flex items-center gap-2">
           <span>⏳</span>
           <span>{duration} MENIT</span>
        </div>
        <div className="flex items-center gap-2">
           <span>📝</span>
           <span>{questionCount} SOAL</span>
        </div>
        <div className="flex items-center gap-2">
           <span>🤖</span>
           <span>CAT SYSTEM</span>
        </div>
        <div className="flex items-center gap-2">
           <span>🔥</span>
           <span>HOTS ACTIVE</span>
        </div>
      </div>

      {/* Tombol Start */}
      <Link 
        href={`/dashboard/mission/${id}`}
        className={`block w-full text-center py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
          difficulty === 'INSANE' ? 'bg-red-900/50 text-red-500 hover:bg-red-600 hover:text-white' : 'bg-white/10 text-white hover:bg-blue-600'
        }`}
      >
        TERIMA MISI ➔
      </Link>

    </div>
  );
}