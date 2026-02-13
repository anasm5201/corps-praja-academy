"use client";

import { Activity } from "lucide-react";

// Komponen Grafik CSS Murni (Ringan & Aman Build)
export default function KecermatanChart({ data }: { data: any[] }) {
  // Normalisasi data untuk mencegah crash jika data kosong/undefined
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="w-full h-64 bg-zinc-900/50 border border-white/5 rounded-xl p-6 flex flex-col relative overflow-hidden">
      
      {/* Header Grafik */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Activity size={14} className="text-blue-500" />
            <span>Grafik Stabilitas</span>
        </div>
      </div>

      {/* Area Chart */}
      <div className="flex-1 flex items-end gap-2 relative">
        {/* Garis Grid Horizontal (Hiasan) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="w-full h-[1px] bg-white/10 border-t border-dashed border-white/20"></div>
            <div className="w-full h-[1px] bg-white/10 border-t border-dashed border-white/20"></div>
            <div className="w-full h-[1px] bg-white/10 border-t border-dashed border-white/20"></div>
        </div>

        {safeData.length > 0 ? (
            safeData.map((point, index) => {
                // Asumsi data: { label: string, score: number } atau sekedar number
                // Kita normalisasi agar aman
                const value = typeof point === 'object' ? (point.score || point.value || 0) : point;
                const label = typeof point === 'object' ? (point.label || index + 1) : index + 1;
                
                // Kalkulasi tinggi batang (Max asumsi 100)
                const heightPercent = Math.min(Math.max(value, 0), 100);
                
                // Warna dinamis berdasarkan performa
                let barColor = "bg-blue-500";
                if (value < 50) barColor = "bg-red-500";
                else if (value < 75) barColor = "bg-yellow-500";

                return (
                    <div key={index} className="flex-1 h-full flex flex-col justify-end group relative">
                        {/* Batang Grafik */}
                        <div 
                            className={`w-full rounded-t-sm transition-all duration-500 opacity-80 group-hover:opacity-100 ${barColor}`}
                            style={{ height: `${heightPercent}%` }}
                        >
                            {/* Efek Kilau */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/30"></div>
                        </div>

                        {/* Tooltip (Hover) */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black border border-white/10 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            <span className="font-bold">Kolom {label}</span>: {value}
                        </div>

                        {/* Label Bawah */}
                        <div className="mt-2 text-center">
                            <span className="text-[9px] text-gray-600 font-mono block group-hover:text-white transition-colors">
                                {label}
                            </span>
                        </div>
                    </div>
                );
            })
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs italic">
                Menunggu Data Grafik...
            </div>
        )}
      </div>
    </div>
  );
}