import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    ArrowLeft, CheckCircle2, XCircle, AlertCircle, 
    BookOpen, HelpCircle 
} from "lucide-react";

export default async function MissionReviewPage({ params }: { params: { id: string, attemptId: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA ATTEMPT + PAKET SOAL (Gunakan 'tryoutAttempt')
  // Kita query attempt-nya langsung, lalu include package dan questions
  const attempt = await prisma.tryoutAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
          package: {
              include: {
                  questions: { orderBy: { createdAt: 'asc' } } // Ambil soal urut
              }
          }
      }
  });

  // 3. VALIDASI AKSES
  if (!attempt || attempt.userId !== userId) {
      return (
          <div className="min-h-screen flex items-center justify-center text-red-500 font-mono font-bold bg-black">
              AKSES DITOLAK: DOKUMEN RAHASIA.
          </div>
      );
  }

  // 4. PARSING JAWABAN USER
  let answerMap = new Map<string, string>();
  
  try {
      if (attempt.answers && typeof attempt.answers === 'string') {
          const parsed = JSON.parse(attempt.answers);
          
          // Cek format: Array atau Object
          if (Array.isArray(parsed)) {
              // Legacy Format: [{questionId, answerCode}, ...]
              parsed.forEach((a: any) => answerMap.set(a.questionId, a.answerCode));
          } else if (parsed.userAnswers) {
              // New Format: { userAnswers: { id: code }, details: ... }
              Object.entries(parsed.userAnswers).forEach(([k, v]) => answerMap.set(k, v as string));
          }
      }
  } catch (e) {
      console.error("Gagal parsing jawaban:", e);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 p-4 md:p-8">
        
        {/* HEADER */}
        <div className="max-w-4xl mx-auto mb-8">
            <Link href={`/dashboard/mission/${params.id}/result`} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-4 transition">
                <ArrowLeft size={16}/> KEMBALI KE HASIL
            </Link>
            <div className="border-b border-white/10 pb-6">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-3">
                    <BookOpen className="text-blue-500" size={32}/> Evaluasi Taktis
                </h1>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                    Misi: {attempt.package?.title || "Unknown Mission"}
                </p>
            </div>
        </div>

        {/* QUESTION LIST */}
        <div className="max-w-4xl mx-auto space-y-6">
            {attempt.package?.questions.map((q, idx) => {
                const uCode = answerMap.get(q.id);
                
                // Parse Options safely
                let opts: any[] = [];
                try {
                   opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                } catch(e) { opts = [] }

                // Determine Correct Answer (Highest Score)
                const bestOpt = opts.length > 0 ? opts.reduce((prev:any, curr:any) => (prev.score > curr.score) ? prev : curr) : { code: '-', score: 0 };
                const userOpt = opts.find((o:any) => (o.code || o.key) === uCode);
                
                // Logic Status Jawaban
                const isCorrect = userOpt && userOpt.score === bestOpt.score;
                const isWrong = !isCorrect && uCode;
                const isSkipped = !uCode;

                return (
                    <div key={q.id} className={`bg-zinc-900/40 border rounded-2xl p-6 transition-all ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                        
                        {/* Question Header */}
                        <div className="flex gap-4 mb-4">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 
                                ${isCorrect ? 'bg-green-500 text-black' : isSkipped ? 'bg-gray-700 text-gray-300' : 'bg-red-500 text-white'}
                            `}>
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <p className="text-sm text-gray-300 mb-4 font-serif leading-relaxed">
                                    {q.text}
                                </p>

                                {/* Options Comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    {/* Jawaban User */}
                                    <div className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                                        <p className="text-gray-500 uppercase font-bold mb-1">Jawaban Anda</p>
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-white text-sm">
                                                {uCode || "Tidak Dijawab"}
                                            </p>
                                            {/* ✅ FIX: Ganti CheckCircle jadi CheckCircle2 */}
                                            {isCorrect ? <CheckCircle2 size={16} className="text-green-500"/> : <XCircle size={16} className="text-red-500"/>}
                                        </div>
                                    </div>

                                    {/* Kunci Jawaban */}
                                    <div className="p-3 rounded-lg border bg-blue-900/20 border-blue-500/50">
                                        <p className="text-gray-500 uppercase font-bold mb-1">Kunci Jawaban</p>
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-white text-sm">
                                                {bestOpt.code || bestOpt.key}
                                            </p>
                                            <span className="text-[10px] text-blue-400 font-mono">({bestOpt.score} Poin)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pembahasan / Explanation */}
                        <div className="mt-4 pt-4 border-t border-white/5 pl-12">
                            <div className="flex items-center gap-2 mb-2 text-blue-400">
                                <HelpCircle size={14} />
                                <span className="text-[10px] font-bold uppercase">Pembahasan Intelijen</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed italic">
                                {q.explanation || "Data pembahasan belum didekripsi oleh markas pusat."}
                            </p>
                        </div>

                    </div>
                );
            })}
        </div>
    </div>
  );
}