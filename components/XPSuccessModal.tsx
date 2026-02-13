"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  xp: number;
  onClose: () => void;
}

export default function XPSuccessModal({ xp, onClose }: Props) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animasi masuk setelah render
    setTimeout(() => setShow(true), 50);
    
    // Auto refresh data dashboard di background
    router.refresh();
  }, [router]);

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-500">
      <div 
        className={`transform transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          show ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-20"
        }`}
      >
        
        {/* KARTU HADIAH */}
        <div className="bg-gradient-to-b from-gray-900 to-black border border-yellow-500/30 p-10 rounded-3xl text-center shadow-[0_0_100px_rgba(234,179,8,0.2)] relative overflow-hidden max-w-sm w-full mx-auto">
          
          {/* Efek Kilau Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent animate-pulse"></div>

          {/* Ikon Bergerak */}
          <div className="text-7xl mb-6 animate-bounce drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
            🎖️
          </div>
          
          <h2 className="text-xl font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
            MISSION ACCOMPLISHED
          </h2>
          
          <div className="py-4 my-4 border-t border-b border-white/10">
            <p className="text-xs font-mono text-yellow-500 mb-1">REWARD OBTAINED</p>
            <p className="text-7xl font-black text-white tracking-tighter drop-shadow-xl">
              +{xp} <span className="text-2xl text-gray-500">XP</span>
            </p>
          </div>

          <p className="text-gray-500 text-xs mb-8 leading-relaxed">
            Laporan integritas telah diverifikasi oleh Markas Besar.
            <br/>Status kedisiplinan Anda meningkat.
          </p>

          <button 
            onClick={onClose}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl uppercase tracking-widest shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
          >
            TERIMA & LANJUTKAN ➔
          </button>

        </div>
      </div>
    </div>
  );
}