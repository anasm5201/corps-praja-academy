import { prisma } from "@/lib/prisma";
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Terminal,
  Cpu,
  Radar
} from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// 🔥 PAKSA REFRESH DATA
export const dynamic = 'force-dynamic';

export default async function PlazaMenzaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // AMBIL DATA KATEGORI "DOKTRIN"
  const materials = await prisma.material.findMany({
    where: { category: "DOKTRIN" },
    orderBy: { title: 'asc' }
  });

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans selection:bg-red-900 relative overflow-hidden">
      
      {/* --- BACKGROUND GRID --- */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* --- HEADER --- */}
      <div className="relative z-10 mb-12 border-b border-red-900/30 pb-8">
        <div className="flex items-center gap-3 mb-2">
            <Cpu className="text-red-600 animate-spin-slow" size={24} />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                PLAZA <span className="text-red-600">MENZA</span>
            </h1>
        </div>
        <p className="text-zinc-500 font-mono text-xs md:text-sm tracking-[0.2em] uppercase max-w-2xl">
            PUSAT LOGISTIK INTELEKTUAL. DOKTRIN INI ADALAH BEKAL HIDUP DAN MATI.
        </p>
      </div>

      {/* --- GRID DOKTRIN --- */}
      {materials.length === 0 ? (
         <div className="h-64 flex flex-col items-center justify-center border border-dashed border-red-900/50 rounded-xl bg-red-950/10">
            <Radar className="text-red-700 mb-4 animate-pulse" size={48}/>
            <p className="text-red-500 font-mono text-xs tracking-widest">MENUNGGU SUPPLY DROP...</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {materials.map((item) => (
            <div 
              key={item.id} 
              className="group bg-[#050505] border border-zinc-800 hover:border-red-600/50 rounded-lg p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] flex flex-col"
            >
              
              {/* TOP BAR: ICON & LABEL */}
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-red-950/20 border border-red-900/30 rounded-md group-hover:border-red-600/50 transition-colors">
                      <ShieldCheck className="text-red-600" size={20} />
                  </div>
                  <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-red-500 transition-colors">
                      DOKTRIN
                  </div>
              </div>

              {/* CONTENT */}
              <div className="mb-6">
                  <h3 className="text-sm font-bold text-white uppercase leading-tight mb-2 group-hover:text-red-500 transition-colors">
                      {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono leading-relaxed line-clamp-2">
                      {item.description}
                  </p>
              </div>

              {/* ACTION BUTTON (HAFAL MATI) */}
              <div className="mt-auto flex gap-2">
                  {item.isLocked ? (
                      <>
                        <button disabled className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center justify-center gap-2 cursor-not-allowed">
                            <FileText size={12}/> HAFAL MATI
                        </button>
                        <div className="w-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded text-zinc-600">
                            <Lock size={14}/>
                        </div>
                      </>
                  ) : (
                      <>
                        <Link 
                            href={item.url} 
                            target="_blank"
                            className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all group/btn"
                        >
                            <FileText size={12} className="text-zinc-400 group-hover/btn:text-white"/> HAFAL MATI
                        </Link>
                        <div className="w-10 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded text-zinc-500">
                            <Lock size={14} className="opacity-20"/>
                        </div>
                      </>
                  )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}