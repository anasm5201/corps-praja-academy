"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle, FileText, PlayCircle, Loader2, Lock } from "lucide-react";
import Link from "next/link";

export default function MaterialViewer({ data }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Simulasi Loading Materi
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          setLoading(false);
          return 100;
        }
        return old + 10; // Kecepatan loading
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const handleFinish = () => {
    if (confirm(`Selesaikan materi "${data.title}" dan klaim +${data.xp} XP?`)) {
        setCompleted(true);
        // Di sini nanti bisa dipasang Server Action untuk tambah XP beneran
        alert(`SELAMAT! Anda mendapatkan +${data.xp} XP (Simulasi).`);
        router.push("/dashboard/materials");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 min-h-screen flex flex-col">
       
       {/* HEADER NAVIGASI */}
       <div className="py-6 border-b border-white/10 mb-8 flex justify-between items-center">
          <Link href="/dashboard/materials" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group">
             <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Kembali ke Arsip
          </Link>
          <div className="text-[10px] font-mono text-gray-500 bg-white/5 px-3 py-1 rounded border border-white/10">
             SECURE ID: {data.id.toUpperCase()}
          </div>
       </div>

       {/* KONTEN UTAMA */}
       <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-1 relative overflow-hidden flex-grow flex flex-col">
          
          {/* Header Materi */}
          <div className="p-8 pb-4 text-center z-10">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border bg-opacity-20 ${data.cat === 'TWK' ? 'bg-red-500 border-red-500' : data.cat === 'TIU' ? 'bg-yellow-500 border-yellow-500' : 'bg-green-500 border-green-500'}`}>
                 {data.type === 'VIDEO' ? <PlayCircle size={32} className="text-white"/> : <FileText size={32} className="text-white"/>}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tight">
                 {data.title}
              </h1>
              
              <div className="flex justify-center gap-3 mb-6">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded border ${data.cat === 'TWK' ? 'text-red-400 border-red-500/30 bg-red-900/20' : data.cat === 'TIU' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20' : 'text-green-400 border-green-500/30 bg-green-900/20'}`}>
                    SEKTOR {data.cat}
                 </span>
                 <span className="text-[10px] font-bold px-2 py-1 rounded border border-white/10 bg-white/5 text-gray-400">
                    {data.size}
                 </span>
              </div>
          </div>

          {/* AREA SIMULASI VIEWER (PDF/VIDEO) */}
          <div className="flex-grow bg-black/40 m-4 rounded-xl border border-white/5 relative min-h-[400px] flex flex-col items-center justify-center overflow-hidden">
             
             {/* Animasi Loading */}
             {loading ? (
                <div className="text-center w-64">
                   <div className="flex justify-between text-[10px] text-blue-400 font-mono mb-2">
                      <span>DECRYPTING DATA...</span>
                      <span>{progress}%</span>
                   </div>
                   <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-100" style={{width: `${progress}%`}}></div>
                   </div>
                </div>
             ) : (
                <div className="text-center animate-fade-in-up">
                   {data.locked ? (
                      <div className="space-y-4">
                         <Lock size={48} className="mx-auto text-red-500"/>
                         <p className="text-red-500 font-bold uppercase tracking-widest text-sm">Akses Ditolak</p>
                      </div>
                   ) : (
                      <div className="space-y-4 max-w-md px-6">
                         <p className="text-gray-500 text-sm font-mono">
                            [ PREVIEW MODE ]<br/>
                            Dokumen sedang ditampilkan di layar utama Anda.
                            <br/><br/>
                            "Pelajari pola soal ini dengan seksama. Jangan terburu-buru. Fokus pada kata kunci dalam setiap paragraf."
                         </p>
                      </div>
                   )}
                </div>
             )}

             {/* Background Grid Decoration */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
          </div>

          {/* FOOTER ACTION */}
          <div className="p-6 border-t border-white/5 bg-black/20 flex justify-center">
              <button 
                 onClick={handleFinish}
                 disabled={loading || completed}
                 className={`
                    px-8 py-4 rounded-xl uppercase tracking-widest font-black text-xs flex items-center gap-2 transition-all
                    ${loading 
                       ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                       : completed 
                          ? 'bg-green-900/50 text-green-500 border border-green-500' 
                          : 'bg-white text-black hover:bg-gray-200 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    }
                 `}
              >
                 {loading ? (
                    <><Loader2 size={16} className="animate-spin"/> Memuat Materi...</>
                 ) : completed ? (
                    <><CheckCircle size={16}/> Selesai</>
                 ) : (
                    <><CheckCircle size={16}/> Selesai Membaca (+{data.xp} XP)</>
                 )}
              </button>
          </div>

       </div>
    </div>
  );
}