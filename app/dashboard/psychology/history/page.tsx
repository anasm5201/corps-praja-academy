import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    History, Calendar, ArrowRight, Brain, 
    AlertCircle 
} from "lucide-react";

export default async function PsychologyHistoryPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;

  // 2. CEK LOGIN
  if (!userId) {
    redirect("/auth/login");
  }

  // 3. AMBIL DATA RIWAYAT PSIKOLOGI
  // Pastikan model 'psychologyAttempt' ada di schema.prisma
  const attempts = await prisma.psychologyAttempt.findMany({
    where: { userId: userId },
    include: { 
        package: true 
    },
    // Gunakan 'createdAt' (standar) atau 'startedAt' sesuai schema Anda. 
    // Kita gunakan 'createdAt' untuk keamanan.
    orderBy: { createdAt: 'desc' } 
  });

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6 pt-8 text-white">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-6 mb-8">
            <div className="p-3 bg-pink-900/20 rounded-xl border border-pink-500/30 text-pink-500">
                <History size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                    Arsip Psikologi
                </h1>
                <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">
                    Riwayat Tes Kecerdasan & Kepribadian
                </p>
            </div>
        </div>

        {/* LIST RIWAYAT */}
        <div className="grid gap-4">
            {attempts.length > 0 ? (
                attempts.map((attempt) => (
                    <div key={attempt.id} className="group relative bg-zinc-900/40 border border-white/5 hover:border-pink-500/50 rounded-2xl p-6 transition-all duration-300 hover:bg-zinc-900/80">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            
                            {/* Info Kiri */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-pink-900/10 border border-pink-500/20 text-pink-500">
                                    <Brain size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-pink-400 transition-colors">
                                        {attempt.package?.title || "Tes Psikologi"}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-mono">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12}/> 
                                            {new Date(attempt.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Kanan (Skor & Action) */}
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">Skor</p>
                                    <p className="text-3xl font-black text-white">
                                        {attempt.score}
                                    </p>
                                </div>
                                <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
                                <Link 
                                    href={`/dashboard/history/psychology/${attempt.id}`}
                                    className="p-3 rounded-full bg-white/5 hover:bg-pink-600 hover:text-white transition-colors"
                                >
                                    <ArrowRight size={20} />
                                </Link>
                            </div>

                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                    <AlertCircle className="mx-auto text-gray-600 mb-4" size={48} />
                    <h3 className="text-gray-400 font-bold text-lg">Belum Ada Riwayat</h3>
                    <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
                        Anda belum mengikuti tes psikologi apapun.
                    </p>
                    <Link href="/dashboard/psychology" className="inline-block mt-6 px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition">
                        Mulai Tes
                    </Link>
                </div>
            )}
        </div>
    </div>
  );
}