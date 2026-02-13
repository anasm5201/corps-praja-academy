"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Timer, Zap, Trophy, Play, Activity, ArrowRight, 
  BarChart3, AlertTriangle, CheckCircle2, Target, 
  BrainCircuit, FileText, TrendingUp, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

// --- KONFIGURASI DOKTRIN ---
const TOTAL_COLUMNS = 10;
const TIME_PER_COLUMN = 60; // Detik

type EngineProps = {
  pkg: any;
};

export default function KecermatanEngine({ pkg }: EngineProps) {
  const router = useRouter();
  
  // --- STATE ---
  const [gameStatus, setGameStatus] = useState<'BRIEFING' | 'PLAYING' | 'TRANSITION' | 'FINISHED'>('BRIEFING');
  const [currentColumn, setCurrentColumn] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_COLUMN);
  
  // Data Statistik
  const [columnScores, setColumnScores] = useState<number[]>([]); 
  const [columnErrors, setColumnErrors] = useState<number[]>([]); 
  
  const [currentScore, setCurrentScore] = useState(0);
  const [currentErrors, setCurrentErrors] = useState(0); 
  const [isShaking, setIsShaking] = useState(false); 
  
  // Generator Soal
  const [keySymbols, setKeySymbols] = useState<string[]>([]);
  const [questionSymbols, setQuestionSymbols] = useState<string[]>([]);
  const [missingSymbol, setMissingSymbol] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC: GENERATOR ---
  const generateProblem = (resetKeys = false) => {
    const pool = ["0","1","2","3","4","5","6","7","8","9"]; 
    let currentKeys = keySymbols;
    
    // Ganti Kunci Setiap Kolom Baru
    if (resetKeys || keySymbols.length === 0) {
        const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
        currentKeys = shuffledPool.slice(0, 5);
        setKeySymbols(currentKeys);
    }
    
    const missing = currentKeys[Math.floor(Math.random() * currentKeys.length)];
    const question = currentKeys.filter(k => k !== missing).sort(() => 0.5 - Math.random());

    setMissingSymbol(missing);
    setQuestionSymbols(question);
  };

  // --- LOGIC: GAME FLOW ---
  const startTest = () => {
    setColumnScores([]);
    setColumnErrors([]);
    setCurrentColumn(1);
    startColumn(1);
  };

  const startColumn = (colIndex: number) => {
    // SECURITY CHECK: Cegah kolom lebih dari 10
    if (colIndex > TOTAL_COLUMNS) {
        finishTest();
        return;
    }

    setGameStatus('PLAYING');
    setCurrentScore(0);
    setCurrentErrors(0);
    setTimeLeft(TIME_PER_COLUMN);
    generateProblem(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Transisi Otomatis saat Waktu Habis
  useEffect(() => {
    if (timeLeft === 0 && gameStatus === 'PLAYING') {
        // Simpan Data
        setColumnScores(prev => [...prev, currentScore]);
        setColumnErrors(prev => [...prev, currentErrors]);
        
        // Cek Batas Kolom
        if (currentColumn >= TOTAL_COLUMNS) {
            finishTest();
        } else {
            setGameStatus('TRANSITION');
            setTimeout(() => {
                setCurrentColumn(prev => {
                    const nextCol = prev + 1;
                    startColumn(nextCol);
                    return nextCol;
                });
            }, 3000); // Istirahat 3 detik
        }
    }
  }, [timeLeft, gameStatus]);

  const finishTest = () => {
    setGameStatus('FINISHED');
    if (timerRef.current) clearInterval(timerRef.current);
    toast.success("Operasi Selesai. Data Analisa Siap.");
  };

  const handleAnswer = (symbol: string) => {
    if (gameStatus !== 'PLAYING') return;

    if (symbol === missingSymbol) {
      setCurrentScore(s => s + 1); 
      generateProblem(false); 
    } else {
      // PENALTI: Catat Error & Kurangi Poin
      setCurrentErrors(e => e + 1);
      setCurrentScore(s => Math.max(0, s - 1)); 

      triggerShake();
      toast.error("MISS!", { 
        duration: 300,
        style: { background: '#dc2626', color: 'white', border: 'none' } 
      });
      generateProblem(false); 
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  // --- ANALISA INTELIJEN & VISUALISASI ---

  const getDetailedAnalysis = (scores: number[], errors: number[]) => {
      if (scores.length === 0) return null;
      
      const totalScore = scores.reduce((a,b) => a+b, 0);
      const totalErrors = errors.reduce((a,b) => a+b, 0);
      const avgScore = totalScore / TOTAL_COLUMNS;
      
      // KONVERSI NILAI (Skala 100)
      // Asumsi Speed Ideal: 45 Benar/Menit = Nilai 100
      let finalScore = Math.round((avgScore / 45) * 100);
      if (finalScore > 100) finalScore = 100;

      // LABEL KELULUSAN
      let label = "";
      let color = "";
      let subLabel = "";
      
      if (finalScore >= 61) { 
          label = "MEMENUHI SYARAT (MS)"; 
          color = "text-emerald-500"; 
          subLabel = finalScore >= 81 ? "KUALIFIKASI: BAIK" : "KUALIFIKASI: CUKUP";
      } else { 
          label = "TIDAK MEMENUHI SYARAT (TMS)"; 
          color = "text-red-500"; 
          subLabel = finalScore >= 41 ? "KUALIFIKASI: KURANG" : "KUALIFIKASI: KURANG SEKALI";
      }

      // NARASI ANALISA MENDALAM
      let narrative = [];
      
      // 1. Analisa Stabilitas (Grafik)
      const firstHalf = scores.slice(0, 5).reduce((a,b)=>a+b,0) / 5;
      const secondHalf = scores.slice(5, 10).reduce((a,b)=>a+b,0) / 5;
      const diff = secondHalf - firstHalf;

      if (diff < -5) narrative.push("Terdeteksi penurunan performa signifikan di 5 menit terakhir. Indikasi kelelahan mental (Endurance Rendah). Latih kardio dan fokus durasi panjang.");
      else if (diff > 5) narrative.push("Grafik menanjak di akhir (Learning Curve positif). Anda tipe 'Diesel', lambat panas namun kuat di akhir.");
      else narrative.push("Grafik stabilitas sangat baik (Konsisten). Mental baja yang mampu mempertahankan ritme kerja.");

      // 2. Analisa Ketelitian (Error)
      if (totalErrors === 0) narrative.push("Akurasi Sempurna (Zero Error). Pertahankan ketelitian ini.");
      else if (totalErrors > 15) narrative.push(`PERINGATAN: ${totalErrors} kesalahan terdeteksi. Anda terlalu impulsif/terburu-buru. Utamakan ketelitian daripada kecepatan semu.`);
      else narrative.push("Tingkat kesalahan masih dalam batas toleransi, namun perlu diminimalisir.");

      // 3. Analisa Puncak (Peak Performance)
      const maxCol = Math.max(...scores);
      const minCol = Math.min(...scores);
      if ((maxCol - minCol) > 15) narrative.push("Terjadi fluktuasi emosi yang ekstrem (Zig-Zag). Anda mudah terdistraksi. Latih ketenangan diri.");

      return { 
          finalScore, label, color, subLabel, 
          avgScore: Math.round(avgScore), 
          totalErrors, narrative 
      };
  };

  // RENDER GRAFIK FUTURISTIK
  const renderChart = () => {
      if (columnScores.length === 0) return null;
      const maxVal = Math.max(...columnScores, 10) + 10; 
      
      // Points untuk Garis
      const points = columnScores.map((score, index) => {
          const x = (index / (TOTAL_COLUMNS - 1)) * 100; 
          const y = 100 - ((score / maxVal) * 100); 
          return `${x},${y}`;
      }).join(" ");

      // Points untuk Area (Gradient Fill) - Tutup path ke bawah
      const areaPoints = `0,100 ${points} 100,100`;

      return (
          <div className="w-full h-56 bg-black/60 rounded-xl border border-neutral-800 relative p-6 mt-4 overflow-hidden group">
               {/* Grid Background */}
               <div className="absolute inset-0 opacity-20" 
                    style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
               </div>

               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible relative z-10">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Area Fill */}
                  <polygon points={areaPoints} fill="url(#chartGradient)" />

                  {/* Line Graph */}
                  <polyline points={points} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" vectorEffect="non-scaling-stroke"/>
                  
                  {/* Data Points */}
                  {columnScores.map((score, index) => {
                      const x = (index / (TOTAL_COLUMNS - 1)) * 100;
                      const y = 100 - ((score / maxVal) * 100);
                      const isError = columnErrors[index] > 2;
                      return (
                        <g key={index}>
                           <circle cx={x} cy={y} r={isError ? "3" : "2"} fill="#111" stroke={isError ? "#ef4444" : "#fff"} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                           {/* Hover Tooltip (Simple) */}
                           <text x={x} y={y - 5} textAnchor="middle" fontSize="6" fill="white" className="opacity-0 group-hover:opacity-100 transition-opacity font-mono">{score}</text>
                        </g>
                      )
                  })}
               </svg>
               
               {/* Axis Labels */}
               <div className="absolute bottom-1 left-0 w-full flex justify-between text-[8px] text-neutral-500 font-mono uppercase px-1">
                   {columnScores.map((_, i) => <span key={i}>M{i+1}</span>)}
               </div>
          </div>
      )
  };

  // --- COMPONENT RENDER ---

  // Progress Bar Logic
  const timePercent = (timeLeft / TIME_PER_COLUMN) * 100;
  let barColor = "bg-emerald-500";
  if (timePercent < 50) barColor = "bg-yellow-500";
  if (timePercent < 20) barColor = "bg-red-500";

  // 1. BRIEFING MISI (PENTING: SEBELUM MULAI)
  if (gameStatus === 'BRIEFING') {
    return (
      <div className="flex flex-col h-full max-w-5xl mx-auto w-full p-4 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-900/10 rounded-full flex items-center justify-center border border-orange-600/50 mx-auto mb-4 animate-pulse">
                <Target size={40} className="text-orange-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase text-white tracking-tighter">BRIEFING MISI: KECERMATAN</h1>
            <p className="text-neutral-500 text-sm font-mono mt-2">SIMULASI TES KORAN / ANGKA HILANG</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Kiri: Deskripsi */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
                <h3 className="text-orange-500 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                    <BrainCircuit size={16}/> OBJEKTIF OPERASI
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Tes ini mengukur 3 aspek vital performa psikologis:
                </p>
                <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex gap-3">
                        <Zap size={18} className="text-yellow-500 shrink-0"/>
                        <span><b>SPEED (Kecepatan):</b> Seberapa banyak soal yang bisa Anda selesaikan dalam 1 menit.</span>
                    </li>
                    <li className="flex gap-3">
                        <Target size={18} className="text-red-500 shrink-0"/>
                        <span><b>ACCURACY (Ketelitian):</b> Kemampuan meminimalisir kesalahan di bawah tekanan. (Salah = -1 Poin).</span>
                    </li>
                    <li className="flex gap-3">
                        <TrendingUp size={18} className="text-blue-500 shrink-0"/>
                        <span><b>ENDURANCE (Ketahanan):</b> Konsistensi grafik performa dari menit ke-1 hingga ke-10.</span>
                    </li>
                </ul>
            </div>

            {/* Kanan: Instruksi */}
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
                <h3 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={16}/> PROTOKOL PENGERJAAN
                </h3>
                <ol className="list-decimal pl-4 space-y-3 text-sm text-gray-400">
                    <li>Total terdapat <b>10 Kolom</b> (Sesi).</li>
                    <li>Setiap kolom berdurasi <b>60 Detik</b>.</li>
                    <li>Lihat <b>Kunci Referensi</b> di bagian atas.</li>
                    <li>Temukan simbol yang <b>HILANG</b> di kotak soal.</li>
                    <li>Kunci referensi akan <b>BERUBAH</b> setiap ganti kolom. Jangan hafalkan kunci kolom sebelumnya!</li>
                </ol>
            </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg mb-8 text-center">
            <p className="text-blue-300 text-sm font-bold animate-pulse">
                "KECERDASAN TANPA KETELITIAN ADALAH KECEROBOHAN. JAGA RITME, JANGAN PANIK."
            </p>
        </div>

        <button 
          onClick={startTest}
          className="w-full md:w-auto mx-auto px-16 py-4 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase tracking-widest rounded-sm text-lg shadow-[0_0_30px_rgba(234,88,12,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
        >
          <Play fill="currentColor" /> MULAI (10 MENIT)
        </button>
      </div>
    );
  }

  // 2. HASIL ANALISA (FINISHED)
  if (gameStatus === 'FINISHED') {
    const analysis = getDetailedAnalysis(columnScores, columnErrors);
    if (!analysis) return null; // Safety check

    return (
      <div className="flex flex-col h-full max-w-6xl mx-auto w-full p-4 animate-in slide-in-from-bottom-10">
        
        {/* Header Hasil */}
        <div className="text-center mb-8 border-b border-white/10 pb-6 relative">
            <div className="absolute top-0 left-0 text-[10px] font-mono text-neutral-600">ID: {pkg.id.substring(0,8)}</div>
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.3em] mb-2">HASIL AKHIR OPERASI</h2>
            <h1 className={`text-4xl md:text-6xl font-black ${analysis.color} mb-2 tracking-tight`}>{analysis.label}</h1>
            <div className={`text-sm font-bold ${analysis.color} bg-black/30 inline-block px-4 py-1 rounded border border-white/5`}>
                {analysis.subLabel}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KIRI: GRAFIK & NARASI */}
            <div className="lg:col-span-2 space-y-6">
                {/* Grafik */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <BarChart3 size={14} className="text-orange-500"/> Visualisasi Stabilitas
                        </h3>
                        <div className="text-[10px] text-neutral-500 font-mono">X: WAKTU (MENIT) | Y: KECEPATAN</div>
                    </div>
                    {renderChart()}
                </div>

                {/* Narasi Intelijen */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-blue-400 uppercase mb-4 flex items-center gap-2">
                        <BrainCircuit size={14}/> ANALISA INTELIJEN
                    </h3>
                    <div className="space-y-3">
                        {analysis.narrative.map((text, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-black/40 rounded border border-white/5">
                                <span className="text-blue-500 font-bold text-xs mt-0.5">{i+1}.</span>
                                <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KANAN: STATISTIK DETAIL */}
            <div className="space-y-6">
                {/* Score Card */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-white uppercase mb-4">STATISTIK KUNCI</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                            <span className="text-xs text-neutral-500">NILAI AKHIR</span>
                            <span className={`text-2xl font-black ${analysis.color}`}>{analysis.finalScore}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                            <span className="text-xs text-neutral-500">RATA-RATA SPEED</span>
                            <span className="text-xl font-bold text-white">{analysis.avgScore} <span className="text-[10px] text-neutral-600">BPM</span></span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                            <span className="text-xs text-neutral-500">TOTAL ERROR</span>
                            <span className={`text-xl font-bold ${analysis.totalErrors > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{analysis.totalErrors}</span>
                        </div>
                    </div>
                </div>

                {/* Log Performa */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 flex flex-col h-[300px]">
                     <h3 className="text-xs font-bold text-white uppercase mb-4">LOG PERFORMA</h3>
                     <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                        {columnScores.map((s, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-black/40 rounded text-xs">
                                <span className="text-neutral-500 font-mono">KOLOM {i+1}</span>
                                <div className="flex gap-3">
                                    <span className="text-white font-bold">{s} Pts</span>
                                    {columnErrors[i] > 0 && <span className="text-red-500 font-bold">-{columnErrors[i]}</span>}
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                     <button onClick={startTest} className="py-3 bg-white hover:bg-gray-200 text-black font-black uppercase rounded-sm text-xs">ULANGI</button>
                     <button onClick={() => router.push('/dashboard/psychology')} className="py-3 border border-neutral-700 hover:border-white text-neutral-400 hover:text-white font-bold uppercase rounded-sm text-xs">KEMBALI</button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // 3. TRANSISI (ANTAR KOLOM)
  if (gameStatus === 'TRANSITION') {
      return (
          <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-300">
              <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">RE-KALIBRASI</h2>
              <div className="text-6xl font-black text-white mb-2">{currentColumn} <span className="text-2xl text-neutral-600">SELESAI</span></div>
              <div className="flex gap-6 mt-4 p-4 bg-neutral-900/80 rounded-lg border border-neutral-800">
                  <div className="text-center">
                      <div className="text-[10px] text-neutral-500 uppercase">SKOR</div>
                      <div className="text-2xl font-mono text-orange-500">{currentScore}</div>
                  </div>
                  <div className="w-px bg-neutral-800"></div>
                  <div className="text-center">
                      <div className="text-[10px] text-neutral-500 uppercase">SALAH</div>
                      <div className="text-2xl font-mono text-red-500">{currentErrors}</div>
                  </div>
              </div>
              <div className="mt-8 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-t-orange-500 border-neutral-800 rounded-full animate-spin"></div>
                  <p className="text-neutral-500 text-xs">MENYIAPKAN KUNCI BARU UNTUK KOLOM {currentColumn + 1}...</p>
              </div>
          </div>
      )
  }

  // 4. GAMEPLAY
  return (
    <div className={`flex flex-col h-full max-w-4xl mx-auto w-full relative ${isShaking ? 'animate-shake' : ''}`}>
      <style jsx global>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {/* Timer Bar */}
      <div className="w-full h-1 bg-neutral-800 fixed top-[64px] left-0 z-40">
          <div className={`h-full ${barColor} transition-all duration-1000 ease-linear shadow-[0_0_10px_currentColor]`} style={{ width: `${timePercent}%` }}></div>
      </div>

      {/* HUD */}
      <div className="flex justify-between items-end mb-6 p-6 bg-neutral-900/80 border border-neutral-800 rounded-b-xl backdrop-blur-sm sticky top-0 z-30 shadow-2xl">
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">POSISI</span>
            <span className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                KOLOM {currentColumn} <span className="text-sm text-neutral-600 font-bold">/ {TOTAL_COLUMNS}</span>
            </span>
        </div>

        <div className="flex gap-8 text-center">
             <div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">BENAR</span>
                <span className="text-4xl font-black text-white leading-none">{currentScore}</span>
             </div>
             <div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">SALAH</span>
                <span className="text-4xl font-black text-red-500 leading-none">{currentErrors}</span>
             </div>
        </div>

        <div className="text-right">
             <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">WAKTU</span>
             <span className={`text-2xl font-black font-mono flex items-center justify-end gap-2 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timeLeft}<span className="text-sm">s</span>
             </span>
        </div>
      </div>

      {/* ARENA */}
      <div className="flex-1 flex flex-col justify-center items-center gap-10 pb-10">
        <div className="w-full">
          <div className="flex justify-center gap-2 items-center mb-4">
              <ShieldAlert size={14} className="text-orange-500"/>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">KUNCI REFERENSI (HAFALKAN)</p>
          </div>
          <div className="flex justify-center gap-3 md:gap-6">
            {keySymbols.map((s, idx) => (
              <div key={idx} className="w-14 h-16 md:w-24 md:h-28 bg-neutral-800 border-b-[6px] border-neutral-700 rounded-xl flex items-center justify-center text-3xl md:text-5xl font-black text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 bg-orange-600/5 blur-3xl -z-10 rounded-full"></div>
          <div className={`flex justify-center items-center gap-4 md:gap-6 p-6 md:p-10 bg-black/60 border ${isShaking ? 'border-red-500' : 'border-orange-900/30'} rounded-3xl mx-auto max-w-fit shadow-[0_0_50px_-10px_rgba(0,0,0,0.7)] backdrop-blur-md transition-colors duration-100`}>
            {questionSymbols.map((s, idx) => (
               <div key={idx} className="w-12 h-12 md:w-16 md:h-16 bg-neutral-900 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold text-neutral-500 border border-white/5">
                 {s}
               </div>
            ))}
            <div className="w-14 h-14 md:w-20 md:h-20 bg-orange-600 rounded-xl flex items-center justify-center text-white text-3xl font-black shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse border-2 border-orange-400">?</div>
          </div>
          <p className="text-center text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mt-6">MANA YANG HILANG?</p>
        </div>

        <div className="grid grid-cols-5 gap-3 md:gap-5 w-full max-w-3xl px-4">
          {keySymbols.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(s)}
              className="h-20 md:h-24 bg-neutral-800 hover:bg-white hover:text-black hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] border-b-[6px] border-neutral-950 active:border-b-0 active:translate-y-1 rounded-2xl text-3xl md:text-4xl font-black transition-all duration-75 group"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}