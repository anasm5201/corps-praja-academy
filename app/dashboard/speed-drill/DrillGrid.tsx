"use client";

import { Zap, Play, Lock, Timer, BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DrillPackage {
  id: string;
  title: string;
  description: string | null;
  config: any; // JSON Config
}

export default function DrillGrid({ drills }: { drills: DrillPackage[] }) {
  const router = useRouter();

  const handleStart = (id: string) => {
    // Arahkan ke engine psikologi (Pastikan route ini nanti dihandle)
    router.push(`/dashboard/psychology/start/${id}`); 
    toast.success("Memasuki Area Fokus...");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drills.map((drill, idx) => {
        // Parsing config untuk info durasi (Defensif)
        let duration = 60;
        try {
            const cfg = typeof drill.config === 'string' ? JSON.parse(drill.config) : drill.config;
            duration = cfg.duration || 60;
        } catch (e) {}

        return (
          <div 
            key={drill.id} 
            className="group relative bg-zinc-900/40 border border-white/10 rounded-3xl p-6 overflow-hidden hover:border-yellow-500/50 transition-all hover:-translate-y-1"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-yellow-500/10 transition-all"></div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-zinc-800 rounded-xl text-yellow-500 border border-white/5 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                  <BrainCircuit size={24} />
                </div>
                <div className="px-3 py-1 bg-zinc-950 border border-white/10 rounded-full text-[10px] font-mono text-gray-400 flex items-center gap-2">
                  <Timer size={12} /> {duration} Detik
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 group-hover:text-yellow-400 transition-colors">
                {drill.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2">
                {drill.description || "Latihan refleks saraf dan ketahanan fokus tingkat tinggi."}
              </p>

              {/* Action - Tombol selalu di bawah */}
              <div className="mt-auto">
                <button 
                  onClick={() => handleStart(drill.id)}
                  className="w-full py-3 bg-white hover:bg-yellow-400 hover:text-black text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Play size={14} fill="currentColor"/> MULAI SIMULASI
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}