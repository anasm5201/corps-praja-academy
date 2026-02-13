'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, CheckCircle, Zap } from 'lucide-react';

// --- TIPE DATA ---
type RewardData = {
  xp: number;
  title: string;
};

interface RewardContextType {
  triggerReward: (data: RewardData) => void;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

// --- KOMPONEN OVERLAY VISUAL (ANIMASI UTAMA DISINI) ---
const RewardOverlay = ({ data, onClose }: { data: RewardData | null, onClose: () => void }) => {
    if (!data) return null;

    // Variabel untuk animasi angka (Count-up)
    const [displayXP, setDisplayXP] = useState(0);

    React.useEffect(() => {
        let start = 0;
        const end = data.xp;
        const duration = 1000; // 1 detik
        const stepTime = Math.abs(Math.floor(duration / end));
        
        const timer = setInterval(() => {
            start += 5; // Kenaikan per step
            if (start > end) start = end;
            setDisplayXP(start);
            if (start === end) clearInterval(timer);
        }, stepTime);

        // Auto close setelah 3 detik
        const closeTimer = setTimeout(onClose, 3000);
        return () => {
            clearInterval(timer);
            clearTimeout(closeTimer);
        };
    }, [data, onClose]);

  return (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[url('/stripes.png')] opacity-10 pointer-events-none"></div>

        <motion.div 
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, transition: { type: "spring", damping: 15 } }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-neutral-900 border-2 border-yellow-500/50 p-8 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)] text-center max-w-sm w-full mx-4 overflow-hidden"
        >
            {/* Partikel Ledakan Cahaya */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full animate-pulse"></div>

            <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1, transition: { delay: 0.2, type: "spring" } }}
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10 border-4 border-yellow-300/50"
            >
                <CheckCircle size={40}className="text-white drop-shadow-md" strokeWidth={3} />
            </motion.div>
            
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                className="text-2xl font-black text-white uppercase tracking-widest mb-1 relative z-10"
            >
                LAPORAN DITERIMA!
            </motion.h2>
            <motion.p
                 initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }}
                className="text-xs text-yellow-500 font-mono mb-6 relative z-10 uppercase"
            >
                {data.title}
            </motion.p>

            {/* ANIMASI XP COUNT-UP */}
            <motion.div 
                 initial={{ scale: 0.8 }} animate={{ scale: 1.1 }} transition={{ delay: 0.5, type: "spring", repeat: 2, repeatType: "reverse" }}
                className="flex items-center justify-center gap-2 text-4xl font-black text-white relative z-10 bg-black/30 py-2 rounded-lg border border-yellow-500/20"
            >
                 <Zap size={32} className="text-yellow-400 fill-yellow-400" />
                 <span>+{displayXP} XP</span>
            </motion.div>
        </motion.div>
    </motion.div>
  );
};

// --- PROVIDER UTAMA ---
export const RewardProvider = ({ children }: { children: ReactNode }) => {
  const [rewardData, setRewardData] = useState<RewardData | null>(null);

  const triggerReward = (data: RewardData) => {
    setRewardData(data);
  };

  const closeReward = () => {
    setRewardData(null);
  };

  return (
    <RewardContext.Provider value={{ triggerReward }}>
      {children}
      <AnimatePresence>
         {rewardData && <RewardOverlay data={rewardData} onClose={closeReward} />}
      </AnimatePresence>
    </RewardContext.Provider>
  );
};

export const useReward = () => {
  const context = useContext(RewardContext);
  if (!context) {
    throw new Error('useReward must be used within a RewardProvider');
  }
  return context;
};