import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Clock, CreditCard, ShieldCheck, MessageCircle, AlertTriangle } from "lucide-react";

export default async function PaymentDetailPage({ params }: { params: { id: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;

  // 2. CEK LOGIN
  if (!userId) {
    redirect("/auth/login");
  }

  // 3. AMBIL DATA TRANSAKSI BESERTA NAMA KADET
  const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { user: { select: { name: true } } } // Ambil nama user untuk WA
  });

  // Jika data tidak ada
  if (!transaction) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#050505] font-mono text-center px-4">
              <div className="bg-red-950/30 border border-red-900/50 p-8 rounded-xl max-w-md w-full">
                  <AlertTriangle size={48} className="text-red-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-red-400 font-bold uppercase tracking-widest">Data Logistik Tidak Ditemukan</p>
                  <Link href="/dashboard/subscription" className="mt-6 block w-full py-3 bg-red-900/50 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition-colors border border-red-700">
                      KEMBALI KE GUDANG SENJATA
                  </Link>
              </div>
          </div>
      );
  }

  // 4. VALIDASI KEPEMILIKAN
  if (transaction.userId !== userId) {
      return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-red-500 font-mono font-bold tracking-widest">AKSES DITOLAK: DOKUMEN RAHASIA.</div>;
  }

  // --- PENGATURAN ADMIN WA ---
  // Ganti dengan nomor Admin Corps Praja Anda
  const ADMIN_WA = "085279722605";
  const kadetName = transaction.user?.name || "Kadet";
  const strAmount = transaction.amount.toLocaleString('id-ID');
  const shortId = transaction.id.slice(0,8).toUpperCase();
  
  // Pesan Otomatis Konfirmasi WA
  const waText = encodeURIComponent(`Izin Komandan, saya Kadet ${kadetName}. Saya telah melakukan transfer sebesar Rp ${strAmount} untuk paket ${transaction.planType} dengan ID Referensi: ${shortId}. Mohon ACC akses saya.`);

  // --- LOGIKA UI STATUS ---
  const status = transaction.status.toUpperCase();
  let statusIcon = <Clock size={48} className="text-amber-500" />;
  let statusColor = "text-amber-500";
  let statusText = "MENUNGGU PEMBAYARAN";
  let statusBg = "bg-amber-500/10 border-amber-500/20";

  if (status === 'SUCCESS' || status === 'PAID') {
      statusIcon = <CheckCircle2 size={48} className="text-emerald-500" />;
      statusColor = "text-emerald-500";
      statusText = "AKSES DIBERIKAN";
      statusBg = "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.3)]";
  } else if (status === 'FAILED') {
      statusIcon = <XCircle size={48} className="text-red-500" />;
      statusColor = "text-red-500";
      statusText = "TRANSAKSI GAGAL";
      statusBg = "bg-red-500/10 border-red-500/20";
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
        
        {/* Background Atmosphere */}
        <div className="fixed inset-0 pointer-events-none opacity-20">
            <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] bg-indigo-900/40 rounded-full blur-[120px]"></div>
        </div>
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-2xl z-10">
            
            {/* Back Button */}
            <Link href="/dashboard" className="absolute top-6 left-6 text-neutral-500 hover:text-white transition">
                <ArrowLeft size={20} />
            </Link>

            <div className="flex flex-col items-center text-center mt-4">
                <div className={`p-6 rounded-full border ${statusBg} mb-6`}>
                    {statusIcon}
                </div>
                
                <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">Status Transaksi</h1>
                <p className={`text-2xl font-black ${statusColor} mb-8 tracking-tight`}>{statusText}</p>

                {/* --- INSTRUKSI PEMBAYARAN JIKA PENDING --- */}
                {status === 'PENDING' && (
                    <div className="w-full bg-amber-950/20 border border-amber-900/50 rounded-xl p-5 mb-6 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10"><CreditCard size={60}/></div>
                        <h3 className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-3">Tujuan Transfer</h3>
                        
                        {/* GANTI DENGAN REKENING ASLI ANDA */}
                        <div className="space-y-2 relative z-10">
                            <div className="bg-black/50 p-3 rounded-lg flex justify-between items-center border border-amber-900/30">
                               <span className="text-xs text-neutral-400 font-mono">BRI</span>
                               <span className="text-sm font-mono font-bold text-white selection:bg-amber-500 selection:text-black">225901006157501</span>
                            </div>
                            <div className="bg-black/50 p-3 rounded-lg flex justify-between items-center border border-amber-900/30">
                               <span className="text-xs text-neutral-400 font-mono">A/N</span>
                               <span className="text-xs font-bold text-white uppercase">Admin Corps Praja</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-amber-500/70 font-mono mt-4 leading-relaxed text-center">
                            *Transfer tepat sesuai nominal hingga <strong className="text-amber-400">3 digit terakhir</strong> untuk identifikasi otomatis.
                        </p>
                    </div>
                )}

                {/* Detail Grid */}
                <div className="w-full space-y-4 border-t border-neutral-800 pt-6 bg-neutral-900/30 p-5 rounded-xl border border-neutral-800/50">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">ID Referensi</span>
                        <span className="font-mono font-bold text-white select-all text-xs bg-black/50 px-2 py-1 rounded border border-neutral-800">{shortId}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">Nominal Bayar</span>
                        <span className="font-mono text-xl font-black text-white tracking-tighter">
                            <span className="text-sm text-neutral-500 mr-1">Rp</span> 
                            {strAmount}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">Paket</span>
                        <span className="font-mono font-bold text-indigo-400 text-xs bg-indigo-950/50 px-2 py-1 rounded border border-indigo-900/50">{transaction.planType}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest">Tanggal</span>
                        <span className="text-neutral-300 text-xs font-mono">{new Date(transaction.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 flex items-center gap-2 text-[10px] text-neutral-600 font-mono">
                    <ShieldCheck size={14} className="text-indigo-900" />
                    <span>Dokumen Terenkripsi Corps Praja</span>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 w-full space-y-3">
                    {status === 'PENDING' ? (
                        <>
                            <a 
                                href={`https://wa.me/${ADMIN_WA}?text=${waText}`} 
                                target="_blank" 
                                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                            >
                                <MessageCircle size={16} /> KONFIRMASI WA
                            </a>
                            <Link href="/dashboard" className="block w-full py-3 text-neutral-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors text-center border border-transparent hover:border-neutral-800">
                                Kembali ke Markas (Nanti Saja)
                            </Link>
                        </>
                    ) : (
                        <Link 
                            href="/dashboard" 
                            className="flex items-center justify-center gap-2 w-full py-4 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                        >
                            KEMBALI KE MARKAS
                        </Link>
                    )}
                </div>

            </div>
        </div>
    </div>
  );
}