"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, Loader2, ArrowRight, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("AKSES DITOLAK", { 
            description: "Kredensial tidak valid. Periksa email dan sandi.",
            className: "bg-red-950 border-red-600 text-white font-bold border-l-4",
            icon: <AlertOctagon className="text-red-500" />
        });
        setIsLoading(false);
      } else {
        toast.success("OTENTIKASI BERHASIL", { 
            description: "Selamat datang kembali, Kadet.",
            className: "bg-zinc-950 border-green-600 text-white font-bold border-l-4",
            icon: <Shield className="text-green-500" />
        });
        
        // Delay sedikit agar animasi toast terlihat sebelum pindah
        setTimeout(() => {
             router.push("/dashboard");
             router.refresh();
        }, 500);
      }
    } catch (error) {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* BACKGROUND EFFECTS (SPEKTAKULER) */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 animate-pulse"></div>
      
      {/* Radar Scan Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/10 rounded-full opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-red-500/10 rounded-full opacity-20"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-900/60 border border-white/10 backdrop-blur-xl p-8 rounded-[32px] relative z-10 shadow-2xl shadow-black/50 overflow-hidden group"
      >
        {/* Top Border Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* HEADER */}
        <div className="text-center mb-10 relative">
            <div className="w-20 h-20 bg-gradient-to-br from-zinc-800 to-black rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-lg relative group-hover:border-red-500/30 transition-colors duration-500">
                <div className="absolute inset-0 bg-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Shield size={36} className="text-white relative z-10 drop-shadow-md"/>
            </div>
            
            <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-2 glitch-effect">
                IDENTIFIKASI
            </h1>
            <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">
                    Secure Channel v4.0 Active
                </p>
            </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {/* EMAIL INPUT */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1 flex justify-between">
                    <span>Email Satuan</span>
                    <span className="text-gray-600">ID-User</span>
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" size={18}/>
                    </div>
                    <input 
                        type="email" 
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none font-medium placeholder:text-gray-700 font-mono text-sm"
                        placeholder="kadet@praja.id"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1 flex justify-between">
                    <span>Kode Sandi</span>
                    <span className="text-gray-600">Encrypted</span>
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-gray-500 group-focus-within:text-red-500 transition-colors duration-300" size={18}/>
                    </div>
                    <input 
                        type="password" 
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all outline-none font-medium placeholder:text-gray-700 font-mono text-sm"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                    />
                </div>
            </div>

            {/* SUBMIT BUTTON */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-200 text-black font-black uppercase tracking-[0.2em] py-5 rounded-xl transition-all mt-6 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] relative overflow-hidden group/btn"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin text-black" size={20}/>
                ) : (
                    <>
                        MASUK MARKAS 
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform"/>
                    </>
                )}
            </motion.button>
        </form>

        {/* FOOTER */}
        <div className="mt-10 text-center pt-6 border-t border-white/5">
            <p className="text-gray-500 text-xs mb-2">Belum terdaftar dalam sistem?</p>
            <Link href="/register" className="inline-block text-xs font-bold text-white uppercase tracking-widest hover:text-red-500 transition-colors border-b border-transparent hover:border-red-500 pb-0.5">
                Lapor Diri (Registrasi)
            </Link>
        </div>

      </motion.div>
    </div>
  );
}