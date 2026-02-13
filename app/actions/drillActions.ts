"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 🔥 PENTING: Nama fungsi ini harus 'submitDrillScore' agar DrillEngine.tsx tidak error
export async function submitDrillScore(
  drillId: string, 
  score: number, 
  correctCount: number
) {
  const session = await getServerSession(authOptions);
  
  // Bypass ID Check
  const userId = (session?.user as any)?.id;

  if (!userId) {
      return { success: false, error: "Unauthorized" };
  }

  try {
    // Logika Bintang (Bisa disesuaikan)
    // Asumsi: Score adalah persentase atau nilai 0-100
    let stars = 0;
    if (score >= 80) stars = 3;
    else if (score >= 60) stars = 2;
    else if (score >= 40) stars = 1;

    // Simpan ke DrillHistory (Upsert)
    await prisma.drillHistory.upsert({
      where: {
        userId_drillUnitId: {
          userId: userId,
          drillUnitId: drillId,
        },
      },
      update: {
        // Hanya update jika skor baru lebih tinggi (High Score)
        // Atau update nilai terakhir (tergantung kebijakan)
        // Di sini kita update nilai terakhir
        stars: stars,
        bestScore: score, 
        correctCount: correctCount, // Pastikan field ini ada di schema
        isUnlocked: true,
      },
      create: {
        userId: userId,
        drillUnitId: drillId,
        stars: stars,
        bestScore: score,
        correctCount: correctCount,
        isUnlocked: true,
      },
    });

    revalidatePath("/dashboard/psychology/drill"); // Sesuaikan path dashboard Anda
    
    return { success: true, stars, score };

  } catch (error) {
    console.error("Gagal Submit Drill:", error);
    return { success: false, error: "Gagal menyimpan progress." };
  }
}