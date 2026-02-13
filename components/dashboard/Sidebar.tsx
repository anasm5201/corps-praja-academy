"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BrainCog, 
  Trophy, 
  Dumbbell, 
  User, 
  LogOut, 
  Shield,
  Crown // Import ikon Mahkota untuk Upgrade
} from "lucide-react";
import { signOut } from "next-auth/react";

const MENU_ITEMS = [
  { name: "Lapangan Parade", href: "/dashboard", icon: LayoutDashboard },
  { name: "Plaza Menza", href: "/dashboard/materials", icon: BrainCog },
  { name: "Papan Kehormatan", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "Samapta", href: "/dashboard/physical/input", icon: Dumbbell },
  { name: "Biodata Praja", href: "/dashboard/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black border-r border-white/10 h-screen fixed left-0 top-0 hidden lg:flex flex-col z-40">
      
      {/* HEADER LOGO */}
      <div className="h-28 flex items-center gap-4 px-6 border-b border-white/10 bg-neutral-950/50">
        <div className="w-12 h-12 bg-red-700 rounded-xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(185,28,28,0.6)] shrink-0 border border-red-500/30">
            <Shield size={24} fill="currentColor" />
        </div>
        
        <div className="flex flex-col justify-center">
            <h1 className="text-white font-black text-xl tracking-tighter leading-none">
                CORPS PRAJA
            </h1>
            <h2 className="text-red-600 font-black text-xl tracking-tighter leading-none mt-0.5">
                ACADEMY
            </h2>
            
            <div className="flex items-center gap-1.5 mt-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-[9px] text-neutral-400 font-mono tracking-widest uppercase">TERITORIAL 1</p>
            </div>
        </div>
      </div>

      {/* NAVIGATION MENU */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-[10px] font-black text-red-900/50 uppercase tracking-[0.2em] px-4 mb-3 mt-4">
            DOKTRIN & MISI
        </div>
        
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${isActive 
                  ? 'bg-red-700 text-white shadow-[0_0_25px_rgba(185,28,28,0.4)] border border-red-500/50' 
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent'
                }
              `}
            >
              {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30"></div>
              )}

              <Icon size={20} className={isActive ? 'text-white' : 'text-neutral-500 group-hover:text-red-500 transition-colors'} />
              <span className="text-sm font-bold tracking-wide">{item.name}</span>
            </Link>
          );
        })}

        {/* --- [NEW] TOMBOL UPGRADE AKSES (KOPERASI) --- */}
        <div className="pt-4 mt-4 border-t border-white/5">
             <div className="text-[10px] font-black text-amber-900/50 uppercase tracking-[0.2em] px-4 mb-3">
                LOGISTIK & SENJATA
            </div>
            <Link 
              href="/dashboard/subscription"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${pathname === '/dashboard/subscription' 
                   ? 'bg-amber-600/20 text-amber-400 border border-amber-500/50'
                   : 'text-amber-500/70 hover:bg-amber-900/20 hover:text-amber-400 border border-amber-900/30'
                }
              `}
            >
               <Crown size={20} className="animate-pulse" />
               <span className="text-sm font-black tracking-wide uppercase">UPGRADE AKSES</span>
            </Link>
        </div>

      </nav>

      {/* FOOTER / LOGOUT */}
      <div className="p-4 border-t border-white/10 bg-neutral-950/50">
        <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition-all group"
        >
            <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
            <span className="text-sm font-bold">KELUAR TERITORIAL</span>
        </button>
        <p className="text-[9px] text-center text-neutral-600 mt-3 font-mono leading-relaxed">
            CORPS PRAJA ACADEMY<br/>SYSTEM v1.0 &copy; 2026
        </p>
      </div>

    </aside>
  );
}