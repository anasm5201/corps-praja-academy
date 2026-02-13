"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- HELPER: CEK KENAIKAN PANGKAT (GAMIFIKASI) ---
async function checkRankUp(userId: string, currentXp: number, addedXp: number) {
    const newXp = currentXp + addedXp;
    const newLevel = Math.floor(newXp / 1000) + 1; // Level 1 (0-999), Level 2 (1000-1999)
    
    let newRank = "ROOKIE"; // Default
    if (newLevel >= 20) newRank = "LIEUTENANT"; // Perwira
    else if (newLevel >= 10) newRank = "SERGEANT"; // Bintara
    else if (newLevel >= 5) newRank = "CORPORAL"; // Tamtama Kepala
    else if (newLevel >= 2) newRank = "PRIVATE"; // Prajurit

    await prisma.user.update({
        where: { id: userId },
        data: { xp: newXp, level: newLevel, rank: newRank }
    });
}

// --- 1. ACTION: UPDATE PROFIL FISIK (BASELINE) ---
export async function updatePhysicalProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    throw new Error("Anda harus login untuk mengakses fitur ini!");
  }

  // Tangkap Data
  const height = parseFloat(formData.get("height") as string) || 0;
  const weight = parseFloat(formData.get("weight") as string) || 0;
  const runDistance = parseInt(formData.get("runDistance") as string) || 0;
  const pushUpReps = parseInt(formData.get("pushUpReps") as string) || 0;
  
  // Hitung BMI
  const heightM = height / 100;
  const bmi = height > 0 ? weight / (heightM * heightM) : 0;

  try {
    // Update Profil Fisik Utama
    await prisma.physicalProfile.upsert({
      where: { userId: session.user.id },
      update: { 
        height, weight, bmi, 
        targetRun: runDistance + 200, 
        targetPushUp: pushUpReps + 5 
      },
      create: {
        userId: session.user.id, height, weight, bmi,
        targetRun: 3000, targetPushUp: 40, 
      }
    });

    // Simpan Assessment Awal
    await prisma.physicalAssessment.create({
      data: {
        userId: session.user.id,
        runDistance,
        pushUpReps,
        sitUpReps: 0, 
        pullUpReps: 0,
        shuttleRunSecs: 0,
        totalScore: 0, // Belum dihitung detail di baseline
        isBaseline: true 
      },
    });

    revalidatePath("/dashboard/physical");

  } catch (error: any) {
    console.error("Gagal update fisik:", error);
    throw new Error("Gagal menyimpan data fisik.");
  }
  
  redirect("/dashboard/physical");
}

// --- 2. ACTION: LAPORAN HARIAN (SUH - KARAKTER) ---
export async function submitDailyReport(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return { error: "Unauthorized" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: "User not found" };

    // Ambil Data Checklist
    const wokeUpOnTime = formData.get("wokeUpOnTime") === "on";
    const worshipDone = formData.get("worshipDone") === "on";
    const fisikDone = formData.get("fisikDone") === "on";
    const akademikDone = formData.get("akademikDone") === "on";

    // Cek Log Hari Ini
    const existingLog = await prisma.dailyLog.findFirst({
      where: { userId: session.user.id, date: { gte: today } }
    });

    // Hitung Progress XP
    const tasksNow = [wokeUpOnTime, worshipDone, fisikDone, akademikDone];
    const completedNow = tasksNow.filter(Boolean).length;
    
    let completedBefore = 0;
    if (existingLog) {
        const tasksBefore = [existingLog.wokeUpOnTime, existingLog.worshipDone, existingLog.fisikDone, existingLog.akademikDone];
        completedBefore = tasksBefore.filter(Boolean).length;
    }

    const xpDiff = (completedNow - completedBefore) * 50; // +50 XP per tugas selesai

    // Simpan Database
    if (existingLog) {
      await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: { wokeUpOnTime, worshipDone, fisikDone, akademikDone }
      });
    } else {
      await prisma.dailyLog.create({
        data: {
          userId: session.user.id,
          date: new Date(),
          wokeUpOnTime, worshipDone, fisikDone, akademikDone,
          targetFisik: "Lakukan Tes Awal", // Fallback
          targetAkademik: "Lakukan Tryout Awal"
        }
      });
    }

    // Update Rank
    if (xpDiff !== 0) {
        await checkRankUp(user.id, user.xp, xpDiff);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/character");
    return { success: true };

  } catch (error: any) {
    console.error("Gagal lapor harian:", error);
    return { error: "Gagal menyimpan laporan." }; 
  }
}

// --- 3. ACTION: SUBMIT UJIAN (JAR - AKADEMIK) ---
export async function submitExam(missionId: string, answers: Record<string, number>) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return { error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: "User not found" };

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: { questions: true }
    });

    if (!mission) return { error: "Misi tidak ditemukan" };

    let totalScore = 0;
    let twkScore = 0;
    let tiuScore = 0;
    let tkpScore = 0;

    mission.questions.forEach((q) => {
      const userAnsIdx = answers[q.id];
      if (userAnsIdx !== undefined) {
        // Logika Nilai TKP (1-5 Poin)
        if (q.type === "TKP" && q.tkpPoints) {
          const points = q.tkpPoints.split(",").map(Number);
          const scoreGot = points[userAnsIdx] || 0;
          tkpScore += scoreGot;
          totalScore += scoreGot;
        } 
        // Logika Nilai TWK & TIU (Benar 5, Salah 0)
        else {
          if (userAnsIdx === q.correctIdx) {
            const points = 5;
            if (q.type === "TWK") twkScore += points;
            if (q.type === "TIU") tiuScore += points;
            totalScore += points;
          }
        }
      }
    });

    // Passing Grade 2024: TWK 65, TIU 80, TKP 166 (Total Min 311 jika lulus semua PG)
    const passed = twkScore >= 65 && tiuScore >= 80 && tkpScore >= 166;
    
    const attempt = await prisma.examAttempt.create({
      data: {
        userId: session.user.id,
        missionId: missionId,
        score: totalScore,
        passed: passed,
        twkScore, tiuScore, tkpScore,
        details: JSON.stringify(answers),
      }
    });

    // Reward XP: 10% dari Skor Ujian
    const xpReward = Math.floor(totalScore / 5); 
    await checkRankUp(user.id, user.xp, xpReward);

    revalidatePath("/dashboard");
    return { success: true, score: totalScore, xp: xpReward, attemptId: attempt.id, passed };

  } catch (error) {
    console.error("Gagal submit ujian:", error);
    return { error: "Gagal memproses nilai." };
  }
}
export async function toggleDailyLog(field: string) {
  try {
      // Contoh: await prisma.dailyLog.update({ ... })
      console.log(`Mengubah status log harian untuk field: ${field}`);
      
      return { success: true };
  } catch (error) {
      console.error("Gagal update daily log", error);
      throw new Error("Gagal update log");
  }
}

// --- 4. ACTION: OPERASI SAMAPTA (LAT - FISIK) ---
export async function submitPhysicalAssessment(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, message: "Unauthorized" };

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "User Missing" };

  // 1. Ambil Data dari Form
  const runDistance = parseInt(formData.get("runDistance") as string) || 0;
  const pullUp = parseInt(formData.get("pullUp") as string) || 0;
  const sitUp = parseInt(formData.get("sitUp") as string) || 0;
  const pushUp = parseInt(formData.get("pushUp") as string) || 0;
  const shuttleRun = parseFloat(formData.get("shuttleRun") as string) || 0;

  // 2. Hitung Skor Samapta (Simulasi Sederhana)
  // Skor Lari (A): Target 3200m = 100
  const scoreA = Math.min(100, Math.max(0, (runDistance - 1200) / 20)); 
  
  // Skor Item B (Rata-rata)
  const scorePull = Math.min(100, pullUp * 5); // Target 20
  const scoreSit = Math.min(100, sitUp * 2.5); // Target 40
  const scorePush = Math.min(100, pushUp * 2.5); // Target 40
  // Shuttle Run: Target 16.2s (makin kecil makin bagus)
  const scoreShuttle = shuttleRun > 0 ? Math.min(100, Math.max(0, 100 - (shuttleRun - 16.2) * 10)) : 0;

  const scoreB = (scorePull + scoreSit + scorePush + scoreShuttle) / 4;
  const totalScore = Math.round((scoreA + scoreB) / 2);

  // 3. Simpan ke Database
  await prisma.physicalAssessment.create({
    data: {
      userId,
      date: new Date(),
      runDistance,
      pullUpReps: pullUp,
      sitUpReps: sitUp,
      pushUpReps: pushUp,
      shuttleRunSecs: shuttleRun,
      totalScore
    }
  });

  // 4. Reward XP (+150 XP per latihan fisik)
  await checkRankUp(user.id, user.xp, 150);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/physical");
  
  return { success: true, score: totalScore };
}