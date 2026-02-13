"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitExam } from "@/lib/actions";
import { Clock, ChevronLeft, ChevronRight, Save, AlertTriangle, CheckCircle } from "lucide-react";

export default function QuizCore({ mission, questions, userId }: any) {
  const router = useRouter();
  
  // STATE
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(mission.duration * 60); // Detik
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TIMER LOGIC
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish(true); // Force finish if time is up
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // FORMAT WAKTU (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // HANDLE JAWAB
  const handleOptionSelect = (optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].id]: optionIdx
    }));
  };

  // HANDLE SUBMIT
  const handleFinish = async (force = false) => {
    if (isSubmitting) return;
    
    // Konfirmasi hanya jika bukan force finish (habis waktu)
    if (!force && !confirm("Yakin ingin menyelesaikan ujian? Waktu akan dihentikan.")) return;

    setIsSubmitting(true);
    try {
      const result = await submitExam(mission.id, answers);
      
      if (result.success) {
        // --- UPDATE PENTING: Redirect ke Halaman Result ---
        // Bukan alert biasa, tapi pindah halaman agar lebih dramatis
        router.push(`/dashboard/mission/result/${result.attemptId}`); 
      } else {
        alert("Gagal menyimpan nilai. Silakan coba lagi.");
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan sistem.");
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6">
      
      {/* KIRI: AREA SOAL */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
         {/* Header Soal */}
         <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-black text-white">
              SOAL NO. <span className="text-blue-500 text-3xl">{currentIndex + 1}</span>
            </h2>
            <span className="text-xs font-bold px-3 py-1 bg-white/10 rounded text-gray-400">
               {currentQ.type} 
               {currentQ.subType && <span className="text-blue-400"> • {currentQ.subType}</span>}
            </span>
         </div>

         {/* Teks Soal */}
         <div className="flex-grow overflow-y-auto mb-6 pr-2">
            <p className="text-lg text-gray-200 leading-relaxed font-serif">
              {currentQ.text}
            </p>
         </div>

         {/* Pilihan Ganda */}
         <div className="space-y-3">
            {currentQ.options.split(",").map((opt: string, idx: number) => {
               const isSelected = answers[currentQ.id] === idx;
               const labels = ["A", "B", "C", "D", "E"];
               return (
                 <button
                   key={idx}
                   onClick={() => handleOptionSelect(idx)}
                   className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group ${
                     isSelected 
                       ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                       : "bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/30 text-gray-300"
                   }`}
                 >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isSelected ? "bg-white text-blue-600" : "bg-white/10 text-gray-500"
                    }`}>
                        {labels[idx]}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                 </button>
               )
            })}
         </div>

         {/* Navigasi Bawah */}
         <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
            <button 
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <ChevronLeft size={16}/> Sebelumnya
            </button>
            
            {currentIndex === questions.length - 1 ? (
               <button 
                 onClick={() => handleFinish(false)}
                 disabled={isSubmitting}
                 className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-900/20"
               >
                 {isSubmitting ? "Menyimpan..." : "Selesai & Kumpulkan"} <Save size={16}/>
               </button>
            ) : (
               <button 
                 onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                 className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-900/20"
               >
                 Selanjutnya <ChevronRight size={16}/>
               </button>
            )}
         </div>
      </div>

      {/* KANAN: NAVIGASI & TIMER */}
      <div className="w-full lg:w-80 space-y-6">
         
         {/* Timer Card */}
         <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-2xl text-center relative overflow-hidden">
            <div className={`absolute inset-0 opacity-20 ${timeLeft < 300 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`}></div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2 relative z-10">
               <Clock size={14}/> Sisa Waktu
            </h3>
            <div className={`text-4xl font-black font-mono relative z-10 ${timeLeft < 300 ? 'text-red-500' : 'text-white'}`}>
               {formatTime(timeLeft)}
            </div>
         </div>

         {/* Info Progress */}
         <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
             <div className="text-xs text-gray-400">Terjawab</div>
             <div className="text-sm font-bold text-white">
                <span className="text-green-500">{answeredCount}</span> / {questions.length}
             </div>
         </div>

         {/* Grid Nomor Soal */}
         <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Navigasi Soal</h3>
            <div className="grid grid-cols-5 gap-2">
               {questions.map((_: any, idx: number) => {
                  const isAnswered = answers[questions[idx].id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-lg text-xs font-bold transition-all ${
                        isCurrent 
                          ? "bg-white text-black border-2 border-blue-500 scale-110 shadow-lg" 
                          : isAnswered 
                            ? "bg-green-600 text-white border border-green-500" 
                            : "bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
               })}
            </div>
         </div>

         <button 
            onClick={() => handleFinish(false)} 
            disabled={isSubmitting}
            className="w-full py-4 border border-red-500/30 text-red-500 hover:bg-red-900/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
         >
            Hentikan Ujian
         </button>

      </div>

    </div>
  );
}