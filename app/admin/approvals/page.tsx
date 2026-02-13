import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, XCircle, AlertCircle, CalendarClock, CreditCard } from "lucide-react";
import { approveTransaction, rejectTransaction } from "@/app/actions/adminActions";
import { revalidatePath } from "next/cache";

// KOMPONEN TOMBOL AKSI (CLIENT COMPONENT WRAPPER)
import TransactionActionButtons from "./TransactionActionButtons"; 

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 1. AMBIL TRANSAKSI YANG MENUNGGU VERIFIKASI
  const pendingTransactions = await prisma.transaction.findMany({
    where: { 
        status: "PENDING_VERIFICATION" // Hanya yang sudah klik "Saya Sudah Transfer"
    },
    include: {
        user: true // Kita butuh nama & email kadet
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-black text-white p-8 pb-20">
        
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 border-b border-white/10 pb-6">
                <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-3">
                    <CheckCircle2 className="text-amber-500" />
                    Verifikasi Pembayaran
                </h1>
                <p className="text-sm text-gray-500 font-mono mt-2">
                    Validasi bukti transfer dan aktifkan akses Kadet secara manual.
                </p>
            </div>

            {pendingTransactions.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-zinc-900/30">
                    <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-gray-400">SEMUA BERES, KOMANDAN!</h3>
                    <p className="text-xs text-gray-600 mt-2">Tidak ada antrian verifikasi saat ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {pendingTransactions.map((trx) => (
                        <div key={trx.id} className="bg-zinc-900 border border-amber-500/30 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                            
                            {/* INFO KADET */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-gray-400 border border-white/10">
                                    {trx.user.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white uppercase">{trx.user.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono">{trx.user.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-[10px] font-bold rounded border border-blue-500/20 uppercase">
                                            {trx.planType} PACKAGE
                                        </span>
                                        <span className="px-2 py-0.5 bg-zinc-800 text-gray-400 text-[10px] font-bold rounded border border-white/10 flex items-center gap-1">
                                            <CalendarClock size={10} /> {new Date(trx.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* INFO TAGIHAN */}
                            <div className="text-right w-full md:w-auto bg-black/40 p-3 rounded-lg border border-white/5">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">TOTAL DITRANSFER</p>
                                <div className="text-2xl font-black text-amber-500 flex items-center justify-end gap-2 font-mono">
                                    <CreditCard size={18} />
                                    Rp {trx.amount.toLocaleString()}
                                </div>
                                <p className="text-[10px] text-red-400 mt-1 italic">
                                    *Pastikan kode unik <span className="font-bold text-white bg-red-900/50 px-1 rounded">{trx.uniqueCode}</span> sesuai mutasi bank.
                                </p>
                            </div>

                            {/* TOMBOL AKSI (Client Component) */}
                            <TransactionActionButtons transactionId={trx.id} />
                            
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}