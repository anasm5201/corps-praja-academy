"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ✅ FUNGSI 1: MULAI UJIAN (Amunisi yang tadi hilang saat Build)
export async function startExam(packageId: string) {
  const session = await getServerSession(authOptions);
  
  // Validasi Session & ID
  if (!session || !session.user || !(session.user as any).id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Buat Attempt Baru di Database
    const attempt = await prisma.tryoutAttempt.create({
      data: {
        userId: (session.user as any).id,
        packageId: packageId,
        score: 0,
        isFinished: false,
        startedAt: new Date(),
        answers: "[]" // Inisialisasi array kosong
      }
    });

    return { success: true, attemptId: attempt.id };
  } catch (error) {
    console.error("Start Exam Error:", error);
    return { success: false, error: "Gagal memulai ujian." };
  }
}

// ✅ FUNGSI 2: AKHIRI UJIAN (Logic Canggih Komandan)
export async function submitExam(attemptId: string, answers: any[]) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, message: "Unauthorized" };

  try {
    // 1. Ambil Data Paket & Soal dari DB
    const attempt = await prisma.tryoutAttempt.findUnique({
        where: { id: attemptId },
        include: { package: { include: { questions: true } } }
    });

    if (!attempt) return { success: false, message: "Data attempt tidak ditemukan" };

    let totalScore = 0;
    const questions = attempt.package.questions;
    
    // Mapping jawaban user
    const userAnswersMap = new Map();
    answers.forEach(a => userAnswersMap.set(a.questionId, a.answerCode)); 

    // 2. HITUNG SKOR (SERVER SIDE CALCULATION)
    questions.forEach(q => {
        const userAnsCode = userAnswersMap.get(q.id);
        
        if (userAnsCode) {
            // Parse Opsi Jawaban dari String JSON
            let options = [];
            try {
                options = JSON.parse(q.options);
            } catch (e) {
                console.error("Gagal parse options untuk soal:", q.id);
            }

            // Cari Opsi yang dipilih user
            const selectedOpt = options.find((o: any) => (o.key === userAnsCode || o.code === userAnsCode));
            
            if (selectedOpt) {
                totalScore += (Number(selectedOpt.score) || 0);
            }
        }
    });

    // 3. UPDATE DB: SIMPAN SKOR & TANDAI SELESAI
    await prisma.tryoutAttempt.update({
      where: { id: attemptId },
      data: {
        answers: JSON.stringify(answers), // Simpan jawaban mentah
        score: totalScore,
        isFinished: true,   // <--- TRIGGER UTAMA
        finishedAt: new Date()
      },
    });

    // ============================================================
    // 🔥 FITUR BARU: AUTO-COMPLETE DAILY MISSION (INTEGRASI JENIUS)
    // ============================================================
    const today = new Date();
    today.setHours(0,0,0,0);

    const pendingMissions = await prisma.dailyMission.findMany({
        where: {
            userId: (session.user as any).id,
            isCompleted: false,
            category: "AKADEMIK", // Target: Misi Akademik
            createdAt: { gte: today }
        }
    });

    // Jika ada misi yang relevan, selesaikan otomatis!
    if (pendingMissions.length > 0) {
        for (const mission of pendingMissions) {
            // 1. Tandai Misi Selesai
            await prisma.dailyMission.update({
                where: { id: mission.id },
                data: { isCompleted: true }
            });
            
            // 2. Berikan Reward XP ke User
            await prisma.user.update({
                where: { id: (session.user as any).id },
                data: { xp: { increment: mission.xpReward } }
            });
        }
    }
    // ============================================================

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/tryout/result/${attemptId}`);
    
    return { success: true, score: totalScore };

  } catch (error) {
    console.error("Submit Error:", error);
    return { success: false, message: "Gagal menyimpan data ujian" };
  }
}