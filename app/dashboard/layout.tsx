import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // [UPDATED] Import Prisma
import Sidebar from "@/components/dashboard/Sidebar";       
import NavbarMobile from "@/components/dashboard/NavbarMobile"; 
import { Toaster } from "sonner"; 
import SecurityGate from "@/components/dashboard/SecurityGate"; // [UPDATED] Import Guard

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // [UPDATED] Ambil Data User Lengkap (Subscription & CreatedAt)
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true,
      name: true,
      subscriptionType: true,
      createdAt: true,
    }
  });

  if (!user) redirect("/login");

  return (
    // UBAH: Selection color lebih gelap (Merah Marun) agar lebih berwibawa/sakral
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-900/50">
      
      {/* 1. BACKGROUND GRID DIGITAL (Ambience) */}
      <div 
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      {/* 2. SIDEBAR NAVIGASI (Desktop) */}
      <Sidebar />

      {/* 3. NAVBAR NAVIGASI (Mobile) */}
      <div className="lg:hidden">
         <NavbarMobile />
      </div>

      {/* 4. MAIN CONTENT AREA */}
      <main className="lg:pl-64 relative z-10 min-h-screen flex flex-col transition-all duration-300 pb-24 lg:pb-0">
        
        {/* HEADER BAR (Sticky Top) */}
        <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center">
             
             {/* UBAH: Status Indikator menjadi Penanda Lokasi Sakral */}
             <div className="flex items-center gap-3">
                <div className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </div>
                <div>
                    <span className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest leading-none">
                        TERITORIAL
                    </span>
                    <span className="block text-xs font-bold text-white uppercase tracking-wider leading-none mt-1">
                        LEMBAH MANGLAYANG
                    </span>
                </div>
             </div>

             {/* UBAH: User Profile menjadi Identitas Praja */}
             <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <h3 className="text-sm font-bold text-white uppercase">{user.name}</h3>
                  <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest">
                    {user.subscriptionType === 'FREE' ? 'REKRUT (TRIAL)' : 'CORPS PRAJA'}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg ${user.subscriptionType !== 'FREE' ? 'bg-gradient-to-br from-amber-600 to-yellow-800 border-amber-500/30' : 'bg-gradient-to-br from-red-900 to-black border-red-500/30 shadow-red-900/20'}`}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
             </div>
        </header>

        {/* [UPDATED] CONTENT CHILDREN WRAPPED WITH IRON CURTAIN */}
        {/* Guard ini akan mengecek status user & URL. Jika tidak valid, konten asli diganti Lock Screen */}
        <div className="flex-1">
            <SecurityGate user={user}>
               {children}
            </SecurityGate>
        </div>

      </main>

      {/* 5. ANTENA NOTIFIKASI */}
      <Toaster position="top-center" richColors theme="dark" />
      
    </div>
  );
}