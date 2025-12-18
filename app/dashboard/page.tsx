"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  return (
    <main className="relative min-h-screen bg-void text-white overflow-hidden selection:bg-laser selection:text-white">
      
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[url('/assets/grid.png')] opacity-10 pointer-events-none bg-[size:50px_50px]"></div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 md:w-20 md:h-20"> 
            <Image src="/assets/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="font-bold tracking-widest text-lg font-sans">CORPS PRAJA</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button className="bg-laser/10 border border-laser text-laser px-4 py-2 rounded text-sm font-mono hover:bg-laser hover:text-white transition-all shadow-[0_0_15px_rgba(214,0,28,0.3)]">
              LOGIN BASE
            </button>
          </Link>
          <button onClick={() => setIsAuditOpen(true)} className="hidden md:block bg-gray-900 border border-gray-700 text-gray-300 px-4 py-2 rounded text-sm font-mono hover:text-white hover:border-white transition-all">
            ⚠ CEK PELUANG
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 px-6 container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-screen">
        <div className="space-y-6 z-10">
          <div className="inline-block border border-holo/30 bg-holo/5 px-3 py-1 rounded text-holo text-xs font-mono tracking-[0.2em]">
            SYSTEM ONLINE // RECRUITMENT 2026
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight font-sans">
            MISI NEGARA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-laser to-red-500 text-glow">
              DIMULAI DI SINI
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-lg border-l-2 border-laser pl-4 font-mono">
            Platform pelatihan taktis berbasis data untuk menembus seleksi IPDN, STIN, & CPNS.
          </p>
          <Link href="/dashboard">
            <button className="bg-laser text-white px-8 py-4 font-bold tracking-wider hover:scale-105 transition-transform shadow-[0_0_30px_rgba(214,0,28,0.6)] skew-x-[-10deg]">
              <span className="skew-x-[10deg] block">GABUNG KORPS SEKARANG</span>
            </button>
          </Link>
        </div>

        <div className="relative h-[500px] lg:h-[650px] flex justify-center items-end mt-10 lg:mt-0">
            <div className="absolute inset-0 bg-laser/20 blur-[100px] rounded-full opacity-40"></div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative w-full h-full">
              <Image src="/assets/satriacitra.png" alt="Commander Satria & Mentor Citra" fill className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]" priority />
            </motion.div>
        </div>
      </section>

      {/* --- ARSENAL (FEATURES) --- */}
      <section className="relative py-24 px-6 bg-void">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-16 font-sans"><span className="text-white">ARSENAL</span> <span className="text-laser">TAKTIK</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-xl hover:border-laser transition-all"><h3 className="text-xl font-bold text-white mb-2">INTELIJEN SKD</h3><p className="text-gray-400 text-sm">Modul rahasia TWK, TIU, TKP.</p></div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-xl hover:border-holo transition-all"><h3 className="text-xl font-bold text-white mb-2">SIMULASI CAT</h3><p className="text-gray-400 text-sm">Ujian real-time dengan timer.</p></div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-xl hover:border-laser transition-all"><h3 className="text-xl font-bold text-white mb-2">RADAR PERFORMA</h3><p className="text-gray-400 text-sm">Analisis grafik kelemahan.</p></div>
          </div>
        </div>
      </section>

      {/* --- PRICING & ROADMAP --- */}
      <section className="relative py-24 px-6 bg-black/50 border-t border-white/5">
        <div className="container mx-auto text-center">
             <h2 className="text-3xl font-extrabold text-white mb-10">SIAP BERGABUNG?</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="p-6 border border-white/10 rounded-xl bg-black"><h3 className="text-2xl font-bold text-white">CADET PASS</h3><div className="text-3xl font-bold text-white my-4">GRATIS</div><button className="w-full py-2 border border-white text-white rounded">AMBIL JATAH</button></div>
                <div className="p-6 border-2 border-laser rounded-xl bg-white/5 transform scale-105"><h3 className="text-2xl font-bold text-white">SPECIAL OPS</h3><div className="text-3xl font-bold text-white my-4">RP 199K</div><button className="w-full py-2 bg-laser text-white rounded font-bold">DEPLOY SEKARANG</button></div>
                <div className="p-6 border border-holo/50 rounded-xl bg-black"><h3 className="text-2xl font-bold text-white">ELITE SQUAD</h3><div className="text-3xl font-bold text-white my-4">RP 499K</div><button className="w-full py-2 border border-holo text-holo rounded">JOIN ELITE</button></div>
             </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 bg-black py-12 text-center text-gray-500 text-sm font-mono">
        © 2026 CORPS PRAJA ACADEMY. SYSTEM SECURE.
      </footer>

      {/* --- AUDIT MODAL --- */}
      <AnimatePresence>
        {isAuditOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-void border border-holo/50 p-8 rounded-xl max-w-md w-full relative shadow-[0_0_50px_rgba(0,240,255,0.2)]">
                <h2 className="text-2xl font-bold text-white mb-4">TACTICAL ASSESSMENT</h2>
                <p className="text-gray-400 mb-4">Pilih target operasi:</p>
                <div className="space-y-2 mb-6">
                    <button className="w-full text-left p-2 bg-white/5 border border-white/10 rounded text-sm hover:border-holo hover:text-holo transition-colors">[ ] IPDN</button>
                    <button className="w-full text-left p-2 bg-white/5 border border-white/10 rounded text-sm hover:border-holo hover:text-holo transition-colors">[ ] STIN</button>
                </div>
                <button onClick={() => setIsAuditOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✖</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
// Markas Besar Corps Praja - Deployment Final