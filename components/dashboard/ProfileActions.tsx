"use client";

import { signOut } from "next-auth/react";
import { LogOut, Settings, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function ProfileActions() {
  const handleLogout = () => {
    toast.info("MENINGGALKAN MARKAS...", { duration: 2000 });
    setTimeout(() => {
        signOut({ callbackUrl: "/login" });
    }, 1000);
  };

  const handleSettings = () => {
    toast.warning("FITUR TERKUNCI", { description: "Pengaturan akun dikelola oleh Pusat Data." });
  };

  return (
    <div className="space-y-3">
        {/* Tombol Dummy Settings */}
        <button 
            onClick={handleSettings}
            className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition group"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-lg text-gray-400 group-hover:text-white transition">
                    <Settings size={20} />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-gray-300 group-hover:text-white">Pengaturan Akun</p>
                    <p className="text-[10px] text-gray-600">Sandi & Keamanan</p>
                </div>
            </div>
        </button>

        {/* Tombol Logout Real */}
        <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-red-900/10 border border-red-900/30 rounded-xl hover:bg-red-900/20 transition group"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-900/20 rounded-lg text-red-500 group-hover:text-red-400 transition">
                    <LogOut size={20} />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-red-500 group-hover:text-red-400">Keluar Sistem</p>
                    <p className="text-[10px] text-red-700">Akhiri Sesi</p>
                </div>
            </div>
        </button>
    </div>
  );
}