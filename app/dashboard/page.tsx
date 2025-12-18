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
          <button 
            onClick={() => setIsAuditOpen(true)}
            className="hidden md:block bg-gray-900 border border-gray-700 text-gray-300 px-4 py-2 rounded text-sm font-mono hover:text-white hover:border-white transition-all"
          >
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
            Platform pelatihan taktis berbasis data untuk menembus seleksi IPDN, STIN, & CPNS. Jangan hanya belajar, berlatihlah seperti kadet.
          </p>
          <Link href="/dashboard">
            <button className="bg-laser text-white px-8 py-4 font-bold tracking-wider hover:scale-105 transition-transform shadow-[0_0_30px_rgba(214,0,28,0.6)] skew-x-[-10deg]">
              <span className="skew-x-[10deg] block">GABUNG KORPS SEKARANG</span>
            </button>
          </Link>
        </div>

        <div className="relative h-[500px] lg:h-[650px] flex justify-center items-end mt-10 lg:mt-0">
            <div className="absolute inset-0 bg-laser/20 blur-[100px] rounded-full opacity-40"></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-full"
            >
              <Image 
                src="/assets/satriacitra.png" 
                alt="Commander Satria & Mentor Citra" 
                fill 
                className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                priority
              />
              <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="absolute top-1/3 -left-4 lg:left-10 bg-black/60 border-l-4 border-holo px-4 py-2 backdrop-blur-md rounded"
              >
                 <div className="text-xs text-gray-400 font-mono">ACTIVE UNIT</div>
                 <div className="text-sm text-white font-bold tracking-wider">SKD & SKB READY</div>
              </motion.div>
            </motion.div>
        </div>
      </section>

      {/* --- ARSENAL (FEATURES) --- */}
      <section className="relative py-24 px-6 bg-void">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold font-sans">
              <span className="text-white">ARSENAL</span> <span className="text-laser">TAKTIK</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm">
              Perlengkapan tempur digital yang wajib dimiliki setiap calon praja.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group relative p-8 bg-white/5 border border-white/10 rounded-xl hover:border-laser transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-laser/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="w-12 h-12 bg-laser/20 rounded-lg flex items-center justify-center text-2xl mb-6 text-laser group-hover:scale-110 transition-transform">📚</div>
              <h3 className="text-xl font-bold text-white mb-3 font-sans">INTELIJEN SKD TERUPDATE</h3>
              <p className="text-gray-400 text-sm font-mono">Modul rahasia TWK, TIU, & TKP disusun berdasarkan pola soal tahun lalu.</p>
            </div>
            {/* Card 2 */}
            <div className="group relative p-8 bg-white/5 border border-white/10 rounded-xl hover:border-holo hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-holo/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="w-12 h-12 bg-holo/20 rounded-lg flex items-center justify-center text-2xl mb-6 text-holo group-hover:scale-110 transition-transform">🎯</div>
              <h3 className="text-xl font-bold text-white mb-3 font-sans">SIMULASI TEMPUR (CAT)</h3>
              <p className="text-gray-400 text-sm font-mono">Sistem ujian real-time dengan timer hitung mundur dan passing grade otomatis.</p>
            </div>
            {/* Card 3 */}
            <div className="group relative p-8 bg-white/5 border border-white/10 rounded-xl hover:border-laser transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-laser/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="w-12 h-12 bg-laser/20 rounded-lg flex items-center justify-center text-2xl mb-6 text-laser group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-white mb-3 font-sans">RADAR PERFORMA</h3>
              <p className="text-gray-400 text-sm font-mono">Analisis grafik kelemahanmu. Mentor AI akan memberitahu sektor mana yang harus diperbaiki.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- ROADMAP --- */}
      <section className="relative py-24 px-6 border-t border-white/5 bg-black/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-16 font-sans">
            <span className="text-white">PETA</span> <span className="text-holo">OPERASI</span>
          </h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 w-1 h-full bg-gradient-to-b from-laser via-holo to-transparent -translate-x-1/2 opacity-30"></div>
            {[
              { title: "RECRUITMENT", desc: "Daftar akun & aktivasi identitas kadet.", icon: "01" },
              { title: "BASIC TRAINING", desc: "Akses materi intelijen dasar TWK, TIU, TKP.", icon: "02" },
              { title: "COMBAT SIM", desc: "Uji nyali di Try Out Akbar Nasional.", icon: "03" },
              { title: "VICTORY", desc: "Lulus seleksi & pelantikan praja.", icon: "04" },
            ].map((step, i) => (
              <div key={i} className={`relative flex items-center justify-between mb-12 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <div className="w-5/12"></div>
                <div className="z-10 w-12 h-12 rounded-full bg-void border-2 border-holo flex items-center justify-center font-bold text-holo shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                  {step.icon}
                </div>
                <div className={`w-5/12 p-6 bg-white/5 border border-white/10 rounded-xl hover:border-laser transition-colors ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-xl font-bold text-white font-sans">{step.title}</h3>
                  <p className="text-gray-400 text-sm font-mono mt-2">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section className="relative py-24 px-6 bg-void">
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-16 font-sans">
            PILIH <span className="text-transparent bg-clip-text bg-gradient-to-r from-laser to-red-500">SENJATA</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 border border-white/10 rounded-2xl bg-black hover:border-white/30 transition-all">
              <div className="text-gray-400 font-mono text-sm mb-2">STARTER PACK</div>
              <h3 className="text-3xl font-bold text-white mb-6">CADET PASS</h3>
              <div className="text-4xl font-bold text-white mb-6">RP 0</div>
              <button className="w-full py-3 border border-white/20 text-white rounded hover:bg-white hover:text-black font-bold transition-all">AMBIL JATAH</button>
            </div>
            <div className="relative p-8 border-2 border-laser rounded-2xl bg-white/5 transform md:-translate-y-4 shadow-[0_0_50px_rgba(214,0,28,0.2)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-laser text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider">RECOMMENDED</div>
              <div className="text-laser font-mono text-sm mb-2">FULL ACCESS</div>
              <h3 className="text-3xl font-bold text-white mb-6">SPECIAL OPS</h3>
              <div className="text-4xl font-bold text-white mb-6">RP 199.000</div>
              <button className="w-full py-3 bg-laser text-white rounded font-bold hover:bg-red-700 transition-all">DEPLOY SEKARANG</button>
            </div>
            <div className="p-8 border border-holo/30 rounded-2xl bg-black hover:border-holo transition-all">
              <div className="text-holo font-mono text-sm mb-2">MENTORING</div>
              <h3 className="text-3xl font-bold text-white mb-6">ELITE SQUAD</h3>
              <div className="text-4xl font-bold text-white mb-6">RP 499.000</div>
              <button className="w-full py-3 border border-holo/50 text-holo rounded hover:bg-holo hover:text-black font-bold transition-all">JOIN ELITE</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 bg-black py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-bold text-white tracking-widest font-sans">CORPS PRAJA</h4>
            <p className="text-gray-500 text-sm mt-2 font-mono">The Elite Tactical Command Center for ASN Candidates.</p>
          </div>
          <div className="text-gray-600 text-xs font-mono">© 2026 CORPS PRAJA ACADEMY. SYSTEM SECURE.</div>
        </div>
      </footer>

      {/* --- AUDIT MODAL --- */}
      <AnimatePresence>
        {isAuditOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl bg-void border border-holo/30 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-[0_0_50px_rgba(0,240,255,0.2)]"
            >
              <div className="relative h-[400px] md:h-auto bg-gradient-to-b from-gray-900 to-black border-r border-white/10 flex items-end justify-center overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-holo shadow-[0_0_20px_#00F0FF] animate-scan"></div>
                <Image src="/assets/citra.png" alt="Mentor Citra" width={300} height={500} className="object-contain relative z-10" />
                <div className="absolute top-4 left-4 text-holo font-mono text-xs">OFFICER: CITRA <br/> STATUS: ANALYZING...</div>
              </div>
              <div className="p-8 flex flex-col justify-center space-y-6 relative bg-void">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-sans">
                   <span className="w-2 h-6 bg-laser block"></span>
                   TACTICAL ASSESSMENT
                 </h2>
                 <p className="text-gray-400 text-sm font-mono">Pilih target operasi Anda:</p>
                 <div className="space-y-3">
                    {['IPDN (KEMENDAGRI)', 'STIN (INTELIJEN)', 'POLTEKIP', 'CPNS UMUM'].map((item) => (
                      <button key={item} className="w-full text-left p-3 border border-white/10 hover:border-holo hover:bg-holo/10 hover:text-holo transition-colors text-sm font-mono rounded bg-white/5">
                        [ ] {item}
                      </button>
                    ))}
                 </div>
                 <button onClick={() => setIsAuditOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✖</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}