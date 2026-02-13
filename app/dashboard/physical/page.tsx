import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    Dumbbell, Activity, Calendar, ArrowUpRight, 
    TrendingUp, Timer, Ruler 
} from "lucide-react";

export default async function PhysicalPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA USER & RIWAYAT FISIK
  const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
          physicalLogs: {
              orderBy: { createdAt: 'desc' },
              take: 10 // Ambil 10 riwayat terakhir
          }
      }
  });

  if (!user) redirect("/auth/login");

  // 3. HITUNG STATISTIK TERBARU
  const latestLog = user.physicalLogs[0];
  const latScore = latestLog ? latestLog.totalScore : 0;
  
  // Analisa Kenaikan (Dummy Logic jika data > 1)
  const previousLog = user.physicalLogs[1];
  const isImproved = previousLog ? latScore >= previousLog.totalScore : true;

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6 pt-8 text-white">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6 gap-6">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/20 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4">
                    <Dumbbell size={12} /> Sektor Jasmani (LAT)
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                    Pusat <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Kebugaran</span>
                </h1>
                <p className="text-gray-400 text-sm mt-2 font-mono uppercase tracking-widest">
                    Pantau grafik performa lari, push-up, dan sit-up.
                </p>
            </div>
            
            <Link 
                href="/dashboard/physical/input" 
                className="bg-amber-600 hover:bg-amber-500 text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
            >
                <Activity size={16} /> Input Data Baru
            </Link>
        </div>

        {/* SCORE CARD UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Score */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={100} className="text-amber-500" />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Skor Jasmani (LAT)</h3>
                <div className="flex items-end gap-4">
                    <span className="text-5xl font-black text-white">{latScore}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded mb-2 flex items-center gap-1 ${isImproved ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        <TrendingUp size={12} /> {isImproved ? 'Stabil/Naik' : 'Turun'}
                    </span>
                </div>
                <p className="text-gray-600 text-[10px] mt-4 font-mono">
                    *Berdasarkan input data terakhir ({latestLog ? new Date(latestLog.createdAt).toLocaleDateString() : "-"})
                </p>
            </div>

            {/* Lari 12 Menit */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Timer size={80} className="text-blue-500" />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Lari 12 Menit</h3>
                <span className="text-4xl font-black text-white">
                    {/* ✅ FIX: Ganti runDistance jadi lariMeter */}
                    {latestLog?.lariMeter || 0} <span className="text-lg text-gray-500">M</span>
                </span>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${Math.min(((latestLog?.lariMeter || 0) / 3500) * 100, 100)}%` }}></div>
                </div>
                <p className="text-gray-600 text-[10px] mt-2 font-mono">Target: 3200+ Meter</p>
            </div>

            {/* Pull Up / Chinning */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Ruler size={80} className="text-green-500" />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Pull Up</h3>
                <span className="text-4xl font-black text-white">
                    {latestLog?.pullUp || 0} <span className="text-lg text-gray-500">X</span>
                </span>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: `${Math.min(((latestLog?.pullUp || 0) / 18) * 100, 100)}%` }}></div>
                </div>
                 <p className="text-gray-600 text-[10px] mt-2 font-mono">Target: 17+ Repetisi</p>
            </div>
        </div>

        {/* HISTORY LIST */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="text-gray-500" size={20} /> Riwayat Latihan
                </h3>
            </div>
            
            {user.physicalLogs.length > 0 ? (
                <div className="divide-y divide-white/5">
                    {user.physicalLogs.map((log) => (
                        <div key={log.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-amber-500 border border-white/5 shadow-inner">
                                    {log.totalScore}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">Latihan Rutin</p>
                                    <p className="text-xs text-gray-500 font-mono">
                                        {new Date(log.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-8 text-xs font-mono text-gray-400">
                                <div>
                                    <span className="block text-[10px] text-gray-600 uppercase font-bold">Lari</span>
                                    {/* ✅ FIX: Ganti runDistance jadi lariMeter */}
                                    <span className="text-white">{log.lariMeter}m</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-600 uppercase font-bold">Pull Up</span>
                                    <span className="text-white">{log.pullUp}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-600 uppercase font-bold">Sit Up</span>
                                    <span className="text-white">{log.sitUp}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-600 uppercase font-bold">Push Up</span>
                                    <span className="text-white">{log.pushUp}</span>
                                </div>
                            </div>

                            <button className="text-gray-500 hover:text-white transition-colors">
                                <ArrowUpRight size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-gray-500">
                    <Activity size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="uppercase font-bold text-sm">Belum ada data fisik</p>
                    <p className="text-xs mt-1">Lakukan input data pertama Anda sekarang.</p>
                </div>
            )}
        </div>
    </div>
  );
}