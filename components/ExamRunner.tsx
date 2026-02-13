"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Timer, Loader2, AlertTriangle } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  text?: string;
  options?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionE?: string;
  correctAnswer?: string;
}

interface ExamRunnerProps {
  questions: Question[];
  missionId: string;
  duration: number; // Menit
}

export default function ExamRunner({ questions, missionId, duration }: ExamRunnerProps) {
  const router = useRouter();
  
  // State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); 
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Timer Countdown
  useEffect(() => {
    if (isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitting]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getOptions = (q: Question) => {
    if (q.optionA) return [q.optionA, q.optionB, q.optionC, q.optionD, q.optionE].filter(Boolean) as string[];
    if (q.options) return q.options.split(",");
    return [];
  };

  const handleAnswer = (qId: string, idx: number) => {
    if (isSubmitting) return;
    const keyMap = ["A", "B", "C", "D", "E"];
    setAnswers((prev) => ({ ...prev, [qId]: keyMap[idx] }));
  };

  // --- [LOGIKA UPDATE] SINKRONISASI DENGAN ROUTE.TS ---
  const finishExam = async () => {
    setIsSubmitting(true);
    
    try {
        const payload = {
            missionId: missionId,
            userAnswers: answers, // Harus "userAnswers" agar cocok dengan API route.ts
            duration: (duration * 60) - timeLeft 
        };

        const res = await fetch("/api/mission/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // Validasi Response
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Gagal mengirim laporan misi");
        }

        // Redirect ke Halaman Result
        router.push(`/dashboard/mission/${missionId}/result`);

    } catch (error: any) {
        console.error("CRITICAL_SUBMIT_ERROR:", error);
        alert(error.message || "Gagal terhubung ke Markas Pusat. Coba lagi.");
        setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIdx];
  const currentOptions = getOptions(currentQ);
  const progress = ((currentIdx + 1) / questions.length) * 100;

  // LOADING SCREEN (ANALISIS DATA)
  if (isSubmitting) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-white">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                <Loader2 size={64} className="animate-spin text-blue-500 relative z-10" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Menganalisis Data Taktis...</h2>
              <p className="text-gray-400 font-mono text-sm text-center px-6">
                  Sistem sedang memetakan kekuatan & kelemahan Anda berdasarkan standar CAT terbaru.
              </p>
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-8 bg-zinc-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm sticky top-4 z-50">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-white/10 font-black text-xl text-white">
                {currentIdx + 1}<span className="text-xs text-gray-500">/{questions.length}</span>
            </div>
            <div className="hidden md:block">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Mission Progress</p>
                <div className="w-32 h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 60 ? 'bg-red-900/20 text-red-500 animate-pulse' : 'bg-black text-white border border-white/10'}`}>
            <Timer size={18} />
            {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-10 min-h-[400px]">
        <h3 className="text-lg md:text-xl font-medium text-white mb-8 leading-relaxed">
            {currentQ.questionText || currentQ.text}
        </h3>

        <div className="space-y-3">
            {currentOptions.map((opt, idx) => {
                const keyMap = ["A", "B", "C", "D", "E"];
                const isSelected = answers[currentQ.id] === keyMap[idx];
                
                return (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(currentQ.id, idx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 group ${
                            isSelected 
                                ? "bg-blue-600 border-blue-500 text-white" 
                                : "bg-black/50 border-white/10 text-gray-300 hover:bg-white/5"
                        }`}
                    >
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isSelected ? "bg-white text-blue-600" : "bg-white/10 text-gray-500"
                        }`}>
                            {keyMap[idx]}
                        </div>
                        <span className="text-sm md:text-base">{opt}</span>
                    </button>
                )
            })}
        </div>

        <div className="mt-10 flex items-center justify-between pt-6 border-t border-white/5">
            <button 
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="text-gray-500 hover:text-white disabled:opacity-30 font-bold uppercase text-xs tracking-widest px-4 py-2"
            >
                Sebelumnya
            </button>

            {currentIdx === questions.length - 1 ? (
                <button 
                    onClick={finishExam}
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                >
                    Selesaikan Misi <CheckCircle2 size={16} />
                </button>
            ) : (
                <button 
                    onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
                    className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest flex items-center gap-2"
                >
                    Selanjutnya <ChevronRight size={16} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
}