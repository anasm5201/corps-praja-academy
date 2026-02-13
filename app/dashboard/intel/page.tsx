import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
    Search, Filter, Lock, PlayCircle, FileText, 
    ArrowUpRight, BookOpen, Clock // ✅ FIX: Clock sudah ditambahkan
} from "lucide-react";

export default async function IntelPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login"); // Pastikan path login benar (/auth/login atau /login)

  // Ambil semua materi dari database, urutkan dari yang terbaru
  const materials = await prisma.material.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 pt-8 relative text-white">
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] -z-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-white/5 pb-8">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    <BookOpen size={12} /> Knowledge Base v1.0
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                    Intel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Materials</span>
                </h1>
                <p className="text-gray-400 text-sm mt-2 max-w-xl font-mono leading-relaxed">
                    Akses dokumen rahasia, modul pembelajaran (PDF), dan materi taktis untuk persiapan SKD. Pelajari pola musuh (soal) sebelum bertempur.
                </p>
            </div>
            
            {/* Search Bar (Visual) */}
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder="Cari dokumen..." 
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
                />
                <Search className="absolute left-3 top-3 text-gray-500" size={16} />
            </div>
        </div>

        {/* GRID MATERI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((item) => (
                <div key={item.id} className="group relative bg-zinc-900/50 border border-white/5 hover:border-blue-500/50 rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10 overflow-hidden flex flex-col h-full">
                    
                    {/* Badge Kategori */}
                    <div className="flex justify-between items-start mb-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                            ${item.category === 'TWK' ? 'bg-red-900/20 text-red-500 border-red-500/20' : 
                              item.category === 'TIU' ? 'bg-yellow-900/20 text-yellow-500 border-yellow-500/20' : 
                              'bg-green-900/20 text-green-500 border-green-500/20'}
                        `}>
                            {item.category}
                        </span>
                        {item.isPremium && (
                            <div className="bg-yellow-600/20 p-1.5 rounded-lg border border-yellow-600/30" title="Premium Access">
                                <Lock size={14} className="text-yellow-500" />
                            </div>
                        )}
                    </div>

                    {/* Icon & Judul */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform shadow-inner">
                            {item.type === 'VIDEO' ? <PlayCircle className="text-red-500" size={24} /> : <FileText className="text-blue-500" size={24} />}
                        </div>
                        <div>
                            <h3 className="text-white font-bold leading-snug group-hover:text-blue-400 transition-colors line-clamp-2 text-sm uppercase">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-mono">
                                <Clock size={12} /> {item.duration || "5 Min"}
                            </div>
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div className="flex-grow">
                         <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-3">
                            {item.description}
                        </p>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="mt-auto pt-6 border-t border-white/5">
                        <a 
                            // ✅ FIX: Ganti 'contentUrl' menjadi 'url'
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-blue-600/20"
                        >
                            <span className="flex items-center gap-2">
                                Buka Dokumen <ArrowUpRight size={14} />
                            </span>
                        </a>
                    </div>
                </div>
            ))}

            {/* Empty State */}
            {materials.length === 0 && (
                <div className="col-span-full py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-gray-600" size={32} />
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-sm">Arsip Intelijen Kosong</p>
                    <p className="text-gray-600 text-xs mt-1">Belum ada materi yang dideploy oleh Markas Pusat.</p>
                </div>
            )}
        </div>
    </div>
  );
}