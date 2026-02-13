"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitPsychologyResult } from "@/app/actions/submitPsychology";
import { 
  Timer, ChevronLeft, ChevronRight, Save, 
  CheckCircle2, AlertTriangle, Loader2, LayoutGrid 
} from "lucide-react";

type Question = {
  id: string;
  text: string;
  image?: string | null;
  options: string; // JSON String
};

interface StandardEngineProps {
  packageId: string;
  title: string;
  questions: Question[];
  duration?: number;
}

export default function StandardExamEngine({ packageId, title, questions, duration = 90 }: StandardEngineProps) {
  const router = useRouter();

  // STATE
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // TIMER
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

  // PARSE OPTIONS
  const currentQuestion = questions[currentIndex];
  let parsedOptions = [];
  try {
    parsedOptions = JSON.parse(currentQuestion.options);
  } catch (e) {
    parsedOptions = [];
  }

  // NAVIGASI
  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };
  const handleSelect = (optLabel: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optLabel }));
  };

  // SUBMIT
  const handleSubmit = async (isAuto = false) => {
    if (!isAuto && !confirm("Apakah Anda yakin ingin menyelesaikan ujian ini?")) return;
    setIsSubmitting(true);
    
    let calculatedScore = 0;
    questions.forEach(q => {
      try {
        const opts = JSON.parse(q.options);
        const correctOpt = opts.find((o: any) => o.isCorrect === true || o.isCorrect === "true");
        const userAns = answers[q.id];
        if (correctOpt && userAns === correctOpt.label) calculatedScore += 4;
      } catch(e) {}
    });

    const result = await submitPsychologyResult({
      packageId,
      answers,
      finalScore: calculatedScore
    });

    if (result.success) {
        if (result.success) {
            router.push(`/dashboard/psychology/result/${result.attemptId}`);
        }
      router.refresh();
    } else {
      alert("Gagal menyimpan data: " + result.message);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (showGrid) {
      return (
          <div className="min-h-screen bg-black text-white p-6 z-50 fixed inset-0">
              <div className="max-w-4xl mx-auto mt-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold uppercase tracking-widest text-red-500">NAVIGASI SOAL</h2>
                    <button onClick={() => setShowGrid(false)} className="text-gray-400 hover:text-white text-sm font-bold border border-white/20 px-3 py-1 rounded">TUTUP [X]</button>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 h-[70vh] overflow-y-auto content-start">
                    {questions.map((q, idx) => (
                        <button 
                            key={q.id} 
                            onClick={() => { setCurrentIndex(idx); setShowGrid(false); }}
                            className={`p-3 rounded border text-sm font-bold transition-all ${
                                answers[q.id] 
                                ? "bg-blue-900 border-blue-500 text-white" 
                                : currentIndex === idx ? "bg-white text-black" : "bg-zinc-900 border-zinc-800 text-gray-500 hover:border-white/30"
                            }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      
      {/* TOP BAR (Sticky) */}
      <div className="h-16 border-b border-white/10 bg-zinc-900/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-4">
            <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded text-xs font-black uppercase tracking-widest border border-yellow-500/20">
                SOAL {currentIndex + 1} / {questions.length}
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setShowGrid(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Lihat Grid Soal">
                <LayoutGrid size={20} className="text-gray-400 hover:text-white" />
            </button>
            <div className={`flex items-center gap-2 font-mono text-xl font-black ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                <Timer size={20} /> {formatTime(timeLeft)}
            </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-1 bg-zinc-800 sticky top-16 z-20">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
      </div>

      {/* MAIN CONTENT (PADDING DIKURANGI, JUSTIFY-START) */}
      <div className="flex-grow flex flex-col items-center justify-start pt-6 p-4 sm:px-8 max-w-4xl mx-auto w-full">
        
        {/* PERTANYAAN (MARGIN BAWAH DIPERKECIL) */}
        <div className="w-full mb-6 bg-zinc-900/30 p-4 sm:p-6 rounded-xl border border-white/5">
            <p className="text-base sm:text-lg leading-relaxed font-medium text-gray-100">
                {currentQuestion.text}
            </p>
            {currentQuestion.image && (
                <div className="mt-4 rounded-lg overflow-hidden border border-white/10 bg-black flex justify-center">
                    <img src={currentQuestion.image} alt="Visual Soal" className="max-w-full max-h-[300px] object-contain" />
                </div>
            )}
        </div>

        {/* PILIHAN JAWABAN (GAP DIPERKECIL) */}
        <div className="w-full grid gap-2 sm:gap-3">
            {parsedOptions.map((opt: any, idx: number) => {
                const isSelected = answers[currentQuestion.id] === opt.label;
                return (
                    <button
                        key={idx}
                        onClick={() => handleSelect(opt.label)}
                        className={`w-full p-3 sm:p-4 rounded-xl border flex items-center gap-4 text-left transition-all group ${
                            isSelected 
                            ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] translate-x-1" 
                            : "bg-zinc-900 border-white/10 hover:border-white/30 text-gray-400 hover:text-white hover:bg-zinc-800"
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold border transition-colors ${
                            isSelected ? "bg-white text-blue-600 border-white" : "bg-black border-white/20 group-hover:border-white/50"
                        }`}>
                            {opt.label}
                        </div>
                        <span className="text-sm sm:text-base font-medium">{opt.text}</span>
                    </button>
                )
            })}
        </div>
      </div>

      {/* BOTTOM BAR (FIXED BOTTOM) */}
      <div className="p-4 border-t border-white/10 bg-zinc-900 flex justify-between items-center w-full sticky bottom-0 z-30">
          <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
            <button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
                <ChevronLeft size={16} /> <span className="hidden sm:inline">SEBELUMNYA</span>
            </button>

            {currentIndex === questions.length - 1 ? (
                <button 
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-green-600 text-white hover:bg-green-500 flex items-center gap-2 shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>} SELESAI
                </button>
            ) : (
                <button 
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-white text-black hover:bg-gray-200 flex items-center gap-2 transition-all"
                >
                    <span className="hidden sm:inline">SELANJUTNYA</span> <ChevronRight size={16} />
                </button>
            )}
          </div>
      </div>

    </div>
  );
}