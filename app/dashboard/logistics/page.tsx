import { getLogisticsPackages } from "@/app/actions/get-logistics";
import { Lock, Unlock, BookOpen, Clock, FileText, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";

// --- KOMPONEN KARTU MODUL (ACADEMIC TACTICAL STYLE) ---
const PackageCard = ({ pkg, isUserPremium }: { pkg: any, isUserPremium: boolean }) => {
  const isOpen = pkg.isFree || isUserPremium;

  return (
    <div className={`relative group overflow-hidden rounded-sm border transition-all duration-300 hover:-translate-y-1
      ${isOpen 
        ? "border-red-600/60 bg-gradient-to-b from-neutral-900 to-black shadow-[0_0_15px_rgba(220,38,38,0.15)]" 
        : "border-neutral-800 bg-neutral-900/40 opacity-75 hover:opacity-100 hover:border-red-900/40"
      }`}>
      
      {/* DEKORASI SUDUT TEKNIS */}
      <div className={`absolute top-0 left-0 w-6 h-6 border-t border-l transition-colors
        ${isOpen ? "border-red-500" : "border-neutral-700"}`} />
      <div className={`absolute bottom-0 right-0 w-6 h-6 border-b border-r transition-colors
        ${isOpen ? "border-red-500" : "border-neutral-700"}`} />

      {/* LABEL STATUS POJOK KANAN */}
      <div className="absolute top-0 right-0 p-4 z-10">
        {isOpen ? (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-red-500 tracking-widest uppercase animate-pulse">SIAP DIUJI</span>
            <div className="bg-red-500/10 border border-red-500/40 text-red-500 p-1 rounded-sm">
              <Unlock size={14} />
            </div>
          </div>
        ) : (
          <div className="bg-neutral-800/50 border border-neutral-700 text-neutral-500 p-1 rounded-sm">
            <Lock size={14} />
          </div>
        )}
      </div>

      {/* BODY KARTU */}
      <div className="p-6 flex flex-col h-full justify-between relative z-0">
        <div>
          {/* Badge Kategori - AKADEMIS */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-[0.15em] border
              ${pkg.isFree 
                ? "bg-red-700 border-red-600 text-white" 
                : "bg-neutral-950 border-neutral-700 text-neutral-400"}`}>
              {pkg.isFree ? "MODUL DASAR" : "LANJUTAN"}
            </span>
            {!pkg.isFree && (
               <span className="text-[9px] font-bold text-red-600 flex items-center gap-1 tracking-wider">
                 <GraduationCap size={12} /> PREMIUM
               </span>
            )}
          </div>

          <h3 className={`text-lg font-black uppercase tracking-tight leading-snug mb-2
            ${isOpen ? "text-white" : "text-neutral-400"}`}>
            {pkg.title}
          </h3>
          
          {/* Garis Pemisah */}
          <div className={`h-[1px] w-full my-4 ${isOpen ? "bg-gradient-to-r from-red-900/50 to-transparent" : "bg-neutral-800"}`} />

          {/* Info Detail - METADATA */}
          <div className="flex items-center gap-5 text-xs font-mono tracking-wide">
            <div className={`flex items-center gap-1.5 ${isOpen ? "text-neutral-300" : "text-neutral-600"}`}>
              <Clock size={12} className="text-red-600" />
              <span>{pkg.duration} MNT</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isOpen ? "text-neutral-300" : "text-neutral-600"}`}>
              <FileText size={12} className="text-red-600" />
              <span>{pkg._count.questions} BUTIR SOAL</span>
            </div>
          </div>
        </div>

        {/* TOMBOL AKSI - NARASI AKADEMIK */}
        <div className="mt-8">
          {isOpen ? (
            <Link href={`/dashboard/exam/${pkg.id}`} className="block w-full group/btn">
              <button className="w-full py-3 bg-red-800 hover:bg-red-700 text-white text-xs font-bold rounded-sm transition-all flex items-center justify-between px-4 tracking-[0.15em] border border-red-600 group-hover/btn:shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                <span>MULAI SIMULASI</span>
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </Link>
          ) : (
            <button className="w-full py-3 bg-transparent border border-neutral-800 text-neutral-600 text-xs font-bold rounded-sm transition-all flex items-center justify-center gap-2 tracking-[0.1em] cursor-not-allowed uppercase">
              <Lock size={12} />
              Akses Dibatasi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- HALAMAN UTAMA ---
export default async function LogisticsPage() {
  const { data: packages } = await getLogisticsPackages();
  const isUserPremium = false; // Nanti diganti dengan logic role user

  // Hitung statistik
  const totalPackages = packages?.length || 0;
  const unlockedPackages = packages?.filter(p => p.isFree || isUserPremium).length || 0;

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-red-900 selection:text-white">
      
      {/* GRID BACKGROUND (Subtle Academic Pattern) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="relative p-6 max-w-7xl mx-auto">
        {/* HEADER - IDENTITAS PILAR JAR (PENGAJARAN) */}
        <div className="mb-10 border-b border-red-900/20 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-1 w-1 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-red-500 tracking-[0.4em] uppercase">PILAR I : JAR (PENGAJARAN)</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
              PUSAT <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">PENGAJARAN</span>
            </h1>
            
            <p className="text-neutral-400 mt-4 text-sm max-w-2xl font-normal leading-relaxed border-l-2 border-red-900/50 pl-4">
              Fasilitas evaluasi kompetensi akademik (SKD). Seluruh modul disusun berdasarkan kurikulum standar seleksi kedinasan. 
              Selesaikan <span className="text-white font-bold">Modul Dasar</span> sebagai syarat awal, atau buka akses <span className="text-red-500 font-bold">Kurikulum Premium</span> untuk pendalaman materi komprehensif.
            </p>
          </div>
          
          {/* STATISTIK AKADEMIK */}
          <div className="flex gap-0 divide-x divide-neutral-800 border border-neutral-800 bg-neutral-950/50 rounded-sm overflow-hidden">
            <div className="px-6 py-4 text-center">
              <div className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest mb-1">Total Modul</div>
              <div className="text-2xl font-black text-white">{totalPackages}</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest mb-1">Akses Terbuka</div>
              <div className="text-2xl font-black text-red-500">{unlockedPackages}</div>
            </div>
          </div>
        </div>

        {/* GRID DAFTAR MODUL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages?.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} isUserPremium={isUserPremium} />
          ))}
        </div>
      </div>
    </div>
  );
}