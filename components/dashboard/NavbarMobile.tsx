"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Trophy, User, Dumbbell } from "lucide-react";

export default function NavbarMobile() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: "/dashboard", icon: LayoutDashboard },
    { href: "/dashboard/materials", icon: Package },
    { href: "/dashboard/physical/input", icon: Dumbbell }, // Tengah (Fokus Latihan)
    { href: "/dashboard/leaderboard", icon: Trophy },
    { href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 p-4 z-50 lg:hidden pb-safe">
      <div className="flex justify-around items-center">
        {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
                <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                        ${isActive ? 'text-blue-500' : 'text-gray-500 hover:text-white'}
                    `}
                >
                    <Icon size={24} className={isActive ? 'fill-current' : ''} />
                    {isActive && <span className="w-1 h-1 bg-blue-500 rounded-full"></span>}
                </Link>
            )
        })}
      </div>
    </div>
  );
}