"use client";

import { useState } from "react";
import { Save, Loader2, Calendar } from "lucide-react";
import { updateTargetProfile } from "@/app/actions/userProfile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
    defaultName: string;
    defaultTarget: string;
    defaultDate: string;
}

export default function ProfileForm({ defaultName, defaultTarget, defaultDate }: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        
        const result = await updateTargetProfile(formData);

        if (result.success) {
            toast.success("DATA TERKUNCI", {
                description: "Target operasi dan jadwal tempur telah diperbarui.",
                className: "bg-zinc-950 border-green-500 text-white font-bold"
            });
            router.refresh();
        } else {
            toast.error("GAGAL UPDATE", { description: result.error });
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAMA LENGKAP */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Personel</label>
                <input 
                    name="name" 
                    defaultValue={defaultName}
                    type="text" 
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 transition-all outline-none font-bold"
                />
            </div>

            {/* TARGET INSTANSI */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Sasaran</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["POLRI", "KEDINASAN", "CPNS"].map((opt) => (
                        <label key={opt} className="cursor-pointer relative">
                            <input 
                                type="radio" 
                                name="targetInstance" 
                                value={opt} 
                                defaultChecked={defaultTarget === opt}
                                className="peer sr-only" 
                            />
                            <div className="w-full p-4 rounded-xl border border-white/10 bg-black peer-checked:bg-blue-900/20 peer-checked:border-blue-500 peer-checked:text-blue-400 text-gray-500 font-bold text-center transition-all hover:bg-zinc-900">
                                {opt}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* TANGGAL TES */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                    <span>Estimasi Tanggal Tes</span>
                    <span className="text-red-500 flex items-center gap-1"><Calendar size={12}/> Countdown Engine Active</span>
                </label>
                <input 
                    name="examDate" 
                    defaultValue={defaultDate}
                    type="date" 
                    required
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-red-500 transition-all outline-none font-mono text-lg"
                />
                <p className="text-[10px] text-gray-600">
                    *Pilih tanggal perkiraan jika jadwal resmi belum rilis. Sistem akan menyesuaikan intensitas latihan berdasarkan tanggal ini.
                </p>
            </div>

            {/* TOMBOL SIMPAN */}
            <div className="pt-4 border-t border-white/5">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> SIMPAN PERUBAHAN</>}
                </button>
            </div>
        </form>
    );
}