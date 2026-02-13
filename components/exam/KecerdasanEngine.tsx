"use client";

import { useState, useEffect } from "react";
import { 
  Timer, ChevronLeft, ChevronRight, Grid, Play, Save, BrainCircuit, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { submitPsychologyResult } from "@/app/actions/submitPsychology"; 
import VictoryModal from "./VictoryModal"; 

// [NEW] ADAPTOR VISUAL: MENGHANDLE GAMBAR BIASA & SVG CODE
const RenderVisual = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  if (!src) return null;

  // Deteksi jika ini adalah kode SVG mentah
  if (src.trim().startsWith("<svg")) {
    return (
      <div 
        // Force SVG untuk mengisi container
        className={`${className} flex items-center justify-center [&>svg]:w-full [&>svg]:h-full`} 
        dangerouslySetInnerHTML={{ __html: src }} 
        title={alt}
      />
    );
  }

  // Jika bukan SVG code, render sebagai Image biasa (File Path)
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
};

interface EngineProps {
  packageId: string;
  questions: any[]; 
  duration: number; 
}

export default function KecerdasanEngine({ packageId, questions, duration }: EngineProps) {
  const router = useRouter();
  
  // STATE
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({}); 
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // STATE UNTUK VICTORY MODAL
  const [showVictory, setShowVictory] = useState(false);
  const [victoryData, setVictoryData] = useState({
      score: 0,
      xp: 0,
      isLevelUp: false,
      newLevel: 1,
      attemptId: ""
  });

  // TIMER
  useEffect(() => {
    if (!isStarted || showVictory) return; 
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
  }, [isStarted, showVictory]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (label: string) => {
    if (!isSubmitting) setAnswers(prev => ({...prev, [currentIdx]: label}));
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Hitung Skor Lokal
    let correctCount = 0;
    questions.forEach((q, idx) => {
        const userAns = answers[idx];
        const options = JSON.parse(q.options);
        const correctOpt = options.find((o: any) => o.isCorrect);
        if (userAns === correctOpt.label) correctCount += 1; 
    });
    
    const finalScore = Math.round((correctCount / questions.length) * 100);
    const totalMistakes = questions.length - correctCount;

    try {
        // Kita panggil fungsi submit
        const rawResult = await submitPsychologyResult({
            packageId: packageId,
            columnHistory: [], 
            totalMistakes: totalMistakes, 
            finalScoreOverride: finalScore,
            userAnswers: answers 
        } as any);

        // --- TAKTIK BYPASS: Paksa tipe data menjadi 'any' ---
        const result = rawResult as any;

        if (result.success && result.attemptId) {
            setVictoryData({
                score: result.score || 0,       // Sekarang aman dari error
                xp: result.earnedXP || 0,
                isLevelUp: result.isLevelUp || false,
                newLevel: result.newLevel || 1,
                attemptId: result.attemptId
            });
            setShowVictory(true); 
        } else {
            router.push("/dashboard/psychology");
        }
    } catch (e) {
        console.error(e);
        alert("Gagal menyimpan nilai.");
        setIsSubmitting(false);
    }
  };

  // NAVIGASI KE REVIEW
  const handleReviewRedirect = () => {
      router.push(`/dashboard/history/psychology/${victoryData.attemptId}`);
  };

  // --- VIEW 1: INTRO ---
  if (!isStarted) {
     return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse border border-blue-500/20">
                <BrainCircuit className="text-blue-500 w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                TES INTELIGENSI
            </h1>
            <p className="text-gray-500 font-mono text-sm mb-8">
                Jumlah Soal: {questions.length} Butir<br/>
                Waktu: {Math.floor(duration / 60)} Menit<br/>
                Tipe: Pilihan Ganda
            </p>
            <button onClick={() => setIsStarted(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center gap-2">
                <Play size={20} fill="currentColor"/> MULAI TES
            </button>
        </div>
     )
  }

  // --- VIEW 3: VICTORY MODAL ---
  if (showVictory) {
      return (
          <VictoryModal 
              score={victoryData.score}
              xp={victoryData.xp}
              isLevelUp={victoryData.isLevelUp}
              newLevel={victoryData.newLevel}
              onReview={handleReviewRedirect}
          />
      )
  }

  // --- VIEW 2: EXAM INTERFACE ---
  const currentQ = questions[currentIdx];
  const options = JSON.parse(currentQ.options); 

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        {/* HUD ATAS */}
        <div className="bg-zinc-900 border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-20">
            <div className="text-blue-500 font-black text-xl flex items-center gap-2">
                <Grid size={20}/> SOAL {currentIdx + 1} <span className="text-gray-600 text-sm">/ {questions.length}</span>
            </div>
            <div className={`font-mono text-xl font-bold flex items-center gap-2 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                <Timer size={20}/> {formatTime(timeLeft)}
            </div>
        </div>

        {/* AREA KERJA */}
        <div className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
            <div className="flex-1 space-y-6">
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 min-h-[300px] flex flex-col">
                    {/* [UPDATED] Menggunakan RenderVisual */}
                    {currentQ.image && (
                        <div className="w-full mb-6 flex justify-center bg-white/5 rounded-xl p-4">
                             <RenderVisual 
                                src={currentQ.image} 
                                alt="Soal Visual" 
                                className="max-h-[300px] w-auto object-contain" 
                             />
                        </div>
                    )}
                    <p className="text-lg font-medium text-gray-200 leading-relaxed font-serif tracking-wide">
                        {currentQ.question}
                    </p>
                </div>
            </div>

            <div className="lg:w-[400px] space-y-3">
                {options.map((opt: any, idx: number) => {
                    const isSelected = answers[currentIdx] === opt.label;
                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(opt.label)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group relative overflow-hidden
                                ${isSelected 
                                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                                    : "bg-zinc-900 border-white/10 text-gray-400 hover:bg-zinc-800 hover:border-white/20"
                                }
                            `}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border shrink-0 z-10
                                ${isSelected ? "bg-white text-blue-600 border-white" : "bg-black border-white/20"}
                            `}>
                                {opt.label}
                            </div>
                            <div className="flex-1 z-10">
                                {/* [UPDATED] Menggunakan RenderVisual */}
                                {opt.image ? (
                                    <RenderVisual 
                                        src={opt.image} 
                                        alt={opt.label} 
                                        className="h-12 w-auto object-contain" 
                                    />
                                ) : (
                                    <span className="text-sm font-medium">{opt.text}</span>
                                )}
                            </div>
                        </button>
                    )
                })}

                <div className="flex justify-between pt-6 mt-6 border-t border-white/5">
                    <button 
                        disabled={currentIdx === 0}
                        onClick={() => setCurrentIdx(p => p - 1)}
                        className="px-6 py-3 rounded-lg bg-zinc-800 text-white font-bold text-xs uppercase hover:bg-zinc-700 disabled:opacity-30 flex items-center gap-2"
                    >
                        <ChevronLeft size={16}/> Prev
                    </button>

                    {currentIdx === questions.length - 1 ? (
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-lg bg-green-600 text-white font-black text-xs uppercase hover:bg-green-500 flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin"/> : <><Save size={16}/> SELESAI</>}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentIdx(p => p + 1)}
                            className="px-6 py-3 rounded-lg bg-white text-black font-bold text-xs uppercase hover:bg-gray-200 flex items-center gap-2"
                        >
                            Next <ChevronRight size={16}/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}