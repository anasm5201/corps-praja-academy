import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    Radar, Activity, Play, CheckCircle2, 
    Lock, ShieldAlert, Terminal, FileJson, KeyRound
} from "lucide-react";
import LockedMissionModal from "./LockedMissionModal"; // Akan kita buat setelah ini

export const dynamic = "force-dynamic";

export default async function TryoutPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/auth/login");

  // 1. AMBIL DATA USER (Untuk Cek Akses)
  const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true, createdAt: true }
  });

  // 2. LOGIKA KEPEMILIKAN AKSES (Premium & Trial)
  const isPremium = ["SOLO_FIGHTER", "INTENSIVE_SQUAD"].includes(user?.subscriptionType || "FREE");
  const joinDate = new Date(user?.createdAt || new Date()).getTime();
  const now = new Date().getTime();
  const hoursSinceJoin = (now - joinDate) / (1000 * 60 * 60);
  const isTrialActive = hoursSinceJoin < 2; 

  // 3. AMBIL DATA PAKET MISI
  const packages = await prisma.tryoutPackage.findMany({
      where: {
          isPublished: true,
          category: "SKD" 
      },
      orderBy: [
        { isFree: 'desc' }, // Yang Gratis ditaruh paling atas
        { title: 'asc' }    // Sisanya diurutkan sesuai abjad
    ], 
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
    <div className="min-h-screen bg-[#020202] text-white pb-20 px-4 sm:px-8 relative overflow-hidden font-sans selection:bg-red-500/30">
        
        {/* --- BACKGROUND LAYER --- */}
        <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none z-0"></div>
        <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto pt-12 relative z-10">
            
            {/* --- HEADER: COMMAND CENTER STYLE --- */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-8 gap-6 relative">
                <div className="absolute bottom-0 left-0 w-32 h-1 bg-red-600"></div>
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/30 border border-red-900/50 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 chamfer-btn">
                        <Radar size={14} className="animate-spin-slow" /> ACTIVE OPERATIONS
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-2" style={{ textShadow: "0 0 30px rgba(255,255,255,0.1)" }}>
                        SIMULASI <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-900">SKD CAT</span>
                    </h1>
                    <p className="text-zinc-500 max-w-2xl text-sm leading-relaxed font-mono uppercase tracking-wide">
                        // Pilih misi latihan. Skor dihitung menggunakan standar BKN terbaru.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-4xl font-black text-white">{packages.length}</div>
                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">MISI TERSEDIA</div>
                </div>
            </div>

            {/* --- GRID PAKET: TACTICAL CARDS (ARSENAL TRANSPARAN) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.map((pkg, index) => {
                    const lastAttempt = pkg.attempts[0]; 
                    const isFinished = lastAttempt?.isFinished;
                    const inProgress = lastAttempt && !lastAttempt.isFinished;
                    
                    // 4. KUNCI KEPUTUSAN (Apakah paket ini dilock untuk user ini?)
                    // Paket Pertama (index 0) selalu gratis. Sisanya tergantung status user.
                    const isMissionLocked = !isPremium && !isTrialActive && !pkg.isFree;

                    return (
                        <div key={pkg.id} className="group relative">
                            
                            {/* Hover Glow Effect (Dimatikan jika terkunci) */}
                            {!isMissionLocked && (
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-red-600 to-transparent opacity-0 group-hover:opacity-30 transition duration-500 blur-lg rounded-xl"></div>
                            )}

                            {/* CARD BODY (CHAMFERED) - Visual Berubah jika Terkunci */}
                            <div className={`chamfer-card bg-[#080808] border h-full relative overflow-hidden transition-all duration-300 ${isMissionLocked ? 'border-zinc-800 opacity-80 grayscale-[50%]' : 'border-white/5 group-hover:-translate-y-1 group-hover:border-red-900/50 group-hover:shadow-[0_0_30px_rgba(220,38,38,0.1)]'}`}>
                                
                                {/* Scanline Overlay */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none scanline bg-[linear-gradient(transparent_2px,#ff0000_3px,transparent_4px)] bg-[size:100%_4px]"></div>

                                {/* BACKGROUND GEMBOK RAKSASA (Jika Terkunci) */}
                                {isMissionLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
                                        <Lock size={150} />
                                    </div>
                                )}

                                <div className="p-8 flex flex-col h-full relative z-10">
                                    
                                    {/* Top Status Bar */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-sm border transition-colors ${isMissionLocked ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-900/50 border-white/5 group-hover:border-red-500/30 group-hover:bg-red-950/20'}`}>
                                            <FileJson className={`w-6 h-6 transition-colors ${isMissionLocked ? 'text-zinc-700' : 'text-zinc-600 group-hover:text-red-500'}`} />
                                        </div>
                                        
                                        {/* Status Badge */}
                                        {isMissionLocked ? (
                                            <span className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 bg-zinc-900 px-3 py-1 rounded-sm border border-zinc-800">
                                                <Lock size={12} /> RESTRICTED
                                            </span>
                                        ) : isFinished ? (
                                            <span className="flex items-center gap-2 text-[10px] font-black uppercase text-green-500 bg-green-950/30 px-3 py-1 rounded-sm border border-green-900">
                                                <CheckCircle2 size={12} /> SELESAI
                                            </span>
                                        ) : inProgress ? (
                                            <span className="flex items-center gap-2 text-[10px] font-black uppercase text-yellow-500 bg-yellow-950/30 px-3 py-1 rounded-sm border border-yellow-900 animate-pulse">
                                                <Activity size={12} /> BERJALAN
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 bg-zinc-900 px-3 py-1 rounded-sm border border-zinc-800">
                                                <Lock size={12} /> AVAILABLE
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div className="mb-6">
                                        <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">SKD PREMIUM</div>
                                        <h3 className={`text-xl font-black uppercase tracking-tight leading-none transition-colors ${isMissionLocked ? 'text-zinc-500' : 'text-white group-hover:text-red-500'}`}>
                                            {pkg.title}
                                        </h3>
                                    </div>

                                    {/* Stats Matrix */}
                                    <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 mb-8">
                                        <div className="bg-[#0A0A0A] p-3 text-center">
                                            <div className="text-[9px] text-zinc-500 font-mono uppercase mb-1">DURASI</div>
                                            <div className={`text-lg font-bold flex justify-center items-center gap-1 ${isMissionLocked ? 'text-zinc-600' : 'text-white'}`}>
                                                {pkg.duration}<span className="text-[10px] text-zinc-600">MNT</span>
                                            </div>
                                        </div>
                                        <div className="bg-[#0A0A0A] p-3 text-center">
                                            <div className="text-[9px] text-zinc-500 font-mono uppercase mb-1">SOAL</div>
                                            <div className={`text-lg font-bold flex justify-center items-center gap-1 ${isMissionLocked ? 'text-zinc-600' : 'text-white'}`}>
                                                {pkg._count.questions}<span className="text-[10px] text-zinc-600">QTS</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button (Chamfered) */}
                                    <div className="mt-auto">
                                        {isMissionLocked ? (
                                            // TAMPILAN JIKA TERKUNCI (Memanggil Komponen Pop-up)
                                            <LockedMissionModal missionName={pkg.title} />
                                        ) : isFinished ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link href={`/dashboard/result/${pkg.id}/${lastAttempt.id}`} className="w-full">
                                                    <button className="chamfer-btn w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition border border-white/5 hover:border-white/20">
                                                        ANALISA
                                                    </button>
                                                </Link>
                                                <Link href={`/dashboard/tryout/${pkg.id}/room`} className="w-full">
                                                    <button className="chamfer-btn w-full py-3 bg-white hover:bg-gray-200 text-black text-[10px] font-black uppercase tracking-[0.2em] transition">
                                                        ULANGI
                                                    </button>
                                                </Link>
                                            </div>
                                        ) : inProgress ? (
                                            <Link href={`/dashboard/tryout/${pkg.id}/room`} className="w-full">
                                                <button className="chamfer-btn w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-black uppercase tracking-[0.2em] transition shadow-[0_0_20px_rgba(202,138,4,0.4)] flex items-center justify-center gap-2">
                                                    <Activity size={16} /> LANJUTKAN MISI
                                                </button>
                                            </Link>
                                        ) : (
                                            <Link href={`/dashboard/tryout/${pkg.id}/room`} className="w-full">
                                                <button className="chamfer-btn w-full py-4 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-[0.2em] transition shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center gap-2">
                                                    <Play size={16} fill="currentColor" /> KERJAKAN
                                                </button>
                                            </Link>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {packages.length === 0 && (
                    <div className="col-span-full py-32 text-center border border-dashed border-red-900/30 rounded-lg bg-red-950/5">
                        <ShieldAlert className="w-16 h-16 text-red-800 mx-auto mb-4 animate-pulse"/>
                        <p className="text-red-500 font-black uppercase tracking-widest text-lg">LOGISTIK KOSONG</p>
                        <p className="text-xs text-red-900/50 mt-2 font-mono">HUBUNGI KOMANDO PUSAT UNTUK SUPLAI AMUNISI.</p>
                    </div>
                )}
            </div>

            {/* Footer Decoration */}
            <div className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <Terminal size={12}/> SYSTEM V.2.0 [TACTICAL]
                </div>
                <div>CORPS PRAJA ACADEMY // SECURE CONNECTION</div>
            </div>

        </div>
    </div>
  );
}