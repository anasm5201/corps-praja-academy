import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Box } from "lucide-react";
import InputForm from "./InputForm"; // Kita import form dari file terpisah

export default async function AddMaterialPage() {
  const session = await getServerSession(authOptions);
  
  // Security Checkpoint
  if (!session) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto pb-20">
        
        {/* HEADER WAR ROOM */}
        <div className="mb-8 border-b border-white/10 pb-6 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                    <Box className="text-yellow-500" size={32}/> INPUT LOGISTIK BARU
                </h1>
                <p className="text-gray-500 text-sm font-mono mt-2">
                    Deploy Paket Soal atau Materi Belajar ke Etalase Toko.
                </p>
            </div>
            <div className="hidden md:block bg-yellow-900/20 text-yellow-500 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-yellow-500/30">
                DATABASE: WRITE MODE
            </div>
        </div>

        {/* FORM AREA */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            {/* Memanggil Client Component Form */}
            <InputForm />
        </div>

    </div>
  );
}