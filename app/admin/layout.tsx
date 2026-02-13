import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Users, LogOut, ShieldAlert, 
  BookOpen, Database, PlusCircle, CheckSquare, CreditCard
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // 1. CEK LOGIN & BYPASS ID (FIXED)
  const userId = (session?.user as any)?.id;

  if (!userId) {
      redirect("/auth/login");
  }

  // 2. CEK ROLE (SECURITY CHECKPOINT LEVEL 5)
  const user = await prisma.user.findUnique({ 
      where: { id: userId } 
  });

  if (!user || user.role !== "ADMIN") {
      redirect("/dashboard"); 
  }

  // 3. HITUNG BADGE NOTIFIKASI (PENDING TRANSACTIONS)
  // Menggunakan tabel 'Transaction' sesuai reformasi database
  const pendingCount = await prisma.transaction.count({
      where: { status: "PENDING" }
  });

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-red-900 selection:text-white">
        
        {/* --- SIDEBAR MARKAS KOMANDO --- */}
        <aside className="w-64 border-r border-white/10 bg-zinc-950 flex flex-col fixed h-full z-50">
            
            {/* Header Sidebar */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-700 rounded flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                    <ShieldAlert size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-black text-white uppercase tracking-tighter leading-none">
                        WAR ROOM
                    </h1>
                    <p className="text-[9px] text-red-500 font-bold tracking-widest mt-0.5">ADMIN ACCESS</p>
                </div>
            </div>

            {/* Menu Navigasi */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                
                {/* SEKSI: KOMANDO */}
                <p className="px-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 mt-2">Komando Pusat</p>
                
                <AdminLink href="/admin" icon={<LayoutDashboard size={18}/>} label="Situasi Terkini" />
                
                {/* MENU APPROVAL / KEUANGAN */}
                {/* Kita arahkan ke /admin/finance karena di situ file page.tsx berada */}
                <Link href="/admin/finance" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-emerald-900/10 hover:border-emerald-900/30 border border-transparent text-gray-400 hover:text-emerald-500 transition-all font-bold text-xs uppercase tracking-wide group">
                    <div className="flex items-center gap-3">
                        <CheckSquare size={18} className="group-hover:scale-110 transition-transform" />
                        <span>Verifikasi Bayar</span>
                    </div>
                    {pendingCount > 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-md animate-pulse">
                            {pendingCount}
                        </span>
                    )}
                </Link>

                <AdminLink href="/admin/users" icon={<Users size={18}/>} label="Data Personel" />

                {/* SEKSI: LOGISTIK & AMUNISI */}
                <p className="px-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 mt-6">Suplai Logistik</p>
                
                <AdminLink href="/admin/question/add" icon={<PlusCircle size={18}/>} label="Input Soal Baru" />
                <AdminLink href="/admin/materials/add" icon={<BookOpen size={18}/>} label="Input Materi PDF" />
                <AdminLink href="/admin/materials" icon={<Database size={18}/>} label="Gudang Bank Soal" />

            </nav>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-white/10 bg-zinc-900/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-gray-500 font-mono">SYSTEM ONLINE</span>
                </div>
                <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 uppercase tracking-widest transition-all group">
                    <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                    Keluar War Room
                </Link>
            </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 ml-64 bg-[#050505] min-h-screen relative">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none fixed"></div>
            <div className="p-8 relative z-10">
                {children}
            </div>
        </main>
    </div>
  );
}

// Komponen Helper
function AdminLink({ href, icon, label }: any) {
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-900/10 hover:border-red-900/30 border border-transparent text-gray-400 hover:text-red-500 transition-all font-bold text-xs uppercase tracking-wide group">
            <span className="group-hover:scale-110 transition-transform duration-300">{icon}</span>
            {label}
        </Link>
    )
}