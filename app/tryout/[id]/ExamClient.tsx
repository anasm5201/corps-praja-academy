"use client";

import { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";
import { submitExam } from "@/app/actions/examActions"; 

// Tipe Data Soal
interface Question {
    id: string;
    type: string; 
    text: string;
    options: any; 
    image?: string | null;
}

export default function ExamClient({ pkg, user, attemptId }: { pkg: any, user: any, attemptId: string }) {
    
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); 
    const [timeLeft, setTimeLeft] = useState(pkg.duration * 60); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const questions: Question[] = pkg.questions;
    const currentQ = questions[currentIdx];
    
    // PARSE OPTIONS AMAN
    let options = [];
    try {
        if (typeof currentQ?.options === 'string') {
            options = JSON.parse(currentQ.options);
        } else {
            options = currentQ?.options || [];
        }
    } catch (e) {
        options = [];
    }

    // TIMER COUNTDOWN
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true); 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // FORMAT WAKTU (HH:MM:SS)
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // HANDLE ANSWER 
    const handleAnswer = (code: string) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: code }));
    };

    // SUBMIT KE SERVER (SUDAH DIPERBAIKI)
    const handleSubmit = async (auto = false) => {
        if (!auto && !confirm("Apakah Anda yakin ingin mengakhiri ujian? Jawaban akan dikunci.")) return;
        
        setIsSubmitting(true);
        toast.info("Menyimpan Lembar Jawaban...", { duration: 5000 });

        try {
            // FIX: Object to Array
            const formattedAnswers = Object.entries(answers).map(([key, value]) => ({
                questionId: key,
                answer: value
            }));

            const result = await submitExam(attemptId, formattedAnswers);
            
            // FIX: Bypass Type Checking untuk redirectUrl
            const response = result as any; 

            if (response.success) {
                toast.success("UJIAN SELESAI! MENGHITUNG SKOR...");
                window.location.href = response.redirectUrl || `/dashboard/history/${attemptId}`; 
            } else {
                toast.error(response.error || response.message || "Gagal menyimpan jawaban.");
                setIsSubmitting(false);
            }
        } catch (e) {
            console.error(e);
            toast.error("Terjadi kesalahan jaringan. Coba lagi.");
            setIsSubmitting(false);
        }
    };

    const getTypeColor = (type: string) => {
        if (type === 'TWK') return 'border-red-500 text-red-500 bg-red-500/10';
        if (type === 'TIU') return 'border-blue-500 text-blue-500 bg-blue-500/10';
        return 'border-green-500 text-green-500 bg-green-500/10'; 
    };

    if (!currentQ) return <div className="p-10 text-center text-black">Memuat soal...</div>;

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col md:flex-row">
            
            {/* --- KIRI: AREA SOAL UTAMA --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                
                {isSubmitting && (
                    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
                            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                            <p className="font-bold text-gray-800">Menyimpan Jawaban...</p>
                            <p className="text-xs text-gray-500">Jangan tutup halaman ini.</p>
                        </div>
                    </div>
                )}

                <div className="h-16 bg-[#0c1f38] text-white flex items-center justify-between px-4 md:px-6 shadow-md z-20 shrink-0">
                    <div>
                        <h1 className="font-bold text-sm md:text-lg uppercase tracking-wider truncate max-w-[200px] md:max-w-md">{pkg.title}</h1>
                        <p className="text-[10px] md:text-xs text-gray-300 font-mono">KADET: {user.name}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-lg border border-white/20">
                        <Clock size={18} className={timeLeft < 300 ? "text-red-500 animate-pulse" : "text-white"}/>
                        <span className={`font-mono text-lg md:text-xl font-bold ${timeLeft < 300 ? "text-red-500" : "text-white"}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                    <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
                        
                        <div className="flex justify-between items-start mb-6 border-b pb-4">
                            <span className={`px-3 py-1 rounded text-xs font-bold border ${getTypeColor(currentQ.type)}`}>
                                {currentQ.type}
                            </span>
                            <span className="text-gray-400 font-bold text-lg">
                                {currentIdx + 1} <span className="text-sm font-normal">/ {questions.length}</span>
                            </span>
                        </div>

                        <div className="mb-8">
                             {currentQ.image && (
                                <div className="mb-6 flex justify-center bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={currentQ.image} alt="Ilustrasi Soal" className="max-h-[300px] object-contain"/>
                                </div>
                             )}
                            <p className="text-lg md:text-xl leading-relaxed font-medium text-gray-800 whitespace-pre-wrap">
                                {currentQ.text}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {options.map((opt: any, idx: number) => {
                                const isSelected = answers[currentQ.id] === opt.code;
                                return (
                                    <button 
                                        key={idx}
                                        onClick={() => handleAnswer(opt.code)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-4 group
                                            ${isSelected 
                                                ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-[0_2px_8px_rgba(37,99,235,0.2)]' 
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold shrink-0 transition-colors border
                                            ${isSelected 
                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                : 'bg-gray-100 text-gray-500 border-gray-300 group-hover:bg-blue-100 group-hover:text-blue-600'
                                            }
                                        `}>
                                            {opt.code}
                                        </div>
                                        <div className="pt-0.5 text-base md:text-lg text-gray-700 group-hover:text-gray-900">
                                            {opt.text}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                    </div>
                </div>

                <div className="h-20 bg-white border-t px-6 flex items-center justify-between z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentIdx === 0}
                        className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-700 flex items-center gap-2 transition-colors"
                    >
                        <ChevronLeft size={18}/> <span className="hidden md:inline">SEBELUMNYA</span>
                    </button>

                    <button 
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="hidden md:flex px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold items-center gap-2 shadow-lg shadow-green-600/30 transition-transform active:scale-95"
                    >
                        <Save size={18}/> SELESAI UJIAN
                    </button>

                    <button 
                        onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentIdx === questions.length - 1}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none transition-colors"
                    >
                        <span className="hidden md:inline">SELANJUTNYA</span> <ChevronRight size={18}/>
                    </button>
                </div>
            </div>

            {/* --- KANAN: NAVIGASI NOMOR --- */}
            <div className="hidden md:flex w-80 bg-gray-50 border-l flex-col h-screen shadow-xl z-30 shrink-0">
                <div className="p-4 bg-white border-b shadow-sm z-10">
                    <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">Navigasi Soal</h3>
                    <div className="flex gap-4 text-xs mt-3">
                        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <div className="w-3 h-3 bg-blue-600 rounded-sm"></div> Terjawab
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div> Kosong
                        </span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-5 gap-2.5">
                        {questions.map((q, i) => {
                            const isAnswered = answers[q.id];
                            const isCurrent = i === currentIdx;
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIdx(i)}
                                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200
                                        ${isCurrent ? 'ring-2 ring-gray-800 ring-offset-2 scale-105' : ''}
                                        ${isAnswered 
                                            ? 'bg-blue-600 text-white shadow-md border border-blue-700' 
                                            : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-200 hover:border-gray-400'
                                        }
                                    `}
                                >
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="p-4 bg-white border-t">
                     <button 
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-900/10 transition-transform active:scale-95"
                    >
                        SELESAI & KUMPULKAN
                    </button>
                </div>
            </div>

        </div>
    );
}