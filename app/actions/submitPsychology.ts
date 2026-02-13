'use server'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { revalidatePath } from "next/cache";

interface SubmitPayload {
  packageId: string;
  columnHistory?: number[]; 
  totalMistakes?: number;
  answers?: Record<string, string>; 
  finalScore?: number; 
}

export async function submitPsychologyResult(payload: SubmitPayload) {
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ FIX UTAMA: Bypass Validasi TypeScript dengan (as any)
    // Kode lama Anda error di sini karena mengecek session.user.id secara langsung
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return { success: false, message: "Akses ditolak: Silakan Login." };
    }

    const pkg = await prisma.psychologyPackage.findUnique({
      where: { id: payload.packageId }
    });

    if (!pkg) {
      return { success: false, message: "Paket tidak ditemukan." };
    }

    let score = 0;
    let earnedXP = 0;
    
    // Gunakan 'any' untuk dbData agar fleksibel (menghindari error tipe ketat Prisma)
    let dbData: any = {
      userId: userId,
      packageId: payload.packageId,
    };

    // LOGIKA SKOR
    if (pkg.type === "PSIKOLOGI_KECERMATAN") {
      const history = payload.columnHistory || [];
      const mistakes = payload.totalMistakes || 0;
      score = history.reduce((a, b) => a + b, 0);
      
      // Rumus XP: (Skor x 2) - (Salah x 5). Minimal dapat 10 XP.
      earnedXP = Math.max(10, (score * 2) - (mistakes * 5));

      dbData.score = score;
      dbData.totalMistakes = mistakes;
      dbData.columnHistory = JSON.stringify(history);
    } else {
      score = payload.finalScore || 0;
      earnedXP = score + 10;
      dbData.score = score;
      dbData.answers = JSON.stringify(payload.answers || {});
    }

    // TRANSAKSI DATABASE (SIMPAN HASIL + UPDATE XP)
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Simpan Rekam Jejak (History)
      // Pastikan model PsychologyAttempt ada di schema.prisma
      const attempt = await tx.psychologyAttempt.create({
        data: dbData
      });

      // 2. UPDATE XP USER
      await tx.user.update({
        where: { id: userId },
        data: { xp: { increment: earnedXP } }
      });

      return attempt;
    });

    revalidatePath("/dashboard/psychology");
    revalidatePath("/dashboard");

    return { 
      success: true, 
      attemptId: result.id,
      earnedXP: earnedXP, 
      message: "Data tersimpan & XP bertambah."
    };

  } catch (error) {
    console.error("GAGAL SUBMIT:", error);
    return { success: false, message: "Gagal menyimpan data." };
  }
}