"use client";

import { useState } from "react";
import { createPackage } from "@/app/actions/logisticsActions"; // Pastikan Server Action ini sudah dibuat
import { Save, Loader2, X, DollarSign, Clock, FileText, Tag } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function InputForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        
        // Panggil Server Action
        const res = await createPackage(formData);

        setIsLoading(false);

        if (res.success) {
            toast.success("LOGISTIK DITERIMA", { description: "Paket berhasil ditambahkan ke database." });
            // Reset form
            (e.target as HTMLFormElement).reset();
            router.refresh();
        } else {
            toast.error("GAGAL MENYIMPAN", { description: res.error });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: IDENTITAS PAKET */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Identitas Produk</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nama Paket / Materi</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                            <input 
                                name="title" 
                                required 
                                type="text" 
                                placeholder="Contoh: Paket VIP Platinum 2025"
                                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 outline-none transition placeholder:text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Kategori</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                            <select 
                                name="category" 
                                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 outline-none transition appearance-none cursor-pointer"
                            >
                                <option value="SKD">SKD (Seleksi Kompetensi Dasar)</option>
                                <option value="PSIKOLOGI">PSIKOLOGI / KECERMATAN</option>
                                <option value="MATERI">E-BOOK / VIDEO STRATEGI</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: PARAMETER LOGISTIK */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Parameter Jual & Teknis</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Harga (Rupiah)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold text-lg">Rp</span>
                            <input 
                                name="price" 
                                required 
                                type="number" 
                                placeholder="150000"
                                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-green-500 outline-none transition placeholder:text-gray-700 font-mono"
                            />
                        </div>
                        <p className="text-[10px] text-gray-600 italic">*Isi 0 untuk membuat paket GRATIS.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Durasi Ujian (Menit)</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18}/>
                            <input 
                                name="duration" 
                                type="number" 
                                defaultValue={100}
                                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition placeholder:text-gray-700 font-mono"
                            />
                        </div>
                        <p className="text-[10px] text-gray-600 italic">*Hanya berlaku untuk paket Tryout.</p>
                    </div>
                </div>
            </div>

            {/* SECTION 3: DESKRIPSI */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Deskripsi Detail</label>
                <textarea 
                    name="description" 
                    rows={5}
                    placeholder="Jelaskan fitur paket ini (Soal HOTS, Pembahasan Lengkap, Akses Selamanya, dll)..."
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-yellow-500 outline-none transition custom-scrollbar resize-none placeholder:text-gray-700 leading-relaxed"
                ></textarea>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-4">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-widest transition">
                    BATAL
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-yellow-900/20 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-wait transform hover:-translate-y-1"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
                    DEPLOY LOGISTIK
                </button>
            </div>

        </form>
    );
}