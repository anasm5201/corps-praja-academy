"use client";

import { useState } from "react";
// Kita pastikan namanya 'toggleDailyLog'
import { toggleDailyLog } from "@/lib/actions";

interface CheckItemProps {
  title: string;
  desc: string;
  field: string;
  initialChecked: boolean;
}

export default function CheckItem({ title, desc, field, initialChecked }: CheckItemProps) {
  const [isChecked, setIsChecked] = useState(initialChecked);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    // 1. Ubah UI SECARA INSTAN (Optimistic Update)
    const newState = !isChecked;
    setIsChecked(newState);
    setIsLoading(true);

    // 2. Kirim ke Server di background
    try {
      await toggleDailyLog(field); // <-- Sekarang sinkron dengan import di atas
    } catch (error) {
      // Jika gagal, kembalikan UI ke awal
      setIsChecked(!newState); 
      alert("Gagal menyimpan data. Cek koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 group relative overflow-hidden ${
        isChecked 
          ? "bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
          : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
      }`}
    >
      {/* Efek Kilat saat aktif */}
      {isChecked && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />}

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-colors z-10 ${
        isChecked 
          ? "bg-white border-white text-blue-600 shadow-inner" 
          : "bg-black/50 border-gray-600 group-hover:border-white text-transparent"
      }`}>
        <span className="font-black text-lg">✓</span>
      </div>
      
      <div className="z-10">
        <h4 className={`font-bold text-base ${isChecked ? "text-white" : "text-gray-200"}`}>
          {title}
        </h4>
        <p className={`text-xs ${isChecked ? "text-blue-100" : "text-gray-500"}`}>
          {desc}
        </p>
      </div>
    </button>
  );
}