import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Shield, Trash2, Search } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Ambil user, urutkan dari yang terbaru
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50 // Batasi 50 user terbaru agar ringan
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b border-white/10 pb-6 gap-4">
            <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <Users className="text-blue-500" /> DATA PERSONEL PASUKAN
                </h1>
                <p className="text-xs text-gray-500 font-mono mt-1">DAFTAR KADET TERDAFTAR DALAM SISTEM</p>
            </div>
            <span className="bg-blue-900/20 text-blue-500 px-4 py-2 rounded-lg text-xs font-bold border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                TOTAL PERSONEL: {users.length}
            </span>
        </div>

        {/* SEARCH BAR (Visual Only for now) */}
        <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
                type="text" 
                placeholder="Cari berdasarkan nama atau email..." 
                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-white/10">
                            <th className="p-4">Nama / Email</th>
                            <th className="p-4">Role & Status</th>
                            <th className="p-4">Pangkat (Rank)</th>
                            <th className="p-4">Total XP</th>
                            <th className="p-4">Tanggal Gabung</th>
                            <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{user.name}</div>
                                    <div className="text-xs text-gray-500 font-mono">{user.email}</div>
                                </td>
                                <td className="p-4">
                                    {user.role === "ADMIN" ? (
                                        <span className="inline-flex items-center gap-1 bg-yellow-900/20 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                            <Shield size={10} /> ADMIN PUSAT
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-zinc-800 text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold border border-white/5">
                                            KADET SISWA
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-300 font-mono text-xs uppercase font-bold">
                                    {user.rank}
                                </td>
                                <td className="p-4 font-black text-blue-500 tabular-nums">
                                    {user.xp.toLocaleString()} XP
                                </td>
                                <td className="p-4 text-gray-500 text-xs font-mono">
                                    {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-red-500/70 hover:text-red-500 transition-colors p-2 hover:bg-red-900/20 rounded-lg" title="Hapus User">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* PAGINATION FOOTER (Visual) */}
            <div className="p-4 bg-black/40 border-t border-white/5 flex justify-center">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Menampilkan {users.length} Data Terbaru</p>
            </div>
        </div>
    </div>
  );
}