"use client";

import { useState } from "react";
import Link from "next/link";
import { 
    BrainCircuit, Zap, Shield, Play, 
    Lock, Clock, Activity, AlertTriangle, CheckCircle2
} from "lucide-react";

// [TAMBAHAN TAKTIS]: Import komponen jebakan yang sudah kita buat
import LockedMissionModal from "@/app/dashboard/tryout/LockedMissionModal";

interface Package {
    id: string;
    title: string;
    category: string;
    description: string | null;
    duration: number;
    _count: { questions: number };
    isFinished?: boolean;
    isLocked?: boolean; // WAJIB ADA: Menerima status gembok dari server
    isFree?: boolean;   // WAJIB ADA: Menerima status gratis dari server
}

export default function PsychologyList({ initialPackages }: { initialPackages: Package[] }) {
    // State Tab (Default JAR/Kecerdasan)
    const [activeTab, setActiveTab] = useState<"KECERDASAN" | "KECERMATAN" | "KEPRIBADIAN">("KECERDASAN");

    // KONFIGURASI VISUAL PER TAB
    const tabConfig = {
        KECERDASAN: { label: "JAR (KECERDASAN)", icon: BrainCircuit, color: "text-blue-500", border: "border-blue-500", bg: "bg-blue-500", glow: "shadow-blue-500/50" },
        KECERMATAN: { label: "LAT (KECERMATAN)", icon: Zap, color: "text-yellow-500", border: "border-yellow-500", bg: "bg-yellow-500", glow: "shadow-yellow-500/50" },
        KEPRIBADIAN: { label: "SUH (KEPRIBADIAN)", icon: Shield, color: "text-green-500", border: "border-green-500", bg: "bg-green-500", glow: "shadow-green-500/50" }
    };

    const currentTheme = tabConfig[activeTab];

    // FILTER DATA (PRESISI TINGGI)
    const filteredPackages = initialPackages.filter(pkg => {
        const cat = (pkg.category || "").toUpperCase();
        const title = (pkg.title || "").toUpperCase();

        if (activeTab === "KECERDASAN") return cat === "KECERDASAN" || cat === "JAR" || cat === "PSIKOLOGI" || title.includes("KECERDASAN");
        if (activeTab === "KECERMATAN") return cat === "KECERMATAN" || cat === "LAT" || title.includes("KECERMATAN");
        if (activeTab === "KEPRIBADIAN") return cat === "KEPRIBADIAN" || cat === "SUH" || cat === "KEP" || title.includes("KEPRIBADIAN");
        
        return false;
    });

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            
            {/* --- HEADER --- */}
            <div className="mb-12 border-b border-white/10 pb-8">
                <p className={`text-[10px] font-black ${currentTheme.color} uppercase tracking-[0.2em] mb-2 flex items-center gap-2`}>
                    <Activity size={12} className="animate-pulse"/> PILAR DOKTRIN: PSIKOLOGI
                </p>
                <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                    LABORATORIUM <span className={currentTheme.color}>{activeTab}</span>
                </h1>
                <p className="text-zinc-500 text-sm font-mono max-w-2xl">
                    // Pusat pelatihan psikologi terpadu. Pilih modul sesuai spesifikasi tes kedinasan.
                </p>
            </div>

            {/* --- TAB NAVIGATOR (TACTICAL SWITCH) --- */}
            <div className="flex flex-wrap gap-4 mb-12">
                {(Object.keys(tabConfig) as Array<keyof typeof tabConfig>).map((key) => {
                    const theme = tabConfig[key];
                    const isActive = activeTab === key;
                    const Icon = theme.icon;

                    return (
                        <button 
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`
                                flex items-center gap-4 px-6 py-4 border rounded-sm transition-all duration-300 relative overflow-hidden group
                                ${isActive 
                                    ? `bg-zinc-900 border-${theme.color.split('-')[1]}-900` 
                                    : "bg-transparent border-zinc-800 hover:border-zinc-700 text-zinc-600"}
                            `}
                        >
                            {/* Active Indicator Bar */}
                            {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bg}`}></div>}
                            
                            <Icon size={24} className={isActive ? theme.color : "text-zinc-600 group-hover:text-zinc-400"}/>
                            <div className="text-left">
                                <div className={`text-[9px] font-black uppercase tracking-widest ${isActive ? theme.color : "text-zinc-700"}`}>
                                    SEKTOR {key.substring(0, 3)}
                                </div>
                                <div className={`text-sm font-bold ${isActive ? "text-white" : "text-zinc-500"}`}>
                                    {key}
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* --- GRID PAKET --- */}
            {filteredPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPackages.map((pkg) => (
                        // [MODIFIKASI VISUAL]: Jika Terkunci, ubah warna border dan grayscale
                        <div key={pkg.id} className={`group relative bg-[#080808] border p-1 transition-all duration-300 
                            ${pkg.isLocked ? 'border-zinc-800 opacity-80 grayscale-[50%]' : 'border-white/5 hover:border-white/20 hover:-translate-y-1'}`}
                        >
                            
                            {/* Hover Glow Effect (Dimatikan jika terkunci) */}
                            {!pkg.isLocked && (
                                <div className={`absolute -inset-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 blur-sm`}></div>
                            )}

                            <div className="relative h-full bg-[#0A0A0A] p-6 flex flex-col">
                                
                                {/* Background Gembok Raksasa jika Terkunci */}
                                {pkg.isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
                                        <Lock size={120} />
                                    </div>
                                )}

                                {/* Header Card */}
                                <div className="mb-6 flex justify-between items-start relative z-10">
                                    <div className={`p-3 rounded-sm border bg-opacity-5 border-opacity-20 transition-colors 
                                        ${pkg.isLocked ? 'bg-zinc-900 border-zinc-800 text-zinc-600' : `${currentTheme.color.replace('text', 'bg')} ${currentTheme.color.replace('text', 'border')} ${currentTheme.color}`}`}
                                    >
                                        <currentTheme.icon size={24} className={pkg.isLocked ? "text-zinc-600" : currentTheme.color} />
                                    </div>
                                    
                                    {/* Status Badge */}
                                    {pkg.isLocked ? (
                                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                                            <Lock size={12} /> RESTRICTED
                                        </span>
                                    ) : pkg.isFinished ? (
                                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-green-500 bg-green-900/20 px-2 py-1 rounded border border-green-500/20">
                                            <CheckCircle2 size={12} /> SELESAI
                                        </span>
                                    ) : (
                                        <div className="text-right">
                                            <div className="text-xl font-black text-white">{pkg._count.questions}</div>
                                            <div className="text-[9px] text-zinc-600 font-black uppercase">SOAL</div>
                                        </div>
                                    )}
                                </div>

                                {/* Title & Desc */}
                                <div className="mb-6 flex-1 relative z-10">
                                    <h3 className={`text-lg font-bold mb-2 uppercase leading-tight line-clamp-2 transition-colors 
                                        ${pkg.isLocked ? 'text-zinc-500' : 'text-white group-hover:text-zinc-300'}`}
                                    >
                                        {pkg.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 font-medium line-clamp-2 font-mono">
                                        {pkg.description || `Simulasi standar ${pkg.category} untuk persiapan seleksi kedinasan.`}
                                    </p>
                                </div>

                                {/* Stats Bar */}
                                <div className="flex items-center gap-4 mb-6 text-xs font-mono text-zinc-400 border-t border-white/5 pt-4 relative z-10">
                                    <div className="flex items-center gap-1">
                                        <Clock size={12}/> {pkg.duration} MENIT
                                    </div>
                                    <div className="h-3 w-px bg-white/10"></div>
                                    <div className="flex items-center gap-1">
                                        {pkg.isFree ? (
                                            <span className="text-green-500 font-bold">TRIAL ACCESS</span>
                                        ) : (
                                            <><Lock size={12}/> PREMIUM</>
                                        )}
                                    </div>
                                </div>

                                {/* ACTION BUTTON (THE FIX) */}
                                <div className="mt-auto relative z-10">
                                    {pkg.isLocked ? (
                                        // JIKA TERKUNCI: Panggil Modal Pop-up (Jebakan Upgrade)
                                        <LockedMissionModal missionName={pkg.title} />
                                    ) : (
                                        // JIKA TERBUKA: Link normal menuju ruang ujian
                                        <Link href={`/dashboard/tryout/${pkg.id}/room`} className="block w-full">
                                            <button className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-transparent hover:border-white/20
                                                ${activeTab === "KECERDASAN" ? "bg-blue-600 hover:bg-blue-500 text-white" : 
                                                  activeTab === "KECERMATAN" ? "bg-yellow-600 hover:bg-yellow-500 text-black" : 
                                                  "bg-green-600 hover:bg-green-500 text-white"}
                                            `}>
                                                <Play size={14} fill="currentColor"/> {pkg.isFinished ? "ULANGI MISI" : "KERJAKAN"}
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // EMPTY STATE
                <div className="min-h-[300px] flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-sm bg-zinc-900/20">
                    <AlertTriangle size={48} className="text-zinc-700 mb-4"/>
                    <h3 className="text-lg font-black text-zinc-500 uppercase tracking-widest">MODUL BELUM TERSEDIA</h3>
                    <p className="text-xs text-zinc-600 font-mono mt-2">Hubungi instruktur untuk penyebaran amunisi baru.</p>
                </div>
            )}
        </div>
    );
}