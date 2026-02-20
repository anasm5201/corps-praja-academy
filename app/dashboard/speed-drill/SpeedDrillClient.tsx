"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Lock, Play, CheckCircle2, Trophy, Target, Star, ShieldAlert } from "lucide-react";

interface Unit {
    id: string;
    unitNumber: number;
    title: string;
    isLockedByProgression: boolean;
    isCompleted: boolean;
    isActive: boolean;
    isPaywalled: boolean;
}

export default function SpeedDrillClient({ 
    units, 
    completedCount, 
    totalUnits 
}: { 
    units: Unit[], 
    completedCount: number, 
    totalUnits: number 
}) {
    // State untuk memicu jebakan modal
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-red-900 overflow-hidden relative pb-20">
            
            {/* BACKGROUND GRID */}
            <div className="fixed inset-0 pointer-events-none opacity-10" 
                 style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="relative max-w-lg mx-auto min-h-screen border-x border-neutral-900/50 bg-neutral-950/80 backdrop-blur-sm">
                
                {/* HUD HEADER */}
                <div className="sticky top-0 z-40 bg-black/90 border-b border-red-900/30 p-5 flex justify-between items-center backdrop-blur-md shadow-lg shadow-black/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-red-600 tracking-[0.3em]">SKD FAST TRACK</span>
                        </div>
                        <h1 className="text-xl font-black uppercase tracking-tighter text-white">
                            SPEED <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">DRILL</span>
                        </h1>
                        <p className="text-[10px] text-neutral-500 font-mono mt-1">LATIHAN REFLEKS TWK - TIU - TKP</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-sm">
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="text-xs font-mono font-bold text-neutral-300">{completedCount}/{totalUnits} UNIT</span>
                    </div>
                </div>

                {/* JALUR PETA (THE PATH) */}
                <div className="flex flex-col items-center py-12 space-y-2 px-4">
                    {units.length === 0 ? (
                         <div className="text-center py-20 opacity-50 text-xs font-mono border border-dashed border-neutral-800 p-8 rounded-xl">
                             <Zap size={40} className="mx-auto mb-4 text-neutral-700"/>
                             DATA DRILL BELUM DIMUAT.<br/>
                             <span className="text-neutral-600">Hubungi Markas Pusat.</span>
                         </div>
                    ) : (
                         units.map((unit, index) => {
                             // Tampilan Visually Locked JIKA terhalang progresi ATAU terhalang paywall
                             const isVisuallyLocked = unit.isLockedByProgression || unit.isPaywalled;
                             const offset = index % 2 === 0 ? "translate-x-12" : "-translate-x-12";

                             return (
                                 <div key={unit.id} className={`relative flex flex-col items-center transition-transform duration-500 ${offset}`}>
                                     
                                     {/* KABEL PENGHUBUNG */}
                                     {index < (units.length - 1) && (
                                         <div className={`absolute top-10 h-28 w-[2px] -z-10 
                                             ${index % 2 === 0 ? "-rotate-[25deg] origin-top-left left-1/2" : "rotate-[25deg] origin-top-right right-1/2"}
                                             ${unit.isCompleted ? "bg-red-800 shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "bg-neutral-800"}`} 
                                         />
                                     )}

                                     {/* TOMBOL HEXAGON */}
                                     <div className="relative group z-10">
                                         {unit.isActive && !unit.isPaywalled && (
                                             <div className="absolute inset-0 bg-red-600 blur-xl opacity-30 animate-pulse rounded-full z-0"></div>
                                         )}
                                         
                                         {unit.isCompleted && (
                                             <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5 z-20 pointer-events-none">
                                                 <Star size={12} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
                                                 <Star size={12} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
                                                 <Star size={12} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
                                             </div>
                                         )}

                                         {/* LOGIKA KLIK: Jika Paywalled, panggil modal. Jika tidak, pakai Link */}
                                         {unit.isPaywalled ? (
                                             <button 
                                                 onClick={() => setShowUpgradeModal(true)}
                                                 className={`w-24 h-24 flex flex-col items-center justify-center relative transition-all duration-300 transform hover:scale-105 active:scale-95 z-10 bg-neutral-950 border-2 border-neutral-800 text-neutral-600 grayscale opacity-80 cursor-pointer hover:border-red-900/50 hover:text-red-500`}
                                                 style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                                             >
                                                 <Lock size={20} />
                                                 <span className="text-[9px] font-black mt-1 opacity-80 tracking-widest">UNIT {unit.unitNumber}</span>
                                             </button>
                                         ) : (
                                             <Link href={unit.isLockedByProgression ? "#" : `/dashboard/speed-drill/${unit.id}`} className={unit.isLockedByProgression ? "cursor-default" : "cursor-pointer"}>
                                                 <button disabled={unit.isLockedByProgression}
                                                     className={`w-24 h-24 flex flex-col items-center justify-center relative transition-all duration-300 transform hover:scale-105 active:scale-95 z-10
                                                     ${unit.isActive 
                                                         ? "bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]" 
                                                         : unit.isCompleted 
                                                             ? "bg-neutral-900 border-2 border-red-900/50 text-red-500" 
                                                             : "bg-neutral-950 border-2 border-neutral-800 text-neutral-600 grayscale opacity-80"
                                                     }`}
                                                     style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                                                 >
                                                     {unit.isLockedByProgression ? (
                                                         <Lock size={20} />
                                                     ) : unit.isActive ? (
                                                         <Play size={28} fill="currentColor" className="ml-1 animate-bounce" />
                                                     ) : (
                                                         <CheckCircle2 size={24} />
                                                     )}
                                                     <span className="text-[9px] font-black mt-1 opacity-80 tracking-widest">UNIT {unit.unitNumber}</span>
                                                 </button>
                                             </Link>
                                         )}
                                     </div>

                                     {/* LABEL JUDUL */}
                                     <div className="absolute top-24 w-40 text-center pointer-events-none z-20">
                                           <h3 className={`text-[9px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-sm border px-3 py-1 rounded-full shadow-lg inline-block
                                             ${unit.isActive && !unit.isPaywalled ? 'text-white border-red-500/30' : 'text-neutral-500 border-neutral-800'}`}>
                                               {unit.title.replace(`UNIT ${unit.unitNumber}:`, "").replace(`Unit ${unit.unitNumber}:`, "").trim() || "LATIHAN"}
                                           </h3>
                                     </div>

                                     {/* PENANDA FASE */}
                                     {(unit.unitNumber % 10 === 0 && unit.unitNumber !== 30) && (
                                         <div className="mt-24 mb-12 w-64 flex items-center justify-center gap-3 opacity-60">
                                             <div className="h-[1px] w-12 bg-red-500/50"></div>
                                             <div className="px-3 py-1 bg-red-950/50 border border-red-900/50 rounded-full flex items-center gap-2">
                                                 <Target size={10} className="text-red-500" />
                                                 <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest">FASE {Math.ceil(unit.unitNumber / 10)} TUNTAS</span>
                                             </div>
                                             <div className="h-[1px] w-12 bg-red-500/50"></div>
                                         </div>
                                     )}
                                 </div>
                             );
                         })
                    )}
                    
                    {/* FINAL BADGE */}
                    {units.length > 0 && (
                        <div className="mt-10 pt-10 text-center opacity-80">
                            <div className="inline-block p-6 border border-neutral-800 bg-neutral-900/50 rounded-sm">
                                <Trophy size={32} className="text-red-600 mx-auto mb-2" />
                                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em]">MISSION COMPLETE</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔥 TACTICAL UPGRADE MODAL (HANYA MUNCUL SAAT DIKLIK) */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0a] border border-red-900/50 p-8 rounded-xl max-w-sm w-full text-center shadow-[0_0_60px_rgba(220,38,38,0.2)] transform scale-100 animate-in zoom-in-95 duration-300">
                        <ShieldAlert size={56} className="mx-auto text-red-600 mb-6 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-pulse" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">AREA TERBATAS</h2>
                        <p className="text-xs text-neutral-400 font-mono mb-8 leading-relaxed">
                            Akses ke lintasan <strong className="text-red-500">Speed Drill Lanjutan</strong> hanya diberikan kepada Kadet <strong>Pasukan Khusus</strong>. Ambil senjata Anda sekarang.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowUpgradeModal(false)} className="flex-1 py-3 text-[10px] font-black tracking-widest text-neutral-500 border border-neutral-800 rounded-sm hover:bg-neutral-900 transition-colors uppercase">
                                BATAL
                            </button>
                            <Link href="/dashboard/subscription" className="flex-1">
                                <button className="w-full py-3 text-[10px] font-black tracking-widest text-white bg-red-700 rounded-sm hover:bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 uppercase">
                                    <Zap size={14} /> UPGRADE
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}