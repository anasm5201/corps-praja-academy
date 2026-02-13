import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    User, Mail, Shield, Star, Settings, LogOut, 
    Trophy, Activity, Brain 
} from "lucide-react";

export default async function ProfilePage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;
  const userEmail = (session?.user as any)?.email;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. HITUNG SKD TERPISAH (Agar tidak error relation name)
  const skdCount = await prisma.tryoutAttempt.count({
      where: { userId: userId }
  });

  // 3. AMBIL DATA USER LENGKAP
  const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
          // Relasi Fisik (Sudah terkonfirmasi valid di file sebelumnya)
          physicalLogs: { select: { id: true } },
          // Relasi Misi (Sudah terkonfirmasi valid di file sebelumnya)
          missions: { where: { isCompleted: true } }
      }
  });

  if (!user) redirect("/auth/login");

  // 4. KALKULASI STATISTIK
  // skdCount sudah diambil di atas
  const physicalCount = user.physicalLogs?.length || 0;
  const missionCount = user.missions?.length || 0;

  // Hitung Level (Contoh logika sederhana)
  const currentXP = user.xp || 0;
  const level = Math.floor(currentXP / 1000) + 1;

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 sm:px-6 pt-8 text-white">
        
        {/* HEADER */}
        <div className="mb-8 border-b border-white/10 pb-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <User className="text-blue-500" size={32} />
                Dossier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Personel</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-mono uppercase tracking-widest">
                Identitas & Rekam Jejak Operasi
            </p>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 mb-8 backdrop-blur-sm relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Shield size={200} />
             </div>

             {/* Avatar */}
             <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-900 to-black border-4 border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                <span className="text-4xl font-black text-blue-500">
                    {user.name ? user.name.charAt(0).toUpperCase() : "K"}
                </span>
             </div>

             {/* Info */}
             <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                    {user.name}
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm font-mono">
                    <Mail size={14} /> {userEmail}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                    <span className="px-3 py-1 rounded bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/50">
                        {user.rank || "CADET"}
                    </span>
                    <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Star size={10} className="text-yellow-500" /> LVL {level}
                    </span>
                </div>
             </div>

             {/* Edit Button */}
             <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors" title="Edit Profil">
                <Settings size={20} className="text-gray-400" />
             </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-red-900/20 text-red-500 rounded-xl">
                    <Trophy size={24} />
                </div>
                <div>
                    <p className="text-2xl font-black text-white">{skdCount}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Simulasi SKD</p>
                </div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-amber-900/20 text-amber-500 rounded-xl">
                    <Activity size={24} />
                </div>
                <div>
                    <p className="text-2xl font-black text-white">{physicalCount}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Log Fisik</p>
                </div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-green-900/20 text-green-500 rounded-xl">
                    <Shield size={24} />
                </div>
                <div>
                    <p className="text-2xl font-black text-white">{missionCount}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Misi Tuntas</p>
                </div>
            </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="border-t border-white/10 pt-8 flex justify-center">
             <Link href="/api/auth/signout" className="flex items-center gap-2 px-8 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                <LogOut size={16} /> Keluar dari Sistem
             </Link>
        </div>

    </div>
  );
}