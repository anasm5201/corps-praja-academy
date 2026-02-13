import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Zap, Play } from "lucide-react";

export default async function KecermatanMenu() {
  const session = await getServerSession(authOptions);
  
  // Ambil semua paket Kecermatan, urutkan berdasarkan Judul
  const packages = await prisma.psychologyPackage.findMany({
    where: { type: "KECERMATAN" }, 
    orderBy: { title: 'asc' }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 border-b border-white/10 pb-6">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-yellow-500 flex items-center gap-2">
                <Zap fill="currentColor"/> PILIH AMUNISI
            </h1>
            <p className="text-gray-500 font-mono text-xs">MODUL KECERMATAN: {packages.length} PAKET</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => {
                // FIX KODE YANG KACAU: Langsung set config dengan nilai dari db
                const config = { 
                    duration: pkg.duration || 60, 
                    columns: 10 
                };
                
                return (
                    <div key={pkg.id} className="bg-zinc-900 border border-white/10 p-5 rounded-xl hover:border-yellow-500/50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-white group-hover:text-yellow-500 transition">{pkg.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{pkg.description}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-xl font-black text-white">{config.columns}</span>
                                <span className="text-[9px] text-gray-500 uppercase">KOLOM</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                            <div className="text-xs font-mono text-gray-400">
                                {config.duration}s / Kolom
                            </div>
                            
                            <Link 
                                href={`/tryout/psychology/kecermatan/${pkg.id}`} 
                                className="bg-white text-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-yellow-500 transition-all flex items-center gap-2"
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