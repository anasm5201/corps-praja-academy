"use client";

import { useState, useEffect } from "react";
import { 
    Timer, AlertTriangle, CheckCircle2, ChevronRight, 
    ChevronLeft, Save, Target, Radio, Activity, Zap 
} from "lucide-react";
import { useRouter } from "next/navigation";

// Tipe Data Sederhana
type Question = {
    id: string;
    text: string;
    options: string; // JSON string
    type: string;
};

type TryoutBoardProps = {
    attemptId: string;
    packageId: string;
    questions: Question[];
    duration: number;
    startTime: number;
    endTime: number;
    initialAnswers: Record<string, string>;
};

export default function TryoutBoard({ 
    attemptId, questions, endTime, initialAnswers 
}: TryoutBoardProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Timer Logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((endTime - now) / 1000);
            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft(0);
                // Auto submit logic here
                handleSubmit();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    // Format Menit:Detik
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSelectOption = (qId: string, code: string) => {
        setAnswers(prev => ({ ...prev, [qId]: code }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulasi submit sukses dan redirect
        // Di real app: panggil Server Action / API submit
        alert("MISI SELESAI! DATA DIKIRIM KE MARKAS.");
        router.push("/dashboard/tryout"); // Kembali ke markas
    };

    // 🛡️ SECURITY PROTOCOL: Mencegah Crash jika data kosong/loading
    if (!questions || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(37,99,235,0.5)]"></div>
                <p className="text-blue-500 font-mono text-sm tracking-[0.2em] animate-pulse">MEMUAT LOGISTIK SOAL...</p>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    // 🛡️ SECURITY PROTOCOL: Mencegah Crash jika indeks berlebih
    if (!currentQ) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-center p-10 border border-red-900/50 bg-red-900/10 rounded-xl m-10">
                <AlertTriangle className="w-12 h-12 text-red-600 mb-4 animate-bounce" />
                <h3 className="text-red-500 font-black text-xl mb-2 tracking-widest uppercase">⚠️ KEGAGALAN LOGISTIK</h3>
                <p className="text-gray-400 text-xs font-mono mb-6">
                    Soal nomor {currentIndex + 1} tidak ditemukan dalam paket ini.<br/>
                    Kemungkinan data corrupted atau indeks berlebih.
                </p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-none uppercase text-xs tracking-[0.2em] transition shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                >
                    REBOOT SYSTEM
                </button>
            </div>
        );
    }

    let parsedOptions: {code: string, label: string}[] = [];
    try {
        parsedOptions = JSON.parse(currentQ.options);
    } catch (e) {
        parsedOptions = [];
    }

    // --- RENDER VISUAL ---
    return (
        <div className="h-screen flex flex-col text-gray-300 font-sans bg-[#020202] overflow-hidden relative selection:bg-blue-500/30">
            
            {/* Background Grid Taktis */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

            {/* Header HUD */}
            <div className="h-16 border-b border-white/10 bg-[#050505]/90 backdrop-blur-md flex items-center justify-between px-6 z-20 shadow-xl relative">
                {/* Garis Hiasan Atas */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-blue-500">
                        <Activity className="w-5 h-5 animate-pulse" />
                        <span className="font-black text-lg tracking-widest uppercase hidden md:inline-block">CAT SIMULATOR</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">SOAL NO.</span>
                        <span className="px-3 py-1 bg-blue-900/20 text-blue-400 text-sm font-black rounded border border-blue-500/30 font-mono shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                            {String(currentIndex + 1).padStart(2, '0')} <span className="text-gray-600 text-[10px] mx-1">/</span> {String(questions.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>

                <div className={`flex items-center gap-3 font-mono text-xl font-bold px-4 py-2 rounded border transition-all duration-500
                    ${timeLeft < 300 
                        ? 'bg-red-900/20 text-red-500 border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse' 
                        : 'bg-zinc-900/50 text-white border-white/10'}`}>
                    <Timer size={18} className={timeLeft < 300 ? 'animate-spin' : ''} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden relative z-10">
                
                {/* Area Soal (Scrollable) */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-black">
                    <div className="max-w-4xl mx-auto pb-20">
                        
                        {/* Box Soal */}
                        <div className="mb-8 relative group">
                            {/* Dekorasi Sudut */}
                            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                            
                            <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-sm shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Target className="w-24 h-24 text-white" />
                                </div>
                                <div className="text-lg md:text-xl leading-relaxed font-medium text-gray-200 relative z-10">
                                    {currentQ.text}
                                </div>
                            </div>
                        </div>

                        {/* Pilihan Jawaban */}
                        <div className="space-y-4">
                            {parsedOptions.map((opt, idx) => {
                                const isSelected = answers[currentQ.id] === opt.code;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectOption(currentQ.id, opt.code)}
                                        className={`group w-full text-left p-5 rounded-lg border transition-all duration-300 flex items-center gap-5 relative overflow-hidden
                                            ${isSelected 
                                                ? 'bg-blue-900/20 border-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.15)] translate-x-2' 
                                                : 'bg-[#0A0A0A] border-white/5 hover:border-white/20 hover:bg-zinc-900 text-gray-400'
                                            }
                                        `}
                                    >
                                        {/* Indikator Seleksi (Glow Bar Kiri) */}
                                        {isSelected && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_#3b82f6]"></div>
                                        )}

                                        <div className={`w-10 h-10 rounded flex items-center justify-center font-black text-sm border transition-all
                                            ${isSelected 
                                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg scale-110' 
                                                : 'bg-black border-white/10 text-gray-600 group-hover:border-white/30 group-hover:text-white'
                                            }
                                        `}>
                                            {opt.code}
                                        </div>
                                        
                                        <span className={`flex-1 text-sm md:text-base font-medium tracking-wide ${isSelected ? 'text-blue-100' : ''}`}>
                                            {opt.label}
                                        </span>

                                        {isSelected && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Radio className="w-6 h-6 text-blue-500 animate-pulse" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigasi (Desktop) */}
                <div className="w-80 border-l border-white/10 bg-[#080808] hidden lg:flex flex-col relative z-20 shadow-2xl">
                    <div className="p-6 border-b border-white/5 bg-[#050505]">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Navigasi Taktis</h3>
                        </div>
                        <p className="text-[10px] text-gray-600 font-mono">Pilih target soal untuk navigasi cepat.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="grid grid-cols-5 gap-3 content-start">
                            {questions.map((q, idx) => {
                                const isAnswered = !!answers[q.id];
                                const isCurrent = idx === currentIndex;
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`aspect-square rounded-sm flex items-center justify-center text-xs font-bold transition-all duration-300 relative
                                            ${isCurrent 
                                                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] scale-110 z-10' 
                                                : isAnswered 
                                                    ? 'bg-blue-900/20 text-blue-400 border border-blue-500/30 hover:bg-blue-900/40' 
                                                    : 'bg-[#111] text-gray-600 border border-white/5 hover:border-white/20 hover:text-white'
                                            }
                                        `}
                                    >
                                        {idx + 1}
                                        {/* Status Dot */}
                                        {isCurrent && <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-[#050505]">
                        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-gray-500 mb-4 uppercase tracking-wider">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-600 rounded-sm"></div>Aktif</div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-900/40 border border-blue-500/30 rounded-sm"></div>Terjawab</div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#111] border border-white/10 rounded-sm"></div>Kosong</div>
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-4 font-black uppercase tracking-[0.2em] text-xs transition-all relative overflow-hidden group
                                ${isSubmitting 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]'
                                }
                            `}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isSubmitting ? "MENYIMPAN DATA..." : <><Save size={16} /> SELESAI MISI</>}
                            </span>
                            {!isSubmitting && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Control (Mobile Only) */}
            <div className="h-16 border-t border-white/10 bg-[#050505] flex items-center justify-between px-6 lg:hidden relative z-30">
                <button 
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-full bg-zinc-800 text-white disabled:opacity-30 border border-white/10"
                >
                    <ChevronLeft size={20} />
                </button>
                
                <button 
                    onClick={handleSubmit}
                    className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded shadow-[0_0_15px_rgba(22,163,74,0.4)]"
                >
                    SELESAI
                </button>
                
                <button 
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="p-3 rounded-full bg-zinc-800 text-white disabled:opacity-30 border border-white/10"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}