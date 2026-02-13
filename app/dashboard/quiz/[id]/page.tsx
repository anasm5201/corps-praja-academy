import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    Brain, Clock, HelpCircle, Play, 
    ArrowLeft, ShieldAlert, Trophy, BookOpen 
} from "lucide-react";

export default async function QuizStartPage({ params }: { params: { id: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA QUIZ (TARGET: TryoutPackage)
  // ✅ FIX: Gunakan 'tryoutPackage' yang valid di schema, bukan 'quiz' atau 'mission'
  const quiz = await prisma.tryoutPackage.findUnique({
      where: { id: params.id },
      include: {
          questions: {
              select: { id: true } // Hanya hitung ID untuk efisiensi
          }
      }
  });

  if (!quiz) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
            <ShieldAlert size={64} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-black text-white uppercase mb-2">PAKET TIDAK DITEMUKAN</h1>
            <p className="text-gray-500 mb-8">Dokumen operasi yang Anda cari tidak tersedia dalam arsip.</p>
            <Link href="/dashboard" className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition">
                KEMBALI KE MARKAS
            </Link>
        </div>
      );
  }

  const questionCount = quiz.questions.length;
  // Gunakan fallback value jika kolom optional
  const duration = (quiz as any).duration || 100; // Default SKD biasanya 100 menit
  const title = (quiz as any).title || "Simulasi SKD";
  const category = (quiz as any).category || "SKD";

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-transparent opacity-50"></div>
        <div className="absolute -right-20 bottom-0 w-96 h-96 bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-2xl w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-8 md:p-12 relative backdrop-blur-xl shadow-2xl">
            
            {/* Back Button */}
            <Link href="/dashboard" className="absolute top-6 left-6 text-gray-500 hover:text-white transition">
                <ArrowLeft size={24} />
            </Link>

            <div className="text-center space-y-6 mt-4">
                {/* Icon Badge */}
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-900 to-black border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] relative group">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <BookOpen size={48} className="text-emerald-500 relative z-10" />
                </div>

                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-3">
                        <Trophy size={12} /> {category}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">
                        {title}
                    </h1>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                        {(quiz as any).description || "Kerjakan soal dengan teliti dan cepat. Waktu akan berjalan mundur otomatis."}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-8 my-8">
                    <div className="text-center border-r border-white/5">
                        <div className="flex justify-center mb-2"><Clock className="text-emerald-500" size={24}/></div>
                        <p className="text-3xl font-black text-white">{duration}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">MENIT</p>
                    </div>
                    <div className="text-center">
                        <div className="flex justify-center mb-2"><HelpCircle className="text-blue-500" size={24}/></div>
                        <p className="text-3xl font-black text-white">{questionCount}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">SOAL</p>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-2">
                    <Link 
                        // Arahkan ke rute play yang sesuai. Jika tryout, biasanya ke /dashboard/tryout/[id]/room
                        // Tapi karena ini di folder quiz, kita asumsikan strukturnya /dashboard/quiz/[id]/play
                        href={`/dashboard/quiz/${quiz.id}/play`} 
                        className="group relative w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 hover:bg-emerald-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    >
                        <Play size={20} fill="currentColor" />
                        MULAI SIMULASI
                    </Link>
                    <p className="text-[10px] text-gray-600 mt-4 font-mono">
                        *Pastikan koneksi internet stabil.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}