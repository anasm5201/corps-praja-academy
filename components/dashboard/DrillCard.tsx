'use client';

import { useState } from 'react';
import { CheckCircle, Clock, Check, Loader2 } from 'lucide-react';
import { completeDailyDrill } from '@/app/actions/blueprint';

type DrillCardProps = {
  blueprintId: string;
  drill: any;
  index: number;
};

export default function DrillCard({ blueprintId, drill, index }: DrillCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(drill.isCompleted || false);

  const handleComplete = async () => {
    if (isCompleted) return;
    setIsLoading(true);

    const res = await completeDailyDrill(blueprintId, index);
    
    if (res.success) {
      setIsCompleted(true); // Ubah status secara instan tanpa loading layar
    } else {
      alert(res.message);
    }
    
    setIsLoading(false);
  };

  const catColor = drill.category === 'LAT' 
    ? 'bg-amber-950/40 text-amber-500 border-amber-900/50' 
    : drill.category === 'JAR' 
    ? 'bg-blue-950/40 text-blue-500 border-blue-900/50' 
    : 'bg-purple-950/40 text-purple-500 border-purple-900/50';

  const cardBorder = isCompleted 
    ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
    : 'border-neutral-800 hover:border-blue-900/50';

  return (
     <div className={`bg-neutral-950 border rounded-xl overflow-hidden flex flex-col group transition-all shadow-xl ${cardBorder}`}>
       {/* HEADER HARI */}
       <div className={`p-3 border-b flex justify-between items-center ${isCompleted ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-neutral-900 border-neutral-800'}`}>
          <span className={`text-sm font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
            {drill.day || `Hari ${index + 1}`}
          </span>
          <span className={`text-[9px] font-bold px-2.5 py-1 rounded-sm ${isCompleted ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800' : catColor} border uppercase tracking-widest`}>
            {drill.category || "UMUM"}
          </span>
       </div>
       
       {/* BODY DRILL */}
       <div className="p-5 flex-1 flex flex-col relative">
          {/* Efek Kaca jika selesai */}
          {isCompleted && (
            <div className="absolute inset-0 bg-emerald-950/10 backdrop-blur-[1px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-emerald-900/90 text-emerald-100 px-4 py-2 rounded-full font-black text-xs tracking-widest flex items-center gap-2 shadow-lg">
                    <CheckCircle size={16} /> MISI TUNTAS
                </div>
            </div>
          )}

          <h5 className={`text-sm font-black uppercase mb-2 leading-tight flex-1 ${isCompleted ? 'text-neutral-500' : 'text-white'}`}>
            {drill.title || "DRILL KHUSUS"}
          </h5>
          
          <div className={`flex items-center gap-2 text-[10px] font-mono mb-5 px-2 py-1 rounded w-fit ${isCompleted ? 'text-emerald-500 bg-emerald-950/30' : 'text-neutral-400 bg-neutral-900/50'}`}>
            <Clock size={12} className={isCompleted ? "text-emerald-500" : "text-blue-500"} /> 
            Estimasi: {drill.duration || "Fleksibel"}
          </div>
          
          <div className={`space-y-4 ${isCompleted ? 'opacity-40 grayscale' : ''}`}>
            <div className="text-xs text-neutral-400 leading-relaxed">
               <strong className="text-blue-400 block mb-1 text-[10px] uppercase tracking-wider">Tahap 1 (Persiapan)</strong> 
               {drill.tahap1}
            </div>
            <div className="text-xs text-neutral-400 leading-relaxed border-l-2 border-neutral-800 pl-3">
               <strong className="text-amber-400 block mb-1 text-[10px] uppercase tracking-wider">Tahap 2 (Eksekusi Inti)</strong> 
               {drill.tahap2}
            </div>
            <div className="text-xs text-neutral-400 leading-relaxed">
               <strong className="text-emerald-400 block mb-1 text-[10px] uppercase tracking-wider">Tahap 3 (Pendinginan)</strong> 
               {drill.tahap3}
            </div>
          </div>
       </div>
       
       {/* TOMBOL EKSEKUSI */}
       <div className={`p-3 border-t mt-auto relative z-20 ${isCompleted ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-neutral-900/30 border-neutral-800'}`}>
         <button 
            onClick={handleComplete}
            disabled={isCompleted || isLoading}
            className={`w-full py-2.5 text-xs font-black border rounded-lg transition-all uppercase flex items-center justify-center gap-2 
            ${isCompleted 
                ? 'bg-emerald-900/20 text-emerald-500 border-emerald-800/50 cursor-not-allowed' 
                : 'text-neutral-500 border-neutral-800 hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/50 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.1)]'
            }`}
         >
            {isLoading ? (
                <><Loader2 size={14} className="animate-spin" /> MENGIRIM LAPORAN...</>
            ) : isCompleted ? (
                <><Check size={14} /> LAPORAN DITERIMA</>
            ) : (
                <><CheckCircle size={14} /> TANDAI SELESAI</>
            )}
         </button>
       </div>
     </div>
  );
}