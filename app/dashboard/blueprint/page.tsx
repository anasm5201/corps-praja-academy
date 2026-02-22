import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Calendar, ShieldCheck, Info, MessageSquare, AlertTriangle } from "lucide-react";
import DrillCard from "@/components/dashboard/DrillCard";
import { ensureWeeklyPlan } from "@/lib/weekly-engine";

export const dynamic = 'force-dynamic';

export default async function BlueprintPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/api/auth/signin");

  // 1. PASTIKAN MESIN JADWAL MENYALA!
  let blueprint = null;
  try {
     // Ini kunci penyembuhnya! Kita panggil AI-nya langsung di sini
     blueprint = await ensureWeeklyPlan(userId); 
  } catch (error) {
     console.error("Gagal load program 7 hari:", error);
  }

  // JIKA AI BENAR-BENAR DOWN (Sistem Cadangan Mutlak)
  if (!blueprint) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-10">
        <div className="p-10 border border-dashed border-red-900/50 bg-red-950/10 rounded-xl text-center max-w-lg">
           <AlertTriangle className="mx-auto text-red-500 mb-6 animate-pulse" size={56} />
           <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">GANGGUAN SATELIT KOMANDO</h2>
           <p className="text-neutral-500 font-mono text-xs leading-relaxed mb-8">
             Sistem AI gagal merumuskan jadwal. Mesin sedang dalam masa pendinginan. Silakan kembali ke Markas Utama dan coba lagi nanti.
           </p>
           <Link href="/dashboard" className="px-8 py-3 bg-red-900 hover:bg-red-800 text-white text-xs font-black uppercase tracking-[0.2em] rounded-sm transition-all">
             KEMBALI KE MARKAS UTAMA
           </Link>
        </div>
      </div>
    );
  }

  // 2. PARSING DATA
  let parsedDrills = [];
  try {
    parsedDrills = JSON.parse(blueprint.dailyDrills || "[]");
  } catch (e) {
    console.error("Gagal parsing dailyDrills:", e);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans pb-20 selection:bg-blue-900">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER NAVIGASI */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="h-12 w-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-500 transition-all group shadow-lg">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <Calendar className="text-blue-500" /> PROGRAM LATIHAN 7 HARI
              </h1>
              <p className="text-[10px] text-neutral-500 font-mono mt-1 uppercase tracking-widest">
                SIKLUS AKTIF • TARGET OPS: <span className="text-blue-400 font-bold">{blueprint.focusAreas}</span>
              </p>
            </div>
          </div>
        </div>

        {/* EVALUASI MENTOR */}
        <div className="bg-neutral-900/50 border-l-4 border-blue-600 p-6 rounded-r-xl shadow-lg relative overflow-hidden group mb-4">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare size={100} /></div>
          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
             [DIRECTIVE] ARAHAN MENTOR MINGGU INI
          </h4>
          <p className="text-lg md:text-xl font-medium text-neutral-200 leading-relaxed italic font-serif">
            "{blueprint.evaluationText}"
          </p>
        </div>

        {/* GRID KARTU MISI */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4 border-t border-neutral-800/50">
          {parsedDrills.map((drill: any, idx: number) => (
            <DrillCard key={idx} blueprintId={blueprint.id} drill={drill} index={idx} />
          ))}
        </div>

      </div>
    </div>
  );
}