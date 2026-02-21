'use server'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function completeDailyDrill(blueprintId: string, dayIndex: number) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return { success: false, message: "Akses ditolak." };

    // 1. Validasi Brankas
    const blueprint = await prisma.weeklyBlueprint.findUnique({
      where: { id: blueprintId, userId: userId }
    });

    if (!blueprint) return { success: false, message: "Blueprint tidak ditemukan." };

    let drills = [];
    try { drills = JSON.parse(blueprint.dailyDrills); } 
    catch (e) { return { success: false, message: "Data drill korup." }; }

    // 2. Cegah kecurangan (Double Submit)
    if (!drills[dayIndex]) return { success: false, message: "Drill tidak valid." };
    if (drills[dayIndex].isCompleted) return { success: false, message: "Drill sudah diselesaikan sebelumnya." };

    // 3. Tandai Selesai
    drills[dayIndex].isCompleted = true;

    // 4. Hitung Tunjangan Keringat (XP Reward)
    // Fisik (LAT) lebih melelahkan, beri 150 XP. Sisanya 100 XP.
    const category = drills[dayIndex].category || "UMUM";
    const xpReward = category === "LAT" ? 150 : 100;

    // 5. Eksekusi Mutlak (Update 2 Tabel Sekaligus via Transaction)
    await prisma.$transaction([
      prisma.weeklyBlueprint.update({
        where: { id: blueprintId },
        data: { dailyDrills: JSON.stringify(drills) }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: xpReward } }
      })
    ]);

    // 6. Refresh Data Otomatis
    revalidatePath("/dashboard");
    return { success: true, message: `Laporan diterima! +${xpReward} XP`, xp: xpReward };

  } catch (error) {
    console.error("[COMPLETE DRILL ERROR]", error);
    return { success: false, message: "Gagal memproses laporan." };
  }
}