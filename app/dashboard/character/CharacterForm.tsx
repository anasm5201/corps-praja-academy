'use client';

import { useState } from "react";
import { 
  Sun, Moon, BookOpen, UserCheck, Sparkles, 
  CheckCircle2, Save 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { submitDailyLog } from "@/app/actions/character";

export default function CharacterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitDailyLog(formData);

    if (result.success) {
      toast.success("LAPORAN HARIAN DITERIMA", {
        description: `Skor Disiplin: ${result.score}/100. Radar SUH diperbarui.`,
        className: "bg-yellow-950 border-yellow-500 text-white font-black",
      });
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      toast.error("GAGAL LAPOR", { description: result.error });
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-950 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] pointer-events-none"></div>

      <div className="p-8 border-b border-white/5 bg-gradient-to-r from-yellow-900/10 to-transparent">
        <h3 className="text-sm font-black text-yellow-500 uppercase tracking-[0.3em] flex items-center gap-2">
           <Sparkles size={16} /> Checklist Disiplin Harian
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* CHECKLIST GRID */}
        <div className="space-y-4">
            {[
                { id: "morningCall", label: "Apel Pagi / Bangun Tepat Waktu", icon: <Sun size={18}/> },
                { id: "worship", label: "Ibadah Wajib & Sunnah", icon: <Sparkles size={18}/> },
                { id: "cleanliness", label: "Kebersihan Diri & Barak", icon: <UserCheck size={18}/> },
                { id: "study", label: "Belajar Mandiri (Min. 1 Jam)", icon: <BookOpen size={18}/> },
                { id: "nightCall", label: "Apel Malam / Tidur Tepat Waktu", icon: <Moon size={18}/> },
            ].map((item) => (
                <label key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-zinc-900/50 cursor-pointer hover:border-yellow-500/50 hover:bg-yellow-900/10 transition-all group">
                    <div className="relative">
                        <input type="checkbox" name={item.id} className="peer sr-only" />
                        <div className="w-6 h-6 rounded-lg border-2 border-zinc-700 peer-checked:bg-yellow-500 peer-checked:border-yellow-500 transition-all flex items-center justify-center">
                            <CheckCircle2 size={14} className="text-black opacity-0 peer-checked:opacity-100" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 group-hover:text-white transition-colors">
                        <div className="text-yellow-600">{item.icon}</div>
                        <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                    </div>
                </label>
            ))}
        </div>

        {/* CATATAN TAMBAHAN */}
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Catatan / Refleksi (Opsional)</label>
            <textarea 
                name="notes" 
                rows={2}
                placeholder="Tulis kendala atau pencapaian hari ini..."
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-700"
            />
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full py-5 rounded-2xl bg-yellow-600 hover:bg-yellow-500 text-black font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
           {loading ? "Menyimpan..." : <><Save size={18} /> Lapor Komando</>}
        </button>

      </form>
    </motion.div>
  );
}