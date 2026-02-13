'use server'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- KONFIGURASI PASSING GRADE (PERMENPAN RB TERBARU) ---
const PASSING_GRADE = {
  TWK: 65,
  TIU: 80,
  TKP: 166
};

// Tipe Data Input dari Frontend (Sesuai ExamSimulator.tsx)
type AnswerInput = {
  questionId: string;
  answerCode: string;
};

// ✅ FIX: Signature fungsi disesuaikan dengan ExamSimulator.tsx
// Menerima attemptId (string) dan userAnswers (array)
export async function submitExam(attemptId: string, userAnswers: AnswerInput[]) {
  try {
    // 1. Validasi Sesi (Keamanan)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return { success: false, message: "Akses ditolak. Silakan login kembali." };
    }

    // 2. Ambil Data Attempt & Soal (Untuk Hitung Skor di Server)
    // Kita ambil attempt dulu untuk dapat packageId, lalu ambil soal-soalnya
    const attempt = await prisma.tryoutAttempt.findUnique({
      where: { id: attemptId },
      include: {
        package: {
          include: { questions: true } // Kita butuh kunci jawaban/skor dari soal
        }
      }
    });

    if (!attempt) {
      return { success: false, message: "Data ujian tidak ditemukan." };
    }

    if (attempt.isFinished) {
      return { success: false, message: "Ujian ini sudah diselesaikan sebelumnya." };
    }

    // 3. LOGIKA PENILAIAN (THE GRADING ENGINE)
    let totalScore = 0;
    let scoreTwk = 0;
    let scoreTiu = 0;
    let scoreTkp = 0;
    
    // Buat Map soal untuk akses cepat O(1)
    const questionMap = new Map(attempt.package.questions.map(q => [q.id, q]));

    // Loop jawaban user
    userAnswers.forEach((ans) => {
      const question = questionMap.get(ans.questionId);
      
      if (question) {
        let points = 0;
        let isCorrect = false; // Flag untuk tracking (opsional)

        // --- LOGIKA PENILAIAN ADAPTIF ---
        try {
            // Cek apakah options adalah JSON (untuk TKP/Bobot)
            // Asumsi: field options berisi JSON string seperti '[{"code":"A","score":5},...]'
            if (question.options && question.options.trim().startsWith("[")) {
                const parsedOptions = JSON.parse(question.options);
                const selectedOpt = parsedOptions.find((opt: any) => opt.code === ans.answerCode);
                
                if (selectedOpt) {
                    points = Number(selectedOpt.score) || 0;
                }
                // TKP biasanya tidak ada benar/salah mutlak (hanya poin besar/kecil)
                // Tapi untuk TWK/TIU yang pakai JSON, poin max dianggap benar
                isCorrect = points === 5; 
            } else {
                // Skema Klasik (TWK/TIU Simple)
                if (question.correctAnswer === ans.answerCode) {
                    points = question.score || 5; // Default 5 jika field score null
                    isCorrect = true;
                }
            }
        } catch (e) {
            // Fallback jika JSON parse error
            console.error(`Error parsing options Q: ${question.id}`, e);
            if (question.correctAnswer === ans.answerCode) {
                points = 5;
            }
        }

        // Akumulasi Skor per Kategori
        // Asumsi: question.type berisi 'TWK', 'TIU', atau 'TKP'
        // Jika tidak ada type, anggap TWK (default)
        const type = (question.type || "TWK").toUpperCase();
        
        if (type.includes('TWK')) scoreTwk += points;
        else if (type.includes('TIU')) scoreTiu += points;
        else if (type.includes('TKP')) scoreTkp += points;
        else totalScore += points; // Fallback umum
      }
    });

    // Hitung Total Akhir
    totalScore = scoreTwk + scoreTiu + scoreTkp;

    // 4. Update Database (Transaksi Atomic)
    await prisma.$transaction(async (tx) => {
      
      // A. Update Status Ujian
      await tx.tryoutAttempt.update({
        where: { id: attemptId },
        data: {
          isFinished: true,
          finishedAt: new Date(),
          score: totalScore,
          answers: JSON.stringify(userAnswers), // Simpan raw jawaban user
          // Jika schema Anda punya field scoreTwk, scoreTiu, scoreTkp, uncomment ini:
          /*
          scoreTwk,
          scoreTiu,
          scoreTkp,
          */
        }
      });

      // B. Update XP User (Gamification)
      // Rumus: XP = Skor Ujian + Bonus Selesai (50)
      const xpGained = Math.floor(totalScore / 10) + 50;

      await tx.user.update({
        where: { id: userId },
        data: { 
          xp: { increment: xpGained }
          // Jika ingin update stats JAR/LAT/SUH bisa di sini
        }
      });
    });

    // 5. Refresh Cache Halaman Terkait
    revalidatePath("/dashboard/history");
    revalidatePath(`/dashboard/result/${attempt.packageId}/${attemptId}`);

    return { success: true, message: "Ujian berhasil disubmit." };

  } catch (error) {
    console.error("[SUBMIT EXAM ERROR]", error);
    return { success: false, message: "Gagal menyimpan data ujian ke server." };
  }
}

// Export alias agar kompatibel jika ada yang memanggil 'submitTryout' (Optional)
export const submitTryout = submitExam;