import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Memaksa Vercel agar tidak me-nge-cache halaman ini
export const dynamic = 'force-dynamic';

export default async function VIPAccessPage() {
  const session = await getServerSession(authOptions);
  
  // Amankan ID Anda
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <h1>AKSES DITOLAK: HARAP LOGIN TERLEBIH DAHULU.</h1>
      </div>
    );
  }

  // 💥 OPERASI PENYUNTIKAN DATABASE VERCEL SECARA PAKSA 💥
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: "ADMIN",
      subscriptionType: "INTENSIVE_SQUAD",
      subscriptionStatus: "ACTIVE"
    }
  });

  // Setelah disuntik, otomatis tendang Komandan kembali ke Markas Utama
  redirect("/dashboard");
}