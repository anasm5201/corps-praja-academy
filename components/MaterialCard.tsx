"use client";

import { useRouter } from "next/navigation";
import { Lock, FileText, PlayCircle, Star, Download, BookOpen } from "lucide-react";

export default function MaterialCard({ data, color }: any) {
    const router = useRouter();
    
    // Mapping warna taktis
    const theme: any = {
        red: "hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        yellow: "hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]",
        green: "hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]",
    };

    const isLocked = data.locked;

    const handleAccess = () => {
        if (isLocked) {
            alert("AKSES DITOLAK: Level Anda belum mencukupi untuk dokumen Rahasia ini (Min. Level 5).");
            return;
        }
        // Navigasi ke Ruang Belajar
        router.push(`/dashboard/materials/${data.id}`);
    };

    return (
        <div className={`
            relative bg-zinc-900/50 border border-white/10 p-5 rounded-2xl 
            transition-all duration-300 group overflow-hidden flex flex-col justify-between h-full
            ${!isLocked && theme[color]}
        `}>
            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
            
            {/* LOCKED OVERLAY */}
            {isLocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-black/50 p-3 rounded-full border border-white/10 mb-2">
                        <Lock size={20} className="text-gray-400" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Denied</span>
                    <span className="text-[9px] text-gray-500 mt-1">Level 5 Required</span>
                </div>
            )}

            {/* TOP: TYPE & XP */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`
                    text-[9px] font-bold px-2 py-1 rounded border border-white/10 bg-black/40 flex items-center gap-1
                    ${color === 'red' ? 'text-red-400' : color === 'yellow' ? 'text-yellow-400' : 'text-green-400'}
                `}>
                    {data.type === 'VIDEO' ? <PlayCircle size={10}/> : <FileText size={10}/>}
                    {data.type}
                </div>
                {!isLocked && (
                    <div className="text-[9px] font-bold text-yellow-500 flex items-center gap-1 bg-yellow-900/10 px-2 py-1 rounded border border-yellow-500/20">
                        <Star size={10} fill="currentColor"/> +{data.xp} XP
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="relative z-10">
                <h4 className={`text-sm font-bold text-white mb-2 leading-snug ${isLocked ? 'blur-[2px]' : ''}`}>
                    {data.title}
                </h4>
                <p className="text-[10px] text-gray-500 font-mono mb-4 flex items-center gap-2">
                    <Download size={10}/> {data.size}
                </p>
            </div>

            {/* BUTTON INTERAKTIF */}
            <div className="mt-auto relative z-10">
                <button 
                    onClick={handleAccess}
                    disabled={isLocked}
                    className={`
                        w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                        ${isLocked 
                            ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                            : 'bg-white text-black hover:bg-gray-200 shadow-lg active:scale-95'
                        }
                    `}
                >
                    {isLocked ? 'Locked' : 'Akses Materi'}
                    {!isLocked && <BookOpen size={12}/>}
                </button>
            </div>
        </div>
    );
}