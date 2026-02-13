import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import { Toaster } from "sonner"; 
import Providers from "@/components/Providers";
// 👇 IMPORT SISTEM ANIMASI HUD BARU
import { RewardProvider } from "@/context/RewardContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CPA - Corps Praja Academy",
  description: "Platform Latihan SKD Kedinasan & Sekolah Kedinasan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🔥 UBAH KE 'dark' AGAR HUD MENYALA SEMPURNA
    <html lang="id" className="dark">
      <body className={`${inter.className} bg-black text-slate-200 antialiased`}>
        
        {/* [1] PROVIDER UTAMA (AUTH DLL) */}
        <Providers>
            
            {/* [2] PROVIDER ANIMASI REWARD (HUD TAKTIS) */}
            <RewardProvider>
                {children}
                
                {/* Toaster untuk notifikasi kecil (Backup) */}
                <Toaster position="top-center" richColors theme="dark" />
            </RewardProvider>

        </Providers>
      </body>
    </html>
  );
}