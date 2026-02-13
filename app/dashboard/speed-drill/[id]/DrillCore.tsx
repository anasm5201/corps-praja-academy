"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Heart, Zap, Timer, CheckCircle, XCircle, 
  ArrowRight, Skull, Target, Volume2, VolumeX, Flame, AlertTriangle
} from "lucide-react";
import { submitDrillResult } from "@/app/actions/submit-drill";

// --- TIPE DATA ---
type Option = {
  key: string;
  text: string;
  score: number;
};

type Question = {
  id: string;
  type: string;
  text?: string;    
  content?: string; 
  question?: string; 
  options: string;  
  explanation?: string; 
};

export default function DrillCore({ unitId, questions }: { unitId: string, questions: Question[] }) {
  const router = useRouter();
  
  // --- GAME STATE ---
  const [index, setIndex] = useState(0); 
  const [hearts, setHearts] = useState(5); 
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20); 
  const [phase, setPhase] = useState<'START' | 'PLAY' | 'FEEDBACK' | 'GAMEOVER' | 'WIN'>('START');
  
  // VISUAL & AUDIO STATE
  const [soundEnabled, setSoundEnabled] = useState(true); 
  const [showStreakAnim, setShowStreakAnim] = useState(false);

  // JAWABAN USER
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<{isCorrect: boolean, score: number} | null>(null);

  // --- PREPARE DATA SOAL ---
  const currentQ = questions[index];
  const questionText = currentQ ? (currentQ.text || currentQ.content || currentQ.question || "Gagal memuat teks soal.") : "";
  const explanationText = currentQ?.explanation || "Pembahasan tersedia di mode review.";

  // --- SOUND SYSTEM ---
  const playSound = (effect: 'correct' | 'wrong' | 'streak' | 'win' | 'lose') => {
    if (!soundEnabled) return;
    const audio = new Audio(`/sounds/${effect}.mp3`);
    audio.volume = 0.7; 
    audio.play().catch(e => console.error("Audio error:", e));
  };

  // --- HELPER: VISUAL COMBO ---
  const getComboTheme = (count: number) => {
    if (count >= 7) return { text: "text-purple-500", bg: "bg-purple-600", glow: "shadow-purple-500/50" }; 
    if (count >= 5) return { text: "text-blue-500", bg: "bg-blue-600", glow: "shadow-blue-500/50" };   
    return { text: "text-yellow-500", bg: "bg-yellow-600", glow: "shadow-yellow-500/50" }; 
  };

  const getComboText = (count: number) => {
    if (count >= 7) return "GODLIKE!";
    if (count >= 5) return "UNSTOPPABLE!";
    return "ON FIRE!";
  };

  const theme = getComboTheme(combo);

  // --- TRIGGER ANIMASI STREAK ---
  useEffect(() => {
    if (combo >= 3) {
        setShowStreakAnim(true);
        playSound('streak');
        const timer = setTimeout(() => setShowStreakAnim(false), 1500);
        return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combo]);

  // 🔥 PERBAIKAN FATAL: ADAPTOR ANTI-KOSONG UNTUK OPSI JAWABAN 🔥
  let parsedOptions: Option[] = [];
  try {
      if (currentQ && currentQ.options) {
         const rawData = typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options;
         
         if (Array.isArray(rawData)) {
             parsedOptions = rawData.map((opt: any, i: number) => {
                 const defaultKey = String.fromCharCode(65 + i); // A, B, C...
                 // Jika data cuma string biasa ["Pancasila", "UUD"]
                 if (typeof opt === 'string') {
                     return { key: defaultKey, text: opt, score: 0 };
                 }
                 // Jika data berupa objek aneh, paksa cari teksnya!
                 return {
                     key: opt.key || defaultKey,
                     text: opt.text || opt.content || opt.label || opt.title || JSON.stringify(opt),
                     score: Number(opt.score) || 0
                 };
             });
         }
      }
  } catch (e) { parsedOptions = []; }

  // --- TIMER MUNDUR ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === 'PLAY' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && phase === 'PLAY') handleTimeout();
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  // --- LOGIC JAWABAN ---
  const handleAnswer = (key: string) => {
    if (phase !== 'PLAY') return;
    setSelectedKey(key);
    
    const chosen = parsedOptions.find(o => o.key === key);
    const earnedScore = chosen ? chosen.score : 0;
    let isCorrect = false; let penalty = false;

    if (currentQ.type === 'TKP') {
        if (earnedScore >= 3) isCorrect = true; else penalty = true;
    } else {
        if (earnedScore === 5) isCorrect = true; else penalty = true;
    }

    if (isCorrect && earnedScore === 5) { 
        setCombo(prev => prev + 1);
        setScore(prev => prev + (earnedScore * 10) + (timeLeft * 5) + (combo * 20));
        if (combo < 2) playSound('correct'); 
    } else {
        setCombo(0);
        setScore(prev => prev + (earnedScore * 10)); 
        if(isCorrect) playSound('correct');
    }

    if (penalty) { setHearts(prev => prev - 1); playSound('wrong'); }
    setCurrentResult({ isCorrect: !penalty, score: earnedScore });
    
    if (penalty && hearts - 1 <= 0) { setPhase('GAMEOVER'); playSound('lose'); }
    else { setPhase('FEEDBACK'); }
  };

  const handleTimeout = () => {
    setHearts(prev => prev - 1); setCombo(0);
    setCurrentResult({ isCorrect: false, score: 0 }); playSound('wrong');
    if (hearts - 1 <= 0) { setPhase('GAMEOVER'); playSound('lose'); }
    else { setPhase('FEEDBACK'); }
  };

  const nextQuestion = () => {
    if (index < questions.length - 1) {
        setIndex(prev => prev + 1); setPhase('PLAY'); setTimeLeft(20); 
        setSelectedKey(null); setCurrentResult(null); setShowStreakAnim(false);
    } else { finishGame(); }
  };

  const finishGame = async () => {
    setPhase('WIN'); playSound('win');
    let stars = 1; if (hearts >= 3) stars = 2; if (hearts === 5) stars = 3;
    await submitDrillResult(unitId, score, stars);
  };

  // ==========================================
  // VIEW: START (SURVIVAL MODE BRIEFING)
  // ==========================================
  if (phase === 'START') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 space-y-8 animate-in zoom-in-95 relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-black to-black pointer-events-none"></div>
         <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 animate-pulse z-20"></div>

         <div className="relative z-10 mt-10">
             <div className="absolute inset-0 bg-red-600/40 blur-[60px] rounded-full animate-pulse-slow"></div>
             <Skull size={100} className="text-neutral-200 relative z-10 drop-shadow-[0_0_25px_rgba(220,38,38,0.8)] animate-bounce-slow" />
             <AlertTriangle size={40} className="text-red-500 absolute -bottom-2 -right-2 z-20 animate-pulse" />
         </div>

         <div className="text-center z-10 space-y-4 max-w-lg relative">
             <h2 className="text-5xl font-black uppercase text-white tracking-tighter leading-none drop-shadow-2xl">
                 SPEED DRILL
                 <span className="block text-red-500 text-2xl mt-2 tracking-[0.5em] font-mono border-y-2 border-red-900/50 py-1">SURVIVAL MODE</span>
             </h2>
             <p className="text-neutral-400 text-sm leading-relaxed font-mono">
                 "Ini bukan latihan biasa, Kadet. Ini zona tempur. Bertahan hidup atau gugur."
             </p>
         </div>

         <div className="bg-neutral-950/80 border-2 border-red-900/50 p-6 rounded-xl w-full max-w-md text-left space-y-4 relative z-10 backdrop-blur-lg shadow-[0_0_30px_rgba(0,0,0,0.5)]">
             <h3 className="text-red-500 font-black uppercase tracking-widest text-sm mb-4 border-b border-red-900/50 pb-2 flex items-center gap-2">
                 <Target size={16}/> BRIEFING MISI:
             </h3>
             <ul className="space-y-3 text-neutral-300 text-sm font-medium">
                 <li className="flex items-start gap-3">
                     <Timer className="text-red-500 shrink-0 mt-0.5 animate-pulse" size={18}/>
                     <span>Waktu kritis: <strong>20 DETIK</strong> per target. Ragu-ragu berarti mati.</span>
                 </li>
                 <li className="flex items-start gap-3">
                     <Heart className="text-red-500 shrink-0 mt-0.5" size={18}/>
                     <span>Perbekalan: Hanya <strong>5 NYAWA</strong>. Kesalahan fatal mengurangi nyawa.</span>
                 </li>
                 <li className="flex items-start gap-3 bg-red-900/20 p-2 rounded-lg border border-red-900/30">
                     <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18}/>
                     <span><strong>PENTING (TKP):</strong> Jawaban poin 1-2 dianggap SALAH & mengurangi nyawa. Cari poin 3-5!</span>
                 </li>
             </ul>
         </div>

         <button onClick={() => { playSound('correct'); setPhase('PLAY'); }} className="w-full max-w-sm bg-red-700 text-white font-black py-5 rounded-xl hover:bg-red-600 transition-all uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(185,28,28,0.6)] hover:shadow-[0_0_40px_rgba(185,28,28,0.9)] relative z-10 group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
             <span className="relative z-10 flex items-center justify-center gap-2">
                SIAP LAKSANAKAN <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
             </span>
         </button>
      </div>
    );
  }

  // ==========================================
  // VIEW: GAMEOVER & WIN
  // ==========================================
  if (phase === 'GAMEOVER') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6 animate-in zoom-in">
          <Skull size={80} className="text-neutral-700 mb-4 animate-bounce-slow" />
          <h2 className="text-4xl font-black uppercase text-red-600 mb-2 tracking-tighter">MISI GAGAL</h2>
          <button onClick={() => router.push('/dashboard/speed-drill')} className="px-8 py-3 bg-neutral-800 text-white font-bold rounded-lg border border-neutral-700 hover:bg-neutral-700 uppercase tracking-widest">KEMBALI KE MARKAS</button>
      </div>
    );
  }

  if (phase === 'WIN') {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6 animate-in zoom-in">
           <Zap size={80} className="text-yellow-500 fill-yellow-500 mb-4 animate-pulse drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
           <h2 className="text-4xl font-black uppercase text-white tracking-tighter">MISI SUKSES</h2>
           <div className="text-2xl font-black text-yellow-500">SKOR: {score}</div>
           <button onClick={() => router.push('/dashboard/speed-drill')} className="w-full max-w-xs py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-500 transition-all uppercase tracking-widest shadow-lg">LANJUTKAN</button>
        </div>
     )
  }

  // ==========================================
  // VIEW: GAMEPLAY (ARENA)
  // ==========================================
  return (
    <div className="max-w-xl mx-auto min-h-[85vh] flex flex-col p-4 pb-48 relative overflow-hidden">
       
       {showStreakAnim && (
         <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex flex-col items-center animate-in zoom-in-50 slide-in-from-bottom-10 duration-300 relative p-12">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] blur-[120px] opacity-60 rounded-full animate-pulse ${theme.bg}`}></div>
                <div className="absolute inset-0 animate-spin-slow opacity-80 mix-blend-screen">
                     <Zap size={30} className={`absolute top-0 left-1/4 ${theme.text} drop-shadow-lg`} fill="currentColor"/>
                     <Zap size={40} className={`absolute bottom-1/4 right-0 ${theme.text} drop-shadow-lg`} fill="currentColor"/>
                     <Zap size={24} className={`absolute top-1/3 right-[10%] ${theme.text} drop-shadow-lg`} fill="currentColor"/>
                     <Zap size={32} className={`absolute bottom-0 left-1/3 ${theme.text} drop-shadow-lg`} fill="currentColor"/>
                </div>
                <div className="relative z-10 animate-bounce-slow mix-blend-screen">
                     <Flame size={220} className={`${theme.text} filter drop-shadow-[0_0_80px_currentColor] relative z-10`} fill="currentColor" />
                     <Flame size={160} className={`absolute top-8 left-8 text-white opacity-70 animate-pulse mix-blend-overlay z-20`} fill="currentColor" />
                </div>
                <h1 className={`relative z-30 text-9xl font-black italic tracking-tighter ${theme.text} uppercase drop-shadow-[0_5px_10px_rgba(0,0,0,1)] scale-110 animate-pulse`}>
                    {combo}x
                </h1>
                <div className={`relative z-30 bg-black/60 px-8 py-3 rounded-full border-2 ${theme.text.replace('text', 'border')} mt-6 backdrop-blur-md shadow-2xl ${theme.glow}`}>
                    <h2 className="text-3xl font-black text-white tracking-[0.3em] uppercase drop-shadow-lg">
                        {getComboText(combo)}
                    </h2>
                </div>
            </div>
         </div>
       )}

       <div className="flex flex-col gap-2 mb-6 relative z-20">
           <div className="flex justify-between items-center px-1">
               <span className="text-[10px] font-mono text-neutral-500 font-bold tracking-widest">WAKTU TERSISA</span>
               <span className={`text-xs font-black ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white"}`}>{timeLeft}s</span>
           </div>
           <div className="h-4 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 relative shadow-inner">
               <div className={`h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_currentColor] ${timeLeft <= 5 ? "bg-red-600 text-red-600" : timeLeft <= 10 ? "bg-yellow-500 text-yellow-500" : "bg-green-500 text-green-500"}`} style={{ width: `${(timeLeft / 20) * 100}%` }}></div>
           </div>
           <div className="flex justify-between items-center mt-2">
               <div className="flex items-center gap-1.5 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800 backdrop-blur-sm">
                   <Heart size={16} className={`${hearts < 2 ? "text-red-500 animate-pulse fill-red-500" : "text-red-600 fill-red-600"}`} />
                   <span className="font-black text-white text-sm">{hearts}</span>
               </div>
               <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-500 hover:text-white transition backdrop-blur-sm">
                   {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}
               </button>
           </div>
       </div>

       <div className="flex-1 relative z-10">
           <div className="mb-2 flex justify-between items-end">
               <span className={`text-[10px] font-black px-2 py-1 rounded text-white shadow-sm ${currentQ.type === 'TWK' ? 'bg-red-600' : currentQ.type === 'TIU' ? 'bg-blue-600' : 'bg-amber-600'}`}>{currentQ.type}</span>
               {combo > 1 && !showStreakAnim && (
                   <span className={`text-xs font-black ${theme.text} drop-shadow-sm flex items-center gap-1 animate-pulse`}>
                       <Flame size={14} fill="currentColor"/> {combo}x STREAK
                   </span>
               )}
           </div>

           <div className="bg-neutral-900/70 border border-neutral-800 p-6 rounded-2xl shadow-xl relative min-h-[120px] flex items-center backdrop-blur-md">
               <h3 className="text-base md:text-lg font-medium text-white leading-relaxed w-full font-sans">{questionText}</h3>
           </div>

           <div className="mt-6 grid grid-cols-1 gap-3">
               {parsedOptions.map((opt, i) => {
                   const isSelected = selectedKey === opt.key;
                   let containerClass = "border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:border-neutral-600";
                   
                   if (phase === 'FEEDBACK') {
                       if (isSelected) {
                           containerClass = currentResult?.isCorrect ? "border-green-500 bg-green-900/30 text-green-400" : "border-red-500 bg-red-900/30 text-red-400";
                       } else if (opt.score === 5) {
                           containerClass = "border-green-500/40 bg-neutral-950 text-green-600 opacity-50 border-dashed"; 
                       } else { containerClass = "border-transparent bg-neutral-950/50 text-neutral-800 opacity-30"; }
                   } else if (isSelected) { containerClass = "border-blue-500 bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"; }

                   return (
                       <button key={i} onClick={() => handleAnswer(opt.key)} disabled={phase === 'FEEDBACK'} className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all active:scale-[0.98] backdrop-blur-sm ${containerClass}`}>
                           <div className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center border border-white/10 text-sm font-mono font-bold bg-black/20">{opt.key}</div>
                           <div className="text-sm font-medium flex-1">{opt.text}</div>
                           {phase === 'FEEDBACK' && currentQ.type === 'TKP' && (<div className={`flex-shrink-0 text-[10px] font-black px-2 py-1 rounded border ${opt.score === 5 ? "bg-green-600 text-white border-green-500" : opt.score >= 3 ? "bg-yellow-600/50 text-yellow-200 border-yellow-500" : "bg-neutral-800 text-neutral-500 border-neutral-700"}`}>{opt.score} Poin</div>)}
                           {phase === 'FEEDBACK' && currentQ.type !== 'TKP' && (opt.score === 5 || isSelected) && (<div className={`flex-shrink-0 text-[10px] font-black px-2 py-1 rounded border ${opt.score === 5 ? "text-green-400 border-green-500" : "text-red-400 border-red-500"}`}>{opt.score === 5 ? "+5" : "0"}</div>)}
                       </button>
                   )
               })}
           </div>
       </div>

       {phase === 'FEEDBACK' && (
           <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
               <div className={`p-1 h-1 w-full ${currentResult?.isCorrect ? "bg-green-500 shadow-[0__10px_20px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_-10px_20px_rgba(239,68,68,0.5)]"}`}></div>
               <div className="bg-neutral-950/95 border-t border-neutral-800 p-6 shadow-2xl backdrop-blur-xl">
                   <div className="max-w-xl mx-auto">
                       <div className="flex items-start gap-4 mb-6">
                           <div className={`p-2 rounded-full shrink-0 ${currentResult?.isCorrect ? "bg-green-900/30 text-green-500" : "bg-red-900/30 text-red-500"}`}>{currentResult?.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}</div>
                           <div>
                               <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${currentResult?.isCorrect ? "text-green-500" : "text-red-500"}`}>{currentResult?.isCorrect ? "KERJA BAGUS" : "KURANG TEPAT"}</h4>
                               <div className="text-sm text-neutral-300 leading-relaxed bg-neutral-900/80 p-3 rounded-lg border border-neutral-800 mt-2 font-sans"><span className="text-blue-500 font-bold text-xs uppercase mb-1 block">PEMBAHASAN:</span>{explanationText}</div>
                           </div>
                       </div>
                       <button onClick={nextQuestion} className={`w-full py-4 font-black rounded-xl uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all ${currentResult?.isCorrect ? "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]" : "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"}`}>LANJUTKAN <ArrowRight size={18}/></button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}