"use client";

import { useState, useEffect } from "react";
import { Timer, ChevronLeft, ChevronRight, Grid, Save, Loader2, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { submitTryoutResult } from "@/app/actions/submitTryout";
import { toast } from "sonner";

interface Question {
  id: string;
  type: string; // TWK, TIU, TKP
  text: string;
  options: { code: string; text: string }[];
}

interface CatProps {
  packageId: string;
  questions: Question[]; // Semua soal (sudah diacak/urut di server)
  duration: number; // Detik (e.g. 100 menit = 6000)
}

export default function SkdCatEngine({ packageId, questions, duration }: CatProps) {
  const router = useRouter();
  
  // State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: "A" }
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile grid

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                handleSubmit();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Waktu (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Logic Submit
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Format jawaban untuk server
    const payload = Object.entries(answers).map(([qId, code]) => ({
        questionId: qId,
        optionCode: code
    }));

    const result = await submitTryoutResult(packageId, payload, duration - timeLeft);

    if (result.success) {
        toast.success("UJIAN SELESAI", { description: `Skor Total: ${result.score}` });
        router.push(`/dashboard/history/skd/${result.attemptId}`);
    } else {
        toast.error("GAGAL KIRIM", { description: "Periksa koneksi internet Anda." });
        setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIdx];
  
  // Hitung statistik
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] lg:bg-[#0a0a0a] text-zinc-800 lg:text-zinc-200 flex flex-col font-sans">
      
      {/* HEADER (CAT STYLE) */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 shadow-md sticky top-0 z-30 flex justify-between items-center">
        <div>
            <h1 className="font-bold text-lg leading-tight">CAT SYSTEM</h1>
            <p className="text-xs text-blue-200 font-mono">Corps Praja Academy</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-[10px] uppercase font-bold text-blue-300">Sisa Waktu</p>
                <p className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                </p>
            </div>
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 bg-white/10 rounded-lg lg:hidden"
            >
                <Grid size={20}/>
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* MAIN AREA (SOAL) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                
                {/* INFO BAR SOAL */}
                <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 lg:bg-blue-900 lg:text-blue-100 rounded text-xs font-bold uppercase">
                        {currentQ.type}
                    </span>
                    <span className="text-sm font-bold text-gray-500">
                        Soal No. {currentIdx + 1} / {questions.length}
                    </span>
                </div>

                {/* TEXT SOAL */}
                <div className="bg-white lg:bg-zinc-900 border border-gray-200 lg:border-white/10 rounded-2xl p-6 lg:p-8 shadow-sm mb-6 min-h-[200px]">
                    <p className="text-lg lg:text-xl font-medium leading-relaxed whitespace-pre-wrap">
                        {currentQ.text}
                    </p>
                </div>

                {/* OPSI JAWABAN */}
                <div className="space-y-3">
                    {currentQ.options.map((opt) => {
                        const isSelected = answers[currentQ.id] === opt.code;
                        return (
                            <button
                                key={opt.code}
                                onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.code }))}
                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group
                                    ${isSelected 
                                        ? "bg-blue-600 border-blue-600 text-white shadow-lg" 
                                        : "bg-white lg:bg-zinc-900 border-gray-200 lg:border-white/10 hover:bg-gray-50 lg:hover:bg-zinc-800"
                                    }
                                `}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border
                                    ${isSelected ? "bg-white text-blue-600 border-white" : "bg-gray-100 lg:bg-black text-gray-500 border-gray-300 lg:border-zinc-700"}
                                `}>
                                    {opt.code}
                                </div>
                                <span className={`text-base mt-1 ${isSelected ? 'text-white' : 'text-gray-700 lg:text-gray-300'}`}>
                                    {opt.text}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* NAVIGASI BAWAH */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 lg:border-white/5">
                    <button 
                        disabled={currentIdx === 0}
                        onClick={() => setCurrentIdx(p => p - 1)}
                        className="px-6 py-3 bg-gray-200 lg:bg-zinc-800 text-gray-700 lg:text-white rounded-lg font-bold text-sm hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
                    >
                        <ChevronLeft size={16}/> SEBELUMNYA
                    </button>

                    <button 
                        disabled={currentIdx === questions.length - 1}
                        onClick={() => setCurrentIdx(p => p + 1)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:hidden flex items-center gap-2"
                    >
                        SELANJUTNYA <ChevronRight size={16}/>
                    </button>
                </div>

            </div>
        </main>

        {/* SIDEBAR (NOMOR SOAL) */}
        <aside className={`
            fixed inset-y-0 right-0 w-80 bg-white lg:bg-zinc-950 border-l border-gray-200 lg:border-white/10 transform transition-transform z-40
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0 lg:block flex flex-col
        `}>
            <div className="p-4 border-b border-gray-200 lg:border-white/10 flex justify-between items-center bg-gray-50 lg:bg-zinc-900">
                <span className="font-bold text-sm">NAVIGASI SOAL</span>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">Tutup</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                        const isAnswered = answers[q.id];
                        const isCurrent = currentIdx === idx;
                        return (
                            <button
                                key={q.id}
                                onClick={() => { setCurrentIdx(idx); setSidebarOpen(false); }}
                                className={`
                                    h-10 w-full rounded-lg text-xs font-bold border transition-all
                                    ${isCurrent 
                                        ? "ring-2 ring-blue-500 bg-transparent" 
                                        : ""
                                    }
                                    ${isAnswered
                                        ? "bg-green-500 text-white border-green-600"
                                        : "bg-gray-100 lg:bg-zinc-900 text-gray-500 lg:text-gray-400 border-gray-200 lg:border-white/10 hover:bg-gray-200"
                                    }
                                `}
                            >
                                {idx + 1}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 lg:border-white/10 bg-gray-50 lg:bg-zinc-900">
                <div className="mb-4 text-xs flex justify-between text-gray-500">
                    <span>Terjawab: <b>{answeredCount}</b></span>
                    <span>Kosong: <b>{questions.length - answeredCount}</b></span>
                </div>
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="animate-spin"/> : <><Save size={18}/> SELESAI UJIAN</>}
                </button>
            </div>
        </aside>

      </div>
    </div>
  );
}