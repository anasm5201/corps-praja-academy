"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  score: number;
  xp: number;
  passed: boolean;
  onReview: () => void; // Fungsi pindah ke halaman pembahasan
}

export default function ExamResultModal({ score, xp, passed, onReview }: Props) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 50);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-500">
      <div 
        className={`transform transition-all duration-700 ${
          show ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-20"
        }`}
      >
        <div className={`border-2 p-10 rounded-3xl text-center shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden max-w-md w-full mx-auto bg-black ${passed ? "border-green-500/50 shadow-green-500/20" : "border-red-500/50 shadow-red-500/20"}`}>
          
          {/* Status Lulus/Gagal */}
          <div className="mb-6">
            <h2 className={`text-4xl font-black uppercase italic tracking-tighter mb-2 ${passed ? "text-green-500" : "text-red-600"}`}>
              {passed ? "MISSION SUCCESS" : "MISSION FAILED"}
            </h2>
            <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">
              {passed ? "EXCELLENT PERFORMANCE" : "NEED MORE TRAINING"}
            </p>
          </div>
          
          {/* Skor Besar */}
          <div className="py-6 border-y border-white/10 mb-6">
            <p className="text-xs font-mono text-gray-500 mb-2">TOTAL SCORE</p>
            <p className="text-8xl font-black text-white tracking-tighter">
              {score}
            </p>
            <div className="mt-4 inline-block bg-white/10 px-4 py-1 rounded-full border border-white/10">
               <span className="text-yellow-400 font-bold text-sm">+{xp} XP EARNED</span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="space-y-3">
            <button 
              onClick={onReview}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg transition-all transform hover:scale-[1.02]"
            >
              📂 ANALISIS JAWABAN
            </button>
            
            <button 
              onClick={() => router.push("/dashboard")}
              className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-gray-400 font-bold py-3 rounded-xl uppercase tracking-widest text-xs transition-all"
            >
              KEMBALI KE MARKAS
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}