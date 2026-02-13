'use server'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Tipe data yang dikirim oleh KecermatanEngine
type SubmitPayload = {
  packageId: string;
  answers: Record<string, string>;
  columnHistory?: number[]; 
  score: number; // KecermatanEngine sudah menghitung skor dasar
};

export async function submitPsychologyAttempt(payload: SubmitPayload) {
  try {
    // 1. Validasi Sesi
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return { success: false, message: "Akses ditolak: Silakan Login." };
    }

    // 2. Cek Paket
    const pkg = await prisma.psychologyPackage.findUnique({
      where: { id: payload.packageId }
    });

    if (!pkg) {
      return { success: false, message: "Paket tidak ditemukan." };
    }

    // 3. LOGIKA XP & DATA PREPARATION
    // Kita gabungkan data history ke dalam answers agar aman disimpan di kolom 'answers' (String/JSON)
    const finalAnswersData = {
        userAnswers: payload.answers,
        history: payload.columnHistory || [], // Simpan grafik di sini
        pkgType: pkg.type
    };

    let earnedXP = 0;
    
    // Logika Pemberian XP
    if (pkg.type.includes("KECERMATAN") || pkg.type.includes("LAT")) {
        const baseXP = Math.floor(payload.score / 2); 
        earnedXP = Math.max(10, baseXP);
    } else {
        // Standar (Skor + Bonus Selesai)
        earnedXP = payload.score + 10;
    }

    // 4. TRANSAKSI DATABASE (Simpan + Update XP)
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Simpan Attempt
      const attempt = await tx.psychologyAttempt.create({
        data: {
          userId: userId,
          packageId: payload.packageId,
          score: payload.score,
          // Simpan semua data (jawaban + history) sebagai JSON string
          answers: JSON.stringify(finalAnswersData), 
          
          // ✅ FIX: Hapus 'startedAt' & 'finishedAt' yang menyebabkan error
          // Prisma akan otomatis mengisi 'createdAt' jika ada di schema
        }
      });

      // B. Update XP User
      await tx.user.update({
        where: { id: userId },
        data: { xp: { increment: earnedXP } }
      });

      return attempt;
    });

    // 5. Refresh Cache
    revalidatePath("/dashboard/psychology");
    revalidatePath("/dashboard/history");

    return { 
        success: true, 
        attemptId: result.id,
        message: `Misi Selesai! +${earnedXP} XP`
    };

  } catch (error) {
    console.error("[SUBMIT PSYCHOLOGY ERROR]", error);
    return { success: false, message: "Gagal menyimpan data ke server." };
  }
}