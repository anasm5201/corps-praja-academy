"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BrainCircuit, Shield, Zap, PlayCircle, 
  RotateCcw, Trophy, Clock, AlertTriangle
} from "lucide-react";

export default function PsychologyClient({ packages, user }: any) {
  const [activeTab, setActiveTab] = useState("JAR");

  const doctrineTabs = [
      { id: "JAR", label: "KECERDASAN", icon: <BrainCircuit size={18}/>, color: "text-blue-500", border: "border-blue-500" },
      { id: "LAT", label: "KECERMATAN", icon: <Zap size={18}/>, color: "text-orange-500", border: "border-orange-500" },
      { id: "SUH", label: "KEPRIBADIAN", icon: <Shield size={18}/>, color: "text-emerald-500", border: "border-emerald-500" },
  ];

  // [FILTER AGRESIF]
  // Cek Kategori ATAU Tipe ATAU Judul. Tidak mungkin lolos.
  const filteredPackages = packages.filter((pkg: any) => {
      // Normalisasi teks jadi huruf besar semua biar gampang dicek
      const allText = (pkg.title + pkg.category + (pkg.type || "")).toUpperCase();

      if (activeTab === "JAR") {
          return allText.includes("KECERDASAN") || allText.includes("INTELEG");
      }
      if (activeTab === "LAT") {
          return allText.includes("KECERMATAN") || allText.includes("REFLEKS");
      }
      if (activeTab === "SUH") {
          return allText.includes("KEPRIBADIAN") || allText.includes("MENTAL");
      }
      return false;
  });

  return (
    <div className="space-y-8">
        
        {/* NAVIGATOR */}
        <div className="flex gap-2 md:gap-4 border-b border-white/10 overflow-x-auto pb-1">
            {doctrineTabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col md:flex-row items-center gap-2 px-4 md:px-6 py-3 transition-all min-w-[120px] md:min-w-0
                        ${activeTab === tab.id 
                            ? `bg-white/5 border-b-2 ${tab.border}` 
                            : 'opacity-60 hover:opacity-100 hover:bg-white/5'}
                    `}
                >
                    <div className={`${activeTab === tab.id ? tab.color : 'text-gray-400'}`}>{tab.icon}</div>
                    <div className="text-left">
                        <div className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? tab.color : 'text-gray-500'}`}>
                            {tab.id}
                        </div>
                        <div className="text-xs font-bold text-white hidden md:block">{tab.label}</div>
                    </div>
                </button>
            ))}
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredPackages.length === 0 ? (
                <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 text-gray-500">
                    <AlertTriangle className="mx-auto mb-4 opacity-50" size={32}/>
                    <p className="font-bold text-sm uppercase">DATA LOGISTIK KOSONG</p>
                    <p className="text-xs mt-1">Sistem tidak menemukan modul dengan kata kunci {activeTab}.</p>
                </div>
            ) : (
                filteredPackages.map((pkg: any) => {
                    const lastAttempt = pkg.attempts?.[0];
                    const isFinished = lastAttempt?.isFinished;
                    
                    let borderColor = "hover:border-blue-500/50";
                    if(activeTab === "LAT") borderColor = "hover:border-orange-500/50";
                    if(activeTab === "SUH") borderColor = "hover:border-emerald-500/50";

                    return (
                        <div key={pkg.id} className={`group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 transition-all hover:bg-zinc-900 ${borderColor}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-black rounded-lg border border-white/10 text-gray-400 group-hover:text-white transition-colors">
                                    {activeTab === "JAR" && <BrainCircuit size={24}/>}
                                    {activeTab === "LAT" && <Zap size={24}/>}
                                    {activeTab === "SUH" && <Shield size={24}/>}
                                </div>
                                {isFinished && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-green-900/20 text-green-500 px-2 py-1 rounded border border-green-900/30">
                                        <Trophy size={12}/> SELESAI
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">{pkg.title}</h3>
                            <p className="text-xs text-gray-500 mb-6 line-clamp-2">{pkg.description || "Latihan standar kompetensi."}</p>

                            <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 mb-6">
                                <span className="flex items-center gap-1"><Clock size={12}/> {pkg.duration} MENIT</span>
                                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase">
                                    {activeTab === "LAT" ? "REFLEKS" : "PILIHAN GANDA"}
                                </span>
                            </div>

                            {/* Tombol Aksi */}
                            {activeTab === "LAT" ? (
                                <Link 
                                    href={`/dashboard/psychology/kecermatan/${pkg.id}`}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-orange-700 hover:bg-orange-600 text-white text-xs font-bold uppercase transition-all"
                                >
                                    {isFinished ? <RotateCcw size={14}/> : <PlayCircle size={14}/>}
                                    {isFinished ? "LATIH ULANG" : "MULAI LAT"}
                                </Link>
                            ) : (
                                <Link 
                                    href={`/dashboard/tryout/${pkg.id}/room`}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white text-xs font-bold uppercase transition-all"
                                >
                                    {isFinished ? <RotateCcw size={14}/> : <PlayCircle size={14}/>}
                                    {isFinished ? "PELAJARI ULANG" : "MULAI MISI"}
                                </Link>
                            )}
                        </div>
                    )
                })
            )}
        </div>
    </div>
  );
}