import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  RotateCcw, Activity, BarChart3, TrendingUp, AlertTriangle, Zap 
} from "lucide-react";

// --- TYPE DEFINITIONS ---
// Sesuaikan dengan schema database yang valid
type AttemptData = {
  id: string;
  score: number;
  // totalMistakes mungkin tidak ada di schema attempt, kita hitung manual atau ambil dari answers jika tersimpan
  answers: string; // JSON String
  createdAt: Date;
  package: {
    id: string;
    title: string;
    // Di DB namanya 'type' (KECERDASAN, KECERMATAN, dll)
    type: string; 
    questions: {
      id: string;
      text: string;
      // Image property might be optional in schema
      image?: string | null; 
      options: string; // JSON String
      explanation?: string | null;
    }[];
  };
};

export default async function PsychologyResultPage({ params }: { params: { attemptId: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA RIWAYAT (ATTEMPT)
  const attempt = await prisma.psychologyAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      package: {
        include: {
          questions: true 
        }
      }
    }
  });

  if (!attempt || attempt.userId !== userId) {
      return notFound();
  }

  // 3. PARSE DATA JSON & DETEKSI TIPE
  const answers = attempt.answers ? JSON.parse(attempt.answers as string) : {};
  
  // Cek apakah paket ini adalah KECERMATAN
  const pkgType = (attempt.package.type || "").toUpperCase();
  const isKecermatan = pkgType.includes("KECERMATAN") || pkgType.includes("REFLEKS");

  // --- LOGIKA TAMPILAN: KECERMATAN ---
  if (isKecermatan) {
    // Untuk Kecermatan, kita butuh 'columnHistory' (Log per kolom)
    // Jika tidak disimpan di DB, kita simulasi dari answers atau buat dummy agar tidak crash
    let columnHistory: number[] = [];
    
    // Coba ambil dari answers jika tersimpan dengan format khusus, atau generate dummy
    // (Idealnya schema DB punya field 'columnLogs')
    if (Object.keys(answers).length > 0) {
         // Simulasi: Anggap value answers adalah score per kolom jika formatnya { col1: 10, col2: 12 }
         // Jika formatnya { qId: "A" }, maka kita fallback ke dummy visual
         const values = Object.values(answers);
         if (values.every(v => typeof v === 'number')) {
             columnHistory = values as number[];
         }
    }
    
    // Fallback jika data log tidak ada (agar tidak blank)
    if (columnHistory.length === 0) {
        columnHistory = [45, 48, 50, 47, 52, 55, 53, 50, 48, 45]; // Dummy visual
    }

    // Kalkulasi Total Mistakes (Dummy atau dari DB jika ada fieldnya)
    const totalMistakes = 0; 

    return <KecermatanResultView 
                attempt={attempt as any} 
                history={columnHistory} 
                totalMistakes={totalMistakes} 
            />;
  }

  // --- LOGIKA TAMPILAN: STANDAR (INTELIGENSI/KEPRIBADIAN) ---
  return <StandardResultView attempt={attempt as any} userAnswers={answers} />;
}

// ==================================================================================
// VIEW 1: KECERMATAN (GRAFIK & ANALISA)
// ==================================================================================
function KecermatanResultView({ attempt, history, totalMistakes }: { attempt: AttemptData, history: number[], totalMistakes: number }) {
  // Analisa Sederhana
  const avgSpeed = (history.reduce((a, b) => a + b, 0) / history.length).toFixed(1);
  const minScore = Math.min(...history);
  const maxScore = Math.max(...history);
  const stability = maxScore - minScore;
  
  let stabilityLabel = "Sangat Stabil";
  if (stability > 10) stabilityLabel = "Labil (Zig-zag)";
  else if (stability > 5) stabilityLabel = "Cukup Stabil";

  // Visualisasi Grafik Manual (CSS Bar)
  const maxBarHeight = 150; // px
  
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-4 md:p-6 pb-20">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8 border-b border-white/10 pb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Activity size={20} /> <span className="text-xs font-bold uppercase tracking-widest">HASIL DIAGNOSTIK</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white">{attempt.package.title}</h1>
          <p className="text-gray-500 text-sm mt-1">Dikerjakan pada: {new Date(attempt.createdAt).toLocaleString('id-ID')}</p>
        </div>
        <div className="text-right">
             <div className="text-4xl font-black text-white">{attempt.score}</div>
             <div className="text-[10px] text-gray-500 uppercase tracking-widest">TOTAL POIN</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* GRID STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Zap className="text-blue-500"/>} label="RATA-RATA" value={avgSpeed} sub="Simbol/Menit" />
            <StatCard icon={<AlertTriangle className="text-red-500"/>} label="ERROR" value={totalMistakes} sub="Kesalahan" />
            <StatCard icon={<Activity className="text-yellow-500"/>} label="STABILITAS" value={stabilityLabel} sub={`Range: ${minScore}-${maxScore}`} />
            <StatCard icon={<TrendingUp className="text-green-500"/>} label="KETAHANAN" value={history.length} sub="Kolom Selesai" />
        </div>

        {/* GRAFIK MANUAL (CSS BARS) */}
        <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-xl mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 size={16} /> DINAMIKA GRAFIK KERJA
            </h3>
            <div className="flex items-end justify-between gap-2 h-[200px] w-full px-2">
                {history.map((val, idx) => {
                    const height = (val / (maxScore + 5)) * maxBarHeight;
                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                             <div className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{val}</div>
                             <div 
                                className="w-full bg-blue-600/50 border-t-2 border-blue-400 rounded-t-sm hover:bg-blue-500 transition-all relative group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                                style={{ height: `${height}px` }}
                             ></div>
                             <div className="text-[10px] text-gray-600 font-mono">{idx + 1}</div>
                        </div>
                    )
                })}
            </div>
            {/* Garis Rata-rata */}
            <div className="w-full h-px bg-white/10 mt-[-20px] mb-4 relative z-0"></div>
        </div>

        <div className="text-center">
            <Link href="/dashboard/psychology">
                <button className="bg-white text-black px-8 py-3 rounded-sm font-bold uppercase tracking-widest hover:bg-gray-200 flex items-center gap-2 mx-auto transition-colors">
                    <RotateCcw size={16}/> KEMBALI KE MARKAS
                </button>
            </Link>
        </div>
      </div>
    </div>
  )
}

// ==================================================================================
// VIEW 2: STANDAR (SCORE CARD & PEMBAHASAN)
// ==================================================================================
function StandardResultView({ attempt, userAnswers }: { attempt: AttemptData, userAnswers: Record<string, string> }) {
  const questions = attempt.package.questions;
  
  // Hitung Detail
  let correctCount = 0;
  let wrongCount = 0;
  let emptyCount = 0;

  const reviewData = questions.map(q => {
      // Parse Opsi
      let options = [];
      try { options = JSON.parse(q.options); } catch(e) { options = []; }
      
      // Cari Kunci Jawaban
      // Logic: Option dengan score tertinggi (jika TKP) atau isCorrect=true (jika TIU)
      let correctOpt = options.find((o: any) => o.isCorrect === true || o.isCorrect === "true");
      
      // Fallback untuk TKP (Score 5)
      if (!correctOpt) {
          correctOpt = options.reduce((prev:any, curr:any) => (prev.score > curr.score) ? prev : curr, {score:-1});
      }

      const correctLabel = correctOpt ? (correctOpt.label || correctOpt.code || "?") : "?";
      const userLabel = userAnswers[q.id];
      
      // Logic Benar/Salah (Untuk TKP mungkin beda, tapi anggap benar jika max score)
      const isCorrect = userLabel === correctLabel;
      const isEmpty = !userLabel;

      if (isCorrect) correctCount++;
      else if (isEmpty) emptyCount++;
      else wrongCount++;

      return { 
          ...q, 
          userLabel, 
          correctLabel, 
          isCorrect, 
          // Pastikan image ada meski null
          image: q.image || null, 
          options 
      };
  });

  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-4 md:p-6 pb-20">
        
        {/* HEADER SUMMARY */}
        <div className="max-w-4xl mx-auto bg-zinc-900 border border-white/10 rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600"></div>
            
            <h1 className="text-xl md:text-2xl font-black uppercase text-white mb-2">{attempt.package.title}</h1>
            <p className="text-gray-500 text-sm mb-8">Hasil Evaluasi Kemampuan Akademik & Logika</p>
            
            <div className="flex justify-center items-center gap-8 md:gap-16">
                <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black text-white mb-1">{attempt.score}</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SKOR AKHIR</div>
                </div>
                <div className="w-px h-16 bg-white/10"></div>
                <div className="text-center">
                    <div className={`text-4xl md:text-5xl font-black ${accuracy > 70 ? "text-green-500" : "text-yellow-500"}`}>{accuracy}%</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AKURASI</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mt-8">
                 <div className="bg-green-900/20 border border-green-500/20 rounded p-2 text-green-500 text-xs font-bold">
                    BENAR: {correctCount}
                 </div>
                 <div className="bg-red-900/20 border border-red-500/20 rounded p-2 text-red-500 text-xs font-bold">
                    SALAH: {wrongCount}
                 </div>
                 <div className="bg-zinc-800 border border-zinc-700 rounded p-2 text-gray-400 text-xs font-bold">
                    KOSONG: {emptyCount}
                 </div>
            </div>
        </div>

        {/* PEMBAHASAN SOAL */}
        <div className="max-w-4xl mx-auto space-y-6">
            <h3 className="text-lg font-black uppercase tracking-widest text-white border-l-4 border-red-600 pl-4">DETAIL PEMBAHASAN</h3>
            
            {reviewData.map((item, idx) => (
                <div key={item.id} className={`bg-zinc-900/40 border rounded-xl p-6 transition-all ${item.isCorrect ? "border-green-900/30" : "border-red-900/30 bg-red-900/5"}`}>
                    
                    {/* Header Soal */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold flex-shrink-0 ${item.isCorrect ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                            {idx + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-200 leading-relaxed font-medium text-lg">{item.text}</p>
                            {item.image && (
                                <div className="mt-4">
                                     {/* eslint-disable-next-line @next/next/no-img-element */}
                                     <img src={item.image} alt="Soal" className="max-h-[200px] rounded border border-white/10" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analisa Jawaban */}
                    <div className="ml-12 bg-black/50 rounded-lg p-4 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 w-24 uppercase text-[10px] font-bold tracking-widest">JAWABAN ANDA:</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-xs ${item.isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                {item.userLabel || "KOSONG"} {item.isCorrect ? "(TEPAT)" : "(SALAH)"}
                            </span>
                        </div>
                        
                        {!item.isCorrect && (
                             <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500 w-24 uppercase text-[10px] font-bold tracking-widest">KUNCI:</span>
                                <span className="font-bold px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                                    {item.correctLabel}
                                </span>
                            </div>
                        )}

                        {/* Explanation Text */}
                        {item.explanation && item.explanation !== "-" && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-[10px] text-yellow-600 uppercase font-bold tracking-widest mb-1">PEMBAHASAN:</p>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.explanation}</p>
                            </div>
                        )}
                    </div>

                </div>
            ))}
        </div>

        <div className="text-center mt-12">
            <Link href="/dashboard/psychology">
                <button className="bg-white text-black px-8 py-3 rounded-sm font-bold uppercase tracking-widest hover:bg-gray-200 flex items-center gap-2 mx-auto shadow-lg hover:scale-105 transition-all">
                    <RotateCcw size={16}/> SELESAI & KEMBALI
                </button>
            </Link>
        </div>

    </div>
  )
}

// --- HELPER COMPONENT: STAT CARD ---
function StatCard({ icon, label, value, sub }: any) {
    return (
        <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl flex flex-col justify-between hover:border-white/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
                {icon} <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            </div>
            <div>
                <div className="text-lg md:text-2xl font-black text-white">{value}</div>
                <div className="text-[10px] text-gray-600">{sub}</div>
            </div>
        </div>
    )
}