import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    Trophy, XCircle, CheckCircle2, Clock, 
    ArrowLeft, Activity, Target, ShieldAlert,
    BarChart2, Zap, AlertTriangle, User, Ban
} from "lucide-react";

export default async function TryoutResultPage({ params }: { params: { attemptId: string } }) {
  // 1. AUTH CHECK
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/auth/login");

  // 2. DATA FETCHING
  const attempt = await prisma.tryoutAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
          package: {
              include: { questions: { orderBy: { id: 'asc' } } }
          }
      }
  });

  if (!attempt) return notFound();
  if (attempt.userId !== userId) redirect("/dashboard");

  const pkg = attempt.package;
  
  // 3. PARSING JAWABAN (FIX LOGIKA)
  let userAnswers: Record<string, number> = {};
  try {
      userAnswers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : (attempt.answers as any) || {};
  } catch (e) { userAnswers = {}; }

  // 4. KONFIGURASI TARGET & SCORE
  const TARGETS = { TWK: 65, TIU: 80, TKP: 166 };
  const MAX_SCORES = { TWK: 150, TIU: 175, TKP: 225 };

  const stats = {
      TWK: { score: 0, correct: 0, wrong: 0, total: 0 },
      TIU: { score: 0, correct: 0, wrong: 0, total: 0 },
      TKP: { score: 0, total: 0 }, 
      TOTAL: { score: 0, correct: 0, wrong: 0, empty: 0 }
  };

  const mapKey = ["A", "B", "C", "D", "E"];

  // Mapping Data untuk Bedah Soal
  const reviewData = pkg.questions.map((q, index) => {
      const userAnswerIndex = userAnswers[q.id]; 
      const userChar = userAnswerIndex !== undefined ? mapKey[userAnswerIndex] : null;
      const isAnswered = userChar !== null;
      
      let type = "UMUM";
      if (q.type.includes("TWK")) type = "TWK";
      else if (q.type.includes("TIU")) type = "TIU";
      else if (q.type.includes("TKP")) type = "TKP";

      let options: any[] = [];
      try {
          options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      } catch(e) { options = [] }

      let point = 0;
      let tkpPointsMap: number[] = []; 

      if (type === "TKP") {
          // LOGIKA TKP
          if (isAnswered) {
             const selectedOpt = options[userAnswerIndex];
             point = selectedOpt?.score || selectedOpt?.points || 0;
          }
          stats.TKP.score += point;
          stats.TKP.total++;
          tkpPointsMap = options.map((o: any) => o.score || o.points || 0);
      } else {
          // LOGIKA TIU/TWK
          const isCorrect = userChar === q.correctAnswer;
          point = isCorrect ? 5 : 0;

          if (type === "TWK") { 
              stats.TWK.score += point; 
              isCorrect ? stats.TWK.correct++ : stats.TWK.wrong++;
              stats.TWK.total++;
          } else if (type === "TIU") { 
              stats.TIU.score += point; 
              isCorrect ? stats.TIU.correct++ : stats.TIU.wrong++;
              stats.TIU.total++;
          }
          
          if (isCorrect) stats.TOTAL.correct++;
          else stats.TOTAL.wrong++;
      }

      if (!isAnswered) stats.TOTAL.empty++;
      stats.TOTAL.score += point;

      return {
          no: index + 1,
          question: q.text,
          image: q.image,
          svgCode: q.svgCode,
          userIndex: userAnswerIndex, 
          correctChar: q.correctAnswer, 
          explanation: q.explanation,
          point: point,
          type: type,
          options: options,
          tkpPoints: tkpPointsMap,
          isAnswered: isAnswered 
      };
  });

  const isPassed = stats.TWK.score >= TARGETS.TWK && 
                   stats.TIU.score >= TARGETS.TIU && 
                   stats.TKP.score >= TARGETS.TKP;

  const durationSeconds = attempt.finishedAt 
      ? (new Date(attempt.finishedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000 
      : pkg.duration * 60;

  return (
    <div className="min-h-screen bg-[#020202] text-white py-12 px-4 relative font-sans">
        
        {/* Background Grid Taktis (Memanggil class dari globals.css) */}
        <div className="fixed inset-0 tactical-grid opacity-20 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
            
            {/* Header Navigasi */}
            <Link href="/dashboard/tryout" className="inline-flex items-center gap-2 text-zinc-500 hover:text-red-500 mb-10 transition group font-mono text-xs tracking-widest uppercase">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> KEMBALI KE MARKAS
            </Link>

            {/* === SEKSI 1: STATUS & SKOR === */}
            <div className={`glass-panel rounded-sm p-8 mb-8 relative overflow-hidden group border-l-4 
                ${isPassed ? 'border-l-green-600 shadow-[0_0_50px_rgba(22,163,74,0.1)]' : 'border-l-red-600 shadow-[0_0_50px_rgba(220,38,38,0.1)]'}
            `}>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded border text-sm font-black uppercase tracking-widest mb-4
                            ${isPassed 
                                ? 'bg-green-950/40 text-green-400 border-green-800' 
                                : 'bg-red-950/40 text-red-500 border-red-800'}
                        `}>
                            {isPassed ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}
                            {isPassed ? "MISI SUKSES (LULUS)" : "MISI GAGAL (TIDAK LULUS)"}
                        </div>
                        <h1 className="text-7xl font-black text-white tracking-tighter drop-shadow-lg">
                            {stats.TOTAL.score}
                        </h1>
                        <p className="text-zinc-500 text-xs font-mono uppercase tracking-[0.4em]">TOTAL SKOR PEROLEHAN</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
                            <Clock className="w-5 h-5 text-blue-500 mx-auto mb-2"/>
                            <div className="text-lg font-black text-white">{Math.floor(durationSeconds/60)}<span className="text-xs font-medium text-zinc-500">M</span></div>
                            <div className="text-[9px] text-zinc-600 font-bold uppercase">DURASI</div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
                            <Target className="w-5 h-5 text-yellow-500 mx-auto mb-2"/>
                            <div className="text-lg font-black text-white">{stats.TOTAL.correct}</div>
                            <div className="text-[9px] text-zinc-600 font-bold uppercase">BENAR</div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
                            <Ban className="w-5 h-5 text-zinc-500 mx-auto mb-2"/>
                            <div className="text-lg font-black text-white">{stats.TOTAL.empty}</div>
                            <div className="text-[9px] text-zinc-600 font-bold uppercase">KOSONG</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* === SEKSI 2: ANALISA SEKTOR === */}
            <div className="mb-6 flex items-center gap-2">
                <BarChart2 className="text-red-600" />
                <h3 className="text-lg font-black uppercase tracking-[0.2em]">ANALISA SEKTOR & AMBANG BATAS</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <ComparativeChart label="TWK" desc="WAWASAN KEBANGSAAN" score={stats.TWK.score} target={TARGETS.TWK} max={MAX_SCORES.TWK} icon={<ShieldAlert size={20} className="text-red-500"/>} />
                <ComparativeChart label="TIU" desc="INTELEGENSIA UMUM" score={stats.TIU.score} target={TARGETS.TIU} max={MAX_SCORES.TIU} icon={<Activity size={20} className="text-yellow-500"/>} />
                <ComparativeChart label="TKP" desc="KARAKTERISTIK PRIBADI" score={stats.TKP.score} target={TARGETS.TKP} max={MAX_SCORES.TKP} icon={<User size={20} className="text-blue-500"/>} />
            </div>

            {/* === SEKSI 3: BEDAH TAKTIS === */}
            <div className="mb-8 flex items-center gap-4">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                    <Zap className="text-yellow-500" /> BEDAH TAKTIS (PEMBAHASAN)
                </h3>
                <div className="h-px bg-zinc-800 flex-1"></div>
            </div>

            <div className="space-y-6 pb-20">
                {reviewData.map((item) => (
                    <div key={item.no} className={`bg-[#0A0A0A] border rounded-sm p-6 relative overflow-hidden transition-all group
                        ${!item.isAnswered ? 'border-yellow-900/40' : 'border-zinc-800 hover:border-zinc-600'}
                    `}>
                        <div className="flex gap-6">
                            {/* Nomor & Poin */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded flex items-center justify-center font-black text-sm text-white">
                                    {item.no}
                                </div>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${item.point > 0 ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                    +{item.point}
                                </span>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-black uppercase bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500">
                                        {item.type}
                                    </span>
                                    {!item.isAnswered && (
                                        <span className="text-[10px] font-bold uppercase text-yellow-600 flex items-center gap-1 animate-pulse">
                                            <AlertTriangle size={10} /> TIDAK DIISI
                                        </span>
                                    )}
                                </div>

                                <div className="text-base text-gray-200 leading-relaxed font-medium mb-6 font-sans">
                                    {item.question}
                                </div>

                                {(item.image || item.svgCode) && (
                                    <div className="mb-6 p-4 bg-zinc-900/50 rounded border border-zinc-800/50 inline-block">
                                        {item.svgCode ? (
                                            <div className="max-w-xs text-zinc-300 [&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: item.svgCode }} />
                                        ) : (
                                            <img src={item.image!} alt="Visual Soal" className="max-w-xs rounded object-contain border border-zinc-700"/>
                                        )}
                                    </div>
                                )}

                                {/* OPSI JAWABAN */}
                                <div className="space-y-2 mb-6 ml-0 md:ml-2">
                                    {item.options.map((opt: any, idx: number) => {
                                        const char = mapKey[idx];
                                        const isSelected = item.userIndex === idx;
                                        
                                        let style = "bg-zinc-900/30 border-zinc-800 text-zinc-500"; 
                                        let statusBadge = null;

                                        if (item.type === "TKP") {
                                            const score = item.tkpPoints[idx] || 0;
                                            style = "bg-zinc-900/30 border-zinc-800 text-zinc-400";
                                            statusBadge = <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded border ${score === 5 ? 'bg-blue-900/30 border-blue-600 text-blue-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>{score} POIN</span>;
                                            if (isSelected) style = "bg-blue-900/20 border-blue-500 text-white ring-1 ring-blue-500";
                                        } else {
                                            const isKey = char === item.correctChar;
                                            if (isKey) {
                                                style = "bg-green-900/20 border-green-500 text-green-400"; 
                                                statusBadge = <span className="ml-auto text-[9px] font-black text-green-500 flex items-center gap-1"><CheckCircle2 size={12}/> KUNCI</span>;
                                            } else if (isSelected && !isKey) {
                                                style = "bg-red-900/20 border-red-500 text-red-400"; 
                                                statusBadge = <span className="ml-auto text-[9px] font-black text-red-500 flex items-center gap-1"><XCircle size={12}/> PILIHANMU</span>;
                                            }
                                        }

                                        return (
                                            <div key={idx} className={`flex items-center gap-4 p-3 rounded border text-sm transition-all ${style}`}>
                                                <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs border border-white/10 shrink-0 ${isSelected ? 'bg-white text-black' : 'bg-black text-zinc-500'}`}>{char}</div>
                                                <div className="flex-1 leading-snug">{opt.text || opt.label || opt}</div>
                                                {statusBadge}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Analisa */}
                                <div className="bg-zinc-950 border-l-2 border-yellow-600 p-5 rounded-r">
                                    <h4 className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Activity size={12}/> ANALISA INSTRUKTUR
                                    </h4>
                                    <div className="text-sm text-zinc-400 leading-relaxed text-justify">
                                        {item.explanation || "Pembahasan belum tersedia untuk amunisi ini."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}

// KOMPONEN CHART (WAJIB ADA DI FILE INI JUGA)
function ComparativeChart({ label, desc, score, target, max, icon }: any) {
    const isPassed = score >= target;
    const scorePerc = Math.min((score / max) * 100, 100);
    const targetPerc = (target / max) * 100;

    return (
        <div className="bg-[#0A0A0A] border border-zinc-800 p-6 rounded-sm relative flex flex-col h-full hover:border-zinc-700 transition-colors group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 rounded border border-zinc-800 group-hover:border-zinc-600 transition">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white leading-none">{label}</h3>
                        <p className="text-[9px] text-zinc-500 font-mono uppercase mt-1">{desc}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-black ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                        {score}
                    </div>
                    <div className="text-[10px] text-zinc-600 font-bold">POIN</div>
                </div>
            </div>

            <div className="mt-auto">
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono mb-2 uppercase">
                    <span>0</span>
                    <span className={isPassed ? 'text-green-600' : 'text-red-600'}>
                        TARGET: {target}
                    </span>
                    <span>{max}</span>
                </div>

                <div className="h-4 w-full bg-zinc-900 rounded-sm relative border border-zinc-800 overflow-hidden">
                    <div className="absolute top-0 bottom-0 w-0.5 border-l border-dashed border-white/50 z-30" style={{ left: `${targetPerc}%` }}></div>
                    <div className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out z-20 ${isPassed ? 'bg-gradient-to-r from-green-900 to-green-500' : 'bg-gradient-to-r from-red-900 to-red-600'}`} style={{ width: `${scorePerc}%` }}></div>
                </div>
            </div>
        </div>
    );
}