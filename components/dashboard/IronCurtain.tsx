"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Lock, Crown, Timer, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function IronCurtain({ children, user }: any) ({ 
  user, 
  children 
}: { 
  user: any; 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // 1. ANALISA STATUS KADET
  const isPremium = ["SOLO_FIGHTER", "INTENSIVE_SQUAD"].includes(user?.subscriptionType);
  const joinDate = new Date(user?.createdAt).getTime();
  const now = new Date().getTime();
  const hoursSinceJoin = (now - joinDate) / (1000 * 60 * 60);
  const isTrialActive = hoursSinceJoin < 2; // Golden Ticket 2 Jam

  // 2. ZONA MERAH (Fitur Berbayar)
  // Daftar URL yang HARAM dimasuki user GRATISAN setelah masa trial habis
  const RESTRICTED_ZONES = [
    "/dashboard/materials",       // Plaza Menza (Kecuali yang free - logic detail ada di page-nya, tapi ini guard global)
    "/dashboard/physical/input",  // Input Samapta
    "/dashboard/tryout/result",   // Analisa mendalam
    // "/dashboard/tryout"        // Kita biarkan terbuka agar mereka melihat menu (tapi terkunci di dalamnya)
  ];

  // Cek apakah user sedang berada di zona merah
  const isInRestrictedZone = RESTRICTED_ZONES.some(zone => pathname?.startsWith(zone));

  // 3. LOGIKA "TIRAI BESI"
  // Jika TIDAK Premium DAN TIDAK Trial DAN Masuk Zona Merah -> BLOKIR
  const showIronCurtain = !isPremium && !isTrialActive && isInRestrictedZone;

  // 4. COUNTDOWN TIMER (Visual Pressure)
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (isPremium || !isTrialActive) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const endTime = joinDate + (2 * 60 * 60 * 1000);
      const diff = endTime - now;

      if (diff <= 0) {
        window.location.reload(); // Refresh paksa saat waktu habis
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}j ${m}m ${s}d`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPremium, isTrialActive, joinDate]);


  // TAMPILAN LOCK SCREEN (JIKA DIBLOKIR)
  if (showIronCurtain) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full bg-[#080808] border border-red-900/30 rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl"
        >
          {/* Efek Lampu Alarm */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse"></div>
          
          <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Lock size={40} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
            AKSES DITOLAK
          </h2>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed font-mono">
            Masa percobaan (Golden Ticket) Anda telah habis. <br/>
            Fasilitas ini sekarang dikhususkan untuk <span className="text-amber-500 font-bold">Pasukan Khusus</span>.
          </p>

          <Link 
            href="/dashboard/subscription" 
            className="block w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl text-black font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-orange-900/20"
          >
            Ambil Senjata (Upgrade)
          </Link>
          
          <button 
            onClick={() => router.back()}
            className="mt-4 text-xs text-zinc-600 hover:text-white transition-colors uppercase font-bold tracking-widest"
          >
            Kembali ke Markas
          </button>
        </motion.div>
      </div>
    );
  }

  // TAMPILAN NORMAL (DENGAN HEADER TRIAL JIKA AKTIF)
  return (
    <>
      {/* HEADER COUNTDOWN (Hanya muncul jika Trial Aktif & Belum Premium) */}
      {!isPremium && isTrialActive && (
        <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white text-[10px] md:text-xs font-bold py-2 px-4 text-center border-b border-blue-500/30 flex items-center justify-center gap-2 animate-in slide-in-from-top">
          <Timer size={12} className="animate-spin-slow" />
          <span>GOLDEN TICKET AKTIF! AKSES PENUH BERAKHIR DALAM: <span className="font-mono text-amber-400 text-sm mx-1">{timeLeft}</span></span>
          <Link href="/dashboard/subscription" className="ml-2 bg-white/10 px-2 py-0.5 rounded hover:bg-white hover:text-blue-900 transition-colors">
            UPGRADE SEKARANG
          </Link>
        </div>
      )}
      
      {children}
    </>
  );
}