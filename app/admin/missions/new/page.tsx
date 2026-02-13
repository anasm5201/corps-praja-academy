"use client";

import { useState } from "react";
import { createMission } from "@/app/actions/createMission";
import { 
  Target, Save, AlertTriangle, FileJson, 
  ArrowLeft, BrainCircuit, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewMissionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Template JSON untuk memudahkan Admin copy-paste
  const jsonTemplate = `[
  {
    "text": "Siapakah presiden pertama Indonesia?",
    "options": ["Soeharto", "Soekarno", "Habibie", "Jokowi", "Megawati"],
    "correctOption": 1,
    "explanation": "Ir. Soekarno adalah proklamator dan presiden pertama RI."
  },
  {
    "text": "Lanjutan deret: 2, 4, 6, 8, ...?",
    "options": ["10", "12", "14", "16", "9"],
    "correctOption": 0,
    "explanation": "Pola penambahan +2."
  }
]`;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createMission(formData);
    setLoading(false);

    if (result?.error) {
      toast.error("GAGAL DEPLOY", { description: result.error });
    } else {
      toast.success("MISI AKTIF", { description: "Data berhasil disimpan ke database." });
      router.push("/admin"); // Kembali ke markas
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* HEADER */}
      <div className="border-b border-white/10 bg-zinc-900/50 p-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                <ArrowLeft size={20} />
            </Link>
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Target className="text-red-600" /> Deploy Misi Baru
                </h1>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                    Logistik Operasi / Create New Mission
                </p>
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* KOLOM KIRI: KONFIGURASI MISI */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Parameter Misi</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Operasi (Judul)</label>
                            <input name="title" type="text" placeholder="Contoh: Simulasi SKD 01" required className="w-full bg-black border border-white/20 rounded-lg p-3 text-sm focus:border-red-500 outline-none mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Kategori</label>
                                <select name="category" className="w-full bg-black border border-white/20 rounded-lg p-3 text-sm focus:border-red-500 outline-none mt-1">
                                    <option value="TWK">TWK (Nasionalisme)</option>
                                    <option value="TIU">TIU (Intelegensia)</option>
                                    <option value="TKP">TKP (Kepribadian)</option>
                                    <option value="SKD">SKD FULL (CAT)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Tingkat Kesulitan</label>
                                <select name="difficulty" className="w-full bg-black border border-white/20 rounded-lg p-3 text-sm focus:border-red-500 outline-none mt-1">
                                    <option value="EASY">Rookie (Easy)</option>
                                    <option value="MEDIUM">Standard (Medium)</option>
                                    <option value="HARD">Elite (Hard)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Durasi (Menit)</label>
                                <input name="duration" type="number" defaultValue={100} className="w-full bg-black border border-white/20 rounded-lg p-3 text-sm focus:border-red-500 outline-none mt-1" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase">XP Reward</label>
                                <input name="xpReward" type="number" defaultValue={500} className="w-full bg-black border border-white/20 rounded-lg p-3 text-sm focus:border-red-500 outline-none mt-1" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl flex gap-3">
                    <AlertTriangle className="text-red-500 shrink-0" size={20} />
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                        <span className="text-red-400 font-bold uppercase">Perhatian:</span> Pastikan format JSON soal valid. Kesalahan satu koma dapat menyebabkan kegagalan deploy.
                    </p>
                </div>
            </div>

            {/* KOLOM KANAN: JSON SOAL DROP ZONE */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileJson size={16} /> Payload Soal (JSON)
                        </h3>
                        <div className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-gray-400 font-mono">
                            Format: Array of Objects
                        </div>
                    </div>

                    <textarea 
                        name="questionsJson"
                        defaultValue={jsonTemplate}
                        className="flex-1 w-full bg-black border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400 focus:border-green-500 outline-none min-h-[400px] leading-relaxed"
                        spellCheck={false}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-white text-black hover:bg-red-600 hover:text-white rounded-xl font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Menghubungi Server..." : <><Save size={18} /> Deploy Misi Sekarang</>}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}