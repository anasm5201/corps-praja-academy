"use client";

import { useEffect, useState } from "react";
import { 
    Sun, Moon, BookOpen, Dumbbell, Coffee, 
    Crosshair, Zap, Shield, Clock, CheckCircle2, XCircle
} from "lucide-react";

// DATA PROPS DARI PARENT (DASHBOARD PAGE)
interface MissionBoardProps {
    completion: {
        hasPhysical: boolean;
        hasTryout: boolean;
        hasLogin: boolean;
    }
}

// DEFINISI SIKLUS KEHIDUPAN (DITAMBAH KATEGORI UNTUK VALIDASI)
const DAILY_CYCLE = [
    { time: "04:30", end: "05:00", title: "IBADAH & PERSIAPAN", type: "SUH", category: "ROHANI", icon: <Shield size={14}/> },
    { time: "05:00", end: "07:00", title: "BINA JASMANI (LARI)", type: "LAT", category: "FISIK", icon: <Dumbbell size={14}/> }, // Cek DB Fisik
    { time: "07:00", end: "08:00", title: "APEL & SARAPAN", type: "SUH", category: "DISIPLIN", icon: <Coffee size={14}/> },
    { time: "08:00", end: "10:00", title: "SPEED DRILL (REFLEKS)", type: "LAT", category: "MENTAL", icon: <Zap size={14}/> },
    { time: "10:00", end: "12:00", title: "MATERI SKD (JAR)", type: "JAR", category: "AKADEMIK", icon: <BookOpen size={14}/> },
    { time: "12:00", end: "13:00", title: "ISOMA SIANG", type: "SUH", category: "ISTIRAHAT", icon: <Sun size={14}/> },
    { time: "15:30", end: "17:30", title: "BINA FISIK SORE", type: "LAT", category: "FISIK", icon: <Dumbbell size={14}/> },
    { time: "19:00", end: "21:00", title: "SIMULASI CAT (TRYOUT)", type: "JAR", category: "TRYOUT", icon: <Crosshair size={14}/> }, // Cek DB Tryout
    { time: "21:00", end: "22:00", title: "EVALUASI & ISTIRAHAT", type: "SUH", category: "EVALUASI", icon: <Moon size={14}/> },
];

export default function MissionBoard({ completion }: MissionBoardProps) {
    const [currentTime, setCurrentTime] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    // LOGIKA TIMER & AKTIVASI JADWAL
    useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const currentH = now.getHours();
            const currentM = now.getMinutes();
            const timeVal = currentH * 60 + currentM;

            setCurrentTime(`${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`);

            let foundIndex = -1;
            DAILY_CYCLE.forEach((slot, idx) => {
                const [hStart, mStart] = slot.time.split(':').map(Number);
                const [hEnd, mEnd] = slot.end.split(':').map(Number);
                const startVal = hStart * 60 + mStart;
                const endVal = hEnd * 60 + mEnd;

                if (timeVal >= startVal && timeVal < endVal) {
                    foundIndex = idx;
                }
            });
            
            // Jika lewat jam 22:00 (Akhir Siklus)
            if (timeVal >= 22 * 60) foundIndex = DAILY_CYCLE.length;

            setActiveIndex(foundIndex);
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Update tiap menit
        return () => clearInterval(interval);
    }, []);

    // Helper Warna
    const getColor = (type: string) => {
        if (type === 'JAR') return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
        if (type === 'LAT') return 'text-green-500 border-green-500/50 bg-green-500/10';
        return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10'; 
    };

    // --- LOGIKA VALIDASI UTAMA ---
    const getStatus = (index: number, slot: any) => {
        // 1. Masa Depan
        if (index > activeIndex) return "UPCOMING";
        
        // 2. Sekarang
        if (index === activeIndex) return "ACTIVE";

        // 3. Masa Lalu (Cek Database)
        if (slot.category === 'FISIK') {
            return completion.hasPhysical ? "DONE" : "MISSED";
        }
        if (slot.category === 'TRYOUT') {
            return completion.hasTryout ? "DONE" : "MISSED";
        }
        
        // Default (Dianggap Done untuk kegiatan rutin/ibadah jika login hari ini)
        return "DONE"; 
    };

    return (
        <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 h-full flex flex-col relative overflow-hidden">
            
            {/* Header Tactical */}
            <div className="flex justify-between items-start mb-6 z-10">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                        <Clock size={16} className="text-[#dc2626] animate-pulse"/> JADWAL OPERASI
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">LOG HARIAN: JAR-LAT-SUH</p>
                </div>
                <div className="bg-black/50 border border-white/10 px-3 py-1 rounded font-mono text-xl font-black text-white shadow-inner">
                    {currentTime}
                </div>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-5" 
                 style={{backgroundImage: 'linear-gradient(0deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent)', backgroundSize: '30px 30px'}}>
            </div>

            {/* Timeline List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 space-y-0">
                {DAILY_CYCLE.map((slot, index) => {
                    const status = getStatus(index, slot);
                    const isActive = status === "ACTIVE";
                    const colorClass = getColor(slot.type);

                    return (
                        <div key={index} className="flex gap-4 relative group">
                            {/* Garis Vertikal (Putus jika Missed) */}
                            <div className={`absolute left-[59px] top-0 bottom-0 w-[2px] 
                                ${status === 'DONE' ? 'bg-zinc-700' 
                                : status === 'MISSED' ? 'bg-red-900/30 dashed' 
                                : isActive ? 'bg-white' : 'bg-zinc-800'}
                            `}></div>

                            {/* Kolom Waktu */}
                            <div className={`w-[50px] text-right text-[10px] font-mono py-3 shrink-0
                                ${isActive ? 'text-white font-bold' : 'text-gray-600'}
                            `}>
                                {slot.time}
                            </div>

                            {/* Dot Indikator Status */}
                            <div className={`relative z-10 mt-3 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-[#050505] shrink-0 transition-all
                                ${isActive 
                                    ? 'border-white animate-pulse shadow-[0_0_10px_white]' 
                                    : status === 'DONE' ? 'border-zinc-600 bg-zinc-800' 
                                    : status === 'MISSED' ? 'border-red-600 bg-red-900/20' 
                                    : 'border-zinc-800'
                                }
                            `}>
                                {status === 'DONE' && <CheckCircle2 size={10} className="text-green-500"/>}
                                {status === 'MISSED' && <XCircle size={10} className="text-red-500"/>}
                                {isActive && <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                            </div>

                            {/* Kartu Detail Kegiatan */}
                            <div className={`flex-1 mb-4 p-3 rounded-xl border transition-all duration-300
                                ${isActive 
                                    ? `bg-zinc-800 border-l-4 ${colorClass.split(' ')[1]} shadow-lg` 
                                    : status === 'MISSED'
                                        ? 'bg-red-950/20 border-red-900/30'
                                        : 'bg-transparent border-transparent hover:bg-zinc-900/50'
                                }
                            `}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${colorClass}`}>
                                        {slot.icon} {slot.type}
                                    </span>
                                    
                                    {/* Label Status Teks */}
                                    {isActive && <span className="text-[9px] text-red-500 font-bold animate-pulse">● LIVE</span>}
                                    {status === 'MISSED' && <span className="text-[9px] text-red-500 font-bold tracking-wider">TERLEWAT</span>}
                                    {status === 'DONE' && <span className="text-[9px] text-green-600 font-bold tracking-wider">SELESAI</span>}
                                </div>
                                
                                <h4 className={`text-xs font-bold uppercase ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                    {slot.title}
                                </h4>

                                {/* Pesan Feedback jika Missed */}
                                {status === 'MISSED' && (
                                    <p className="text-[9px] text-red-400 mt-1 italic font-mono border-t border-red-900/30 pt-1">
                                        ⚠ Data laporan tidak ditemukan.
                                    </p>
                                )}
                                
                                {/* Pesan Motivasi jika Active */}
                                {isActive && (
                                    <p className="text-[10px] text-gray-300 mt-1 font-mono">
                                        Fokus pada misi sekarang.
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Legend */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-[9px] uppercase text-gray-500 font-bold tracking-widest">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> JAR</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> LAT</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> SUH</span>
            </div>
        </div>
    );
}