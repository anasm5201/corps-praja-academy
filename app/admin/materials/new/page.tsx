"use client";

import { useState } from "react";
import { createMaterial } from "@/app/actions/createMaterial";
import { 
  FileText, Save, Youtube, BookOpen, 
  ArrowLeft, Lock
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewMaterialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Default langsung ke PDF/Narasi karena Video sedang maintenance
  const [type, setType] = useState("PDF"); 

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createMaterial(formData);
    setLoading(false);

    if (result?.error) {
      toast.error("GAGAL UPLOAD", { description: result.error });
    } else {
      toast.success("INTEL DITERIMA", { description: "Materi Narasi berhasil didistribusikan." });
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* HEADER */}
      <div className="border-b border-white/10 bg-zinc-900/50 p-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                <ArrowLeft size={20} />
            </Link>
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <FileText className="text-yellow-500" /> Upload Intelijen
                </h1>
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                    Logistik Pendidikan / Add Narrative Material
                </p>
            </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8">
        <form action={handleSubmit} className="space-y-8">
            
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl space-y-6">
                
                {/* Judul & Kategori */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Judul Materi</label>
                        <input name="title" type="text" placeholder="Contoh: Rangkuman Pasal UUD 1945" required 
                            className="w-full bg-black border border-white/20 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none mt-2" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Kategori</label>
                        <select name="category" className="w-full bg-black border border-white/20 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none mt-2">
                            <option value="TWK">TWK (Wawasan Kebangsaan)</option>
                            <option value="TIU">TIU (Intelegensia Umum)</option>
                            <option value="TKP">TKP (Karakteristik Pribadi)</option>
                        </select>
                    </div>
                </div>

                {/* Tipe Konten Switcher */}
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Format Data</label>
                    <div className="grid grid-cols-2 gap-4">
                        
                        {/* VIDEO OPTION (DISABLED / COMING SOON) */}
                        <div className="relative border border-zinc-800 bg-zinc-950/30 rounded-xl p-4 flex items-center justify-center gap-2 text-zinc-600 cursor-not-allowed">
                            <Youtube size={20} /> Video Intel
                            <span className="absolute top-2 right-2 text-[8px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-bold border border-zinc-700">COMING SOON</span>
                        </div>

                        {/* NARRATIVE OPTION (ACTIVE DEFAULT) */}
                        <label className={`cursor-pointer border rounded-xl p-4 flex items-center justify-center gap-2 transition-all ${type === 'PDF' ? 'bg-blue-900/20 border-blue-500 text-blue-500' : 'bg-black border-white/10 text-gray-500'}`}>
                            <input type="radio" name="type" value="PDF" className="hidden" checked={type === 'PDF'} onChange={() => setType('PDF')} />
                            <BookOpen size={20} /> Materi Narasi / PDF
                        </label>
                    </div>
                </div>

                {/* URL Link */}
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Link Dokumen (G-Drive / PDF)</label>
                    <input name="contentUrl" type="url" placeholder="https://drive.google.com/file/d/..." required 
                        className="w-full bg-black border border-white/20 rounded-xl p-4 text-sm font-mono text-blue-400 focus:border-yellow-500 outline-none mt-2" />
                    <p className="text-[10px] text-gray-600 mt-2">
                        Pastikan akses dokumen diatur ke "Anyone with the link" (Publik).
                    </p>
                </div>

                {/* Deskripsi & Detail */}
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Ringkasan Materi (Intro)</label>
                    <textarea name="description" rows={6} placeholder="Tuliskan poin-poin kunci yang akan dipelajari kadet dalam dokumen ini..." required 
                        className="w-full bg-black border border-white/20 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none mt-2 leading-relaxed" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Estimasi Baca</label>
                        <input name="duration" type="text" placeholder="Contoh: 15 Menit / 10 Hal" required 
                            className="w-full bg-black border border-white/20 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none mt-2" />
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="isPremium" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                            <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-800 cursor-pointer"></label>
                        </div>
                        <label htmlFor="toggle" className="text-xs font-bold text-gray-400 uppercase cursor-pointer flex items-center gap-2">
                            <Lock size={14} /> Dokumen Rahasia (Premium)
                        </label>
                    </div>
                </div>

            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-yellow-600/20 disabled:opacity-50"
            >
                {loading ? "Mengirim Data..." : <><Save size={18} /> Deploy Materi Narasi</>}
            </button>

        </form>
      </div>

      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #ca8a04;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #ca8a04;
        }
      `}</style>
    </div>
  );
}