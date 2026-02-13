import Link from 'next/link';
import { GraduationCap, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO & BRAND */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-wide">CORPS PRAJA</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest">ACADEMY</span>
            </div>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition">
                Beranda
              </Link>
              <Link href="/tryout" className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-bold transition shadow-lg shadow-blue-900/20">
                Mulai Latihan (CAT)
              </Link>
              <Link href="#" className="hover:bg-slate-800 px-3 py-2 rounded-md text-sm font-medium transition text-slate-300">
                Masuk
              </Link>
            </div>
          </div>

          {/* MENU MOBILE (Icon Only) */}
          <div className="-mr-2 flex md:hidden">
            <button className="bg-slate-800 p-2 rounded-md text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}