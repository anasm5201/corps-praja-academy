import NavbarPublic from "@/components/layout/NavbarPublic";
import FeatureGrid from "@/components/home/FeatureGrid";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Users, Trophy, Terminal, Target, Scan, Cpu, Zap, Activity } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
      
      {/* HEADER CUSTOM (Logo & Title Update) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 h-24 flex items-center px-6 lg:px-12 justify-between">
          <div className="flex items-center gap-4">
              {/* LOGO CUSTOM - DIBESARKAN & LEBIH BOLD */}
              <Image 
                src="/assets/logo.png" 
                alt="Corps Praja Logo" 
                width={80} 
                height={80} 
                className="w-16 h-auto md:w-[72px] drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]" 
                priority 
              />
              <div className="flex flex-col -space-y-1">
                  <span className="text-xl md:text-2xl font-black tracking-tighter leading-none uppercase drop-shadow-md">CORPS PRAJA</span>
                  {/* TAMBAHAN TULISAN AKADEMI MERAH */}
                  <span className="text-xl md:text-2xl font-black tracking-tighter leading-none uppercase text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">ACADEMY</span>
              </div>
          </div>
          
          <nav className="hidden md:flex gap-8 text-sm font-bold tracking-widest text-gray-400">
              <Link href="#fitur" className="hover:text-white transition-colors">FITUR</Link>
              <Link href="#metode" className="hover:text-white transition-colors text-red-500">SISTEM TRITUNGGAL</Link>
              <Link href="#premium" className="hover:text-white transition-colors">AKSES PREMIUM</Link>
          </nav>

          <div className="flex items-center gap-4">
              <Link href="/login" className="text-xs font-bold uppercase tracking-widest hover:text-red-500 transition-colors">Masuk</Link>
              <Link href="/register" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105">
                  Daftar
              </Link>
          </div>
      </header>

      {/* === HERO SECTION === */}
      <section className="relative h-screen flex flex-col justify-end pt-24 overflow-hidden">
        
        {/* ATMOSFER & LANTAI */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-950/40 via-[#050505] to-[#000000] z-0 pointer-events-none"></div>
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="tactical-floor opacity-100"></div> {/* Lantai lebih terang */}
            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-red-600/20 via-transparent to-transparent z-10"></div>
        </div>

        {/* PARTIKEL API DRAMATIS (JUMLAH DIPERBANYAK & LEBIH VARIATIF) */}
        <div className="particles z-0">
            {[...Array(60)].map((_, i) => {
                const size = Math.random() * 4 + 1;
                return (
                <div key={i} className="particle" style={{ 
                    left: `${Math.random() * 100}%`, 
                    bottom: `-${Math.random() * 20}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: 'rgba(255, 80, 50, 0.8)',
                    boxShadow: '0 0 10px rgba(255, 50, 0, 0.8)',
                    animationDelay: `${Math.random() * 5}s`, 
                    '--duration': `${4 + Math.random() * 6}s` 
                } as any}></div>
            )})}
        </div>

        {/* GERBANG SIKU (FRAME) */}
        <div className="absolute inset-0 flex justify-between items-end pointer-events-none z-10">
            <div className="w-[20%] lg:w-[15%] h-[85%] relative animate-pulse origin-bottom-left">
               <svg viewBox="0 0 100 200" className="w-full h-full fill-red-700 drop-shadow-[0_0_80px_rgba(220,38,38,0.7)]" preserveAspectRatio="none">
                  <path d="M 0 200 L 100 200 L 100 0 Z" />
               </svg>
            </div>
            <div className="w-[20%] lg:w-[15%] h-[85%] relative animate-pulse delay-500 origin-bottom-right">
               <svg viewBox="0 0 100 200" className="w-full h-full fill-red-700 drop-shadow-[0_0_80px_rgba(220,38,38,0.7)]" preserveAspectRatio="none">
                  <path d="M 100 200 L 0 200 L 0 0 Z" />
               </svg>
            </div>
        </div>

        {/* PANGGUNG UTAMA */}
        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 h-full grid grid-cols-1 lg:grid-cols-12 items-end pb-0">
            
            {/* AREA KIRI: TEKS */}
            <div className="lg:col-span-6 space-y-8 mb-20 lg:mb-32 relative z-30 pl-4 lg:pl-0">
                <div className="flex items-center gap-3 mb-2">
                    <Scan className="text-red-500 animate-spin-slow" size={20} />
                    <div className="h-px w-12 bg-red-800"></div>
                    <span className="text-[10px] font-mono text-red-500 tracking-[0.3em] animate-pulse">SYSTEM ONLINE</span>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/40 border border-red-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Pendaftaran Batch 2026 Dibuka</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
                    Siapkan Diri<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-text-shimmer bg-[length:200%_auto]">Menembus</span><br/>
                    Batas Mustahil
                </h1>

                <p className="text-lg text-gray-300 max-w-xl leading-relaxed border-l-4 border-red-600 pl-6 bg-gradient-to-r from-red-950/40 to-transparent py-4 backdrop-blur-sm rounded-r-xl">
                    <span className="text-red-400 font-bold">[BRIEFING]:</span> Platform pelatihan #1 Calon Taruna. Integrasi Akademik, Fisik, & Mental dalam satu ekosistem digital.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href="/register" className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:shadow-[0_0_60px_rgba(220,38,38,0.7)] hover:scale-105 flex items-center justify-center gap-3 group">
                        Gabung Korps <ChevronRight className="group-hover:translate-x-1 transition-transform"/>
                    </Link>
                    <Link href="/login" className="px-10 py-5 bg-black/60 border border-white/20 hover:bg-white/10 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center hover:border-red-500/50 backdrop-blur-md">
                        Masuk Markas
                    </Link>
                </div>
            </div>

            {/* AREA KANAN: MODEL RAKSASA */}
            <div className="hidden lg:flex lg:col-span-6 relative h-[90vh] items-end justify-center z-20 pointer-events-none">
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[90%] h-[200px] bg-red-600/30 blur-[100px] rounded-full animate-pulse"></div>
                <div className="relative w-full h-full flex items-end justify-center">
                    <Image 
                        src="/assets/satriacitra.png"
                        alt="Satria dan Citra"
                        width={1200} 
                        height={1600}
                        quality={100}
                        priority
                        className="w-auto h-full max-h-[88vh] object-contain drop-shadow-[0_0_60px_rgba(0,0,0,0.9)]"
                    />
                    
                    {/* HUD Decorations - DIPINDAHKAN KE BAWAH */}
                    <div className="absolute bottom-[15%] -right-[5%] bg-black/80 border border-red-500/40 p-5 rounded-xl backdrop-blur-md animate-bounce delay-700 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
                        <div className="flex items-center gap-3 mb-2">
                            <Target size={15} className="text-red-500 animate-pulse"/>
                            <span className="text-xs font-mono text-white tracking-[0.2em] uppercase"> Accuracy Rate</span>
                        </div>
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-red-500">99.9%</div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-3 overflow-hidden">
                            <div className="h-full w-[99.9%] bg-red-600 shadow-[0_0_10px_red]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* === SECTION METODE TRITUNGGAL (REBRANDED) === */}
      <section id="metode" className="py-32 bg-[#050505] relative border-t border-red-900/30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_30px_rgba(220,38,38,0.8)]"></div>
          
          <div className="max-w-7xl mx-auto px-6 text-center mb-20">
              <div className="inline-flex items-center justify-center p-3 bg-red-950/30 rounded-2xl mb-6 border border-red-900/50 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                  <Cpu size={32} className="text-red-500" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
                  SISTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 font-extrabold drop-shadow-md">TRITUNGGAL</span> TERPUSAT
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                  Doktrin pembentukan karakter modern. Tiga pilar fundamental yang terintegrasi AI untuk menempa warga sipil menjadi perwira masa depan yang adaptif dan tangguh.
              </p>
          </div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* PILAR 1: JAR */}
              <div className="group relative p-8 bg-zinc-900/60 border border-white/10 hover:border-red-500/60 rounded-[2rem] transition-all duration-500 hover:-translate-y-2 overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="w-16 h-16 bg-blue-950/50 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30 group-hover:border-blue-400 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                      <Zap size={32} className="text-blue-500 group-hover:text-blue-400" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-4 flex flex-col gap-1">
                      <span className="text-blue-500">JAR</span> 
                      <span className="text-sm font-mono text-gray-400 tracking-[0.2em] uppercase">Pengajaran Taktis</span>
                  </h3>
                  
                  <p className="text-gray-300 text-sm leading-relaxed mb-8 border-l-2 border-blue-900/50 pl-4">
                      Pengembangan SKD presisi tinggi. Integrasi <strong>Doktrin Materi</strong> mendalam, simulasi <strong>Try Out HOTS</strong> adaptif, dan latihan refleks <strong>Speed Drill</strong> (Time Attack) untuk dominasi mental ujian.
                  </p>
                  
                  <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                      <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out shadow-[0_0_10px_#3b82f6]"></div>
                  </div>
              </div>

              {/* PILAR 2: LAT */}
              <div className="group relative p-8 bg-zinc-900/60 border border-white/10 hover:border-red-500/60 rounded-[2rem] transition-all duration-500 hover:-translate-y-2 overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,_var(--tw-gradient-stops))] from-yellow-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="w-16 h-16 bg-yellow-950/50 rounded-2xl flex items-center justify-center mb-8 border border-yellow-500/30 group-hover:border-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)] group-hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                      <Target size={32} className="text-yellow-500 group-hover:text-yellow-400" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-4 flex flex-col gap-1">
                      <span className="text-yellow-500">LAT</span> 
                      <span className="text-sm font-mono text-gray-400 tracking-[0.2em] uppercase">Pelatihan Terukur</span>
                  </h3>
                  
                  <p className="text-gray-300 text-sm leading-relaxed mb-8 border-l-2 border-yellow-900/50 pl-4">
                      Penempaan fisik dan psikis berbasis data. Sistem <strong>Screening Awal</strong>, periodisasi latihan jasmani, dan latihan <strong>Psikologi CAT</strong> (Kecermatan, Kepribadian, Kecerdasan) yang intensif.
                  </p>
                  
                  <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                      <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000 ease-out shadow-[0_0_10px_#eab308]"></div>
                  </div>
              </div>

              {/* PILAR 3: SUH */}
              <div className="group relative p-8 bg-zinc-900/60 border border-white/10 hover:border-red-500/60 rounded-[2rem] transition-all duration-500 hover:-translate-y-2 overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-green-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="w-16 h-16 bg-green-950/50 rounded-2xl flex items-center justify-center mb-8 border border-green-500/30 group-hover:border-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.2)] group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                      <Activity size={32} className="text-green-500 group-hover:text-green-400" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white mb-4 flex flex-col gap-1">
                      <span className="text-green-500">SUH</span> 
                      <span className="text-sm font-mono text-gray-400 tracking-[0.2em] uppercase">Pengasuhan AI</span>
                  </h3>
                  
                  <p className="text-gray-300 text-sm leading-relaxed mb-8 border-l-2 border-green-900/50 pl-4">
                      Monitoring performa 24/7. <strong>Artificial Intelligence</strong> mengonversi data progres menjadi <strong>Rencana Jangka Panjang</strong> dan misi harian (Daily Quest) untuk kedisiplinan total.
                  </p>
                  
                  <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                      <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000 ease-out shadow-[0_0_10px_#22c55e]"></div>
                  </div>
              </div>
          </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-32 bg-gradient-to-b from-[#050505] to-black border-t border-red-900/30 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 bg-fixed"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-red-950/20 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-6 relative z-10">
              <div className="inline-block p-3 bg-red-600/10 rounded-full mb-6 animate-pulse">
                <ShieldCheck size={40} className="text-red-500" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 drop-shadow-[0_0_25px_rgba(220,38,38,0.5)] leading-none">
                  Waktu Tidak <span className="text-red-500">Menunggu</span>
              </h2>
              <p className="text-gray-300 mb-12 text-xl leading-relaxed font-light max-w-2xl mx-auto">
                  Setiap detik keraguan adalah keuntungan bagi kompetitor. Medan seleksi tidak mengenal ampun bagi yang tidak siap.
                  <strong className="text-white block mt-4 text-2xl font-black">Ambil langkah pertama menuju seragam kebanggaan sekarang.</strong>
              </p>
              <Link href="/register" className="inline-flex items-center gap-3 px-20 py-6 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-[0.2em] rounded-full transition-all shadow-[0_0_40px_rgba(220,38,38,0.5)] hover:shadow-[0_0_80px_rgba(220,38,38,0.8)] hover:scale-105 group">
                  GABUNG KORPS SEKARANG <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
          </div>
      </section>

      <footer className="py-10 bg-black border-t border-red-900/20 text-center relative z-20">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity">
              <Terminal size={14} className="text-red-500" />
              <span className="text-xs font-mono text-red-500 tracking-widest">SECURE CONNECTION ESTABLISHED</span>
          </div>
          <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">
              © 2026 Corps Praja Academy. All Rights Reserved. <span className="text-red-800">System Version 2.0 (Tritunggal)</span>
          </p>
      </footer>

    </div>
  );
}