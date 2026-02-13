'use client';

import { useState } from "react";
import { 
  Dumbbell, Timer, Footprints, 
  Save, Activity, Zap, AlertTriangle, Target, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner"; 
import { useRouter } from "next/navigation";
import { submitPhysicalLog } from "@/app/actions/submitPhysical"; 
// Import Logic Samapta
import { 
  getScoreLari, 
  getScorePullUp, 
  getScorePushUp, 
  getScoreSitUp, 
  getScoreShuttleRun, 
  calculateFinalSamapta 
} from "@/lib/samapta-logic";

export default function PhysicalInputClient() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- STATE UNTUK LIVE TRACKER ---
  const [vals, setVals] = useState({
    lari: 0,
    pullup: 0,
    pushup: 0,
    situp: 0,
    shuttle: 0.0
  });

  // --- KALKULASI SKOR REAL-TIME ---
  const liveScores = {
    lari: getScoreLari(vals.lari),
    pull: getScorePullUp(vals.pullup),
    push: getScorePushUp(vals.pushup),
    sit: getScoreSitUp(vals.situp),
    shuttle: getScoreShuttleRun(vals.shuttle)
  };

  const analysis = calculateFinalSamapta(liveScores);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const data = {
        runDistance: vals.lari,
        pullUp: vals.pullup,
        pushUp: vals.pushup,
        sitUp: vals.situp,
        shuttleRun: vals.shuttle
    };

    const result = await submitPhysicalLog(data);

    if (result.success) {
      toast.success("DATA JASMANI BERHASIL DIARSIPKAN", {
        description: result.message,
        className: "bg-zinc-950 border-emerald-500 text-white font-black",
      });
      router.refresh(); 
      router.push("/dashboard"); 
    } else {
      toast.error("ERROR SISTEM", {
        description: result.message,
        className: "bg-red-950 border-red-500 text-white font-bold",
      });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* FORM INPUT (KOLOM KIRI) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-8 bg-zinc-950 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="bg-gradient-to-r from-emerald-600/20 to-transparent p-6 border-b border-white/5">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
            <Zap size={16} className="text-emerald-500 fill-emerald-500" /> Input Data Samapta Baru
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PUSH UP */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-emerald-500 transition-colors">
                <Dumbbell size={12} /> Push-Up (1 Menit)
              </label>
              <div className="relative">
                <input 
                  name="pushup" type="number" required placeholder="0"
                  onChange={(e) => setVals({...vals, pushup: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-2xl font-black text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-700 uppercase">Reps</span>
              </div>
            </div>

            {/* SIT UP */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-emerald-500 transition-colors">
                <Activity size={12} /> Sit-Up (1 Menit)
              </label>
              <div className="relative">
                <input 
                  name="situp" type="number" required placeholder="0"
                  onChange={(e) => setVals({...vals, situp: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-2xl font-black text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-700 uppercase">Reps</span>
              </div>
            </div>

            {/* PULL UP */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-emerald-500 transition-colors">
                <Zap size={12} /> Pull-Up
              </label>
              <div className="relative">
                <input 
                  name="pullup" type="number" required placeholder="0"
                  onChange={(e) => setVals({...vals, pullup: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-2xl font-black text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-700 uppercase">Reps</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* JARAK LARI */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-emerald-500 transition-colors">
                <Footprints size={12} /> Jarak Lari (12 Menit)
              </label>
              <div className="relative">
                <input 
                  name="lari" type="number" required placeholder="0"
                  onChange={(e) => setVals({...vals, lari: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-4xl font-black text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800 italic"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-700 uppercase">Meter</span>
              </div>
            </div>

            {/* SHUTTLE RUN */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 group-focus-within:text-emerald-500 transition-colors">
                <Timer size={12} /> Shuttle Run
              </label>
              <div className="relative">
                <input 
                  name="shuttle" type="number" step="0.1" required placeholder="0.0"
                  onChange={(e) => setVals({...vals, shuttle: parseFloat(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-4xl font-black text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800 italic"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-700 uppercase">Detik</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full relative overflow-hidden group py-6 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm transition-all hover:bg-emerald-600 hover:text-white disabled:opacity-50"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Mengunggah Laporan...
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
                  Kirim Laporan Samapta <Save size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </form>
      </motion.div>

      {/* LIVE PERFORMANCE DESK (KOLOM KANAN) */}
      <div className="lg:col-span-4 space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900 border border-white/10 p-6 rounded-[32px] sticky top-8"
        >
          <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 tracking-[0.2em] flex items-center gap-2">
            <Target size={14} className="text-emerald-500" /> Live Performance Desk
          </h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
              <span className="text-xs text-zinc-500 font-bold uppercase">Skor Samapta A</span>
              <span className="font-mono font-black text-emerald-500">{liveScores.lari}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
              <span className="text-xs text-zinc-500 font-bold uppercase">Rata-rata Samapta B</span>
              <span className="font-mono font-black text-blue-500">
                {((liveScores.pull + liveScores.push + liveScores.sit + liveScores.shuttle) / 4).toFixed(1)}
              </span>
            </div>
          </div>

          <div className="text-center p-8 bg-black rounded-[24px] border border-white/5 shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-widest">Estimasi Skor Akhir</p>
            <p className="text-7xl font-black text-white tracking-tighter">{analysis.finalScore}</p>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-white/10 mt-4 ${analysis.color}`}>
              {analysis.status.includes("MS") ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              <span className="text-[10px] font-black uppercase tracking-tighter">{analysis.status}</span>
            </div>
          </div>
          
          {/* WARNING BLOCK */}
          {Object.values(liveScores).some(s => s === 0) && vals.lari > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-start"
            >
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <p className="text-[10px] text-red-200 leading-relaxed font-bold uppercase tracking-tight">
                Gagal Ambang Batas: Terdapat item latihan dengan nilai 0. Status otomatis menjadi Tidak Memenuhi Syarat (TMS).
              </p>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[9px] text-zinc-600 font-mono leading-relaxed italic text-center">
              "Kekuatan fisik adalah aset tempur utama. Gunakan kalkulator ini untuk mengukur kesiapan operasional Anda."
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}