import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
    History, Calendar, ChevronRight, BarChart3, 
    Target, Trophy, AlertTriangle 
} from "lucide-react";

export default async function HistoryPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;

  // 2. CEK LOGIN
  if (!userId) {
    redirect("/auth/login");
  }

  // 3. AMBIL DATA RIWAYAT (Gunakan 'tryoutAttempt' agar sinkron dengan SKD)
  const attempts = await prisma.tryoutAttempt.findMany({
    where: { userId: userId },
    include: {
      package: {
        select: { title: true } // Ambil judul paket
      }
    },
    orderBy: { createdAt: 'desc' } // Urutkan dari yang terbaru
  });

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6 space-y-8 text-white">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-6 pt-6">
            <div className="p-3 bg-zinc-900 rounded-xl border border-white/10">
                <History className="text-blue-500" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                    Arsip Operasi
                </h1>
                <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">
                    Riwayat Latihan & Simulasi SKD
                </p>
            </div>
        </div>

        {/* LIST RIWAYAT */}
        <div className="grid gap-4">
            {attempts.length > 0 ? (
                attempts.map((attempt) => {
                    // Kalkulasi Status Lulus (Simulasi)
                    // Anda bisa ambil dari attempt.answers jika sudah di-parse, atau logic sederhana score > 350
                    const isPassed = attempt.score >= 350; 
                    
                    return (
                        <Link 
                            key={attempt.id} 
                            href={`/dashboard/history/${attempt.id}`}
                            className="group relative bg-zinc-900/40 border border-white/5 hover:border-yellow-500/50 rounded-2xl p-6 transition-all duration-300 hover:bg-zinc-900/80"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                
                                {/* Info Kiri */}
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl border ${isPassed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                        {isPassed ? <Trophy size={24} className="text-green-500"/> : <Target size={24} className="text-red-500"/>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-yellow-500 transition-colors">
                                            {attempt.package?.title || "Misi Tidak Dikenal"}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-mono">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12}/> 
                                                {new Date(attempt.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Kanan (Skor) */}
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">Total Skor</p>
                                        <p className={`text-3xl font-black ${isPassed ? 'text-green-500' : 'text-white'}`}>
                                            {attempt.score}
                                        </p>
                                    </div>
                                    <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
                                    <ChevronRight className="text-gray-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                                </div>

                            </div>
                        </Link>
                    );
                })
            ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                    <AlertTriangle className="mx-auto text-gray-600 mb-4" size={48} />
                    <h3 className="text-gray-400 font-bold text-lg">Belum Ada Riwayat</h3>
                    <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
                        Anda belum melaksanakan operasi simulasi apapun. Segera menuju ruang ujian untuk memulai latihan.
                    </p>
                    <Link href="/dashboard/tryout" className="inline-block mt-6 px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition">
                        Mulai Latihan
                    </Link>
                </div>
            )}
        </div>
    </div>
  );
}