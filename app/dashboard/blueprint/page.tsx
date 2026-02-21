import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Calendar, ShieldCheck, Info, MessageSquare } from "lucide-react";

// Import Komponen Taktis Kita
import DrillCard from "@/components/dashboard/DrillCard";
import ProgressHeader from "@/components/dashboard/ProgressHeader";
import { calculateMatraStats } from "@/lib/utils/progress";

// 🚨 PROTOKOL WAJIB VERCEL: Anti-Static Render
export const dynamic = 'force-dynamic';

export default async function BlueprintPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/api/auth/signin");

  // 1. EKSTRAKSI BLUEPRINT DARI DATABASE
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

  const blueprint = await prisma.weeklyBlueprint.findFirst({
    where: { userId, createdAt: { gte: startOfWeek } },
    orderBy: { createdAt: 'desc' }
  });

  // JIKA BLUEPRINT BELUM ADA (Kadet belum membuka halaman Dashboard utama)
  if (!blueprint) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-10">
        <div className="p-10 border border-dashed border-neutral-800 rounded-xl text-center max-w-lg">
           <Info className="mx-auto text-blue-500 mb-6 animate-pulse" size={56} />
           <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">OPERASI BELUM DIINISIASI</h2>
           <p className="text-neutral-500 font-mono text-xs leading-relaxed mb-8">
             Doktrin Tri Tunggal Terpusat belum dimuat ke dalam sistem untuk minggu ini. Silakan kembali ke Markas Utama untuk mengaktifkan AI Elite Coach.
           </p>
           <Link href="/dashboard" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
             KEMBALI KE MARKAS UTAMA
           </Link>
        </div>
      </div>
    );
  }

  // 2. PARSING DATA (DENGAN PENGAMANAN KETAT)
  let parsedDrills = [];
  try {
    parsedDrills = JSON.parse(blueprint.dailyDrills || "[]");
  } catch (e) {
    console.error("Gagal parsing dailyDrills:", e);
  }

  // ⚠️ HACK TAKTIS: Menggunakan (blueprint as any) agar TypeScript tidak error 
  // jika field completedDrills belum di-generate sempurna di skema Prisma Anda.
  const rawCompleted = (blueprint as any).completedDrills || "[]";
  const stats = calculateMatraStats(parsedDrills, rawCompleted);

  // 3. RENDER WAR ROOM
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans pb-20 selection:bg-blue-900">
      {/* Latar Belakang Taktikal (Grid) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* ========================================================= */}
        {/* BAGIAN A: NAVIGASI & STATUS HEADER                        */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="h-12 w-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-500 transition-all group shadow-lg">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3 drop-shadow-md">
                <Calendar className="text-blue-500" /> TACTICAL BLUEPRINT
              </h1>
              <p className="text-[10px] text-neutral-500 font-mono mt-1 uppercase tracking-widest">
                DOKTRIN: <span className="text-blue-400 font-bold">TRI TUNGGAL TERPUSAT</span> • TARGET OPS: {blueprint.focusAreas}
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-900/80 border border-neutral-800 px-6 py-3 rounded-lg flex items-center gap-4 shadow-xl backdrop-blur-md">
            <ShieldCheck className="text-emerald-500" size={24} />
            <div className="text-[10px] font-black uppercase tracking-widest leading-none">
              <span className="text-neutral-500 block mb-1">STATUS SISTEM</span>
              <span className="text-emerald-400">AKTIF & TERKENDALI</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BAGIAN B: TRI-AXIS READINESS HUD (YANG BARU KITA BUAT)    */}
        {/* ========================================================= */}
        <ProgressHeader stats={stats} />

        {/* ========================================================= */}
        {/* BAGIAN C: PENGARAHAN MENTOR (EVALUATION TEXT)             */}
        {/* ========================================================= */}
        <div className="bg-neutral-900/50 border-l-4 border-blue-600 p-6 rounded-r-xl shadow-lg relative overflow-hidden group mb-4">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare size={100} /></div>
          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
             [DIRECTIVE] INSTRUKSI KOMANDO MINGGUAN
          </h4>
          <p className="text-lg md:text-xl font-medium text-neutral-200 leading-relaxed italic font-serif">
            "{blueprint.evaluationText}"
          </p>
        </div>

        {/* ========================================================= */}
        {/* BAGIAN D: GRID OPERASI HARIAN (7 KARTU)                   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4 border-t border-neutral-800/50">
          {parsedDrills.map((drill: any, idx: number) => (
            <DrillCard 
              key={idx} 
              blueprintId={blueprint.id} 
              drill={drill} 
              index={idx} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}