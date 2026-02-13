import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BrainCircuit, Play, Lock, GraduationCap, Calculator, Shapes } from "lucide-react";

export default async function KecerdasanMenu() {
  const session = await getServerSession(authOptions);
  
  // Ambil paket tipe KECERDASAN
  const packages = await prisma.psychologyPackage.findMany({
    where: { type: "KECERDASAN" }, // Cukup filter tipenya saja
    orderBy: { title: 'asc' }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 border-b border-white/10 pb-6 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-blue-500 flex items-center gap-3">
                    <BrainCircuit fill="currentColor" size={32}/> INTELLIGENCE CORP
                </h1>
                <p className="text-gray-500 font-mono text-xs mt-1">DIVISI KECERDASAN: LOGIKA, NUMERIK, SPASIAL</p>
            </div>
        </div>

        {/* GRID PAKET */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg, index) => {
              const config = { duration: pkg.duration || 900 }; // 900 detik (15 menit) sebagai cadangan                
                // Ikon Dinamis berdasarkan Judul
                let Icon = BrainCircuit;
                if (pkg.title.includes("Numerik")) Icon = Calculator;
                if (pkg.title.includes("Spasial")) Icon = Shapes;
                if (pkg.title.includes("Verbal")) Icon = GraduationCap;

                return (
                    <div key={pkg.id} className="bg-zinc-900 border border-white/10 p-5 rounded-xl transition-all hover:border-blue-500 group relative overflow-hidden">
                        
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Icon size={60} />
                        </div>

                        <div className="mb-6 relative z-10">
                            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-blue-500 transition line-clamp-1">
                                {pkg.title.replace("Kecerdasan ", "")}
                            </h3>
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2 h-10">
                                {pkg.description}
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 relative z-10">
                            <div className="text-xs font-mono text-gray-400">
                                <span className="text-white font-bold">{Math.floor(config.duration / 60)}</span> MENIT
                            </div>
                            
                            <Link 
                                href={`/tryout/psychology/kecerdasan/${pkg.id}`} 
                                className="bg-white text-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                            >
                                <Play size={14} fill="currentColor"/> MULAI TES
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