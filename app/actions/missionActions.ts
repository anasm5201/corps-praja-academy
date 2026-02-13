"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function claimMissionReward(missionId: string) {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Ekstraksi ID secara aman dengan Type Casting (as any)
  // Ini mencegah error "session.user is possibly undefined"
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
      return { success: false, message: "Unauthorized: Silakan Login." };
  }

  try {
    // 1. Cek Misi
    const mission = await prisma.dailyMission.findUnique({
      where: { id: missionId },
    });

    // ✅ FIX: Gunakan variabel 'userId' yang sudah diamankan
    if (!mission || mission.userId !== userId) {
      return { success: false, message: "Misi tidak valid atau bukan milik Anda." };
    }

    if (mission.isCompleted) {
      return { success: false, message: "Misi sudah diklaim sebelumnya" };
    }

    // 2. Transaksi Database (Atomic)
    // - Tandai Misi Selesai
    // - Tambah XP User
    await prisma.$transaction([
      prisma.dailyMission.update({
        where: { id: missionId },
        data: { isCompleted: true },
      }),
      prisma.user.update({
        where: { id: userId }, // ✅ Gunakan userId yang aman
        data: { xp: { increment: mission.xpReward } },
      }),
    ]);

    revalidatePath("/dashboard");
    return { success: true, message: `+${mission.xpReward} XP` };

  } catch (error) {
    console.error("Claim Error:", error);
    return { success: false, message: "Gagal klaim reward" };
  }
}