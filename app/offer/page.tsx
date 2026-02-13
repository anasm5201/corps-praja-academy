import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OfferCard from "./OfferCard";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OfferPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  // Ini memastikan kita tidak mengakses properti 'id' dari undefined
  const userId = (session?.user as any)?.id;

  // 2. QUERY DATABASE (Safe Mode)
  // Hanya jalankan query jika userId ada
  const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
      // Pastikan relasi 'purchases' atau 'transactions' ada di schema Anda.
      // Jika ragu, hapus baris include ini agar build tetap jalan.
      // include: { purchases: true } 
  }) : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white py-20 px-4 font-sans selection:bg-blue-600">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-900/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <ShieldCheck size={12} /> Official Pricing
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
                PILIH <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">SENJATA</span> ANDA
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
                Investasi terbaik untuk masa depan karir kedinasan. Materi terupdate, sistem CAT standar BKN, dan analisa AI.
            </p>
        </div>

        {/* Grid Offers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* PAKET 1: BASIC */}
            <OfferCard 
                title="REKRUT"
                price="GRATIS"
                period="SELAMANYA"
                variant="basic"
                features={[
                    "Akses Dashboard Basic",
                    "1x Tryout SKD Gratis",
                    "Akses Terbatas Bank Soal",
                    "Komunitas Telegram"
                ]}
                ctaLabel="DAFTAR SEKARANG"
                ctaLink={session ? "/dashboard" : "/auth/register"}
            />

            {/* PAKET 2: PRO (POPULAR) */}
            <OfferCard 
                title="KOMANDAN"
                price="Rp 99rb"
                period="/ BULAN"
                variant="pro"
                isPopular={true}
                features={[
                    "Akses 50+ Paket Tryout SKD",
                    "Full Pembahasan & Analisa",
                    "Drill Kecermatan & Psikologi",
                    "Ranking Nasional Real-time",
                    "Download Soal PDF"
                ]}
                ctaLabel="UPGRADE SEKARANG"
                ctaLink="/dashboard/subscription"
            />

            {/* PAKET 3: ELITE */}
            <OfferCard 
                title="JENDERAL"
                price="Rp 249rb"
                period="LIFETIME"
                variant="elite"
                features={[
                    "Semua Fitur Paket Komandan",
                    "Masa Aktif Selamanya (Lifetime)",
                    "Grup Mentoring Eksklusif",
                    "Prioritas Support 24/7",
                    "Garansi Update Soal 2024"
                ]}
                ctaLabel="AMBIL LIFETIME"
                ctaLink="/dashboard/subscription"
            />
        </div>

        <div className="mt-20 text-center border-t border-white/5 pt-10">
            <p className="text-gray-600 text-xs font-mono uppercase tracking-widest">
                *Pembayaran aman & terverifikasi otomatis melalui Payment Gateway.
            </p>
        </div>

      </div>
    </div>
  );
}