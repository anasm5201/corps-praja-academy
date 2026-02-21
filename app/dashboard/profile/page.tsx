'use client'

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { User, Mail, Shield, Star, Save, LogOut, Trophy, Activity, Loader2 } from "lucide-react";
import { updateProfileInfo } from "@/app/actions/profile";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login");
    
    // Fetch data user via API route (Kita pakai fetch manual krn ini Client Component)
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user/profile-stats'); // Endpoint sementara, kita akan buat jika belum ada
        if (res.ok) {
            const data = await res.json();
            setUserData(data);
            setName(data.name || "");
            setGender(data.gender || "");
        }
      } catch (error) {
        console.error("Gagal menarik data.");
      }
      setIsLoading(false);
    };

    if (status === "authenticated") fetchUserData();
  }, [status]);

  const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      
      const formData = new FormData();
      formData.append("name", name);
      formData.append("gender", gender);

      const result = await updateProfileInfo(formData);
      alert(result.message);
      setIsSaving(false);
  };

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white"><Loader2 className="animate-spin text-blue-500" size={40}/></div>;
  if (!userData) return <div className="text-white text-center mt-20">Data tidak ditemukan.</div>;

  const userEmail = session?.user?.email;
  const level = Math.floor((userData.xp || 0) / 1000) + 1;

  return (
    <div className="min-h-screen bg-[#050505] pb-24 px-4 sm:px-6 pt-8 text-white font-sans selection:bg-blue-900">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 border-b border-white/10 pb-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <User className="text-blue-500" size={32} />
                Dossier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Personel</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-mono uppercase tracking-widest">
                Identitas & Rekam Jejak Operasi
            </p>
        </div>

        {/* PROFILE CARD (READ ONLY VISUAL) */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 mb-8 backdrop-blur-sm relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Shield size={200} />
             </div>

             <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-900 to-black border-4 border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                <span className="text-4xl font-black text-blue-500">
                    {name ? name.charAt(0).toUpperCase() : "K"}
                </span>
             </div>

             <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                    {name}
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm font-mono">
                    <Mail size={14} /> {userEmail}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                    <span className="px-3 py-1 rounded bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/50">
                        {userData.rank || "CADET"}
                    </span>
                    <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Star size={10} className="text-yellow-500" /> LVL {level}
                    </span>
                    {gender && (
                        <span className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-widest ${gender === 'PRIA' ? 'bg-cyan-950/40 text-cyan-400 border-cyan-800' : 'bg-pink-950/40 text-pink-400 border-pink-800'}`}>
                            {gender}
                        </span>
                    )}
                </div>
             </div>
        </div>

        {/* ========================================================== */}
        {/* PANEL PENGATURAN IDENTITAS (EDIT FORM) */}
        {/* ========================================================== */}
        <div className="bg-zinc-900/30 border border-white/10 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-3">Pembaruan Identitas Taktis</h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input Nama */}
                    <div>
                        <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2 ml-1">Nama Panggilan (Kadet)</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Contoh: Anas"
                        />
                    </div>

                    {/* Input Gender (SANGAT KRUSIAL) */}
                    <div>
                        <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2 ml-1">Klasifikasi Gender <span className="text-red-500">*Wajib</span></label>
                        <select 
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            required
                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none"
                        >
                            <option value="" disabled>-- Pilih Klasifikasi --</option>
                            <option value="PRIA">PRIA (Standar Lari 3444m)</option>
                            <option value="WANITA">WANITA (Standar Lari 3095m)</option>
                        </select>
                        <p className="text-[9px] text-gray-500 mt-2 font-mono ml-1 italic">*Menentukan rumus kalkulator Samapta dan AI Mentor.</p>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Simpan Identitas
                    </button>
                </div>
            </form>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-red-900/20 text-red-500 rounded-xl"><Trophy size={24} /></div>
                <div>
                    <p className="text-2xl font-black text-white">{userData.skdCount || 0}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Simulasi SKD</p>
                </div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-amber-900/20 text-amber-500 rounded-xl"><Activity size={24} /></div>
                <div>
                    <p className="text-2xl font-black text-white">{userData.physicalCount || 0}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Log Fisik</p>
                </div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-green-900/20 text-green-500 rounded-xl"><Shield size={24} /></div>
                <div>
                    <p className="text-2xl font-black text-white">{userData.missionCount || 0}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Misi Tuntas</p>
                </div>
            </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="border-t border-white/10 pt-8 flex justify-center">
             <Link href="/api/auth/signout" className="flex items-center gap-2 px-8 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                <LogOut size={16} /> Keluar dari Sistem
             </Link>
        </div>
      </div>
    </div>
  );
}