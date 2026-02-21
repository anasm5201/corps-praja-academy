import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  ChevronLeft, Calendar, ShieldCheck, Zap, 
  Target, Info, MessageSquare, Clock 
} from "lucide-react";
import DrillCard from "@/components/dashboard/DrillCard";

export const dynamic = 'force-dynamic';

export default async function BlueprintPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/api/auth/signin");

  // Fetch Blueprint Mingguan
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

  const blueprint = await prisma.weeklyBlueprint.findFirst({
    where: { userId, createdAt: { gte: startOfWeek } },
    orderBy: { createdAt: 'desc' }
  });

  if (!blueprint) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-10">
        <div className="p-10 border border-dashed border-neutral-800 rounded-xl text-center">
           <Info className="mx-auto text-neutral-600 mb-4" size={48} />
           <p className="text-neutral-500 font-mono text-sm">OPERASI BELUM DIMULAI. SILAKAN AKTIFKAN BLUEPRINT DI DASHBOARD UTAMA.</p>
           <Link href="/dashboard" className="mt-6 inline-block text-blue-500 text-xs font-bold uppercase tracking-widest border-b border-blue-500 pb-1">KEMBALI KE MARKAS ➔</Link>
        </div>
      </div>
    );
  }

  const parsedDrills = JSON.parse(blueprint.dailyDrills || "[]");

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans pb-20 selection:bg-blue-900">
      {/* Background Grid Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #555 1px, transparent 1px), linear-gradient(to bottom, #555 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* HEADER: NAVIGATION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="h-12 w-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-all group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <Calendar className="text-blue-500" /> TACTICAL BLUEPRINT
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-1 uppercase tracking-widest">
                DOKTRIN: <span className="text-blue-400">TRI TUNGGAL TERPUSAT</span> • OPS MINGGU INI: {blueprint.focusAreas}
              </p>
            </div>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/30 px-6 py-3 rounded-lg flex items-center gap-4">
            <ShieldCheck className="text-blue-500" size={24} />
            <div className="text-[10px] font-black uppercase tracking-widest leading-none">
              <span className="text-neutral-400 block mb-1">STATUS OPERASI</span>
              <span className="text-blue-400">AKTIF & TERKENDALI</span>
            </div>
          </div>
        </div>

        {/* MENTOR EVALUATION BLOCK */}
        <div className="bg-neutral-950 border-l-4 border-blue-600 p-6 rounded-r-xl mb-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare size={100} /></div>
          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
             [DIRECTIVE] INSTRUKSI KOMANDO MINGGUAN
          </h4>
          <p className="text-lg md:text-xl font-medium text-neutral-200 leading-relaxed italic font-serif">
            "{blueprint.evaluationText}"
          </p>
        </div>
        const stats = calculateMatraStats(parsedDrills, blueprint.completedDrills || []);

return (
  <div className="p-4 md:p-8 max-w-7xl mx-auto">
    {/* HEADER PROGRESS */}
    <ProgressHeader stats={stats} />
    
    {/* EVALUATION MENTOR */}
    <div className="mb-12">...</div>

    {/* GRID KARTU */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {parsedDrills.map((drill, idx) => (
         <DrillCard key={idx} drill={drill} index={idx} blueprintId={blueprint.id} />
       ))}
    </div>
  </div>
);

        {/* GRID 7 HARI (TRI TUNGGAL TERPUSAT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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