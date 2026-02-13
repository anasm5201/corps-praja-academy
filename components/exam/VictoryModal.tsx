"use client";

import { Trophy, Star, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface VictoryModalProps {
  score: number;
  xp: number;
  isLevelUp: boolean;
  newLevel: number;
  onReview: () => void;
}

export default function VictoryModal({ score, xp, isLevelUp, newLevel, onReview }: VictoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)]">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient"></div>
        {isLevelUp && (
             <div className="absolute inset-0 bg-yellow-500/10 animate-pulse z-0 pointer-events-none"></div>
        )}

        {/* ICON UTAMA */}
        <div className="relative z-10 mb-6 flex justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${isLevelUp ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-blue-500/20 border-blue-500 text-blue-500'}`}>
                {isLevelUp ? <Trophy size={48} className="animate-bounce" /> : <ShieldCheck size={48} />}
            </div>
        </div>

        {/* HEADLINE */}
        <h2 className="relative z-10 text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
            {isLevelUp ? "LEVEL UP!" : "MISSION COMPLETE"}
        </h2>
        
        {/* SKOR & XP */}
        <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase font-bold">NILAI AKHIR</p>
                <p className={`text-2xl font-black ${score >= 75 ? 'text-green-500' : 'text-red-500'}`}>{score}</p>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-400 uppercase font-bold">XP GAINED</p>
                <p className="text-2xl font-black text-yellow-500 flex items-center justify-center gap-1">
                    +{xp} <Zap size={14} fill="currentColor"/>
                </p>
            </div>
        </div>

        {isLevelUp && (
            <div className="relative z-10 bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 border border-yellow-500/50 p-3 rounded-lg mb-6">
                <p className="text-yellow-500 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <Star size={14} fill="currentColor"/> NEW LEVEL REACHED: {newLevel}
                </p>
            </div>
        )}

        {/* TOMBOL ACTION */}
        <button 
            onClick={onReview}
            className="relative z-10 w-full bg-white hover:bg-gray-200 text-black py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
            REVIEW BATTLE <ArrowRight size={18}/>
        </button>

      </div>
    </div>
  );
}