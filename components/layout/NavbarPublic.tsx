"use client";

import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function NavbarPublic() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <Shield size={24} fill="currentColor" />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter text-white">
                CORPS <span className="text-red-600">PRAJA</span>
            </span>
        </div>

        {/* MENU DESKTOP */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <Link href="#fitur" className="hover:text-white transition">Fitur</Link>
            <Link href="#metode" className="hover:text-white transition">Metode Trinity</Link>
            <Link href="#pricing" className="hover:text-white transition">Akses Premium</Link>
        </div>

        {/* CTA BUTTON */}
        <div className="flex gap-4">
            <Link href="/login" className="px-6 py-2 rounded-full border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition">
                Masuk
            </Link>
            <Link href="/register" className="px-6 py-2 rounded-full bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                Daftar Sekarang <ArrowRight size={14}/>
            </Link>
        </div>

      </div>
    </nav>
  );
}