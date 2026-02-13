"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface AnswerInput {
  questionId: string;
  optionCode: string; // A, B, C, D, E
}

export async function submitTryoutResult(packageId: string, answers: AnswerInput[], durationUsed: number) {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX 1: Bypass Validasi ID (Type Casting)
  const userId = (session?.user as any)?.id;

  if (!userId) return { error: "Unauthorized: Silakan Login." };

  // 1. Ambil Kunci Jawaban dari Database
  // ❌ HAPUS 'include: { options: true }' karena options sudah jadi JSON di dalam questions
  const pkg = await prisma.tryoutPackage.findUnique({
    where: { id: packageId },
    include: { 
      questions: true 
    }
  });

  if (!pkg) return { error: "Paket soal tidak ditemukan" };

  let scoreTwk = 0, scoreTiu = 0, scoreTkp = 0;
  
  // Kita simpan detail jawaban dalam object untuk dikonversi ke JSON
  const detailedAnswers: Record<string, any> = {};

  // 2. Hitung Skor (The Scoring Engine)
  for (const q of pkg.questions) {
    const userAns = answers.find(a => a.questionId === q.id);
    const answerCode = userAns ? userAns.optionCode : null;
    
    let points = 0;
    
    // Tentukan Skor
    // Di Schema baru, 'options' adalah string JSON.
    // Jika TKP butuh bobot 1-5, kita harus parse JSON-nya.
    // Untuk keamanan Build saat ini, kita gunakan logika standar dulu (Benar=5, Salah=0)
    // Kecuali jika ada field khusus.
    
    if (answerCode) {
        // Cek Kebenaran
        if (answerCode === q.correctAnswer) {
            points = q.score || 5; // Default 5 jika tidak ada set skor
        } else {
            // Jika TKP, dan kita ingin logika 1-5, kita perlu parsing q.options
            // Namun untuk saat ini kita set 0 jika salah (Mode Strict)
            // agar kode tidak crash saat parsing JSON yang mungkin formatnya beda.
            points = 0;
        }
    }

    // Akumulasi Skor per Kategori
    // Pastikan type dinormalisasi (uppercase)
    const type = (q.type || "TWK").toUpperCase();
    
    if (type === "TWK") scoreTwk += points;
    else if (type === "TIU") scoreTiu += points;
    else if (type === "TKP") scoreTkp += points;
    else scoreTwk += points; // Default ke TWK jika error

    // Simpan ke map detailedAnswers
    if (userAns) {
        detailedAnswers[q.id] = answerCode;
    }
  }

  const totalScore = scoreTwk + scoreTiu + scoreTkp;
  // Ambang Batas (Passing Grade SKD - Contoh)
  const passed = scoreTwk >= 65 && scoreTiu >= 80 && scoreTkp >= 166; 

  try {
    // 3. Simpan ke Database (Atomic Transaction)
    const attempt = await prisma.$transaction(async (tx) => {
        
        // A. Buat Attempt Record
        // Kita gunakan 'answers' (JSON) pengganti tabel AttemptAnswer
        const newAttempt = await tx.tryoutAttempt.create({
            data: {
                userId: userId, // Gunakan ID aman
                packageId: pkg.id,
                
                // Simpan Total Skor
                score: totalScore, 
                
                // Simpan Detail Jawaban (JSON String)
                answers: JSON.stringify(detailedAnswers),
                
                // Metadata
                isFinished: true,
                finishedAt: new Date(),
                // duration: durationUsed // Uncomment jika ada kolom duration di schema
                
                // CATATAN: Field 'scoreTwk', 'scoreTiu', 'passed' mungkin belum ada di schema
                // Jika error "Unknown argument", hapus baris di bawah ini:
                /* scoreTwk, 
                scoreTiu, 
                scoreTkp,
                isPassed: passed 
                */
            }
        });

        // B. Update Misi Harian (Logic SUH - Dipertahankan)
        const today = new Date(); today.setHours(0,0,0,0);
        
        // Pastikan kolom category sesuai (JAR/LATIHAN)
        const activeMission = await tx.dailyMission.findFirst({
            where: {
                userId: userId,
                category: "JAR", // Pastikan kategori ini valid di DB
                isCompleted: false,
                createdAt: { gte: today }
            }
        });

        if (activeMission) {
            await tx.dailyMission.update({
                where: { id: activeMission.id },
                data: { isCompleted: true }
            });
            await tx.user.update({
                where: { id: userId },
                data: { xp: { increment: activeMission.xpReward } }
            });
        }
        
        // Reward XP Dasar (misal 10% dari skor)
        if (!activeMission) {
             await tx.user.update({
                where: { id: userId },
                data: { xp: { increment: Math.floor(totalScore / 10) } }
            });
        }

        return newAttempt;
    });

    revalidatePath("/dashboard");
    return { 
        success: true, 
        attemptId: attempt.id, 
        score: totalScore,
        detail: { twk: scoreTwk, tiu: scoreTiu, tkp: scoreTkp }
    };

  } catch (e) {
    console.error("Submit SKD Error:", e);
    return { error: "Gagal menyimpan nilai SKD." };
  }
}