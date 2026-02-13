import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
    User, Mail, Shield, LogOut, Copy, 
    Settings, CreditCard, Bell, Key
} from "lucide-react";
// Jika Anda punya komponen SignOutButton terpisah, bisa diimport. 
// Jika tidak, kita bisa buat tombol link sederhana ke /api/auth/signout atau client component.
// Disini kita gunakan layout server component murni.

export default async function SettingsPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  // Casting ke 'any' agar properti 'id' bisa dibaca
  const user = session?.user as any; 

  if (!user) {
    redirect("/auth/login");
  }

  // Generate Referral Code simulasi dari ID (Ambil 6 karakter terakhir)
  const referralCode = user.id ? user.id.slice(-6).toUpperCase() : "UNKNOWN";

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 sm:px-6 pt-8 text-white">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="p-3 bg-zinc-800 rounded-xl border border-white/10">
                <Settings size={24} className="text-gray-400" />
            </div>
            <div>
                <h1 className="text-2xl font-black uppercase tracking-wide">Pengaturan Akun</h1>
                <p className="text-gray-500 text-sm">Kelola profil dan preferensi sistem Anda.</p>
            </div>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-800 to-black border-4 border-zinc-800 flex items-center justify-center shadow-2xl">
                    {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User size={40} className="text-gray-500" />
                    )}
                </div>

                {/* Info */}
                <div className="text-center md:text-left flex-1 space-y-2">
                    <h2 className="text-2xl font-black text-white">{user.name || "Kadet Tanpa Nama"}</h2>
                    <div className="flex flex-col md:flex-row gap-3 items-center justify-center md:justify-start text-sm text-gray-400">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-black/30 rounded-full border border-white/5">
                            <Mail size={12} /> {user.email}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-900/20 text-blue-400 rounded-full border border-blue-500/20 font-bold uppercase text-[10px] tracking-widest">
                            <Shield size={12} /> {user.role || "MEMBER"}
                        </span>
                    </div>
                </div>

                {/* Referral Code (Titik Error Sebelumnya) */}
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-center min-w-[180px]">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">ID / KODE KOMANDAN</p>
                    <div className="flex items-center justify-center gap-2">
                        <code className="text-blue-400 font-mono font-bold tracking-widest text-lg">
                            {/* ✅ FIX: Menggunakan variabel 'referralCode' yang sudah aman */}
                            {referralCode}
                        </code>
                        <button className="text-gray-600 hover:text-white transition-colors">
                            <Copy size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* MENU GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl hover:border-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4 mb-3">
                    <div className="p-2 bg-yellow-900/20 text-yellow-500 rounded-lg group-hover:bg-yellow-500 group-hover:text-black transition-all">
                        <CreditCard size={20} />
                    </div>
                    <h3 className="font-bold text-gray-200">Langganan & Tagihan</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Lihat status paket aktif dan riwayat transaksi Anda.
                </p>
            </div>

            <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl hover:border-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4 mb-3">
                    <div className="p-2 bg-purple-900/20 text-purple-500 rounded-lg group-hover:bg-purple-500 group-hover:text-black transition-all">
                        <Key size={20} />
                    </div>
                    <h3 className="font-bold text-gray-200">Keamanan Akun</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Ubah kata sandi dan aktifkan verifikasi dua langkah.
                </p>
            </div>

            <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl hover:border-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4 mb-3">
                    <div className="p-2 bg-green-900/20 text-green-500 rounded-lg group-hover:bg-green-500 group-hover:text-black transition-all">
                        <Bell size={20} />
                    </div>
                    <h3 className="font-bold text-gray-200">Notifikasi</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Atur preferensi pemberitahuan email dan aplikasi.
                </p>
            </div>

        </div>

        {/* LOGOUT BUTTON */}
        <div className="mt-12 pt-8 border-t border-white/5">
             {/* Catatan: Di NextAuth, logout idealnya via Client Component (signOut).
                Disini kita gunakan Link ke rute signout default NextAuth atau custom.
             */}
             <a href="/api/auth/signout" className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold text-sm px-4 py-2 hover:bg-red-900/10 rounded-lg w-fit transition-colors">
                <LogOut size={16} />
                KELUAR DARI SISTEM
             </a>
        </div>

    </div>
  );
}