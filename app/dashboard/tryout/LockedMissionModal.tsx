"use client";

import { useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function LockedMissionModal({ missionName }: { missionName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* TOMBOL PADA KARTU (Saat diklik akan memicu Pop-up) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="chamfer-btn w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white border border-zinc-800 text-xs font-black uppercase tracking-[0.2em] transition flex items-center justify-center gap-2"
      >
        <Lock size={14} /> AKSES PREMIUM
      </button>

      {/* MODAL POP-UP (Hanya muncul jika tombol di atas diklik) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            
            {/* Background penutup (Klik untuk tutup) */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#080808] border border-red-900/50 rounded-xl p-8 max-w-md w-full relative z-10 shadow-[0_0_50px_rgba(220,38,38,0.15)] text-center chamfer-card"
            >
              <div className="w-16 h-16 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-900/50 relative">
                  <ShieldAlert className="text-red-500 w-8 h-8" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                AREA RESTRIKSI
              </h3>
              
              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                Misi <span className="text-white font-bold">"{missionName}"</span> mengandung algoritma soal tingkat tinggi yang dikhususkan untuk <strong>Pasukan Khusus (Premium)</strong>. 
                <br/><br/>
                Buka seluruh gembok markas, raih analisa nilai taktis, dan hancurkan batas mustahil.
              </p>

              <div className="flex flex-col gap-3">
                <Link href="/dashboard/subscription" className="w-full">
                    <button className="chamfer-btn w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-black text-sm font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                        UPGRADE SEKARANG
                    </button>
                </Link>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="py-3 text-xs text-zinc-500 hover:text-white uppercase font-bold tracking-widest transition-colors"
                >
                  BATALKAN PERINTAH
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}