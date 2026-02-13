"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 🔥 PENTING: Nama fungsi diganti menjadi 'submitDrillResult' sesuai permintaan DrillCore.tsx
export async function submitDrillResult(
  unitId: string, 
  score: number, 
  stars: number
) {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Bypass ID Check
  const userId = (session?.user as any)?.id;

  if (!userId) {
      return { success: false, error: "Unauthorized" };
  }

  try {
    // Simpan ke DrillHistory
    // Gunakan UPSERT: Update jika ada, Buat baru jika tidak
    await prisma.drillHistory.upsert({
      where: {
        userId_drillUnitId: {
          userId: userId,
          drillUnitId: unitId,
        },
      },
      update: {
        // Update bestScore & stars jika capaian baru lebih baik
        // Atau kita timpa saja progress terakhir (sesuai kebijakan Komandan)
        stars: stars,
        bestScore: score, 
        isUnlocked: true,
      },
      create: {
        userId: userId,
        drillUnitId: unitId,
        stars: stars,
        bestScore: score,
        isUnlocked: true,
      },
    });

    // Revalidate halaman agar UI terupdate
    revalidatePath("/dashboard/speed-drill"); 
    
    return { success: true };

  } catch (error) {
    console.error("Gagal Submit Drill:", error);
    return { success: false, error: "Gagal menyimpan progress." };
  }
}