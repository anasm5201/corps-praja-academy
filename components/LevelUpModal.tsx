"use client";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { ShieldCheck, ChevronUp, Crown } from "lucide-react";

export function LevelUpModal({ newLevel, rank }: { newLevel: number, rank: string }) {
  // Amankan ukuran layar agar tidak error saat build/SSR
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set ukuran layar hanya saat sudah di browser
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      {/* Efek Confetti hanya muncul jika lebar layar sudah terdeteksi */}
      {windowSize.width > 0 && (
        <Confetti 
          width={windowSize.width} 
          height={windowSize.height} 
          recycle={false} 
          numberOfPieces={200}
        />
      )}
      
      {/* Konten Modal Level Up Anda... */}
      <div className="relative bg-zinc-900 border border-yellow-500/50 p-10 rounded-3xl text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
         {/* ... isi konten ... */}
      </div>
    </div>
  );
}