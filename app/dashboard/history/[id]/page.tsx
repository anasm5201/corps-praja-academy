import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
    ArrowLeft, CheckCircle2, XCircle, AlertCircle, 
    Award, BarChart3, BookOpen 
} from "lucide-react";

export default async function HistoryDetailPage({ params }: { params: { id: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;

  // 2. CEK LOGIN
  if (!userId) {
    redirect("/auth/login");
  }

  // 3. AMBIL DATA HASIL UJIAN
  const attempt = await prisma.tryoutAttempt.findUnique({
      where: { id: params.id },
      include: {
          package: {
              include: {
                  questions: { orderBy: { createdAt: 'asc' } } // Ambil soal untuk pembahasan
              }
          }
      }
  });

  // 4. VALIDASI KEPEMILIKAN DATA
  if (!attempt || attempt.userId !== userId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-mono font-bold">
            AKSES DITOLAK: DOKUMEN RAHASIA.
        </div>
      );
  }

  // 5. PARSING JAWABAN USER (ADAPTIF: SUPPORT FORMAT BARU & LAMA)
  let answerMap = new Map<string, string>();
  let storedScores = { twk: 0, tiu: 0, tkp: 0 };
  let isNewFormat = false;

  try {
      if (attempt.answers && typeof attempt.answers === 'string') {
          const parsed = JSON.parse(attempt.answers);
          
          if (parsed.userAnswers && !Array.isArray(parsed.userAnswers)) {
              // FORMAT BARU: { userAnswers: { id: "A" }, details: { ... } }
              Object.entries(parsed.userAnswers).forEach(([k, v]) => answerMap.set(k, v as string));
              if (parsed.details) {
                  storedScores = parsed.details;
                  isNewFormat = true;
              }
          } else if (Array.isArray(parsed)) {
              // FORMAT LAMA: Array<{questionId, answerCode}>
              parsed.forEach((a: any) => answerMap.set(a.questionId, a.answerCode));
          }
      }
  } catch (e) {
      console.error("Gagal parsing jawaban:", e);
  }

  // 6. HITUNG SKOR (FALLBACK JIKA FORMAT LAMA)
  // Jika format baru, kita pakai storedScores. Jika lama, kita hitung manual.
  let scoreTWK = storedScores.twk;
  let scoreTIU = storedScores.tiu;
  let scoreTKP = storedScores.tkp;
  
  // PASSING GRADE SKD 2024
  const PG_TWK = 65;
  const PG_TIU = 80;
  const PG_TKP = 166;

  // Jika format lama (skor 0 semua), lakukan hitung ulang manual
  if (!isNewFormat && attempt.package && attempt.package.questions) {
      attempt.package.questions.forEach(q => {
          const uCode = answerMap.get(q.id);
          // Parsing Options: Handle string JSON or Object
          let opts: any[] = [];
          try {
             opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          } catch(e) { opts = [] }

          const selectedOpt = opts.find((o: any) => (o.code || o.key) === uCode);
          
          if (selectedOpt) {
              const points = selectedOpt.score || 0;
              // Deteksi Kategori Sederhana
              const textUpper = q.text.toUpperCase();
              const typeUpper = q.type?.toUpperCase() || "";
              
              if (typeUpper === "TWK" || textUpper.includes("TWK")) scoreTWK += points;
              else if (typeUpper === "TKP" || textUpper.includes("TKP") || (points > 0 && points < 5)) scoreTKP += points;
              else scoreTIU += points; // Default TIU
          }
      });
  }

  // Gunakan Total Score dari DB untuk validasi akhir
  const finalScore = attempt.score; 

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 p-6 md:p-12">
        
        {/* HEADER */}
        <div className="max-w-4xl mx-auto mb-8">
            <Link href="/dashboard/history" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-4 transition">
                <ArrowLeft size={16}/> KEMBALI KE ARSIP
            </Link>
            <div className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
                        Laporan Hasil Operasi
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                        Misi: {attempt.package?.title || "Unknown Mission"} • {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleDateString() : "-"}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Total Skor</p>
                    <p className={`text-4xl font-black ${finalScore >= 350 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {finalScore}
                    </p>
                </div>
            </div>
        </div>

        {/* SCORECARDS */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {/* TWK */}
            <div className={`p-6 rounded-2xl border ${scoreTWK >= PG_TWK ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
                <div className="flex justify-between mb-2">
                    <h3 className="font-black text-gray-400">TWK</h3>
                    <span className="text-[10px] bg-black px-2 py-1 rounded text-gray-500 border border-white/10">PG: {PG_TWK}</span>
                </div>
                <p className={`text-3xl font-black ${scoreTWK >= PG_TWK ? 'text-green-500' : 'text-red-500'}`}>{scoreTWK}</p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">{scoreTWK >= PG_TWK ? 'MEMENUHI SYARAT' : 'TIDAK MEMENUHI'}</p>
            </div>

            {/* TIU */}
            <div className={`p-6 rounded-2xl border ${scoreTIU >= PG_TIU ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
                <div className="flex justify-between mb-2">
                    <h3 className="font-black text-gray-400">TIU</h3>
                    <span className="text-[10px] bg-black px-2 py-1 rounded text-gray-500 border border-white/10">PG: {PG_TIU}</span>
                </div>
                <p className={`text-3xl font-black ${scoreTIU >= PG_TIU ? 'text-green-500' : 'text-red-500'}`}>{scoreTIU}</p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">{scoreTIU >= PG_TIU ? 'MEMENUHI SYARAT' : 'TIDAK MEMENUHI'}</p>
            </div>

            {/* TKP */}
            <div className={`p-6 rounded-2xl border ${scoreTKP >= PG_TKP ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
                <div className="flex justify-between mb-2">
                    <h3 className="font-black text-gray-400">TKP</h3>
                    <span className="text-[10px] bg-black px-2 py-1 rounded text-gray-500 border border-white/10">PG: {PG_TKP}</span>
                </div>
                <p className={`text-3xl font-black ${scoreTKP >= PG_TKP ? 'text-green-500' : 'text-red-500'}`}>{scoreTKP}</p>
                <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold">{scoreTKP >= PG_TKP ? 'MEMENUHI SYARAT' : 'TIDAK MEMENUHI'}</p>
            </div>
        </div>

        {/* PEMBAHASAN DETAIL */}
        <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-6 flex items-center gap-3">
                <BookOpen className="text-blue-500" size={24}/> Analisa Jawaban
            </h3>

            {attempt.package?.questions && attempt.package.questions.length > 0 ? (
                <div className="space-y-6">
                    {attempt.package.questions.map((q, idx) => {
                        const uCode = answerMap.get(q.id);
                        
                        // Parse options safely
                        let opts: any[] = [];
                        try {
                           opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                        } catch(e) { opts = [] }

                        // Logic Kunci Jawaban
                        const bestOpt = opts.length > 0 ? opts.reduce((prev:any, current:any) => (prev.score > current.score) ? prev : current) : { code: '-', score: 0 };
                        const userOpt = opts.find((o:any) => (o.code || o.key) === uCode);
                        const userScore = userOpt ? userOpt.score : 0;
                        
                        const isPerfect = userScore === bestOpt.score && bestOpt.score > 0;
                        const isWrong = userScore === 0;

                        return (
                            <div key={q.id} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition">
                                <div className="flex gap-4 mb-4">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 
                                        ${isPerfect ? 'bg-green-500 text-black' : isWrong ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}
                                    `}>
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-300 mb-4 font-serif leading-relaxed">
                                            {q.text}
                                        </p>
                                        
                                        {/* Opsi User vs Kunci */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                            <div className={`p-3 rounded-lg border ${isPerfect ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                                                <p className="text-gray-500 uppercase font-bold mb-1">Jawaban Anda</p>
                                                <p className="font-bold text-white text-sm">
                                                    {uCode || "-"} <span className="opacity-70">({userScore} Poin)</span>
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg border bg-blue-900/20 border-blue-500/50">
                                                <p className="text-gray-500 uppercase font-bold mb-1">Kunci Jawaban</p>
                                                <p className="font-bold text-white text-sm">
                                                    {bestOpt.code || bestOpt.key} <span className="opacity-70">({bestOpt.score} Poin)</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Accordion Pembahasan */}
                                <div className="mt-4 pt-4 border-t border-white/5 pl-12">
                                    <p className="text-[10px] text-blue-400 font-bold uppercase mb-2 flex items-center gap-2">
                                        <AlertCircle size={12}/> Intelijen / Pembahasan
                                    </p>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {/* ✅ FIX: Hapus q.discussion */}
                                        {q.explanation || "Analisa intelijen untuk soal ini belum didekripsi (Pembahasan tidak tersedia)."}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl text-gray-500 italic">
                    <AlertCircle className="mx-auto mb-4 opacity-50" size={32} />
                    Data soal arsip tidak ditemukan di database markas.<br/>
                    (Soal mungkin dimuat dari Logistik Lokal JSON saat ujian)
                </div>
            )}
        </div>

    </div>
  );
}