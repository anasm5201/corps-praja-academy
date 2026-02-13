import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  Shield, Star, Flame, CalendarCheck, Crown, 
  UserCheck, AlertOctagon, History 
} from "lucide-react";
import { TritunggalRadar } from "@/components/DashboardWidgets";
import CharacterForm from "./CharacterForm"; 

export default async function CharacterPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // 2. AMANKAN USER ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;

  // 3. CEK LOGIN
  if (!userId) {
    redirect("/auth/login");
  }

  // 4. AMBIL DATA REAL DARI DATABASE
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      dailyLogs: {
        // ✅ FIX: Gunakan 'createdAt' (bukan 'date')
        orderBy: { createdAt: 'desc' },
        take: 7 
      }
    }
  });

  if (!user) redirect("/auth/login");

  // 5. HITUNG STATISTIK REAL
  const totalLogs = await prisma.dailyLog.count({ where: { userId: user.id } });
  
  // Hitung Streak (Logic sederhana untuk MVP)
  // Jika kolom 'suhStreak' tidak ada di DB, kita gunakan logika manual
  const currentStreak = totalLogs > 0 ? 1 : 0;

  // Ambil Rata-rata Skor SUH dari User Profile (Default 0 jika null)
  const disciplineScore = user.suhStats || 0;

  // Radar Data
  const radarData = { 
      jar: disciplineScore, 
      lat: disciplineScore, 
      suh: disciplineScore 
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 relative space-y-8 text-white">
        {/* Background Grid & Ambient Light */}
        <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] -z-10"></div>
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        {/* --- HEADER TACTICAL --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 pt-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-600/10 rounded-lg border border-yellow-600/20">
                       <Shield className="text-yellow-500" size={28} />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                       SEKTOR PENGASUHAN <span className="text-yellow-500">(SUH)</span>
                    </h1>
                </div>
                <p className="text-gray-400 text-xs font-mono uppercase tracking-widest max-w-2xl border-l-2 border-yellow-600 pl-4 leading-relaxed">
                    Evaluasi integritas, kedisiplinan, dan mentalitas juang praja.
                </p>
            </div>
            
            {/* Quick Stat Card */}
            <div className="bg-zinc-900/40 border border-white/10 p-5 rounded-2xl flex items-center gap-6 backdrop-blur-md">
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Indeks Disiplin</p>
                    <p className="text-4xl font-black text-white leading-none mt-1 italic">
                        {disciplineScore}%
                    </p>
                </div>
                <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)] border border-yellow-400/20">
                    <Star size={26} className="text-white fill-white" />
                </div>
            </div>
        </div>

        {/* --- MAIN DASHBOARD GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* KOLOM KIRI: STATISTIK & RADAR */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* 1. STAT ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Flame size={48}/></div>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Daily Streak</p>
                        <h3 className="text-3xl font-black text-white">{currentStreak} <span className="text-sm font-normal text-gray-600">HARI</span></h3>
                        <div className="mt-3 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500" style={{ width: `${Math.min(currentStreak * 10, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><CalendarCheck size={48}/></div>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Laporan</p>
                        <h3 className="text-3xl font-black text-white">{totalLogs} <span className="text-sm font-normal text-gray-600">LOGS</span></h3>
                    </div>
                    <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Crown size={48}/></div>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Level Karakter</p>
                        <h3 className="text-3xl font-black text-yellow-500">PRATAMA</h3>
                    </div>
                </div>

                {/* 2. CHARACTER RADAR & ANALYSIS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 relative flex flex-col justify-between">
                        <div className="absolute top-4 left-6 flex items-center gap-2">
                             <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                             <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Mental Map</span>
                        </div>
                        <div className="h-[250px] w-full flex items-center justify-center mt-4">
                             <TritunggalRadar data={radarData} />
                        </div>
                        <div className="flex justify-center gap-4 text-[8px] font-black uppercase tracking-widest text-gray-500 mt-2">
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Integritas</span>
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Loyalitas</span>
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Juang</span>
                        </div>
                    </div>

                    <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full"></div>
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <AlertOctagon size={14} className="text-yellow-500"/> Catatan Pengasuh
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-1 h-full bg-gradient-to-b from-yellow-500 to-transparent rounded-full min-h-[50px]"></div>
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase mb-1">Pertahankan Konsistensi</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Grafik integritas menunjukkan tren {disciplineScore > 70 ? 'positif' : 'perlu perbaikan'}. Tingkatkan partisipasi dalam kegiatan korps untuk mendongkrak nilai Loyalitas.
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-xl">
                                <p className="text-[9px] text-yellow-500 font-black uppercase mb-1">Rekomendasi Tindakan</p>
                                <ul className="text-[10px] text-gray-400 space-y-1 list-disc pl-4">
                                    <li>Ikuti apel malam tepat waktu.</li>
                                    <li>Lengkapi atribut seragam dinas.</li>
                                    <li>Tingkatkan ibadah harian.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* KOLOM KANAN: INPUT FORM & RIWAYAT */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* [2] DISINI KITA GUNAKAN FORM ASLI */}
                <CharacterForm />

                {/* RIWAYAT LOGBOOK */}
                <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <History size={14}/> Riwayat Laporan
                    </h3>
                    <div className="space-y-4">
                        {user.dailyLogs.length > 0 ? (
                            user.dailyLogs.map((log) => (
                                <div key={log.id} className="flex gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
                                    <div className="flex flex-col items-center gap-1 pt-1">
                                        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_current] ${log.score >= 80 ? 'bg-green-500 text-green-500' : 'bg-yellow-500 text-yellow-500'}`}></div>
                                        <div className="w-0.5 h-full bg-white/10 group-hover:bg-yellow-500/30 transition-colors"></div>
                                    </div>
                                    <div className="pb-2 w-full">
                                        <div className="flex justify-between items-start">
                                            <p className="text-[10px] font-mono text-gray-500 mb-0.5">
                                                {/* ✅ FIX: GUNAKAN log.createdAt DISINI */}
                                                {new Date(log.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${log.score >= 80 ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                {log.score}%
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-yellow-500 transition-colors">Laporan Harian Rutin</h4>
                                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-1 italic">
                                            "{log.notes || 'Siap Laksanakan'}"
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-600 text-xs italic border border-dashed border-white/10 rounded-xl">
                                Belum ada laporan masuk.
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}