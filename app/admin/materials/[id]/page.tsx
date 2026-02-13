import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
    ArrowLeft, PlusCircle, FileText, CheckCircle2, AlertCircle, Clock 
} from "lucide-react";
import DeleteQuestionButton from "./DeleteQuestionButton"; // Pastikan file ini dibuat di folder yang sama

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 1. AMBIL DATA PAKET + SOAL DI DALAMNYA
  const pkg = await prisma.tryoutPackage.findUnique({
      where: { id: params.id },
      include: {
          questions: {
              orderBy: { createdAt: 'asc' } // Urutkan dari soal no 1
          }
      }
  });

  if (!pkg) return <div className="p-10 text-center text-gray-500">Data Logistik Tidak Ditemukan.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
        
        {/* HEADER NAVIGASI */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Link href="/admin/materials" className="p-3 bg-zinc-900 rounded-xl border border-white/10 hover:bg-zinc-800 transition text-gray-400 hover:text-white">
                    <ArrowLeft size={20}/>
                </Link>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border
                            ${pkg.category === 'SKD' ? 'border-blue-900 text-blue-500 bg-blue-900/10' : 
                              pkg.category === 'PSIKOLOGI' ? 'border-purple-900 text-purple-500 bg-purple-900/10' :
                              'border-yellow-900 text-yellow-500 bg-yellow-900/10'}
                        `}>
                            {pkg.category}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">ID: {pkg.id.slice(0,8).toUpperCase()}</span>
                    </div>
                    <h1 className="text-2xl font-black uppercase text-white tracking-tight">{pkg.title}</h1>
                </div>
            </div>

            {/* TOMBOL ISI AMUNISI (Membawa packageId) */}
            <Link 
                href={`/admin/question/add?packageId=${pkg.id}`} 
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition shadow-lg shadow-green-900/20"
            >
                <PlusCircle size={18}/> Isi Amunisi Soal
            </Link>
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Soal</p>
                <p className="text-2xl font-black text-white">{pkg.questions.length}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Durasi</p>
                <p className="text-2xl font-black text-white flex items-end gap-1">
                    {pkg.duration} <span className="text-xs font-bold text-gray-500 mb-1">Mnt</span>
                </p>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Harga</p>
                <p className="text-xl font-black text-white">
                    {pkg.price === 0 ? "FREE" : `Rp ${(pkg.price/1000).toLocaleString()}K`}
                </p>
            </div>
            <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</p>
                <p className={`text-xl font-black uppercase ${pkg.isPublished ? 'text-green-500' : 'text-gray-500'}`}>
                    {pkg.isPublished ? 'LIVE' : 'DRAFT'}
                </p>
            </div>
        </div>

        {/* LIST SOAL (MANIFEST) */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-zinc-950/50">
                <h3 className="font-bold uppercase text-sm flex items-center gap-2 text-gray-300">
                    <FileText size={16} className="text-blue-500"/> Manifest Soal
                </h3>
            </div>

            <div className="divide-y divide-white/5">
                {pkg.questions.map((q, index) => {
                    // Parsing opsi jawaban dari JSON string
                    let options = [];
                    try { options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options } catch(e){}

                    // Cari jawaban benar (untuk display)
                    // Logic: Kalau SKD/TIU cari yang poin 5. Kalau boolean, cari yang isCorrect.
                    // Fallback sederhana:
                    const correctOption = Array.isArray(options) 
                        ? options.find((o:any) => o.score === 5 || o.isCorrect === true) 
                        : null;
                    
                    const keyAnswer = correctOption ? correctOption.code || "A" : "?";

                    return (
                        <div key={q.id} className="p-6 hover:bg-white/5 transition group flex flex-col md:flex-row gap-6">
                            
                            {/* NOMOR */}
                            <div className="hidden md:flex flex-col items-center justify-center w-12 shrink-0 border-r border-white/5 pr-6">
                                <span className="text-2xl font-black text-gray-700 group-hover:text-blue-500 transition">
                                    {index + 1}
                                </span>
                            </div>

                            {/* KONTEN SOAL */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-[10px] font-bold bg-zinc-800 text-gray-300 px-2 py-0.5 rounded uppercase border border-white/10">
                                        {q.type}
                                    </span>
                                    <span className="text-[10px] font-bold bg-green-900/20 text-green-500 px-2 py-0.5 rounded uppercase flex items-center gap-1 border border-green-900/30">
                                        <CheckCircle2 size={10}/> Kunci: {keyAnswer}
                                    </span>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-sm text-gray-300 font-medium line-clamp-3 leading-relaxed">
                                        {q.text.replace(/<[^>]+>/g, '') /* Strip HTML tags sederhana untuk preview */}
                                    </p>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition pl-4 border-l border-white/5">
                                {/* Tombol Delete Client Component */}
                                <DeleteQuestionButton id={q.id} packageId={pkg.id} />
                            </div>
                        </div>
                    )
                })}

                {pkg.questions.length === 0 && (
                    <div className="text-center py-24">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <AlertCircle className="text-gray-600" size={32}/>
                        </div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">KOTAK AMUNISI KOSONG</p>
                        <p className="text-gray-600 text-xs mt-2 max-w-xs mx-auto">
                            Paket ini belum memiliki butir soal. Klik tombol hijau di atas untuk mulai mengisi.
                        </p>
                    </div>
                )}
            </div>
        </div>

    </div>
  );
}