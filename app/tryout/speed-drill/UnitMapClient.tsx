'use client';

import { useState } from 'react';
import { Heart, Zap, Lock, Star, Trophy, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Definisi Tipe Data yang diterima dari Server
type UnitMapProps = {
  units: {
    id: number;
    title: string;
    description: string;
    status: 'LOCKED' | 'ACTIVE' | 'COMPLETED'; // Pastikan tipe string cocok
    stars: number;
  }[];
  userStats: {
    xp: number;
  }
};

export default function UnitMapClient({ units, userStats }: UnitMapProps) {
  // Nyawa sementara dikelola di client state (reset setiap refresh page untuk MVP)
  // Nanti bisa dikaitkan ke DB jika schema sudah update
  const [hearts] = useState(5); 
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans selection:bg-orange-500/30">
      
      {/* --- HUD HEADER --- */}
      <div className="fixed top-0 w-full z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-gray-800 p-4 shadow-lg">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition flex items-center gap-2 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-xs tracking-wider font-bold">MARKAS</span>
          </Link>

          <div className="flex gap-6">
            <div className="flex items-center gap-1.5 text-red-500 font-bold bg-red-950/30 px-3 py-1 rounded-full border border-red-900/50">
              <Heart className="w-4 h-4 fill-current animate-pulse" />
              <span className="font-mono">{hearts}</span>
            </div>
            <div className="flex items-center gap-1.5 text-yellow-500 font-bold bg-yellow-950/30 px-3 py-1 rounded-full border border-yellow-900/50">
              <Zap className="w-4 h-4 fill-current" />
              <span className="font-mono">{userStats.xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- THE MAP --- */}
      <div className="max-w-md mx-auto pt-32 px-6 flex flex-col items-center gap-12 relative min-h-screen">
        <div className="absolute top-32 bottom-20 w-1 bg-gradient-to-b from-gray-800 via-gray-800 to-transparent -z-10" />

        {units.map((unit, index) => {
          const isLeft = index % 2 === 0;
          const offsetClass = isLeft ? '-translate-x-10' : 'translate-x-10';

          return (
            <div key={unit.id} className={`relative flex flex-col items-center ${offsetClass} group`}>
              
              {/* BUTTON UNIT */}
              <button
                disabled={unit.status === 'LOCKED'}
                onClick={() => {
                   if (unit.status !== 'LOCKED') {
                     // Navigasi ke halaman gameplay
                     router.push(`/tryout/speed-drill/${unit.id}`);
                   }
                }}
                className={`
                  relative w-20 h-20 rounded-full flex items-center justify-center border-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 transform
                  ${unit.status === 'COMPLETED' ? 'bg-[#EAB308] border-[#CA8A04] text-black shadow-yellow-900/20 hover:scale-110' : ''}
                  ${unit.status === 'ACTIVE' ? 'bg-orange-600 border-orange-700 text-white animate-bounce-slow ring-4 ring-orange-500/20 scale-110 shadow-orange-900/40 z-10' : ''}
                  ${unit.status === 'LOCKED' ? 'bg-[#1A1A1A] border-[#262626] text-gray-600 cursor-not-allowed grayscale' : ''}
                `}
              >
                {unit.status === 'COMPLETED' && <Trophy className="w-8 h-8 drop-shadow-md" />}
                {unit.status === 'ACTIVE' && <Star className="w-8 h-8 fill-current drop-shadow-md" />}
                {unit.status === 'LOCKED' && <Lock className="w-7 h-7 opacity-50" />}
              </button>

              {/* BINTANG PROGRESS */}
              {unit.status !== 'LOCKED' && (
                <div className="absolute -bottom-6 flex gap-1 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {[1, 2, 3].map((star) => (
                    <Star key={star} className={`w-3 h-3 ${star <= unit.stars ? 'text-yellow-500 fill-current' : 'text-gray-700'}`} />
                  ))}
                </div>
              )}

              {/* LABEL INFO */}
              <div className={`
                absolute top-2 ${isLeft ? 'left-24' : 'right-24'} 
                w-40 p-3 bg-[#111] border border-gray-800 rounded-lg shadow-xl text-left transition-opacity duration-300
                ${unit.status === 'ACTIVE' ? 'opacity-100 translate-y-0 border-orange-900/50' : 'opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}
                z-20 pointer-events-none
              `}>
                <div className={`absolute top-6 w-3 h-3 bg-[#111] border-t border-l border-gray-800 transform rotate-45 ${isLeft ? '-left-1.5' : '-right-1.5'}`}></div>
                <h3 className={`font-bold text-xs uppercase tracking-wider mb-1 ${unit.status === 'ACTIVE' ? 'text-orange-500' : 'text-gray-300'}`}>{unit.title}</h3>
                <p className="text-[10px] text-gray-500 leading-tight">{unit.description}</p>
                
                {unit.status === 'ACTIVE' && (
                   <div className="mt-2 text-[10px] font-bold text-white bg-orange-600/20 py-1 px-2 rounded border border-orange-600/30 flex items-center justify-between">
                     MULAI <ChevronRight className="w-3 h-3" />
                   </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Padding Bawah */}
        <div className="h-20" />
      </div>
    </div>
  );
}