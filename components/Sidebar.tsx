"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Target, 
  Dumbbell, 
  User, 
  BookOpen, 
  Users, 
  Settings,
  LogOut,
  Trophy,
  ShieldAlert 
} from "lucide-react";

const menuItems = [
  { name: "MARKAS PUSAT (ADMIN)", href: "/admin", icon: ShieldAlert },
  { name: "COMMAND CENTER", href: "/dashboard", icon: LayoutDashboard },
  { name: "MISSION (TRY OUT)", href: "/dashboard/mission", icon: Target },
  // [MODIFIKASI] Diarahkan ke list utama, bukan jalur yang bisa memicu 'null'
  { name: "INTEL (MATERI)", href: "/dashboard/intel", icon: BookOpen },
  { name: "PHYSICAL (JASMANI)", href: "/dashboard/physical", icon: Dumbbell },
  { name: "CHARACTER (SUH)", href: "/dashboard/character", icon: User },
  { name: "RECRUITMENT (AFILIASI)", href: "/dashboard/recruitment", icon: Users },
  { name: "GLOBAL RANKING", href: "/dashboard/leaderboard", icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSettingsActive = pathname === "/dashboard/settings";

  return (
    <aside className="w-64 bg-black border-r border-white/10 hidden md:flex flex-col relative z-20 h-screen sticky top-0">
      
      <div className="p-8 border-b border-white/5">
        <h1 className="text-2xl font-black text-white tracking-tighter leading-none">
          CORPS PRAJA <span className="block text-red-600 text-3xl">ACADEMY</span>
        </h1>
        <div className="flex items-center gap-2 mt-3 bg-red-900/10 border border-red-500/20 px-2 py-1 rounded w-fit">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[9px] font-mono text-gray-400 tracking-[0.2em] uppercase">
            SECURE CHANNEL v4.0
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          // Filter akses Admin
          // @ts-ignore
          if (item.href === "/admin" && session?.user?.role !== "ADMIN") return null;

          // Logika Active Link yang lebih presisi
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? "bg-red-900/20 text-white border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[0_0_10px_#dc2626]"></div>
              )}
              
              <item.icon 
                size={20} 
                className={`transition-transform duration-300 ${isActive ? "text-red-500 scale-110" : "group-hover:text-white"}`} 
              />
              
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 border-t border-white/10 space-y-2">
        <Link 
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
            isSettingsActive 
              ? "bg-white/10 border border-white/20 text-white" 
              : "text-gray-500 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Settings size={18} className={`transition-transform duration-700 ${isSettingsActive ? "animate-spin-slow" : "group-hover:rotate-90"}`} />
          <span className="text-[10px] font-bold tracking-widest uppercase">SYSTEM CONFIG</span>
        </Link>

        <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/70 hover:text-red-500 hover:bg-red-900/10 transition-all group border border-transparent hover:border-red-500/20"
        >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform"/>
            <span className="text-[10px] font-bold tracking-widest uppercase">TERMINATE SESSION</span>
        </button>
      </div>
    </aside>
  );
}