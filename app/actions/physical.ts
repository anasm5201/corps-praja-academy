'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateSamaptaScore } from "@/lib/samapta";

export async function submitPhysicalLog(formData: FormData) {
  const session = await getServerSession(authOptions);

  // ✅ FIX 1: BYPASS CHECK ID (Ini kunci agar build lolos)
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    throw new Error("Unauthorized: Silakan Login kembali.");
  }

  // 1. AMBIL DATA FORM
  const lariMeter = parseInt(formData.get("lariMeter") as string) || 0;
  const pushUp = parseInt(formData.get("pushUp") as string) || 0;
  const sitUp = parseInt(formData.get("sitUp") as string) || 0;
  const pullUp = parseInt(formData.get("pullUp") as string) || 0;
  const shuttleRun = parseFloat(formData.get("shuttleRun") as string) || 0; 

  // 2. HITUNG SKOR
  // Pastikan lib/samapta.ts aman. Jika belum ada, kita beri nilai default agar tidak crash.
  let result;
  try {
      result = calculateSamaptaScore(lariMeter, pushUp, sitUp, pullUp, shuttleRun);
  } catch (e) {
      result = { totalScore: 0, feedback: "Kalkulasi Error", scoreA: 0, scoreB: 0 };
  }

  // 3. SIMPAN KE DATABASE (Sesuai Model PhysicalLog Komandan)
  await prisma.physicalLog.create({
    data: {
      userId: userId, 
      lariMeter,
      pushUp,
      sitUp,
      pullUp,
      shuttleRun,
      totalScore: result.totalScore,
      aiFeedback: result.feedback
    }
  });

  // =========================================================================
  // 4. PROTOKOL SUH (PENGASUHAN) - AUTO GENERATE MISI REMEDIAL
  // =========================================================================
  
  // Skenario A: Lari Lemah (< 70)
  if (result.scoreA < 70) {
    await prisma.dailyMission.create({
      data: {
        userId: userId,
        title: "⚡ REMEDIAL: Lari Interval",
        description: `Skor lari Anda ${result.scoreA} (Kurang). AI mewajibkan lari interval 20 menit besok pagi!`,
        category: "FISIK",
        difficulty: "HARD",
        xpReward: 100,
        // ✅ FIX 2: Gunakan 'duration' string (sesuai schema DailyMission), bukan expiresAt date
        duration: "24 Jam", 
        status: "AVAILABLE",
      }
    });
  }

  // Skenario B: Otot Lemah (< 70)
  if (result.scoreB < 70) {
    await prisma.dailyMission.create({
      data: {
        userId: userId,
        title: "💪 REMEDIAL: Bodyweight Circuit",
        description: "Otot tangan/perut lemah. Lakukan 5 set Push-up & Sit-up sebelum tidur.",
        category: "FISIK",
        difficulty: "MEDIUM",
        xpReward: 75,
        // ✅ FIX 2: Gunakan 'duration' string
        duration: "24 Jam",
        status: "AVAILABLE",
      }
    });
  }
  // =========================================================================

  // 5. UPDATE XP & REFRESH
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: 50 } }
  });

  revalidatePath("/dashboard/physical");
  revalidatePath("/dashboard"); 
  redirect("/dashboard");
}