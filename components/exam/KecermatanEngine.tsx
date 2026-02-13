"use client";

import { submitPsychologyResult } from "@/app/actions/submitPsychology";
import { useState, useEffect, useCallback } from "react";
import { 
  Zap, Timer, Play, RotateCcw, ShieldCheck, 
  AlertTriangle, TrendingUp, Activity, Loader2,
  BarChart3, Target, Crosshair, BrainCircuit
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

interface EngineProps {
  packageId: string;
  config: {
    duration: number; 
    columns: number;  
    symbols: string[];
  };
}

type GameState = "INTRO" | "PLAYING" | "FINISHED" | "REPORT";

export default function KecermatanEngine({ packageId, config }: EngineProps) {
  const router = useRouter();

  // CONSTANTS
  const TOTAL_COLUMNS = config.columns || 10;
  const DURATION_PER_COLUMN = config.duration || 60;
  const MASTER_POOL = config.symbols || ["♣", "♠", "♦", "♥", "★"];

  // GAME STATE
  const [gameState, setGameState] = useState<GameState>("INTRO");
  const [currentColumn, setCurrentColumn] = useState(1);
  const [timeLeft, setTimeLeft] = useState(DURATION_PER_COLUMN);
  
  // LOGISTIK SOAL
  const [keySymbols, setKeySymbols] = useState<string[]>([]); 
  const [questionSymbols, setQuestionSymbols] = useState<string[]>([]); 
  const [correctAnswer, setCorrectAnswer] = useState<string>(""); 
  
  // STATISTIK
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [columnHistory, setColumnHistory] = useState<number[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // --- LOGIC: ANALISA PSIKOMETRIK (THE BRAIN) ---
  const analyzePerformance = (history: number[], totalErrors: number) => {
    if (history.length === 0) return null;

    // 1. KECEPATAN (PANKER - Panduan Kerja)
    const totalScore = history.reduce((a, b) => a + b, 0);
    const avgSpeed = totalScore / history.length;
    
    // 2. STABILITAS (Deviasi Standar Sederhana)
    // Range antara nilai tertinggi dan terendah
    const minScore = Math.min(...history);
    const maxScore = Math.max(...history);
    const stabilityScore = maxScore - minScore; 
    let stabilityStatus = "Sangat Stabil";
    if (stabilityScore > 10) stabilityStatus = "Labil (Zig-zag)";
    else if (stabilityScore > 5) stabilityStatus = "Cukup Stabil";

    // 3. KETAHANAN (Endurance - Trendline)
    // Bandingkan paruh pertama vs paruh kedua
    const halfIndex = Math.floor(history.length / 2);
    const firstHalf = history.slice(0, halfIndex).reduce((a, b) => a + b, 0);
    const secondHalf = history.slice(halfIndex).reduce((a, b) => a + b, 0);
    let trend = "Datar";
    if (secondHalf > firstHalf + 5) trend = "Menanjak (Positif)";
    else if (secondHalf < firstHalf - 5) trend = "Menurun (Kelelahan)";

    // 4. KESIMPULAN
    let verdict = "PERLU LATIHAN";
    let verdictColor = "text-red-500";
    if (avgSpeed > 35 && totalErrors < 2) {
        verdict = "DISARANKAN (MEMENUHI SYARAT)";
        verdictColor = "text-green-500";
    } else if (avgSpeed > 25) {
        verdict = "DIPERTIMBANGKAN";
        verdictColor = "text-yellow-500";
    }

    return {
        avgSpeed: avgSpeed.toFixed(1),
        minScore,
        maxScore,
        stability: stabilityStatus,
        trend: trend,
        verdict,
        verdictColor
    };
  };

  // CORE: GENERATE KOLOM BARU
  const initializeColumn = useCallback(() => {
    const shuffledPool = [...MASTER_POOL].sort(() => 0.5 - Math.random());
    const newKeys = shuffledPool.slice(0, 5); 
    setKeySymbols(newKeys);
    generateQuestionFromKeys(newKeys);
  }, [MASTER_POOL]);

  // CORE: GENERATE SOAL
  const generateQuestionFromKeys = (keys: string[]) => {
    const missingIndex = Math.floor(Math.random() * 5);
    const missingSymbol = keys[missingIndex];
    setCorrectAnswer(missingSymbol);
    const question = keys.filter(s => s !== missingSymbol).sort(() => 0.5 - Math.random());
    setQuestionSymbols(question);
  };

  // TIMER
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "PLAYING") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleColumnFinished();
            return DURATION_PER_COLUMN;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, currentColumn]); 

  const handleColumnFinished = () => {
    setColumnHistory(prev => [...prev, score]);
    
    if (currentColumn >= TOTAL_COLUMNS) {
      setGameState("FINISHED");
    } else {
      setCurrentColumn(prev => prev + 1);
      setScore(0); 
      initializeColumn(); 
    }
  };

  const handleAnswer = (selectedSymbol: string) => {
    if (selectedSymbol === correctAnswer) {
      setScore(prev => prev + 1);
    } else {
      setMistakes(prev => prev + 1);
    }
    generateQuestionFromKeys(keySymbols);
  };

  const startGame = () => {
    setScore(0);
    setMistakes(0);
    setColumnHistory([]);
    setCurrentColumn(1);
    setTimeLeft(DURATION_PER_COLUMN);
    initializeColumn();
    setGameState("PLAYING");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const finalHistory = [...columnHistory, score]; // Include skor kolom terakhir
    try {
        const result = await submitPsychologyResult({
            packageId: packageId, 
            columnHistory: finalHistory,
            totalMistakes: mistakes
        });
        if (result.success) {
            // Kita simpan history final ke state local untuk ditampilkan di report
            setAnalysisData({ columnHistory: finalHistory });
            if (result.success) {
              router.push(`/dashboard/psychology/result/${result.attemptId}`);
          }}
    } catch (error) { console.error(error); } 
    finally { setIsSubmitting(false); }
  };

  // --- VIEW: INTRO ---
  if (gameState === "INTRO") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-24 h-24 bg-red-900/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <BrainCircuit className="text-red-600 w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">OPERASI KECERMATAN</h1>
        <div className="flex flex-col gap-1 text-gray-500 font-mono text-xs mb-8">
            <p>TARGET: {TOTAL_COLUMNS} KOLOM x {DURATION_PER_COLUMN} DETIK</p>
            <p className="text-red-500">WARNING: POLA KUNCI BERUBAH TIAP KOLOM</p>
        </div>
        <button onClick={startGame} className="bg-red-700 hover:bg-red-600 text-white px-12 py-4 rounded-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-3 transition-all hover:scale-105">
            <Play size={20} fill="currentColor"/> MULAI TES
        </button>
        <Link href="/dashboard/psychology" className="mt-8 text-gray-600 hover:text-white text-[10px] font-mono uppercase tracking-widest border-b border-transparent hover:border-gray-500 transition-all">BATALKAN MISI</Link>
      </div>
    );
  }

  // --- VIEW: FINISHED ---
  if (gameState === "FINISHED") {
     return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="text-green-500 w-24 h-24 mb-6 animate-bounce" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">MISI SELESAI</h1>
        <p className="text-gray-500 text-sm mb-8">Data telah dikunci. Siap untuk dianalisa.</p>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-sm backdrop-blur">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Skor Akhir</p>
                <p className="text-3xl font-black text-white">{score}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-sm backdrop-blur">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Salah</p>
                <p className="text-3xl font-black text-red-500">{mistakes}</p>
            </div>
        </div>

        <button onClick={handleSave} disabled={isSubmitting} className="w-full max-w-sm bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(34,197,94,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <><Loader2 className="animate-spin" size={18}/> MEMPROSES DATA...</> : <><Activity size={18}/> LIHAT LAPORAN LENGKAP</>} 
        </button>
      </div>
    );
  }

  // --- VIEW: REPORT (THE REAL DEAL) ---
  if (gameState === "REPORT" && analysisData) {
      const hist = analysisData.columnHistory || [];
      const stats = analyzePerformance(hist, mistakes);
      
      // Data Grafik
      const chartData = hist.map((val: number, idx: number) => ({ name: `${idx + 1}`, score: val }));
      
      return (
        <div className="min-h-screen bg-[#050505] text-white overflow-y-auto">
            {/* Header Laporan */}
            <div className="bg-zinc-900 border-b border-white/10 p-6 sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">HASIL DIAGNOSTIK</h1>
                        <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-1">SISTEM ANALISA PSIKOMETRIK TERPADU V2.0</p>
                    </div>
                    <Link href="/dashboard/psychology">
                         <button className="bg-white text-black px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-gray-200 flex items-center gap-2">
                            <RotateCcw size={14} /> TUTUP
                         </button>
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 pb-20 animate-in slide-in-from-bottom duration-700">
                
                {/* 1. KESIMPULAN UTAMA (Verdict) */}
                <div className="mb-8 p-6 bg-zinc-900/30 border border-white/10 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${stats?.verdict === "DISARANKAN" ? "border-green-500 bg-green-900/20 text-green-500" : "border-red-500 bg-red-900/20 text-red-500"}`}>
                            <Target size={32} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">REKOMENDASI SISTEM</p>
                            <h2 className={`text-2xl font-black uppercase ${stats?.verdictColor}`}>{stats?.verdict}</h2>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-gray-500 font-mono">ID PAKET: {packageId.substring(0,8)}...</p>
                        <p className="text-xs text-gray-500 font-mono">TANGGAL: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* 2. STATISTIK GRID (4 PILAR) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Kecepatan */}
                    <div className="bg-black border border-white/10 p-4 rounded-sm hover:border-blue-500/50 transition-colors group">
                        <div className="flex items-center gap-2 text-blue-500 mb-2"><Zap size={16}/><span className="text-[10px] font-bold uppercase tracking-widest">RATA-RATA</span></div>
                        <p className="text-3xl font-black text-white group-hover:text-blue-400">{stats?.avgSpeed}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Simbol / Menit</p>
                    </div>
                    {/* Ketelitian */}
                    <div className="bg-black border border-white/10 p-4 rounded-sm hover:border-red-500/50 transition-colors group">
                        <div className="flex items-center gap-2 text-red-500 mb-2"><AlertTriangle size={16}/><span className="text-[10px] font-bold uppercase tracking-widest">ERROR</span></div>
                        <p className="text-3xl font-black text-white group-hover:text-red-400">{mistakes}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Total Kesalahan</p>
                    </div>
                     {/* Stabilitas */}
                     <div className="bg-black border border-white/10 p-4 rounded-sm hover:border-yellow-500/50 transition-colors group">
                        <div className="flex items-center gap-2 text-yellow-500 mb-2"><Activity size={16}/><span className="text-[10px] font-bold uppercase tracking-widest">STABILITAS</span></div>
                        <p className="text-sm font-bold text-white mt-2 group-hover:text-yellow-400">{stats?.stability}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Range: {stats?.minScore}-{stats?.maxScore}</p>
                    </div>
                     {/* Ketahanan */}
                     <div className="bg-black border border-white/10 p-4 rounded-sm hover:border-green-500/50 transition-colors group">
                        <div className="flex items-center gap-2 text-green-500 mb-2"><TrendingUp size={16}/><span className="text-[10px] font-bold uppercase tracking-widest">KETAHANAN</span></div>
                        <p className="text-sm font-bold text-white mt-2 group-hover:text-green-400">{stats?.trend}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Trend Grafik</p>
                    </div>
                </div>

                {/* 3. GRAFIK UTAMA (MASTERPIECE) */}
                <div className="bg-zinc-900/20 border border-white/10 rounded-sm p-6 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2"><BarChart3 size={16} className="text-blue-500"/> DINAMIKA KERJA (WORK CURVE)</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-[10px] text-gray-500 uppercase">SPEED</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white/20 rounded-full"></div><span className="text-[10px] text-gray-500 uppercase">AVG: {stats?.avgSpeed}</span></div>
                        </div>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{fill: '#666', fontSize: 10}} 
                                    axisLine={false} 
                                    tickLine={false}
                                    label={{ value: 'KOLOM KE-', position: 'insideBottom', offset: -5, fill: '#444', fontSize: 10 }}
                                />
                                <YAxis 
                                    tick={{fill: '#666', fontSize: 10}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    domain={[0, 'auto']}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }} 
                                    itemStyle={{ color: '#3b82f6' }}
                                    formatter={(value: number) => [`${value} Simbol`, 'Speed']}
                                    labelFormatter={(label) => `Kolom ${label}`}
                                />
                                <ReferenceLine y={Number(stats?.avgSpeed)} stroke="#666" strokeDasharray="3 3" />
                                <Area 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorScore)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button onClick={() => window.print()} className="text-xs font-mono text-gray-600 hover:text-white uppercase">Cetak Laporan</button>
                </div>
            </div>
        </div>
      );
  }

  // --- VIEW: PLAYING (COMPACT MODE - TETAP SAMA) ---
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      {/* HEADER */}
      <div className="bg-zinc-900/90 border-b border-white/10 py-3 px-4 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
            <div className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
                KOLOM {Math.min(currentColumn, TOTAL_COLUMNS)} / {TOTAL_COLUMNS}
            </div>
            <div className={`flex items-center gap-2 font-mono text-lg font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                <Timer size={18} /> {timeLeft}s
            </div>
        </div>
        <div className="w-full bg-zinc-800 h-0.5 mt-3 absolute bottom-0 left-0">
            <div className="bg-yellow-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / DURATION_PER_COLUMN) * 100}%` }}></div>
        </div>
      </div>

      {/* GAME AREA */}
      <div className="flex-grow flex flex-col items-center justify-start pt-4 px-2 pb-2">
        
        <div className="mb-1 text-[10px] text-gray-500 uppercase tracking-widest font-mono">REFERENSI KUNCI</div>
        <div className="flex gap-2 mb-4 p-3 bg-zinc-900/50 border border-white/10 rounded-xl" key={currentColumn}>
            {["A", "B", "C", "D", "E"].map((label, idx) => (
                <div key={label} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 bg-black border border-white/20 rounded-lg flex items-center justify-center text-2xl text-white font-mono font-bold shadow-inner">
                        {keySymbols[idx]}
                    </div>
                    <span className="text-[9px] font-bold text-gray-500">{label}</span>
                </div>
            ))}
        </div>

        <div className="mb-1 text-[10px] text-gray-500 uppercase tracking-widest font-mono">MANA YANG HILANG?</div>
        <div className="flex gap-2 mb-6">
             {questionSymbols.map((symbol, idx) => (
                <div key={idx} className="w-14 h-14 bg-zinc-800 border border-white/5 rounded-lg flex items-center justify-center text-3xl text-gray-300 font-mono font-bold">
                    {symbol}
                </div>
             ))}
             <div className="w-14 h-14 bg-yellow-900/10 border-2 border-dashed border-yellow-500/50 rounded-lg flex items-center justify-center animate-pulse">
                 <AlertTriangle className="text-yellow-500/50" size={20} />
             </div>
        </div>

        <div className="grid grid-cols-5 gap-2 w-full max-w-sm">
            {keySymbols.map((symbol, idx) => (
                <button key={idx} onClick={() => handleAnswer(symbol)} className="aspect-square bg-zinc-900 hover:bg-zinc-800 border border-white/20 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-all active:bg-yellow-600 active:text-black active:border-yellow-500 group">
                    <span className="text-2xl mb-1 text-white group-active:text-black font-mono font-bold">{symbol}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase group-active:text-black">{["A", "B", "C", "D", "E"][idx]}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}