import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { User, Shield, Target, Zap, Award } from "lucide-react";
// Pastikan path import ini sesuai dengan lokasi komponen Radar Anda
import TritunggalRadar from "@/components/charts/TritunggalRadar"; 

export default async function ProfilePage({ params }: { params: { id: string } }) {
  // 1. QUERY PROFILE
  const profile = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      image: true,
      xp: true,
      suhStats: true, // Nilai 0-100
      role: true,
    }
  });

  if (!profile) return notFound();

  // 2. LOGIKA LEVEL (SIMULASI)
  const currentLevel = Math.floor((profile.xp || 0) / 100) + 1;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER PROFILE */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16 border-b border-white/10 pb-12">
            <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                    {profile.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User size={64} className="text-zinc-700" />
                    )}
                </div>
                <div className="absolute -bottom-4 -right-4 bg-blue-600 px-3 py-1 rounded-lg text-xs font-black italic shadow-xl">
                    LVL.{currentLevel}
                </div>
            </div>

            <div className="text-center md:text-left space-y-2">
                <h1 className="text-4xl font-black uppercase tracking-tighter">{profile.name || "KADET TANPA NAMA"}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-zinc-500 tracking-widest uppercase">
                    <span className="flex items-center gap-1.5"><Shield size={14} className="text-blue-500" /> {profile.role}</span>
                    <span className="flex items-center gap-1.5"><Award size={14} className="text-yellow-500" /> {profile.xp || 0} XP</span>
                </div>
            </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* KOLOM KIRI: RADAR AUDIT */}
            <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl flex flex-col items-center">
                <div className="flex items-center gap-2 text-zinc-600 mb-8 self-start">
                    <Target size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Performance_Audit_v1.0</span>
                </div>
                
                {/* ✅ FIX: Mengirim props langsung, bukan dibungkus stats={} */}
                <TritunggalRadar 
                    jar={80} 
                    lat={75} 
                    suh={Number(profile.suhStats) || 0} 
                />
            </div>

            {/* KOLOM KANAN: ETALASE BINTANG */}
            <div className="space-y-6">
                <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-2xl flex items-center gap-6 group hover:border-blue-500/50 transition-colors">
                    <div className="p-4 bg-black rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="font-black text-lg uppercase">Pencapaian Tertinggi</h3>
                        <p className="text-sm text-zinc-500">Mencetak skor 400+ pada Simulasi SKD Tahap 1.</p>
                    </div>
                </div>
                {/* Tambahkan item pencapaian lainnya di sini */}
            </div>

        </div>

      </div>
    </div>
  );
}