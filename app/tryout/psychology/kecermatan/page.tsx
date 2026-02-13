import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Zap, Play, Lock, ShieldCheck, TrendingUp } from "lucide-react";

export default async function KecermatanMenu() {
  const session = await getServerSession(authOptions);
  
  // FIX: Hapus "isPublished" dari kriteria pencarian
  const packages = await prisma.psychologyPackage.findMany({
    where: { type: "KECERMATAN" },
    orderBy: { title: 'asc' }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER MARKAS */}
        <div className="mb-8 border-b border-white/10 pb-6 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-yellow-500 flex items-center gap-3">
                    <Zap fill="currentColor" size={32}/> GUDANG AMUNISI
                </h1>
                <p className="text-gray-500 font-mono text-xs mt-1">DIVISI KECERMATAN: {packages.length} PAKET STANDAR POLRI</p>
            </div>
        </div>

        {/* GRID PAKET */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg, index) => {
                // FIX: Gunakan "duration" bawaan dari DB, berhenti mencari "config"
                const config = { 
                    duration: pkg.duration || 60, 
                    columns: 10 
                };
                
                // Visualisasi Tier Kesulitan
                let badge = "BASIC";
                let borderColor = "border-white/10";
                
                if (index >= 4 && index < 8) { badge = "STANDAR POLRI"; borderColor = "border-blue-500/30"; }
                else if (index >= 8) { badge = "ELITE / HARD"; borderColor = "border-red-500/30"; }

                return (
                    <div key={pkg.id} className={`bg-zinc-900 border ${borderColor} p-5 rounded-xl transition-all hover:border-yellow-500 group relative`}>
                        <div className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest text-gray-500 border border-white/5 bg-black/20 px-2 py-0.5 rounded">
                            {badge}
                        </div>

                        <div className="mb-4">
                            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-yellow-500 transition line-clamp-1">
                                {pkg.title.replace("Kecermatan ", "")}
                            </h3>
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2 h-8">
                                {pkg.description}
                            </p>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                            <div className="text-xs font-mono text-gray-400">
                                <strong>{config.columns}</strong> KOLOM x <strong>{config.duration}s</strong>
                            </div>
                            {/* TOMBOL MENUJU ENGINE DINAMIS */}
                            <Link 
                                href={`/tryout/psychology/kecermatan/${pkg.id}`} 
                                className="bg-white hover:bg-yellow-500 hover:text-black text-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                            >
                                <Play size={14} fill="currentColor"/> MULAI
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}