import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    Target, Clock, Shield, AlertTriangle, 
    PlayCircle, Trophy, Star 
} from "lucide-react";

export default async function MissionListPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. SAFE DATA FETCHING
  // ✅ FIX: Berikan tipe eksplisit 'any[]' agar TypeScript tidak bingung
  let missions: any[] = [];
  
  try {
      // Gunakan 'tryoutPackage' sesuai schema database kita
      missions = await prisma.tryoutPackage.findMany({
          where: {
              // Filter status PUBLISHED jika ada, atau tampilkan semua
              // isPublished: true 
          },
          include: {
              _count: {
                  select: { questions: true }
              }
          },
          orderBy: { createdAt: 'desc' }
      });
  } catch (error) {
      console.error("Gagal mengambil data misi:", error);
      // missions tetap [] jika error
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 pt-8 text-white">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Target className="text-blue-500" size={40} />
                    Daftar <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Operasi</span>
                </h1>
                <p className="text-gray-400 text-sm mt-2 font-mono uppercase tracking-widest">
                    Pilih paket simulasi SKD untuk memulai latihan.
                </p>
            </div>
            
            {/* Stats Summary (Dummy/Static for now) */}
            <div className="flex gap-4 mt-4 md:mt-0">
                <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-white/10 text-center">
                    <p className="text-xs text-gray-500 font-bold uppercase">Total Misi</p>
                    <p className="text-xl font-black text-white">{missions.length}</p>
                </div>
            </div>
        </div>

        {/* MISSION GRID */}
        {missions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missions.map((mission) => (
                    <div key={mission.id} className="group relative bg-zinc-900/50 border border-white/5 hover:border-blue-500/50 rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 overflow-hidden flex flex-col">
                        
                        {/* Background Deco */}
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Target size={100} />
                        </div>

                        {/* Badge Kategori */}
                        <div className="flex justify-between items-start mb-6 z-10">
                            <span className="px-3 py-1 rounded-lg bg-blue-900/20 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                                SKD CAT
                            </span>
                            {mission.isPremium && (
                                <span className="bg-yellow-600/20 text-yellow-500 px-2 py-1 rounded text-[10px] font-bold border border-yellow-600/30 flex items-center gap-1">
                                    <Star size={10} fill="currentColor" /> PREMIUM
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-grow z-10">
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                {mission.title}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
                                {mission.description || "Simulasi standar kompetensi dasar sistem CAT."}
                            </p>
                            
                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono border-t border-white/5 pt-4">
                                <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>{mission.duration || 100} Mnt</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Shield size={12} />
                                    <span>{mission._count?.questions || 0} Soal</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-6 pt-2 z-10">
                            <Link 
                                href={`/dashboard/mission/${mission.id}`} 
                                className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all group-hover:shadow-lg group-hover:shadow-blue-600/20"
                            >
                                <PlayCircle size={16} /> Briefing
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            /* EMPTY STATE */
            <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <AlertTriangle className="text-gray-600" size={40} />
                </div>
                <h3 className="text-white font-bold text-lg uppercase tracking-wide">Tidak Ada Misi Aktif</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-md">
                    Markas pusat belum merilis paket operasi baru. Silakan periksa kembali nanti.
                </p>
            </div>
        )}
    </div>
  );
}