"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const KEY_MAP = ["A", "B", "C", "D", "E"];

export async function submitExam(attemptId: string, userAnswers: Record<string, number>) {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX 1: Bypass Validasi ID (Type Casting)
  const userId = (session?.user as any)?.id;

  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // [PERBAIKAN] Ambil Data Attempt + Paket + Soal
    const attempt = await prisma.tryoutAttempt.findUnique({
      where: { id: attemptId },
      include: { 
        package: { 
            // Pastikan ini mengambil 'questions' (TryoutQuestion)
            include: { questions: true } 
        } 
      }
    });

    if (!attempt) return { success: false, error: "Data operasi kadaluarsa." };
    if (!attempt.package) return { success: false, error: "Paket soal tidak ditemukan." };

    // Validasi Pemilik Attempt
    if (attempt.userId !== userId) {
        return { success: false, error: "Akses ilegal terdeteksi." };
    }

    const questions = attempt.package.questions;
    
    // --- KALKULASI SKOR ---
    // Gunakan tipe any untuk stats agar fleksibel terhadap kategori
    let stats: Record<string, any> = {
        TWK: { score: 0, correct: 0, wrong: 0, empty: 0, total: 0, passing: 65 },
        TIU: { score: 0, correct: 0, wrong: 0, empty: 0, total: 0, passing: 80 },
        TKP: { score: 0, correct: 0, wrong: 0, empty: 0, total: 0, passing: 166 },
    };

    let totalScore = 0;

    questions.forEach((q) => {
        const userIdx = userAnswers[q.id];
        const userKey = userIdx !== undefined ? KEY_MAP[userIdx] : null;
        
        // Deteksi Kategori (Default TWK jika aneh-aneh)
        let cat = (q.type || "TWK").toUpperCase();
        if (!["TWK", "TIU", "TKP"].includes(cat)) cat = "TWK";
        
        const target = stats[cat];
        target.total++;

        // Logika Penilaian
        if (userKey === null || userKey === undefined) {
            target.empty++;
        } else if (userKey === q.correctAnswer) {
            target.correct++;
            
            // ✅ FIX 2: Gunakan skor dari database (q.score) jika ada, default 5
            const point = q.score || 5; 
            target.score += point;
            totalScore += point;
        } else {
            target.wrong++;
            // Jika ada sistem minus, tambahkan di sini
        }
    });

    // Cek Status Lulus (Passing Grade SKD)
    const isPassed = 
        stats.TWK.score >= stats.TWK.passing &&
        stats.TIU.score >= stats.TIU.passing &&
        stats.TKP.score >= stats.TKP.passing;

    // Simpan Hasil ke Database
    await prisma.tryoutAttempt.update({
        where: { id: attemptId },
        data: {
            score: totalScore,
            answers: JSON.stringify(userAnswers),
            isFinished: true,
            finishedAt: new Date(),
        }
    });

    // XP Reward
    if (totalScore > 0) {
        await prisma.user.update({
            // ✅ FIX 3: Gunakan variabel 'userId' yang aman
            where: { id: userId }, 
            data: { xp: { increment: isPassed ? 150 : 50 } }
        });
    }

    revalidatePath("/dashboard/tryout");
    // Return data lengkap untuk ditampilkan di halaman hasil (Result Page)
    return { success: true, attemptId, score: totalScore, isPassed };

  } catch (error) {
    console.error("SUBMIT ERROR:", error);
    return { success: false, error: "Gagal menyimpan laporan. Koneksi database bermasalah." };
  }
}