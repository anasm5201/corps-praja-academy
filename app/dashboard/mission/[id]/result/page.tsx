import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    Trophy, XCircle, CheckCircle, ArrowRight, 
    RotateCcw, Shield, Target, Calendar 
} from "lucide-react";

export default async function MissionResultPage({ params }: { params: { id: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA PERCOBAAN TERAKHIR (Gunakan 'tryoutAttempt' & 'packageId')
  const attempt = await prisma.tryoutAttempt.findFirst({
      where: {
          packageId: params.id, // Ganti missionId ke packageId
          userId: userId
      },
      orderBy: { createdAt: 'desc' }, // Ambil yang paling baru
      include: {
          package: true // Sertakan info paket soal
      }
  });

  // Jika tidak ada data attempt, kembalikan ke dashboard
  if (!attempt) {
      redirect("/dashboard/tryout");
  }

  // 3. LOGIKA PASSING GRADE (SIMULASI)
  // Anda bisa sesuaikan ini dengan logic real passing grade SKD nanti
  const isPassed = attempt.score >= 350; // Ambang batas sementara

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background FX */}
        <div className={`absolute inset-0 opacity-10 ${isPassed ? 'bg-green-900' : 'bg-red-900'}`}></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

        <div className="max-w-3xl w-full relative z-10">
            
            {/* STATUS HEADER */}
            <div className="text-center mb-8 animate-in zoom-in duration-500">
                {isPassed ? (
                    <div className="inline-flex flex-col items-center">
                        <Trophy size={64} className="text-yellow-500 mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 uppercase tracking-tighter">
                            MISSION ACCOMPLISHED
                        </h1>
                        <p className="text-yellow-500/80 font-mono tracking-[0.3em] mt-2">OPERASI SUKSES</p>
                    </div>
                ) : (
                    <div className="inline-flex flex-col items-center">
                        <XCircle size={64} className="text-red-500 mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-700 uppercase tracking-tighter">
                            MISSION FAILED
                        </h1>
                        <p className="text-red-500/80 font-mono tracking-[0.3em] mt-2">OPERASI GAGAL - EVALUASI DIBUTUHKAN</p>
                    </div>
                )}
            </div>

            {/* SCORE CARD */}
            <div className="bg-zinc-900/80 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-8 mb-8">
                    <div>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Misi</h2>
                        <p className="text-xl font-bold text-white">{attempt.package?.title || "Unknown Mission"}</p>
                    </div>
                    <div className="text-right">
                         <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Skor</h2>
                         <p className={`text-5xl font-black ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                             {attempt.score}
                         </p>
                    </div>
                </div>

                {/* STATS GRID (Placeholder Score Breakdown) */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">TWK</p>
                        <p className="text-2xl font-black text-white">-</p> 
                        {/* Nanti ambil dari detail attempt jika ada */}
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">TIU</p>
                        <p className="text-2xl font-black text-white">-</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">TKP</p>
                        <p className="text-2xl font-black text-white">-</p>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col md:flex-row gap-4">
                    <Link href={`/dashboard/history/${attempt.id}`} className="flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all">
                        <Target size={18} />
                        Lihat Pembahasan
                    </Link>
                    <Link href="/dashboard/tryout" className="flex-1 py-3 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all">
                        <RotateCcw size={18} />
                        Kembali ke Markas
                    </Link>
                </div>

            </div>

        </div>
    </div>
  );
}