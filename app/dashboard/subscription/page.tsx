import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Check, Zap, Crown, Shield, X, Flame, Gem, Video, MessageCircle, Star, Dumbbell, Radar } from "lucide-react";
import { createTransaction } from "@/app/actions/transaction"; 

export default async function SubscriptionPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Bypass Type Check untuk akses ID
  const user = session?.user as any;

  if (!user || !user.id) {
    redirect("/auth/login");
  }

  // =================================================================================
  // 🛡️ PROTOKOL INTERCEPTOR (PENGUNCIAN)
  // =================================================================================
  // ⚠️ NOTE: Logika ini sementara dinonaktifkan agar Build Sukses (karena model Transaction belum ada di schema).
  // Silakan uncomment jika schema.prisma sudah diupdate dengan model Transaction.
  
  /*
  const activeTransaction = await prisma.transaction.findFirst({
    where: {
        userId: user.id,
        status: "PENDING",
        expiresAt: { gt: new Date() }
    }
  });

  if (activeTransaction) {
      redirect(`/dashboard/payment/${activeTransaction.id}`);
  }
  */

  // ✅ KONEKSI KE KASIR DIGITAL (Membuat ID Transaksi)
  const buySolo = createTransaction.bind(null, "SOLO");
  const buyIntensive = createTransaction.bind(null, "INTENSIVE");

  return (
    <div className="min-h-screen bg-[#050505] text-white py-20 px-4 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* ATMOSFER LATAR BELAKANG (UPGRADED - COSMIC VIBE) */}
        {/* [FIX]: Tambah z-0 agar tidak menutupi tombol */}
        <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/30 rounded-full blur-[150px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-[120px]"></div>
        </div>
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0" 
             style={{ backgroundImage: 'linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
            
            {/* HEADER COPYWRITING (PSIKOLOGI DESAKAN & INTEGRASI JAR-LAT-SUH) */}
            <div className="text-center mb-20 space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000 relative z-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/30 backdrop-blur-md text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <Star size={12} className="fill-indigo-400 text-indigo-400 animate-pulse" /> Official Corps Praja System
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                    DOKTRIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">JAR - LAT - SUH</span><br/>
                    <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">SIAP DITERAPKAN</span>
                </h1>
                <p className="text-neutral-400 max-w-2xl mx-auto font-mono text-sm md:text-base leading-relaxed">
                    Sistem kami bukan sekadar Bank Soal. Ini adalah <span className="text-indigo-400 font-bold">Simulator Akademi Militer Digital</span>.
                    Kami melatih <strong>Otak (Akademik)</strong>, menempa <strong>Fisik (Jasmani)</strong>, dan membentuk <strong>Mental (Pengasuhan)</strong> Anda.
                </p>
            </div>

            {/* GRID 3 PAKET */}
            {/* [FIX]: Tambah relative dan z-30 pada container grid utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative z-30">
                
                {/* ========================================================= */}
                {/* 1. SILVER (REKRUT / FREE) */}
                {/* ========================================================= */}
                <div className="relative group p-1 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 opacity-80 hover:opacity-100 transition-all duration-500">
                    <div className="relative h-full bg-[#0a0a0a] rounded-xl p-8 flex flex-col border border-neutral-800 group-hover:border-neutral-600 transition-colors">
                        <div className="mb-8 border-b border-neutral-800 pb-6">
                            <div className="flex items-center gap-3 mb-4 text-neutral-500">
                                <Shield size={24} />
                                <h3 className="font-black text-lg uppercase tracking-[0.2em]">REKRUT</h3>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-neutral-400">GRATIS</span>
                            </div>
                            <p className="text-neutral-600 text-xs font-mono mt-2 uppercase tracking-wide">AKSES TERBATAS (TRIAL)</p>
                        </div>

                        <ul className="space-y-4 mb-8 text-sm text-neutral-500 flex-1">
                            <li className="flex gap-3 items-center"><Check size={16} className="text-neutral-500 shrink-0"/> <span>Akses Dashboard Markas</span></li>
                            <li className="flex gap-3 items-center"><Check size={16} className="text-neutral-500 shrink-0"/> <span>1x Tryout SKD (Demo)</span></li>
                            <li className="flex gap-3 items-center text-neutral-700 line-through decoration-red-900/50"><X size={16} className="shrink-0 text-red-900"/> <span><strong>Smart Samapta Tracker</strong></span></li>
                            <li className="flex gap-3 items-center text-neutral-700 line-through decoration-red-900/50"><X size={16} className="shrink-0 text-red-900"/> <span>Zoom Class & Bimbingan</span></li>
                        </ul>

                        <button disabled className="w-full py-4 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-600 font-bold text-xs uppercase tracking-widest cursor-not-allowed pointer-events-none">
                            POSISI ANDA SAAT INI
                        </button>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 2. GOLD (SOLO FIGHTER) - FOCUS: SYSTEM ONLY */}
                {/* ========================================================= */}
                <div className="relative group p-1 rounded-2xl bg-gradient-to-b from-amber-500 via-yellow-600 to-amber-800 transform lg:-translate-y-4 shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)] transition-all duration-500 hover:shadow-[0_0_80px_-10px_rgba(245,158,11,0.5)] z-40">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-6 py-1.5 rounded-sm skew-x-[-10deg] shadow-lg z-20 pointer-events-none">
                        <span className="block skew-x-[10deg] text-[10px] font-black uppercase tracking-[0.2em]">PILIHAN POPULER</span>
                    </div>
                    
                    <div className="relative h-full bg-[#0f0a05] rounded-xl p-8 flex flex-col border border-amber-900/50">
                        <div className="mb-8 border-b border-amber-900/30 pb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Zap size={80} /></div>
                            <div className="flex items-center gap-3 mb-4 text-amber-500">
                                <Flame size={24} className="animate-pulse fill-amber-500/20" />
                                <h3 className="font-black text-lg uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">SOLO FIGHTER</h3>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">Rp 299rb</span>
                            </div>
                            <p className="text-amber-500/80 text-xs font-mono mt-2 uppercase tracking-wide font-bold">FULL SYSTEM ACCESS (3 BULAN)</p>
                        </div>

                        <ul className="space-y-4 mb-8 text-sm text-neutral-300 font-medium flex-1">
                            <li className="flex gap-3 items-start">
                                <Check size={18} className="text-amber-500 shrink-0 mt-0.5"/> 
                                <span><strong>PENGAJARAN (JAR):</strong> Akses Ribuan Bank Soal SKD, Drill, & Psikologi.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <Dumbbell size={18} className="text-amber-500 shrink-0 mt-0.5"/> 
                                <span><strong>PELATIHAN (LAT):</strong> Input Latihan Fisik & Kalkulator Samapta Otomatis.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <Radar size={18} className="text-amber-500 shrink-0 mt-0.5"/> 
                                <span><strong>PENGASUHAN (SUH):</strong> AI Memantau Grafik Akademik vs Jasmani Anda.</span>
                            </li>
                            <li className="flex gap-3 items-center text-neutral-600 line-through decoration-neutral-600">
                                <X size={18} className="shrink-0"/> <span>Zoom Class & Mentoring</span>
                            </li>
                        </ul>

                        {/* [FIX]: Bungkus dengan form Server Action */}
                        <div className="mt-auto relative z-50">
                            <form action={buySolo} className="block w-full">
                                <button type="submit" className="w-full py-4 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-black text-sm uppercase tracking-[0.15em] hover:brightness-110 hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer pointer-events-auto">
                                    <Zap size={16} fill="black" /> AMBIL SENJATA INI
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 3. DIAMOND (INTENSIVE SQUAD) - COSMIC PURPLE THEME */}
                {/* ========================================================= */}
                <div className="relative group p-1 rounded-2xl bg-gradient-to-b from-indigo-600 via-violet-700 to-fuchsia-900 transform lg:-translate-y-8 shadow-[0_0_60px_-10px_rgba(124,58,237,0.5)] transition-all duration-500 hover:shadow-[0_0_100px_-10px_rgba(124,58,237,0.8)] hover:scale-[1.02] z-40 border border-indigo-400/30">
                    
                    {/* LABEL GLOWING */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-indigo-400 text-indigo-300 px-6 py-2 rounded-sm shadow-[0_0_20px_rgba(124,58,237,0.8)] z-30 pointer-events-none">
                        <span className="block text-[11px] font-black uppercase tracking-[0.2em] animate-pulse flex items-center gap-2">
                            <Crown size={12} fill="currentColor"/> BEST SELLER
                        </span>
                    </div>

                    <div className="relative h-full bg-[#090515] rounded-xl p-8 flex flex-col border border-indigo-500/40 bg-[url('/noise.png')]">
                        
                        {/* EFEK KILAU (SHINE) - LEBIH KUAT */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-fuchsia-500/10 opacity-40 pointer-events-none rounded-xl z-0"></div>

                        {/* HEADER */}
                        <div className="mb-8 border-b border-indigo-500/30 pb-6 relative overflow-hidden z-10">
                            <div className="absolute top-0 right-0 p-4 opacity-20 text-indigo-500 rotate-12 pointer-events-none"><Gem size={100} /></div>
                            <div className="flex items-center gap-3 mb-4 text-indigo-300">
                                <Gem size={28} className="fill-indigo-400/20 text-indigo-300 drop-shadow-[0_0_15px_rgba(167,139,250,1)]" />
                                <h3 className="font-black text-lg uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-fuchsia-300">INTENSIVE SQUAD</h3>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(124,58,237,0.6)]">Rp 999rb</span>
                            </div>
                            <p className="text-indigo-300 text-xs font-mono mt-2 uppercase tracking-wide font-bold">BIMBINGAN TOTAL (SAMPAI TES)</p>
                        </div>

                        {/* FITUR LIST (HIGHLIGHTED) */}
                        <ul className="space-y-5 mb-8 text-sm text-neutral-200 font-medium flex-1 z-10">
                            <li className="flex gap-3 items-start bg-indigo-900/40 p-2.5 rounded-lg border border-indigo-500/30">
                                <Shield size={18} className="text-indigo-300 shrink-0 mt-0.5"/> 
                                <span><strong>SEMUA FITUR GOLD:</strong> Bank Soal, Tryout, & Pelacak Jasmani Lengkap.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <Video size={18} className="text-fuchsia-400 shrink-0 mt-0.5 animate-pulse"/> 
                                <span><strong>ZOOM CLASS EKSKLUSIF (Minimal 1x/Minggu):</strong> Bedah Materi HOTS & Strategi Mental langsung via tatap muka.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <MessageCircle size={18} className="text-fuchsia-400 shrink-0 mt-0.5"/> 
                                <span><strong>BIMBINGAN PRIBADI (JALUR KOMANDO):</strong> Konsultasi WA 24/7. Tanya jawab solusi kendala fisik/kesehatan/akademik.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <Dumbbell size={18} className="text-indigo-400 shrink-0 mt-0.5"/> 
                                <span><strong>PERSONAL REVIEW JASMANI:</strong> Evaluasi & Pengarahan target Jasmani Anda secara berkala agar lolos Samapta.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <Crown size={18} className="text-yellow-400 shrink-0 mt-0.5"/> 
                                <span><strong>CIRCLE VIP:</strong> Masuk grup "Pasukan Khusus". Info valid lebih cepat & tips rahasia.</span>
                            </li>
                        </ul>

                        {/* TOMBOL */}
                        {/* [FIX]: Bungkus dengan form Server Action */}
                        <div className="mt-auto relative z-50">
                            <form action={buyIntensive} className="block w-full">
                                <button type="submit" className="w-full py-5 rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white font-black text-sm uppercase tracking-[0.15em] border border-indigo-400/50 hover:border-white hover:shadow-[0_0_40px_rgba(124,58,237,0.8)] hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden cursor-pointer pointer-events-auto">
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                                    <Crown size={18} fill="currentColor" /> GABUNG PASUKAN KHUSUS
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-indigo-400/60 mt-3 font-mono">
                                *Garansi bimbingan maksimal sampai hari H tes.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            
            <div className="text-center mt-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 relative z-10">
                <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest">
                    "Keringat yang menetes di medan latihan akan menebus darah di medan pertempuran."
                </p>
                <div className="h-px w-20 bg-neutral-800 mx-auto mt-4"></div>
            </div>

        </div>
    </div>
  );
}