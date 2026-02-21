import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, XCircle, Clock, CalendarClock, CreditCard, ArrowLeft, ShieldCheck } from "lucide-react";
import { approveTransaction, rejectTransaction } from "@/app/actions/adminActions";
import Link from "next/link";

// Memaksa halaman selalu membaca data terbaru dari satelit
export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Validasi Keamanan Lapis 2: Pastikan hanya ADMIN yang bisa masuk
  const currentUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!currentUser || currentUser.role !== "ADMIN") redirect("/dashboard");

  // 1. AMBIL TRANSAKSI YANG MENUNGGU VERIFIKASI (SINKRON DENGAN KASIR)
  const pendingTransactions = await prisma.transaction.findMany({
    where: { 
        status: "PENDING" // ✅ FIX: Disesuaikan dengan status dari Kasir Digital
    },
    include: {
        user: true // Kita butuh nama & email kadet
    },
    orderBy: { createdAt: 'asc' } // Yang transfer duluan, antre di atas
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 pb-20 selection:bg-amber-500 selection:text-black">
        
        <div className="max-w-5xl mx-auto relative z-10">
            
            {/* --- HEADER --- */}
            <div className="mb-8 border-b border-white/10 pb-6 flex items-start gap-4">
                <Link href="/admin" className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl transition-colors mt-1">
                    <ArrowLeft size={20} className="text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider flex items-center gap-3">
                        <CheckCircle2 className="text-amber-500" />
                        Verifikasi <span className="text-amber-500">Logistik</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-mono mt-2 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-green-500"/> Validasi bukti transfer dan aktifkan akses Kadet secara manual.
                    </p>
                </div>
            </div>

            {/* --- DAFTAR ANTREAN --- */}
            {pendingTransactions.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-zinc-900/30">
                    <CheckCircle2 size={56} className="mx-auto text-green-500/50 mb-4" />
                    <h3 className="text-lg font-bold text-gray-400 tracking-widest uppercase">SEMUA BERES, KOMANDAN!</h3>
                    <p className="text-xs text-gray-600 font-mono mt-2">Tidak ada laporan transfer yang masuk ke radar saat ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5">
                    {pendingTransactions.map((trx) => {
                        
                        // ⚙️ SERVER ACTIONS BINDING (Pengganti Client Component)
                        const handleApprove = approveTransaction.bind(null, trx.id);
                        const handleReject = rejectTransaction.bind(null, trx.id);

                        // 🧠 SMART UI: Pisahkan 3 Digit Terakhir Nominal untuk Verifikasi Mata
                        const amountStr = trx.amount.toString();
                        const mainAmount = amountStr.length > 3 ? amountStr.slice(0, -3) : "0";
                        const last3Digits = amountStr.length > 3 ? amountStr.slice(-3) : amountStr;

                        return (
                            <div key={trx.id} className="bg-zinc-900/80 border border-amber-500/30 p-6 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-6 shadow-[0_0_30px_rgba(245,158,11,0.05)] hover:border-amber-500/60 transition-colors group">
                                
                                {/* 1. INFO KADET */}
                                <div className="flex items-center gap-4 w-full xl:w-1/3">
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center font-bold text-amber-500 border border-amber-500/20 shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div className="truncate">
                                        <h3 className="font-bold text-white uppercase text-sm truncate">{trx.user.name || "KADET"}</h3>
                                        <p className="text-[10px] text-gray-500 font-mono truncate">{trx.user.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="px-2 py-0.5 bg-indigo-950/50 text-indigo-400 text-[9px] font-black rounded border border-indigo-500/30 uppercase tracking-widest">
                                                {trx.planType}
                                            </span>
                                            <span className="px-2 py-0.5 bg-zinc-800 text-gray-400 text-[9px] font-bold rounded border border-white/10 flex items-center gap-1 font-mono">
                                                <CalendarClock size={10} /> {new Date(trx.createdAt).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. INFO TAGIHAN (DIBUAT SANGAT JELAS UNTUK ADMIN) */}
                                <div className="text-left xl:text-center w-full xl:w-1/3 bg-black/40 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-5"><CreditCard size={40}/></div>
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Cek Mutasi Bank Sebesar:</p>
                                    <div className="text-xl md:text-2xl font-black text-white flex items-center xl:justify-center gap-2 font-mono">
                                        <span className="text-sm text-gray-500">Rp</span> 
                                        {/* Sorot 3 digit terakhir dengan warna amber */}
                                        {Number(mainAmount).toLocaleString('id-ID')}.<span className="text-amber-500 bg-amber-500/10 px-1 rounded">{last3Digits}</span>
                                    </div>
                                    <p className="text-[9px] text-amber-500/70 mt-2 font-mono flex items-center xl:justify-center gap-1">
                                        ID: <span className="text-white select-all">{trx.id.slice(0, 8).toUpperCase()}</span>
                                    </p>
                                </div>

                                {/* 3. TOMBOL EKSEKUSI (SERVER ACTIONS) */}
                                <div className="flex gap-3 w-full xl:w-auto shrink-0">
                                    <form action={handleReject} className="w-full xl:w-auto">
                                        <button type="submit" className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-red-950/30 hover:bg-red-900 text-red-500 hover:text-white border border-red-900/50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
                                            <XCircle size={16} /> TOLAK
                                        </button>
                                    </form>
                                    <form action={handleApprove} className="w-full xl:w-auto">
                                        <button type="submit" className="w-full xl:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95">
                                            <CheckCircle2 size={18} /> ACC SEKARANG
                                        </button>
                                    </form>
                                </div>
                                
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
}