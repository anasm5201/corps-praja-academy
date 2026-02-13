import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
    Users, Share2, Copy, Wallet, TrendingUp, 
    ShieldCheck, UserPlus, AlertCircle 
} from "lucide-react";

export default async function RecruitmentPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA USER (SAFE MODE)
  // ⚠️ CATATAN: Kita menghapus 'include: affiliates' karena relasi belum ada di schema.prisma
  // Ini mencegah error build. Nanti jika schema sudah update, silakan tambahkan lagi.
  const user = await prisma.user.findUnique({
      where: { id: userId },
      // Kita ambil data dasar saja agar build sukses
      select: {
        id: true,
        name: true,
        email: true,
        // referralCode: true, // Uncomment jika kolom ini sudah ada
      }
  });

  if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-mono">
            DATA PERSONEL TIDAK DITEMUKAN.
        </div>
      );
  }

  // 3. DATA DUMMY / DEFAULT (Agar UI Tetap Muncul)
  // Karena relasi database belum ada, kita set ke 0 dulu.
  const affiliates: any[] = []; // Kosongkan list rekrutan
  const totalRecruits = 0; 
  
  // Gunakan ID sebagai kode referral sementara jika kolom referralCode belum ada
  const referralCode = (user as any).referralCode || user.id.slice(0, 8).toUpperCase();
  const estimatedEarnings = totalRecruits * 25000;

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 sm:px-6 pt-8 text-white">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6 gap-6">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/20 border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4">
                    <Users size={12} /> Divisi Personalia
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                    Pusat <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Rekrutmen</span>
                </h1>
                <p className="text-gray-400 text-sm mt-2 font-mono uppercase tracking-widest">
                    Undang kadet baru dan dapatkan komisi operasi.
                </p>
            </div>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Kartu Kode Referral */}
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Share2 size={100} className="text-emerald-500" />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Kode Komandan</h3>
                <div className="flex items-center gap-4 bg-black/50 p-3 rounded-xl border border-white/5">
                    <span className="text-2xl font-black text-white tracking-widest font-mono">{referralCode}</span>
                    <button className="p-2 bg-white/10 hover:bg-emerald-600 rounded-lg transition-colors ml-auto">
                        <Copy size={16} />
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-4">
                    Bagikan kode ini kepada calon kadet.
                </p>
            </div>

            {/* Kartu Total Rekrutan */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <UserPlus size={80} className="text-blue-500" />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Rekrutan</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{totalRecruits}</span>
                    <span className="text-sm text-gray-500 font-bold uppercase">PERSONEL</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-green-500 bg-green-900/10 px-2 py-1 rounded w-fit">
                    <TrendingUp size={12} />
                    <span>Aktif Beroperasi</span>
                </div>
            </div>

            {/* Kartu Estimasi Pendapatan */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Wallet size={80} className="text-yellow-500" />
                </div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Estimasi Komisi</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-lg text-gray-400 font-bold">Rp</span>
                    <span className="text-4xl font-black text-white">{estimatedEarnings.toLocaleString('id-ID')}</span>
                </div>
                <p className="text-[10px] text-gray-600 mt-4 font-mono">
                    *Pencairan dilakukan setiap tanggal 1.
                </p>
            </div>
        </div>

        {/* DAFTAR REKRUTAN TERBARU */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
                    <Users className="text-gray-500" size={20} /> Manifest Personel Terbaru
                </h3>
            </div>

            {affiliates.length > 0 ? (
                <div className="divide-y divide-white/5">
                    {affiliates.map((recruit) => (
                        <div key={recruit.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-bold text-gray-400">
                                    {recruit.name ? recruit.name.charAt(0).toUpperCase() : "?"}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{recruit.name || "Tanpa Nama"}</p>
                                    <p className="text-[10px] text-gray-500 font-mono">
                                        Bergabung: {new Date(recruit.createdAt).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 text-green-500 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest">
                                <ShieldCheck size={12} /> TERVERIFIKASI
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="uppercase font-bold text-sm">Belum ada rekrutan</p>
                    <p className="text-xs mt-1 max-w-sm mx-auto">
                        Sebarkan kode komandan Anda untuk mulai membangun pasukan dan mendapatkan komisi.
                    </p>
                </div>
            )}
        </div>

    </div>
  );
}