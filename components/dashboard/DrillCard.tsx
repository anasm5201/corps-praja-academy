"use client";
import { Zap, Clock, CheckCircle, Dumbbell, BookOpen, BrainCircuit } from "lucide-react";

export default function DrillCard({ drill, index }: { drill: any, index: number, blueprintId: string }) {
  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-sm overflow-hidden group hover:border-blue-500/50 transition-all flex flex-col h-full relative">
      {/* HEADER KARTU */}
      <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
        <h5 className="text-sm font-black text-white uppercase tracking-wider">{drill.title || "HARI OPERASI"}</h5>
        <span className="text-[9px] font-black bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">H-{index + 1}</span>
      </div>

      <div className="p-5 flex-1 space-y-6">
        {/* MATRA 1: JASMANI (LAT) */}
        <div className="relative pl-6 border-l border-amber-500/20">
          <div className="absolute -left-3 top-0 h-6 w-6 bg-amber-950 border border-amber-600 rounded-sm flex items-center justify-center text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Dumbbell size={12} />
          </div>
          <h6 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">MATRA JASMANI (LAT - PAGI)</h6>
          <p className="text-xs text-neutral-300 leading-relaxed">{drill.tahap1}</p>
        </div>

        {/* MATRA 2: AKADEMIK (JAR) */}
        <div className="relative pl-6 border-l border-blue-500/20">
          <div className="absolute -left-3 top-0 h-6 w-6 bg-blue-950 border border-blue-600 rounded-sm flex items-center justify-center text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <BookOpen size={12} />
          </div>
          <h6 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">MATRA AKADEMIK (JAR - SIANG)</h6>
          <p className="text-xs text-neutral-300 leading-relaxed font-medium">{drill.tahap2}</p>
        </div>

        {/* MATRA 3: PENGASUHAN (SUH) */}
        <div className="relative pl-6 border-l border-purple-500/20">
          <div className="absolute -left-3 top-0 h-6 w-6 bg-purple-950 border border-purple-600 rounded-sm flex items-center justify-center text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <BrainCircuit size={12} />
          </div>
          <h6 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">MATRA PENGASUHAN (SUH - MALAM)</h6>
          <p className="text-xs text-neutral-300 leading-relaxed">{drill.tahap3}</p>
        </div>
      </div>

      {/* FOOTER: ESTIMASI & AKSI */}
      <div className="p-4 bg-neutral-950/50 border-t border-neutral-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-mono uppercase">
           <Clock size={12} /> {drill.duration || "180 MIN TOTAL"}
        </div>
        <button className="flex-1 py-2 bg-neutral-900 border border-neutral-800 rounded-sm text-[10px] font-black text-neutral-500 hover:text-green-400 hover:border-green-500/50 transition-all flex items-center justify-center gap-2 group/btn">
          <CheckCircle size={14} className="group-hover/btn:scale-110 transition-transform" /> TANDAI SELESAI
        </button>
      </div>
    </div>
  );
}