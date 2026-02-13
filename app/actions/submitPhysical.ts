"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getScoreLari, getScorePullUp, getScorePushUp, getScoreSitUp, getScoreShuttleRun, calculateFinalSamapta } from "@/lib/samapta-logic";

interface PhysicalData {
  runDistance: number; // Meter
  pullUp: number;
  pushUp: number;
  sitUp: number;
  shuttleRun: number; // Detik
}

export async function submitPhysicalLog(data: PhysicalData) {
  const session = await getServerSession(authOptions);

  // ✅ FIX 1: Bypass Validasi ID (Type Casting)
  const userId = (session?.user as any)?.id;

  if (!userId) {
      return { success: false, message: "Unauthorized: Silakan Login." }; // Return object konsisten
  }

  try {
    // 1. Simpan Log Fisik Baru
    // ✅ FIX 2: Mapping field sesuai Schema PhysicalLog yang sudah dibuat
    const scores = {
      lari: getScoreLari(data.runDistance),
      pull: getScorePullUp(data.pullUp),
      push: getScorePushUp(data.pushUp),
      sit: getScoreSitUp(data.sitUp),
      shuttle: getScoreShuttleRun(data.shuttleRun)
    };
    
    const resultAnalysis = calculateFinalSamapta(scores);
    await prisma.physicalLog.create({
      data: {
        userId: userId,
        lariMeter: data.runDistance,
        pullUp: data.pullUp,
        pushUp: data.pushUp,
        sitUp: data.sitUp,
        shuttleRun: data.shuttleRun,
        totalScore: resultAnalysis.finalScore, // Skor Resmi Polri
        aiFeedback: `Status: ${resultAnalysis.status}. Tetap berlatih!`,
      }
    });

    // 2. Update Profile (Baseline Terakhir)
    // ⚠️ PERINGATAN LOGISTIK: Model 'UserProfile' belum terdaftar di Schema.prisma.
    // Bagian ini saya nonaktifkan sementara agar BUILD SUKSES. 
    // Jika Anda ingin mengaktifkannya, pastikan buat model UserProfile dulu.
    /*
    await prisma.userProfile.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        baseRunDistance: data.runDistance,
        basePullUp: data.pullUp,
        basePushUp: data.pushUp,
        baseSitUp: data.sitUp
      },
      update: {
        baseRunDistance: data.runDistance,
        basePullUp: data.pullUp,
        basePushUp: data.pushUp,
        baseSitUp: data.sitUp,
        updatedAt: new Date()
      }
    });
    */

    // 3. AUTO-COMPLETE MISI HARIAN (Logic SUH)
    // Cek apakah ada misi aktif hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ✅ FIX 3: Gunakan userId yang aman & Kategori sesuai Schema (FISIK)
    const activeMission = await prisma.dailyMission.findFirst({
      where: {
        userId: userId,
        category: "FISIK", // Gunakan "FISIK" sesuai data sebelumnya (atau "LAT")
        isCompleted: false,
        createdAt: { gte: today, lt: tomorrow }
      }
    });

    let missionMessage = "";
    
    if (activeMission) {
      // Tandai Selesai & Beri XP
      await prisma.$transaction([
        prisma.dailyMission.update({
          where: { id: activeMission.id },
          data: { isCompleted: true }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: activeMission.xpReward } }
        })
      ]);
      missionMessage = ` | Misi "${activeMission.title}" Selesai! (+${activeMission.xpReward} XP)`;
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Laporan Jasmani Diterima." + missionMessage };

  } catch (error) {
    console.error("Physical Submit Error:", error);
    // Kembalikan format object yang konsisten (success: boolean)
    return { success: false, message: "Gagal menyimpan laporan." };
  }
}