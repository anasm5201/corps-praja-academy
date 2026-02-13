"use client";

import { useState, useRef } from "react";
import { createQuestion } from "@/app/actions/questionInputActions"; // Pastikan Server Action ini sudah dibuat
import { Save, Loader2, ListChecks, Type } from "lucide-react";
import { toast } from "sonner";

export default function QuestionInput({ packageId, category }: { packageId: string, category: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Deteksi Mode TKP (Skor 1-5) vs Standar (Skor 5/0)
    const isTKP = category === "TKP" || category === "PSIKOLOGI";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        
        // Inject Hidden Data
        formData.append("packageId", packageId);
        formData.append("type", "MULTIPLE_CHOICE");

        // Panggil Server Action
        const res = await createQuestion(formData);
        setIsLoading(false);

        if (res.success) {
            toast.success("SOAL TERSIMPAN", { description: "Data berhasil masuk ke gudang amunisi." });
            
            // Reset Form & Scroll ke Atas agar admin bisa input soal berikutnya dgn cepat
            formRef.current?.reset(); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        } else {
            toast.error("GAGAL MENYIMPAN", { description: res.error });
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 relative z-10">
            
            {/* 1. PERTANYAAN UTAMA */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Type size={14}/> Naskah Soal
                    </label>
                    <span className="text-[10px] text-gray-600 font-mono bg-black px-2 py-1 rounded">HTML SUPPORTED</span>
                </div>
                <textarea 
                    name="questionText" 
                    required 
                    rows={6} 
                    className="w-full bg-black border border-white/10 rounded-xl p-5 text-white focus:border-red-500 outline-none transition custom-scrollbar text-sm leading-relaxed placeholder:text-gray-700 shadow-inner"
                    placeholder="Tulis pertanyaan lengkap di sini..."
                ></textarea>
            </div>

            {/* 2. OPSI JAWABAN & SKOR */}
            <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ListChecks size={14}/> Opsi Jawaban & Poin
                    </h3>
                    {isTKP ? (
                        <span className="text-[10px] text-yellow-500 font-bold bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-500/20">
                            MODE TKP (SKOR 1-5)
                        </span>
                    ) : (
                        <span className="text-[10px] text-blue-500 font-bold bg-blue-900/20 px-3 py-1 rounded-full border border-blue-500/20">
                            MODE STANDAR (BENAR=5)
                        </span>
                    )}
                </div>

                <div className="grid gap-3">
                    {["A", "B", "C", "D", "E"].map((opt) => (
                        <div key={opt} className="flex gap-3 items-stretch group">
                            {/* Label A-E */}
                            <div className="w-12 bg-zinc-900 border border-white/5 rounded-lg flex items-center justify-center font-black text-gray-600 group-focus-within:bg-white group-focus-within:text-black transition">
                                {opt}
                            </div>
                            
                            {/* Input Teks Jawaban */}
                            <input 
                                name={`opt_${opt}`}
                                required
                                type="text"
                                placeholder={`Teks Jawaban ${opt}...`}
                                className="flex-1 bg-zinc-900/50 border border-white/10 rounded-lg px-4 text-white focus:border-white focus:bg-black outline-none transition text-sm py-3"
                            />

                            {/* Input Skor */}
                            <div className="w-24 relative">
                                <input 
                                    name={`score_${opt}`}
                                    required
                                    type="number"
                                    min="0"
                                    max="5"
                                    defaultValue={0}
                                    className="w-full h-full bg-zinc-900 border border-white/10 rounded-lg px-2 text-center text-yellow-500 font-black focus:border-yellow-500 outline-none transition text-lg"
                                />
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 bg-[#121212] px-1 uppercase font-bold tracking-widest">
                                    POIN
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                <p className="text-[10px] text-gray-600 italic max-w-xs">
                    *Pastikan kunci jawaban memiliki poin 5 (Kecuali TKP yang berjenjang).
                </p>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-10 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-900/20 flex items-center gap-3 transition disabled:opacity-50 disabled:cursor-wait hover:scale-105"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                    SIMPAN & LANJUT
                </button>
            </div>

        </form>
    );
}