import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    BookOpen, Clock, Activity, Play, 
    CheckCircle2, AlertCircle, BarChart3, Lock, Trophy
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TryoutPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA PAKET & PROGRESS USER (FILTER KHUSUS SKD)
  const packages = await prisma.tryoutPackage.findMany({
      where: {
          isPublished: true,
          // 🔥 FILTER STRICT: HANYA TAMPILKAN SKD
          // (Drill & Psikologi dilarang masuk sini)
          category: "SKD" 
      },
      orderBy: { title: 'asc' }, // Urutkan nama paket (Paket 01, 02...)
      include: {
          _count: { select: { questions: true } },
          attempts: {
              where: { userId: userId },
              orderBy: { createdAt: 'desc' }, 
              take: 1
          }
      }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 px-4 sm:px-6 relative overflow-hidden font-sans">
        
        {/* Background Ambient */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto pt-10 relative z-10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-8 gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        <BookOpen size={12} /> Medan Operasi
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                        SIMULASI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">SKD CAT</span>
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-2xl text-sm leading-relaxed font-mono">
                        Pilih paket latihan untuk menguji kesiapan tempur Anda. Skor dihitung menggunakan standar penilaian terbaru.
                    </p>
                </div>
            </div>

            {/* Grid Paket */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => {
                    const lastAttempt = pkg.attempts[0]; 
                    const isFinished = lastAttempt?.isFinished;
                    const inProgress = lastAttempt && !lastAttempt.isFinished;
                    
                    return (
                        <div key={pkg.id} className="group relative bg-zinc-900/40 border border-white/10 p-1 rounded-3xl hover:bg-zinc-900/60 transition-all hover:border-blue-500/30 hover:-translate-y-1 duration-300">
                            
                            {/* Card Content */}
                            <div className="bg-[#0a0a0a] rounded-[20px] p-6 h-full flex flex-col relative overflow-hidden">
                                
                                {/* Status Badge */}
                                <div className="absolute top-6 right-6">
                                    {isFinished ? (
                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-green-500 bg-green-900/20 px-2 py-1 rounded border border-green-500/20">
                                            <CheckCircle2 size={12} /> Selesai
                                        </span>
                                    ) : inProgress ? (
                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-500/20 animate-pulse">
                                            <Activity size={12} /> Sedang Berjalan
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-500 bg-zinc-800 px-2 py-1 rounded border border-white/5">
                                            <Lock size={12} /> Belum Dimulai
                                        </span>
                                    )}
                                </div>

                                <div className="mb-2">
                                     <span className="text-[9px] font-black px-2 py-1 rounded border uppercase tracking-wider bg-blue-900/20 text-blue-500 border-blue-900/50">
                                        SKD PREMIUM
                                    </span>
                                </div>

                                <h3 className="text-lg font-black uppercase text-white mb-6 pr-20 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                                    {pkg.title}
                                </h3>
                                
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <Clock size={14} /> <span className="text-[10px] font-bold uppercase">Durasi</span>
                                        </div>
                                        <p className="text-xl font-black text-white">{pkg.duration}<span className="text-xs font-medium text-gray-500 ml-1">mnt</span></p>
                                    </div>
                                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <AlertCircle size={14} /> <span className="text-[10px] font-bold uppercase">Soal</span>
                                        </div>
                                        <p className="text-xl font-black text-white">{pkg._count.questions}</p>
                                    </div>
                                </div>

                                {/* Last Score (If Finished) */}
                                {isFinished && (
                                    <div className="mb-6 p-3 bg-green-900/10 border border-green-500/20 rounded-xl flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-green-500 flex items-center gap-2"><Trophy size={14}/> Skor Terakhir</span>
                                        <span className="text-lg font-black text-white">{lastAttempt.score}</span>
                                    </div>
                                )}

                                {/* Action Button */}
                                <div className="mt-auto">
                                    {isFinished ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link href={`/dashboard/result/${pkg.id}/${lastAttempt.id}`} className="w-full">
                                                <button className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-widest transition border border-white/5 flex items-center justify-center gap-2">
                                                    <BarChart3 size={16} /> Analisa
                                                </button>
                                            </Link>
                                            <Link href={`/dashboard/tryout/${pkg.id}/room`} className="w-full">
                                                <button className="w-full py-3 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2">
                                                    <Play size={16} fill="currentColor" /> Ulangi
                                                </button>
                                            </Link>
                                        </div>
                                    ) : inProgress ? (
                                        <Link href={`/dashboard/tryout/${pkg.id}/room`} className="w-full">
                                            <button className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black uppercase tracking-widest transition shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center justify-center gap-2">
                                                <Play size={16} fill="currentColor" /> LANJUTKAN
                                            </button>
                                        </Link>
                                    ) : (
                                        <Link href={`/dashboard/tryout/${pkg.id}/room`} className="w-full">
                                            <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest transition shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2">
                                                <Play size={16} fill="currentColor" /> KERJAKAN
                                            </button>
                                        </Link>
                                    )}
                                </div>

                            </div>
                        </div>
                    );
                })}

                {packages.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                        <p className="text-gray-500 font-bold uppercase">Belum ada paket soal tersedia.</p>
                        <p className="text-xs text-gray-600 mt-2 font-mono">Hubungi admin untuk update logistik.</p>
                    </div>
                )}
            </div>

        </div>
    </div>
  );
}