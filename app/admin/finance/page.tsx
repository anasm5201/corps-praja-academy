import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
    CreditCard, CheckCircle2, XCircle, Clock, 
    TrendingUp, AlertCircle 
} from "lucide-react";
import TransactionActionButtons from "./TransactionActionButtons"; 

export default async function AdminFinancePage() {
  const session = await getServerSession(authOptions);
  
  // Cek Auth & Role (Opsional: Tambahkan cek role ADMIN jika perlu)
  if (!session) redirect("/auth/login");

  // ✅ FIX 1: AMBIL DATA DARI 'transaction' (Bukan 'purchase')
  const transactions = await prisma.transaction.findMany({
      include: {
          user: true,
          // ❌ HAPUS 'package: true' (Data paket sekarang ada di kolom planType & amount)
      },
      orderBy: { createdAt: 'desc' }
  });

  // ✅ FIX 2: HITUNG OMZET DARI KOLOM 'amount'
  const totalRevenue = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

  return (
    <div className="space-y-8 pb-20 p-6 bg-zinc-950 min-h-screen text-white">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                    <CreditCard className="text-green-500" size={32}/> LOGISTIK & KEUANGAN
                </h1>
                <p className="text-gray-500 text-sm font-mono mt-2">
                    Validasi pembayaran manual dan monitoring arus kas.
                </p>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Omzet Masuk</p>
                <p className="text-3xl font-black text-green-500">
                    Rp {(totalRevenue/1000).toLocaleString('id-ID')}K
                </p>
            </div>
        </div>

        {/* ALERT PENDING */}
        {pendingCount > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                <AlertCircle className="text-yellow-500" size={24} />
                <div>
                    <h4 className="font-bold text-yellow-500 uppercase text-sm">Perhatian Komandan</h4>
                    <p className="text-xs text-yellow-200">Ada {pendingCount} transaksi menunggu persetujuan aktivasi.</p>
                </div>
            </div>
        )}

        {/* TABEL TRANSAKSI */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-500"/> Riwayat Transaksi
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-black border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4">ID / Tanggal</th>
                            <th className="px-6 py-4">Personel</th>
                            <th className="px-6 py-4">Paket Amunisi</th>
                            <th className="px-6 py-4 text-right">Nilai (Rp)</th>
                            <th className="px-6 py-4 text-center">Kode Unik</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {transactions.map((trx) => (
                            <tr key={trx.id} className="hover:bg-white/5 transition">
                                <td className="px-6 py-4 font-mono text-gray-400">
                                    <span className="block text-white font-bold">{trx.id.slice(0,8).toUpperCase()}</span>
                                    {new Date(trx.createdAt).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{trx.user?.name || "Tanpa Nama"}</div>
                                    <div className="text-xs text-gray-500">{trx.user?.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {/* ✅ FIX 3: Ganti trx.package.title menjadi trx.planType */}
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${trx.amount >= 500000 ? 'border-yellow-500 text-yellow-500' : 'border-blue-500 text-blue-500'}`}>
                                        {trx.planType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-black text-white">
                                    {/* ✅ FIX 4: Ganti trx.package.price menjadi trx.amount */}
                                    {trx.amount.toLocaleString('id-ID')}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs font-mono">
                                        {trx.uniqueCode}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {trx.status === 'SUCCESS' && <span className="inline-flex items-center gap-1 text-green-500 font-bold text-xs"><CheckCircle2 size={14}/> AKTIF</span>}
                                    {trx.status === 'PENDING' && <span className="inline-flex items-center gap-1 text-yellow-500 font-bold text-xs"><Clock size={14}/> PENDING</span>}
                                    {trx.status === 'FAILED' && <span className="inline-flex items-center gap-1 text-red-500 font-bold text-xs"><XCircle size={14}/> GAGAL</span>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {trx.status === 'PENDING' ? (
                                        <TransactionActionButtons id={trx.id} />
                                    ) : (
                                        <span className="text-[10px] text-gray-600 font-mono">LOCKED</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500 italic">
                                    Belum ada data keuangan.
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