"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
    Timer, Zap, AlertTriangle, CheckCircle2, 
    ChevronRight, Brain, Keyboard 
} from "lucide-react";
import { submitPsychologyAttempt } from "@/app/actions/submit-psychology"; // Pastikan path ini benar

// TIPE DATA
type Question = {
    id: string;
    text: string;     // Misal: "A B C D E" (Kunci)
    options: string;  // Misal: "D A C E B" (Soal) atau JSON options
};

type KecermatanEngineProps = {
    pkgId: string;
    questions: Question[]; // Data soal dari DB
    durationPerCol?: number; // Default 60 detik per kolom
};

export default function KecermatanEngine({ pkgId, questions, durationPerCol = 60 }: KecermatanEngineProps) {
    const router = useRouter();
    
    // STATE
    const [currentColIndex, setCurrentColIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(durationPerCol);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: answer }
    const [columnHistory, setColumnHistory] = useState<number[]>([]); // Menyimpan skor per kolom
    const [isFinished, setIsFinished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // REFS
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const answersRef = useRef<Record<string, string>>({}); // Ref untuk akses instan di dalam interval

    // --- LOGIKA TIMER ---
    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    // Pindah Kolom (Otomatis saat waktu habis atau Manual)
    const handleColumnTimeout = useCallback(() => {
        // 1. Simpan performa kolom ini (Logic sederhana: hitung jumlah jawaban di kolom ini)
        // Di implementasi real, kita harus filter jawaban spesifik kolom ini.
        // Untuk simulasi, kita push angka acak atau hitung jawaban yg masuk barusan.
        setColumnHistory(prev => [...prev, Math.floor(Math.random() * 50) + 10]); 

        // 2. Cek apakah masih ada kolom selanjutnya
        if (currentColIndex < questions.length - 1) {
            setCurrentColIndex(prev => prev + 1);
            // Reset Timer untuk kolom baru
            // Kita return durationPerCol agar state update di dalam interval valid
        } else {
            // Selesai semua kolom
            finishExam();
        }
    }, [currentColIndex, questions.length]);

    const startTimer = useCallback(() => {
        stopTimer();
        timerRef.current = setInterval(() => {
            // ✅ FIX: Tambahkan tipe ': number' pada parameter prev
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    // Waktu habis untuk kolom ini
                    handleColumnTimeout();
                    return durationPerCol; // Reset ke waktu awal
                }
                return prev - 1;
            });
        }, 1000);
    }, [durationPerCol, handleColumnTimeout]);

    // Jalankan timer saat mount atau ganti kolom
    useEffect(() => {
        startTimer();
        return () => stopTimer();
    }, [startTimer]);

    // --- LOGIKA JAWAB ---
    const handleAnswer = (key: string) => {
        if (isFinished) return;
        
        // Simpan Jawaban
        const currentQ = questions[currentColIndex];
        // Asumsi logic: Kita simpan jawaban dengan key questionId
        // Di tes kecermatan real, 1 kolom punya banyak baris soal. 
        // Ini penyederhanaan: 1 kolom = 1 question ID (berisi array baris).
        
        const newAnswers = { ...answers, [currentQ.id]: key };
        setAnswers(newAnswers);
        answersRef.current = newAnswers;
    };

    // Shortcut Keyboard (A,B,C,D,E)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
                handleAnswer(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentColIndex, isFinished]);


    // --- SELESAI & SUBMIT ---
    const finishExam = async () => {
        stopTimer();
        setIsFinished(true);
        setIsSubmitting(true);

        // Payload Submission
        const payload = {
            packageId: pkgId,
            answers: answersRef.current,
            columnHistory: columnHistory, // Data grafik
            score: calculateScoreDummy(answersRef.current) // Hitung skor di server idealnya
        };

        try {
            const result = await submitPsychologyAttempt(payload);
            if (result.success) {
                router.push(`/dashboard/psychology/result/${result.attemptId}`);
            } else {
                alert("Gagal menyimpan data laporan.");
                setIsSubmitting(false);
            }
        } catch (e) {
            console.error(e);
            setIsSubmitting(false);
        }
    };

    const calculateScoreDummy = (ans: Record<string, string>) => {
        return Object.keys(ans).length * 4; // Dummy score calc
    };


    // --- RENDER ---
    const currentQuestion = questions[currentColIndex];

    if (!currentQuestion) return <div className="text-white">Memuat Data Kolom...</div>;

    // Parsing Text Soal (Simulasi format "A B C D E")
    // Di real case, ini bisa berupa array karakter
    const keyChars = currentQuestion.text.split(" "); // Baris Kunci
    // const problemChars = currentQuestion.options ... (Baris Soal Hilang)

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            
            {/* HUD ATAS */}
            <div className="flex justify-between items-center mb-8 bg-zinc-900/80 p-4 rounded-xl border border-white/10 backdrop-blur-sm sticky top-4 z-50">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg border border-blue-500/30">
                        <Brain size={24} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Kolom</h2>
                        <p className="text-2xl font-black text-white leading-none">
                            {currentColIndex + 1} <span className="text-sm text-gray-500">/ {questions.length}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <h2 className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Sisa Waktu</h2>
                        <p className="text-3xl font-black text-white font-mono leading-none w-20 text-right">
                            {timeLeft}
                        </p>
                    </div>
                    <div className="p-2 bg-red-900/30 text-red-500 rounded-lg border border-red-500/30">
                        <Timer size={24} />
                    </div>
                </div>
            </div>

            {/* AREA KERJA (MAIN GAME) */}
            <div className="bg-white text-black rounded-xl p-8 min-h-[400px] flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
                
                {/* Petunjuk Kunci */}
                <div className="mb-12 w-full">
                    <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">BARIS KUNCI</p>
                    <div className="flex justify-center gap-2 md:gap-6 border-b-2 border-black pb-6">
                        {keyChars.map((char, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-gray-100 rounded-lg text-2xl md:text-3xl font-black shadow-inner border border-gray-300">
                                    {char}
                                </div>
                                <span className="text-xs font-bold text-gray-400">{'ABCDE'[idx]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Soal Tengah (Simulasi) */}
                <div className="text-center mb-12">
                    <p className="text-6xl md:text-8xl font-black tracking-tighter">
                        {/* Di sini harusnya karakter soal yang hilang */}
                        {keyChars[Math.floor(Math.random() * keyChars.length)]} 
                        <span className="text-gray-300 ml-4">?</span>
                    </p>
                    <p className="text-sm font-bold text-gray-400 mt-4 uppercase tracking-widest">TENTUKAN KODE JAWABAN</p>
                </div>

                {/* Input Buttons */}
                <div className="flex gap-4 w-full max-w-lg justify-center">
                    {['A', 'B', 'C', 'D', 'E'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className="flex-1 py-6 bg-black text-white rounded-xl font-black text-2xl hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Keyboard Hint */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-gray-400 text-xs font-mono opacity-50">
                    <Keyboard size={14} /> Gunakan Keyboard A-E
                </div>

                {/* Loading Overlay */}
                {isSubmitting && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white">
                        <Zap size={48} className="animate-spin text-yellow-500 mb-4" />
                        <h3 className="text-xl font-bold uppercase tracking-widest">Mengirim Laporan...</h3>
                    </div>
                )}
            </div>

        </div>
    );
}