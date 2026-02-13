"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// ✅ FIX: Import dari lokasi yang benar (sesuai turn sebelumnya)
import { submitExam } from "@/app/actions/tryout"; 
import { 
    Clock, ChevronLeft, ChevronRight, Map, 
    Flag, Save 
} from "lucide-react";
import { toast } from "sonner";

export default function ExamSimulator({ pkg, questions, attempt }: any) {
    const router = useRouter();
    
    // STATE UTAMA
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // {questionId: optionCode}
    const [flags, setFlags] = useState<Record<string, boolean>>({}); // Ragu-ragu
    const [timeLeft, setTimeLeft] = useState(pkg.duration * 60); // Detik
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load jawaban tersimpan jika ada (Resume Sesi)
    useEffect(() => {
        if (attempt?.answers) {
            try {
                const saved = JSON.parse(attempt.answers);
                // Handle format jawaban (bisa object langsung atau properti userAnswers)
                const loadedAnswers = saved.userAnswers || saved;
                if (loadedAnswers && typeof loadedAnswers === 'object') {
                    setAnswers(loadedAnswers);
                }
            } catch (e) {
                console.error("Gagal load jawaban:", e);
            }
        }
    }, [attempt]);

    // --- 1. TIMER LOGIC ---
    useEffect(() => {
        // Hitung sisa waktu berdasarkan (createdAt + duration) - now
        // Note: Menggunakan 'createdAt' karena 'startedAt' sudah kita hapus dari schema
        const startTime = new Date(attempt.createdAt).getTime(); 
        const endTime = startTime + (pkg.duration * 60 * 1000);
        
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((endTime - now) / 1000);
            
            if (diff <= 0) {
                clearInterval(interval);
                handleFinishExam(true); // Force finish
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Format Menit:Detik
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // --- 2. JAWAB SOAL ---
    const handleAnswer = (optionCode: string) => {
        const qId = questions[currentIndex].id;
        setAnswers(prev => ({ ...prev, [qId]: optionCode }));
    };

    const toggleFlag = () => {
        const qId = questions[currentIndex].id;
        setFlags(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    // --- 3. SUBMIT EXAM (LOGIC FIX) ---
    const handleFinishExam = async (force = false) => {
        if (!force && !confirm("Apakah Anda yakin ingin menyelesaikan ujian?")) return;
        
        setIsSubmitting(true);
        
        // ✅ FIX: Hapus kalkulasi skor di Client (Tidak Aman & Argumen Berlebih)
        // Biarkan Server yang menghitung skor berdasarkan kunci jawaban di DB.
        
        // Convert answers object to array for DB storage
        const answersArray = Object.keys(answers).map(key => ({
            questionId: key,
            answerCode: answers[key]
        }));

        // ✅ FIX: Panggil submitExam dengan 2 argumen saja (AttemptID, Answers)
        const res = await submitExam(attempt.id, answersArray);

        if (res.success) {
            toast.success("UJIAN SELESAI. MENGHITUNG SKOR...");
            router.push(`/dashboard/result/${pkg.id}/${attempt.id}`); // Redirect ke Result Page
            router.refresh();
        } else {
            toast.error("Gagal mengirim jawaban: " + res.message);
            setIsSubmitting(false);
        }
    };

    // Helper Data
    const currentQ = questions[currentIndex];
    let options: any[] = [];
    try {
        options = typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options;
    } catch(e) {
        options = [];
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0a] text-white font-sans">
            
            {/* HEADER / HUD */}
            <div className="h-16 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-4">
                    <div className="text-xl font-black uppercase text-white tracking-tight hidden md:block">
                        {pkg.title}
                    </div>
                    <span className="bg-zinc-800 text-xs px-2 py-1 rounded font-mono text-gray-400 border border-white/10">
                        SOAL {currentIndex + 1} / {questions.length}
                    </span>
                </div>

                <div className={`flex items-center gap-2 text-2xl font-mono font-black ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
                    <Clock size={24}/> {formatTime(timeLeft)}
                </div>

                <button 
                    onClick={() => handleFinishExam(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold uppercase text-xs rounded-lg transition shadow-lg shadow-green-900/20 flex items-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? "MENYIMPAN..." : "SELESAI"} <Save size={16}/>
                </button>
            </div>

            {/* MAIN BATTLEFIELD */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* AREA SOAL (KIRI) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
                    <div className="max-w-4xl mx-auto pb-20">
                        
                        {/* Text Soal */}
                        <div className="text-lg md:text-xl leading-relaxed text-gray-200 mb-8 font-serif">
                            {currentQ.text}
                        </div>

                        {/* Pilihan Jawaban */}
                        <div className="space-y-3">
                            {options.map((opt: any) => {
                                const isSelected = answers[currentQ.id] === opt.code;
                                return (
                                    <button
                                        key={opt.code}
                                        onClick={() => handleAnswer(opt.code)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group
                                            ${isSelected 
                                                ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500' 
                                                : 'bg-zinc-900/30 border-white/10 hover:bg-zinc-800 hover:border-white/30'
                                            }
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors
                                            ${isSelected ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-gray-500 group-hover:bg-zinc-700'}
                                        `}>
                                            {opt.code}
                                        </div>
                                        <div className={`text-sm md:text-base pt-1 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                            {opt.label || opt.text} {/* Handle 'label' atau 'text' tergantung JSON */}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                    </div>
                </div>

                {/* NAVIGASI NOMOR (KANAN) */}
                <div className="w-80 border-l border-white/10 bg-[#080808] flex flex-col hidden md:flex">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Map size={14}/> Navigasi Soal
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q: any, idx: number) => {
                                const isAnswered = !!answers[q.id];
                                const isFlagged = !!flags[q.id];
                                const isCurrent = idx === currentIndex;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`aspect-square rounded-lg text-xs font-bold flex items-center justify-center relative border transition-all
                                            ${isCurrent ? 'bg-white text-black border-white ring-2 ring-blue-500 z-10' : 
                                              isFlagged ? 'bg-yellow-900/20 text-yellow-500 border-yellow-500' :
                                              isAnswered ? 'bg-green-900/20 text-green-500 border-green-900' : 
                                              'bg-zinc-900 text-gray-600 border-transparent hover:border-white/20'}
                                        `}
                                    >
                                        {idx + 1}
                                        {isFlagged && <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></div>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/10 space-y-2 bg-zinc-900/50">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase">
                            <span>Terjawab: {Object.keys(answers).length}</span>
                            <span>Sisa: {questions.length - Object.keys(answers).length}</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                            <div 
                                className="bg-green-500 h-full transition-all duration-500" 
                                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

            </div>

            {/* BOTTOM BAR (MOBILE CONTROLS) */}
            <div className="h-16 border-t border-white/10 bg-[#0a0a0a] flex items-center justify-between px-6 z-20">
                <button 
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 transition"
                >
                    <ChevronLeft size={20} className="text-white"/>
                </button>

                <button 
                    onClick={toggleFlag}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 border transition
                        ${flags[currentQ.id] 
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500' 
                            : 'bg-zinc-900 text-gray-500 border-transparent hover:bg-zinc-800'}
                    `}
                >
                    <Flag size={16} fill={flags[currentQ.id] ? "currentColor" : "none"}/>
                    <span className="hidden md:inline">Ragu-ragu</span>
                </button>

                <button 
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="p-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 disabled:opacity-30 transition text-black"
                >
                    <ChevronRight size={20}/>
                </button>
            </div>

        </div>
    );
}