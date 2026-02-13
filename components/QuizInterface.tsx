"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitExam } from "@/lib/actions";
import ExamResultModal from "@/components/ExamResultModal"; // Import Modal Baru

export default function QuizInterface({ mission, questions }: any) {
  const router = useRouter();
  
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(mission.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Hasil Ujian
  const [resultData, setResultData] = useState<any>(null);

  // Timer Countdown
  useEffect(() => {
    if (resultData) return; // Stop timer kalau sudah selesai

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto submit (force)
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resultData]); // Dependency

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (idx: number) => {
    const qId = questions[currentIndex].id;
    setAnswers({ ...answers, [qId]: idx });
  };

  const handleSubmit = async (force = false) => {
    if (!force && !confirm("Apakah Anda yakin ingin mengakhiri ujian ini?")) return;
    
    setIsSubmitting(true);
    try {
      const result = await submitExam(mission.id, answers);
      
      if (result.success) {
        // SIMPAN DATA HASIL & TAMPILKAN MODAL
        setResultData(result);
      } else {
        alert("Gagal mengirim jawaban.");
        setIsSubmitting(false); // Reset loading jika gagal
      }
    } catch (e) {
      alert("Error jaringan.");
      setIsSubmitting(false);
    }
  };

  // --- REDIRECT KE HALAMAN PEMBAHASAN ---
  const handleGoToReview = () => {
    if (resultData && resultData.attemptId) {
      router.push(`/dashboard/mission/${mission.id}/review/${resultData.attemptId}`);
    }
  };

  // JIKA SUDAH ADA HASIL, TAMPILKAN MODAL
  if (resultData) {
    return (
      <ExamResultModal 
        score={resultData.score} 
        xp={resultData.xp} 
        passed={resultData.passed} 
        onReview={handleGoToReview} 
      />
    );
  }

  const currentQ = questions[currentIndex];
  const options = currentQ.options.split(",");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      
      {/* AREA SOAL (KIRI) */}
      <div className="lg:col-span-3 flex flex-col h-full">
        
        {/* Header Soal */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            SOAL NO. {currentIndex + 1}
            <span className="ml-4 text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded border border-blue-500/50">
              {currentQ.type}
            </span>
            {currentQ.isHOTS && (
              <span className="ml-2 text-xs bg-red-900 text-red-300 px-2 py-1 rounded border border-red-500/50 animate-pulse">
                🔥 HOTS
              </span>
            )}
          </h2>
          <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg border ${timeLeft < 60 ? "text-red-500 border-red-500 animate-pulse" : "text-yellow-500 border-yellow-500/30 bg-black/50"}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Isi Soal */}
        <div className="flex-1 bg-black/40 border-x border-white/10 p-8 overflow-y-auto">
          <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">
            {currentQ.text}
          </p>
          {currentQ.imgUrl && (
             <div className="mt-4 p-2 bg-white rounded-lg inline-block">
                <div className="w-64 h-32 bg-gray-300 flex items-center justify-center text-black text-xs">
                  [GAMBAR SOAL]
                </div>
             </div>
          )}
        </div>

        {/* Pilihan Jawaban */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-b-xl space-y-3">
          {options.map((opt: string, idx: number) => {
            const isSelected = answers[currentQ.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-4 group ${
                  isSelected 
                    ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                    : "bg-black/40 border-white/10 hover:bg-white/10 hover:border-white/30 text-gray-300"
                }`}
              >
                <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                  isSelected ? "bg-white text-blue-600" : "bg-white/10 text-gray-400 group-hover:bg-white/20"
                }`}>
                  {String.fromCharCode(65 + idx)} 
                </div>
                <span className="text-sm font-medium">{opt}</span>
              </button>
            )
          })}
        </div>

        {/* Tombol Navigasi Bawah */}
        <div className="flex justify-between mt-4">
           <button 
             disabled={currentIndex === 0}
             onClick={() => setCurrentIndex(c => c - 1)}
             className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30"
           >
             ⬅️ SEBELUMNYA
           </button>
           
           {currentIndex === questions.length - 1 ? (
             <button 
               onClick={() => handleSubmit(false)}
               disabled={isSubmitting}
               className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)]"
             >
               {isSubmitting ? "MEMPROSES..." : "SELESAI UJIAN 🏁"}
             </button>
           ) : (
             <button 
               onClick={() => setCurrentIndex(c => c + 1)}
               className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg"
             >
               SELANJUTNYA ➡️
             </button>
           )}
        </div>
      </div>

      {/* PANEL NAVIGASI (KANAN) */}
      <div className="hidden lg:block bg-white/5 border border-white/10 rounded-xl p-4 h-fit">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">NAVIGASI SOAL</h3>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q: any, idx: number) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = currentIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-10 w-10 rounded text-xs font-bold transition-all border ${
                  isCurrent 
                    ? "border-yellow-500 text-yellow-500 bg-yellow-900/20 scale-110 shadow-yellow-500/40" 
                    : isAnswered 
                      ? "bg-green-600 border-green-500 text-white" 
                      : "bg-black/40 border-white/10 text-gray-500 hover:bg-white/10"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}