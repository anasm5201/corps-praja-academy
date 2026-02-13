"use client";

import { useState, useEffect } from "react";
import { 
  Timer, Award, Zap, Activity, Target, AlertTriangle, 
  BarChart3, ChevronLeft, ChevronRight, Crosshair, 
  ShieldAlert, MonitorPlay, Save
} from "lucide-react";
import { toast } from "sonner";
import { submitExam } from "@/app/actions/submitExam"; 
import { useRouter } from "next/navigation";

// --- GUDANG VISUAL KECERMATAN (Auto-Shuffle) ---
const MASTER_POOLS: any = {
    ANGKA: [
        ["0", "1", "2", "3", "4"], ["5", "6", "7", "8", "9"], ["8", "6", "4", "2", "0"], 
        ["9", "7", "5", "3", "1"], ["1", "2", "5", "6", "9"], ["3", "4", "7", "8", "0"], 
        ["2", "3", "5", "7", "8"], ["1", "4", "6", "9", "0"], ["5", "0", "4", "1", "6"], 
        ["9", "8", "7", "2", "3"],
    ],
    HURUF: [
        ["A", "B", "C", "D", "E"], ["K", "L", "M", "N", "O"], ["P", "Q", "R", "S", "T"], 
        ["V", "W", "X", "Y", "Z"], ["F", "G", "H", "I", "J"], ["M", "N", "B", "V", "C"], 
        ["R", "S", "T", "U", "V"], ["H", "J", "K", "L", "P"], ["Q", "W", "E", "R", "T"], 
        ["Z", "X", "C", "V", "B"],
    ],
    SIMBOL: [
        ["★", "▲", "●", "■", "♦"], ["♠", "♣", "♥", "♦", "⚜"], ["☀", "☁", "☂", "☃", "☄"], 
        ["♔", "♕", "♖", "♗", "♘"], ["⚀", "⚁", "⚂", "⚃", "⚄"], ["⬆", "⬇", "⬅", "➡", "⬈"], 
        ["✂", "✈", "✉", "✎", "✒"], ["☮", "☯", "aa", "☣", "☤"], ["➀", "➁", "➂", "➃", "➄"], 
        ["➊", "➋", "➌", "➍", "➎"],
    ]
};

interface Question {
  id: string;
  text: string;
  options: any[]; 
  image?: string | null;
  svgCode?: string | null;
  type: string; 
  correctAnswer?: string; 
}

interface Package {
  id: string;
  title: string;
  category: string; 
  duration: number; 
}

interface ExamProps {
  pkg: Package;
  questions: Question[];
  attemptId: string;
  savedAnswers: Record<string, number>; 
  user: any;
  endTime: string; 
}

export default function ExamInterface({ pkg, questions, attemptId, savedAnswers, user, endTime }: ExamProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  // 🔥 DETEKSI MODE CERDAS
  const titleUpper = pkg.title.toUpperCase();
  const catUpper = (pkg.category || "").toUpperCase();
  const isKecermatan = ["KECERMATAN", "ANGKA", "HURUF", "SIMBOL", "SPEED", "KORAN"].some(keyword => 
      titleUpper.includes(keyword) || catUpper.includes(keyword)
  );
  
  const getPoolType = () => {
      if (titleUpper.includes("ANGKA")) return "ANGKA";
      if (titleUpper.includes("HURUF")) return "HURUF";
      return "SIMBOL"; 
  };
  const poolType = getPoolType();

  const [answers, setAnswers] = useState<Record<string, number>>(savedAnswers || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);

  // --- CONFIG KECERMATAN ---
  const TOTAL_KOLOM = 10; 
  const DURASI_PER_KOLOM = 60; 
  const MAX_SOAL_PER_KOLOM = 50; 

  const [currentCol, setCurrentCol] = useState(1);
  const [colTimeLeft, setColTimeLeft] = useState(DURASI_PER_KOLOM); 
  const [currentIdxInCol, setCurrentIdxInCol] = useState(0); 
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  // --- CONFIG STANDARD MODE ---
  const [stdCurrentIndex, setStdCurrentIndex] = useState(0);
  
  // Hitung waktu sisa (Standard Mode Only)
  const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      // Safeguard: Jika endTime invalid/masa lalu, beri waktu default 1 jam agar tidak auto-close
      if (isNaN(end) || end < now) return 3600; 
      const diff = Math.floor((end - now) / 1000);
      return diff > 0 ? diff : 0;
  };
  const [stdTimeLeft, setStdTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => { setIsMounted(true); }, []);

  // ==================================================================================
  // ⚙️ ENGINE 1: KECERMATAN (Anti-Duplikasi & Timer Kolom)
  // ==================================================================================
  
  // Select Soal Anti-Duplikasi
  useEffect(() => {
      if (!isKecermatan || !questions || questions.length === 0) return;
      const rawIndex = ((currentCol - 1) * MAX_SOAL_PER_KOLOM) + currentIdxInCol;
      let selectedIndex = rawIndex % questions.length;
      let candidate = questions[selectedIndex];
      if (activeQuestion && candidate.id === activeQuestion.id && questions.length > 1) {
          const nextIndex = (selectedIndex + 1) % questions.length;
          candidate = questions[nextIndex];
      }
      setActiveQuestion(candidate);
  }, [currentCol, currentIdxInCol, questions, isKecermatan]);

  // Timer Kecermatan (Per Kolom)
  useEffect(() => {
    if (!isMounted || isFinished || !isKecermatan) return;
    const timer = setInterval(() => {
      setColTimeLeft((prev) => {
        if (prev <= 1) {
          goToNextColumn();
          return DURASI_PER_KOLOM; 
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentCol, isFinished, isMounted, isKecermatan]);

  const goToNextColumn = () => {
      if (currentCol < TOTAL_KOLOM) {
          const nextCol = currentCol + 1;
          setCurrentCol(nextCol);
          setCurrentIdxInCol(0); 
          setColTimeLeft(DURASI_PER_KOLOM); 
          toast.info(`PINDAH KOLOM! FOKUS KUNCI BARU.`, { duration: 1500, icon: <Zap className="text-yellow-500"/> });
      } else {
          finishExam();
      }
  };

  const handleSelectOptionDrill = (clickedBtnIndex: number) => {
    if (isFinished || !activeQuestion) return;
    const keyLabels = ['A', 'B', 'C', 'D', 'E'];
    const dbCorrectIndex = keyLabels.indexOf(activeQuestion.correctAnswer || 'A');
    const uniqueKey = `${currentCol}-${currentIdxInCol}`; 
    const isCorrect = clickedBtnIndex === dbCorrectIndex ? 1 : 0;
    setAnswers(prev => ({ ...prev, [uniqueKey]: isCorrect }));
    
    if (currentIdxInCol < MAX_SOAL_PER_KOLOM - 1) {
        // Pindah soal tanpa delay (Instant)
        setCurrentIdxInCol(prev => prev + 1);
    } else {
        toast.warning("Tunggu instruksi Pindah!");
    }
  };

  // ==================================================================================
  // ⚙️ ENGINE 2: STANDARD MODE (Timer Global)
  // ==================================================================================
  useEffect(() => {
    if (isKecermatan || isFinished || !isMounted) return;
    const timer = setInterval(() => {
      setStdTimeLeft((prev) => {
          if (prev <= 1) {
              clearInterval(timer);
              finishExam();
              return 0;
          }
          return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, isKecermatan, isMounted]);

  const handleSelectOptionStd = (idx: number) => {
    if (isFinished) return;
    const qId = questions[stdCurrentIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  // ==================================================================================
  // 🏁 SUBMISSION SYSTEM
  // ==================================================================================
  const finishExam = async () => {
    if (isSubmitting) return; 
    setIsSubmitting(true);
    
    // Hitung Skor Lokal
    let totalCorrect = 0;
    if (isKecermatan) {
        totalCorrect = Object.values(answers).reduce((a, b) => a + b, 0);
    } else {
        questions.forEach(q => {
            const char = String.fromCharCode(65 + (answers[q.id] || -1));
            if (char === q.correctAnswer) totalCorrect++;
        });
    }
    
    setExamResult({ score: totalCorrect });
    setIsFinished(true);
    
    // Kirim ke Server
    await submitExam(attemptId, answers);
  };

  const formatTime = (s: number) => {
      if (!isKecermatan) {
          const h = Math.floor(s / 3600);
          const m = Math.floor((s % 3600) / 60);
          const sec = s % 60;
          return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
      }
      return `00:${s.toString().padStart(2,'0')}`;
  };

  if (!isMounted) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500 font-mono text-xs animate-pulse">SYSTEM LOADING...</div>;

  // -------------------------------------------------------------------------
  // 📊 HALAMAN HASIL (COMMON)
  // -------------------------------------------------------------------------
  if (isFinished) {
     if (isKecermatan) {
         // Grafik Analisa Kecermatan
         const stats = Array.from({ length: TOTAL_KOLOM }, (_, i) => {
             const colNum = i + 1;
             let correct = 0;
             let total = 0;
             Object.keys(answers).forEach(key => {
                 if (key.startsWith(`${colNum}-`)) {
                     total++;
                     if (answers[key] === 1) correct++;
                 }
             });
             return { col: colNum, correct, total };
         });
         const maxVal = Math.max(...stats.map(s => s.total), 40); 
         const totalCorrect = stats.reduce((acc, s) => acc + s.correct, 0);
         const points = stats.map((s, i) => `${(i / (TOTAL_KOLOM - 1)) * 100},${100 - ((s.correct / maxVal) * 100)}`).join(" ");

         return (
            <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#000]"></div>
                <div className="max-w-5xl w-full bg-[#080808] border border-zinc-800 p-8 rounded-3xl relative z-10 shadow-2xl">
                    <div className="flex justify-between items-start mb-10 border-b border-white/5 pb-6">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-widest text-white flex gap-2"><Activity className="text-yellow-500"/> Laporan Psikogram</h2>
                            <p className="text-zinc-500 font-mono text-xs mt-1">MODUL: KECERMATAN</p>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-black text-white">{totalCorrect}</div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-2">POIN EFEKTIF</div>
                        </div>
                    </div>
                    <div className="relative h-64 w-full mb-10 pl-2 pr-2">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/></linearGradient>
                            </defs>
                            {[0, 25, 50, 75, 100].map(pos => (<line key={pos} x1="0%" y1={`${pos}%`} x2="100%" y2={`${pos}%`} stroke="#333" strokeDasharray="4" strokeWidth="1" />))}
                            {stats.map((s, i) => {
                                const xPos = `${(i / (TOTAL_KOLOM - 1)) * 100}%`;
                                const barHeight = `${(s.correct / maxVal) * 100}%`;
                                const yPos = 100 - (s.correct / maxVal) * 100;
                                return (
                                    <g key={i}>
                                        <rect x={`calc(${xPos} - 1.5%)`} y={`${yPos}%`} width="3%" height={barHeight} fill="url(#barGradient)" rx="2"/>
                                        <circle cx={xPos} cy={`${yPos}%`} r="4" fill="#fbbf24" stroke="#000" strokeWidth="2" className="drop-shadow-lg z-20"/>
                                        <text x={xPos} y={`${yPos - 5}%`} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{s.correct}</text>
                                        <text x={xPos} y="110%" textAnchor="middle" fill="#666" fontSize="10" fontFamily="monospace">K{s.col}</text>
                                    </g>
                                );
                            })}
                            <polyline points={points} fill="none" stroke="#fbbf24" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-md"/>
                        </svg>
                    </div>
                    <button onClick={() => router.push('/dashboard/tryout')} className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-[0.2em] transition rounded-lg shadow-lg">KEMBALI KE MARKAS</button>
                </div>
            </div>
         );
     } else {
         // Hasil Standard (Ringkas)
         return (
            <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6 text-center">
                <Award size={64} className="text-yellow-500 mb-6" />
                <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">MISI TUNTAS</h2>
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm mb-8">
                    <p className="text-xs text-zinc-500 font-bold uppercase mb-2">Skor Akhir</p>
                    <p className="text-6xl font-black text-white">{examResult?.score || 0}</p>
                </div>
                <button onClick={() => router.push('/dashboard/tryout')} className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-zinc-200 transition">KEMBALI KE MARKAS</button>
            </div>
         );
     }
  }

  // ==================================================================================
  // 🅰️ UI: MODE KECERMATAN (VISUAL DINAMIS)
  // ==================================================================================
  if (isKecermatan && activeQuestion) {
      const poolIndex = (currentCol - 1) % 10;
      const currentSymbolSet = MASTER_POOLS[poolType] ? MASTER_POOLS[poolType][poolIndex] : MASTER_POOLS["SIMBOL"][0];
      const keyLabels = ['A', 'B', 'C', 'D', 'E'];
      const correctChar = activeQuestion.correctAnswer || 'A';
      const correctIdx = keyLabels.indexOf(correctChar); 
      const questionDisplaySymbols = currentSymbolSet.filter((_:any, i:number) => i !== correctIdx);
      while (questionDisplaySymbols.length < 4) questionDisplaySymbols.push("?"); 

      return (
        <div key={currentCol} className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative overflow-hidden selection:bg-none">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
             
             {/* Header */}
             <div className="flex justify-between items-center p-4 md:px-8 border-b border-white/10 bg-[#050505] z-20">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">KOLOM</span>
                    <span className="text-xl font-black text-white leading-none">{currentCol} <span className="text-zinc-600 text-sm">/ {TOTAL_KOLOM}</span></span>
                 </div>
                 <div className={`flex items-center gap-3 px-4 py-2 rounded border font-mono font-bold text-xl ${colTimeLeft <= 10 ? 'bg-red-900/20 text-red-500 border-red-500 animate-pulse' : 'bg-zinc-900 text-yellow-500 border-zinc-700'}`}>
                    <Timer size={20}/> {formatTime(colTimeLeft)}
                 </div>
             </div>

             {/* Arena */}
             <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-xl mx-auto z-10 space-y-6">
                 {/* Kunci */}
                 <div className="w-full bg-zinc-900/80 border border-white/10 p-5 rounded-xl relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-50"></div>
                     <p className="text-[10px] text-center text-zinc-500 font-black uppercase tracking-[0.3em] mb-4">REFERENSI KUNCI</p>
                     <div className="flex justify-between gap-2">
                         {currentSymbolSet.map((char: any, idx: number) => (
                             <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                                 <div className="w-full aspect-square flex items-center justify-center bg-black border border-zinc-700 rounded-lg text-3xl font-black text-white shadow-inner">{char}</div>
                                 <div className="w-6 h-6 flex items-center justify-center text-[10px] font-black text-black bg-white rounded-full">{keyLabels[idx]}</div>
                             </div>
                         ))}
                     </div>
                 </div>
                 {/* Soal */}
                 <div className="w-full bg-black/40 border border-white/5 p-6 rounded-xl text-center">
                     <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-4">MANA YANG HILANG?</p>
                     <div className="flex justify-center gap-3 md:gap-4">
                         {questionDisplaySymbols.slice(0,4).map((char: any, idx: number) => (
                             <div key={idx} className="w-16 h-16 flex items-center justify-center bg-zinc-800 border border-zinc-600 rounded-lg text-3xl font-black text-zinc-400 opacity-80">{char}</div>
                         ))}
                         <div className="w-16 h-16 flex items-center justify-center bg-yellow-900/10 border-2 border-dashed border-yellow-600 text-yellow-600 rounded-lg animate-pulse"><AlertTriangle size={24}/></div>
                     </div>
                 </div>
                 {/* Input */}
                 <div className="w-full relative z-[999]">
                     <div className="grid grid-cols-5 gap-3">
                         {keyLabels.map((key, idx) => (
                             <button key={key} onClick={() => handleSelectOptionDrill(idx)} className="h-20 bg-zinc-900 border-b-4 border-zinc-950 rounded-lg flex flex-col items-center justify-center hover:bg-white hover:text-black hover:border-b-0 hover:translate-y-1 transition-all active:scale-95 group cursor-pointer">
                                 <span className="text-3xl font-black text-zinc-400 group-hover:text-black">{key}</span>
                             </button>
                         ))}
                     </div>
                 </div>
             </div>
             <div className="absolute bottom-0 w-full pointer-events-none">
                <div className="h-1 bg-zinc-800 w-full">
                    <div className="h-full bg-yellow-600 transition-all duration-100 ease-linear" style={{ width: `${((currentIdxInCol + 1) / MAX_SOAL_PER_KOLOM) * 100}%` }}></div>
                </div>
             </div>
        </div>
      );
  }

  // ==================================================================================
  // 🅱️ UI: MODE STANDARD (COCKPIT MODE) - FULL RESTORE
  // ==================================================================================
  const stdQ = questions[stdCurrentIndex];
  if (!stdQ) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">MEMUAT SOAL STANDARD...</div>;

  const svgData = stdQ.svgCode;
  const hasSvg = svgData && svgData.length > 20;
  const isSingleSvgMode = !!hasSvg;

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-red-500/30 overflow-hidden relative">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="fixed inset-0 bg-gradient-to-b from-[#020202] via-transparent to-[#020202] pointer-events-none"></div>

        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 p-4 lg:p-8 max-w-[1600px] mx-auto relative z-10">
            <div className="lg:col-span-9 flex flex-col h-full min-h-[85vh]">
                <div className="mb-6 flex justify-between items-center border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-zinc-900 border border-zinc-700 px-3 py-1 text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">NO. <span className="text-white text-lg">{stdCurrentIndex + 1}</span> <span className="text-zinc-600">/ {questions.length}</span></div>
                        <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/50 px-3 py-1 rounded border border-zinc-800"><Target size={12} className="text-red-500"/> {stdQ.type}</div>
                    </div>
                </div>
                <div className="flex-1 bg-[#080808] border border-zinc-800 relative flex flex-col p-6 md:p-10 shadow-2xl group">
                    <h3 className="text-lg md:text-2xl text-zinc-200 font-medium leading-relaxed mb-8 select-none font-sans">{stdQ.text}</h3>
                    {(hasSvg || stdQ.image) && (
                        <div className="w-full mb-10 flex justify-center bg-black/50 border border-dashed border-zinc-800 p-6 min-h-[200px] relative">
                             {isSingleSvgMode ? (
                                <div className="w-full max-w-2xl flex items-center justify-center"><div className="w-full [&>svg]:w-full [&>svg]:h-auto text-zinc-300" dangerouslySetInnerHTML={{ __html: svgData || "" }} /></div>
                            ) : (
                                <img src={stdQ.image!} alt="Visual" className="max-h-[400px] w-auto h-auto object-contain shadow-lg" />
                            )}
                        </div>
                    )}
                    <div className={`mt-auto ${isSingleSvgMode ? 'grid grid-cols-5 gap-4' : 'grid grid-cols-1 gap-3'}`}>
                        {stdQ.options.map((opt: any, idx: number) => {
                            const char = String.fromCharCode(65 + idx);
                            const isSelected = answers[stdQ.id] === idx;
                            const optText = typeof opt === 'object' ? opt.text : opt;
                            const cleanText = optText ? optText.replace(/^[A-E]\.\s*/, '') : '';
                            return (
                                <button key={idx} onClick={() => handleSelectOptionStd(idx)} className={`group/btn relative transition-all duration-200 border text-left ${isSingleSvgMode ? `h-16 flex flex-col items-center justify-center ${isSelected ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600'}` : `p-4 pl-14 md:pl-16 rounded-sm ${isSelected ? 'bg-zinc-100 text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-600 hover:text-zinc-200'}`}`}>
                                    {!isSingleSvgMode && (<div className={`absolute left-0 top-0 bottom-0 w-10 md:w-12 flex items-center justify-center border-r transition-colors ${isSelected ? 'bg-black text-white border-zinc-200' : 'bg-zinc-900 text-zinc-600 border-zinc-800 group-hover/btn:text-zinc-400'}`}><span className="text-lg font-black font-mono">{char}</span></div>)}
                                    {isSingleSvgMode ? <span className="text-xl font-black font-mono">{char}</span> : <span className="text-sm md:text-base font-medium leading-snug">{cleanText}</span>}
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-900">
                        <button onClick={() => setStdCurrentIndex(prev => Math.max(0, prev - 1))} disabled={stdCurrentIndex === 0} className="px-6 py-3 bg-transparent border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] transition disabled:opacity-30 flex items-center gap-2"><ChevronLeft size={14} /> PREV</button>
                        {stdCurrentIndex === questions.length - 1 ? (
                            <button onClick={finishExam} disabled={isSubmitting} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white border border-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2"><ShieldAlert size={14} /> {isSubmitting ? "TRANSMITTING..." : "AKHIRI MISI"}</button>
                        ) : (
                            <button onClick={() => setStdCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))} className="px-6 py-3 bg-white hover:bg-zinc-200 text-black border border-white text-[10px] font-black uppercase tracking-[0.2em] transition flex items-center gap-2">NEXT <ChevronRight size={14} /></button>
                        )}
                    </div>
                </div>
            </div>
            {/* Sidebar Kanan: Timer & Map */}
            <div className="lg:col-span-3 space-y-6 mt-8 lg:mt-0 lg:pl-6 flex flex-col">
                <div className="bg-[#080808] border border-zinc-800 p-6 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
                    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2 flex justify-center items-center gap-2"><Timer size={10} className="animate-pulse text-red-500"/> SISA WAKTU OPERASI</div>
                    <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter tabular-nums text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>{formatTime(stdTimeLeft)}</div>
                </div>
                <div className="bg-[#080808] border border-zinc-800 p-1 flex-1 flex flex-col relative">
                     <div className="p-3 border-b border-zinc-900 mb-2"><div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Crosshair size={10}/> RADAR SOAL</div></div>
                    <div className="p-3 grid grid-cols-5 gap-1.5 overflow-y-auto max-h-[400px] scrollbar-hide">
                        {questions.map((_, i) => {
                            const isAnswered = answers[questions[i].id] !== undefined;
                            const isCurrent = stdCurrentIndex === i;
                            return (
                                <button key={i} onClick={() => setStdCurrentIndex(i)} className={`aspect-square flex items-center justify-center text-[10px] font-black border transition-all duration-300 relative ${isCurrent ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10 scale-110' : isAnswered ? 'bg-blue-900/20 text-blue-400 border-blue-900/50 hover:bg-blue-900/40' : 'bg-zinc-900/50 text-zinc-600 border-zinc-800 hover:border-zinc-600 hover:text-zinc-400'}`}>
                                    {isCurrent && (<span className="absolute inset-0 border border-black animate-ping opacity-20"></span>)}
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}