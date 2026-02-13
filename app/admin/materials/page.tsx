import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
    Box, Plus 
} from "lucide-react";
import PackageActionButtons from "./PackageActionButtons"; 

export default async function MaterialsInventoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // AMBIL SEMUA PAKET
  const packages = await prisma.tryoutPackage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
          _count: {
              select: { 
                  questions: true, // ✅ Hitung jumlah soal
                  // ❌ purchases: true // <-- DIBUANG (Penyebab Error)
              }
          }
      }
  });

  return (
    <div className="space-y-8 pb-20 p-6 bg-black min-h-screen text-white">
        
        {/* HEADER & ACTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                    <Box className="text-blue-500" size={32}/> GUDANG LOGISTIK
                </h1>
                <p className="text-gray-500 text-sm font-mono mt-2">
                    Manajemen Aset Paket Soal & Materi Pembelajaran.
                </p>
            </div>
            
            <div className="flex gap-3">
                <Link href="/admin/materials/add" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-2 transition shadow-lg shadow-blue-900/20">
                    <Plus size={18}/> Tambah Stok
                </Link>
            </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-black border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4">Nama Paket</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4">Harga</th>
                            <th className="px-6 py-4 text-center">Isi (Soal)</th>
                            {/* ❌ Kolom Terjual Dihapus Sementara */}
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Kontrol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {packages.map((pkg) => (
                            <tr key={pkg.id} className="hover:bg-white/5 transition group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white group-hover:text-blue-400 transition">
                                        {pkg.title}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono mt-1 line-clamp-1">
                                        ID: {pkg.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {/* Pastikan field category ada di schema, jika tidak bisa dihapus bagian ini */}
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border 
                                        ${(pkg as any).category === 'SKD' ? 'border-blue-900 text-blue-500 bg-blue-900/10' : 
                                          (pkg as any).category === 'PSIKOLOGI' ? 'border-purple-900 text-purple-500 bg-purple-900/10' : 
                                          'border-yellow-900 text-yellow-500 bg-yellow-900/10'}
                                    `}>
                                        {(pkg as any).category || 'UMUM'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-300">
                                    {/* Gunakan (pkg as any) jika price belum terdaftar di TypeScript definition */}
                                    {!(pkg as any).price ? "GRATIS" : `Rp ${((pkg as any).price/1000).toLocaleString('id-ID')}K`}
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-white">
                                    {pkg._count.questions}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {(pkg as any).isPublished ? (
                                        <span className="inline-flex items-center gap-1 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Live
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div> Draft
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <PackageActionButtons id={pkg.id} isPublished={(pkg as any).isPublished} />
                                </td>
                            </tr>
                        ))}
                        
                        {packages.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-500 italic">
                                    Gudang kosong. Segera input logistik baru.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}