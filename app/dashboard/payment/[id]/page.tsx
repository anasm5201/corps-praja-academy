import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Clock, CreditCard, ShieldCheck } from "lucide-react";

export default async function PaymentDetailPage({ params }: { params: { id: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;

  // 2. CEK LOGIN
  if (!userId) {
    redirect("/auth/login");
  }

  // 3. AMBIL DATA TRANSAKSI
  const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      // include: { package: true } // Opsional: jika ada relasi ke paket
  });

  // Jika data tidak ada
  if (!transaction) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-mono text-center">
              DATA LOGISTIK TIDAK DITEMUKAN DALAM ARSIP.
          </div>
      );
  }

  // 4. VALIDASI KEPEMILIKAN (FIXED)
  // Menggunakan variable 'userId' yang sudah diamankan di atas
  if (transaction.userId !== userId) {
      return <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-mono font-bold">AKSES DITOLAK: DOKUMEN RAHASIA.</div>;
  }

  // --- LOGIKA UI STATUS ---
  let statusIcon = <Clock size={48} className="text-yellow-500" />;
  let statusColor = "text-yellow-500";
  let statusText = "MENUNGGU VERIFIKASI";
  let statusBg = "bg-yellow-500/10 border-yellow-500/20";

  // Sesuaikan status string dengan database Anda (SUCCESS / PAID / PENDING / FAILED)
  const status = transaction.status.toUpperCase();

  if (status === 'SUCCESS' || status === 'PAID') {
      statusIcon = <CheckCircle2 size={48} className="text-green-500" />;
      statusColor = "text-green-500";
      statusText = "PEMBAYARAN DITERIMA";
      statusBg = "bg-green-500/10 border-green-500/20";
  } else if (status === 'FAILED') {
      statusIcon = <XCircle size={48} className="text-red-500" />;
      statusColor = "text-red-500";
      statusText = "PEMBAYARAN GAGAL";
      statusBg = "bg-red-500/10 border-red-500/20";
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
            
            {/* Back Button */}
            <Link href="/dashboard" className="absolute top-6 left-6 text-gray-500 hover:text-white transition">
                <ArrowLeft size={20} />
            </Link>

            <div className="flex flex-col items-center text-center mt-4">
                <div className={`p-6 rounded-full ${statusBg} mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
                    {statusIcon}
                </div>
                
                <h1 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Status Transaksi</h1>
                <p className={`text-2xl font-black ${statusColor} mb-8 tracking-tight`}>{statusText}</p>

                {/* Detail Grid */}
                <div className="w-full space-y-4 border-t border-white/5 pt-6 bg-black/20 p-4 rounded-xl">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-mono text-xs uppercase">ID Referensi</span>
                        <span className="font-mono text-white select-all text-xs">{transaction.id.slice(0,8).toUpperCase()}...</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-mono text-xs uppercase">Nominal</span>
                        <span className="font-mono text-white font-bold">Rp {transaction.amount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-mono text-xs uppercase">Tanggal</span>
                        <span className="text-white text-xs font-mono">{new Date(transaction.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-600">
                    <ShieldCheck size={12} />
                    <span>Transaksi Terenkripsi & Aman</span>
                </div>

                {/* Action */}
                <div className="mt-6 w-full">
                    <Link 
                        href="/dashboard" 
                        className="block w-full py-3 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-center"
                    >
                        Kembali ke Markas
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}