"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, User, Mail, ChevronRight, Loader2, CheckCircle2, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("PENDAFTARAN BERHASIL", { 
            description: "Akun Kadet telah dibuat. Silakan login.",
            className: "bg-zinc-950 border-green-600 text-white font-bold border-l-4",
            icon: <CheckCircle2 className="text-green-500" />
        });
        
        // Delay sedikit
        setTimeout(() => {
            router.push("/login?registered=true");
        }, 1000);
      } else {
        const data = await res.json();
        throw new Error(data.message || "Gagal mendaftar");
      }
    } catch (error: any) {
        toast.error("GAGAL DAFTAR", { 
            description: error.message || "Email mungkin sudah digunakan.",
            className: "bg-red-950 border-red-600 text-white font-bold border-l-4",
            icon: <AlertOctagon className="text-red-500" />
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* BACKGROUND EFFECTS (SAMA DENGAN LOGIN) */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 animate-pulse"></div>
      
      {/* Radar Scan Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/10 rounded-full opacity-20"></div>
      
      {/* Ambient Glow - Posisi dibalik dari Login agar variatif */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-32 -mb-32 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -ml-32 -mt-32 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-900/60 border border-white/10 backdrop-blur-xl p-8 rounded-[32px] relative z-10 shadow-2xl shadow-black/50 overflow-hidden group"
      >
        {/* Top Border Gradient (Blue Theme for Register) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Header */}
        <div className="text-center mb-10 relative">
          <div className="w-20 h-20 bg-gradient-to-br from-zinc-800 to-black rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-lg relative group-hover:border-blue-500/30 transition-colors duration-500">
             <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <User size={36} className="text-white relative z-10 drop-shadow-md" />
          </div>
          
          <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-2 glitch-effect">
            ENLISTMENT
          </h1>
          <div className="flex items-center justify-center gap-2">
             <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></span>
             <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">
                Formulir Perekrutan Kadet
             </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-6 relative z-10">
          
          {/* NAMA INPUT */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Sandi (Full Name)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Shield className="text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" size={18} />
              </div>
              <input 
                type="text" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none font-medium placeholder:text-gray-700 font-mono text-sm"
                placeholder="Kadet Anas"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* EMAIL INPUT */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Saluran Komunikasi (Email)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Mail className="text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" size={18} />
              </div>
              <input 
                type="email" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none font-medium placeholder:text-gray-700 font-mono text-sm"
                placeholder="siap@praja.id"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* PASSWORD INPUT */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kunci Keamanan (Password)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Lock className="text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" size={18} />
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none font-medium placeholder:text-gray-700 font-mono text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             type="submit" 
             disabled={loading}
             className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] py-5 rounded-xl transition-all mt-6 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] relative overflow-hidden group/btn"
          >
            {loading ? (
                <Loader2 className="animate-spin text-white" size={20}/>
            ) : (
                <>
                    GABUNG KORPS 
                    <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform"/>
                </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center border-t border-white/5 pt-6">
          <p className="text-xs text-gray-500 mb-2">Sudah memiliki akses?</p>
          <Link href="/login" className="inline-block text-xs font-bold text-white uppercase tracking-widest hover:text-blue-500 transition-colors border-b border-transparent hover:border-blue-500 pb-0.5">
            Lapor Masuk (Login)
          </Link>
        </div>

      </motion.div>
    </div>
  );
}