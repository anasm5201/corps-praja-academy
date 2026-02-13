import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  ShieldAlert, Users, LogOut,
  Activity, CreditCard, CheckSquare 
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  // 2. INTELIJEN DATA (REAL TIME)
  const stats = {
    totalCadets: await prisma.user.count({ where: { role: "CADET" } }), 
    
    // 🔥 PERBAIKAN: Fokus pada yang SUDAH TRANSFER (PENDING_VERIFICATION)
    pendingApprovals: await prisma.transaction.count({ 
        where: { status: "PENDING_VERIFICATION" } 
    }),
    
    // Hitung Revenue dari Transaksi SUKSES
    successfulTransactions: await prisma.transaction.findMany({ 
        where: { status: 'SUCCESS' }
    }),
    
    // Ambil aktivitas terakhir (Tryout)
    recentActivity: await prisma.tryoutAttempt.findMany({
        take: 5,
        orderBy: { finishedAt: 'desc' },
        include: { user: true, package: true }
    })
  };

  const totalOmzet = stats.successfulTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 pb-20 p-8">
        
        {/* --- TOP BAR COMMANDER --- */}
        <div className="bg-gradient-to-r from-red-950/40 to-black border-b border-red-900/30 -mx-8 -mt-8 px-8 py-6 mb-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-700 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                        <ShieldAlert size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
                            MARKAS PUSAT <span className="text-red-600">KOMANDO</span>
                        </h1>
                        <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                            Administrator Access Level 5 • Secure Channel
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 hover:border-white/30 text-xs font-bold uppercase rounded transition-all group">
                        <LogOut size={14} className="group-hover:-translate-x-1 transition-transform"/> 
                        Pantau Lapangan
                    </Link>
                </div>
            </div>
        </div>

        {/* --- 1. SITUASI LOGISTIK (STATS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* KARTU 1: ANTRIAN APPROVAL (KADET SUDAH TRANSFER) */}
            <Link href="/admin/approvals">
                <div className={`bg-zinc-900/50 border p-6 rounded-2xl flex items-center justify-between group hover:bg-zinc-900 transition cursor-pointer relative overflow-hidden
                    ${stats.pendingApprovals > 0 ? "border-amber-500/50" : "border-white/10"}`}>
                    
                    {stats.pendingApprovals > 0 && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full animate-ping m-4"></div>
                    )}
                    
                    <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">SIAP VERIFIKASI</p>
                        <h3 className={`text-3xl font-black ${stats.pendingApprovals > 0 ? "text-amber-500" : "text-white"}`}>
                            {stats.pendingApprovals}
                        </h3>
                        <p className="text-[10px] text-gray-600 mt-1">Konfirmasi Transfer</p>
                    </div>
                    <div className={`p-3 rounded-xl border group-hover:scale-110 transition-transform 
                        ${stats.pendingApprovals > 0 ? "bg-amber-950 border-amber-500/30 text-amber-500" : "bg-zinc-950 border-white/5 text-gray-500"}`}>
                        <CheckSquare size={24} />
                    </div>
                </div>
            </Link>

            <StatCard 
                label="Total Personel" 
                value={stats.totalCadets} 
                icon={Users} 
                color="text-blue-500" 
                border="border-blue-500/20" 
            />
            
            <StatCard 
                label="Omzet Logistik" 
                value={`Rp ${totalOmzet.toLocaleString()}`} 
                icon={CreditCard} 
                color="text-green-500" 
                border="border-green-500/20" 
            />
            
            <StatCard 
                label="Aktivitas Tempur" 
                value={stats.recentActivity.length > 0 ? "AKTIF" : "SEPI"} 
                sub="Radar Simulasi"
                icon={Activity} 
                color="text-red-500" 
                border="border-red-500/20" 
            />
        </div>

        {/* --- 2. LIVE FEED ACTIVITY --- */}
        <div className="grid grid-cols-1 gap-8">
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Activity size={14} className="text-green-500 animate-pulse"/> Radar Aktivitas Tempur (Live)
                </h3>
                
                <div className="space-y-4">
                    {stats.recentActivity.map((attempt) => (
                        <div key={attempt.id} className="flex gap-4 items-start border-b border-white/5 pb-3 last:border-0 last:pb-0">
                            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0 uppercase">
                                {attempt.user.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs text-white leading-relaxed">
                                    <span className="font-bold text-blue-400">{attempt.user.name}</span> 
                                    <span className="text-gray-400"> tuntas mengerjakan </span>
                                    <span className="text-yellow-500 font-bold">{attempt.package.title}</span>
                                </p>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 rounded font-bold ${attempt.score >= 350 ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
                                        SKOR: {attempt.score}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-mono">
                                        {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleTimeString() : "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, border }: any) {
    return (
        <div className={`bg-zinc-900/50 border ${border} p-6 rounded-2xl flex items-center justify-between group hover:bg-zinc-900 transition`}>
            <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-2xl font-black text-white">{value}</h3>
                {sub && <p className="text-[10px] text-gray-600 mt-1">{sub}</p>}
            </div>
            <div className={`p-3 bg-zinc-950 rounded-xl border border-white/5 group-hover:scale-110 transition-transform ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    )
}