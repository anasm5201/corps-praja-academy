'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

export async function submitDailyLog(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  // 🛠️ FIX TYPE ERROR: Menggunakan casting (as any) untuk memaksa TS membaca ID
  if (!session || !(session.user as any).id) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = (session.user as any).id;
  
  // Ambil Data Checklist
  const morningCall = formData.get('morningCall') === 'on';
  const worship = formData.get('worship') === 'on';
  const cleanliness = formData.get('cleanliness') === 'on';
  const study = formData.get('study') === 'on';
  const nightCall = formData.get('nightCall') === 'on';
  const notes = formData.get('notes') as string;

  // Hitung Skor Harian (Masing-masing poin bernilai 20)
  let dailyScore = 0;
  if (morningCall) dailyScore += 20;
  if (worship) dailyScore += 20;
  if (cleanliness) dailyScore += 20;
  if (study) dailyScore += 20;
  if (nightCall) dailyScore += 20;

  try {
    // 1. Simpan Log Harian
    await prisma.dailyLog.create({
      data: {
        userId,
        morningCall, worship, cleanliness, study, nightCall,
        notes,
        score: dailyScore
      }
    });

    // 2. Update Rata-rata Nilai SUH User & Tambah XP
    // Kita ambil semua log user untuk hitung rata-rata
    const allLogs = await prisma.dailyLog.findMany({
        where: { userId },
        select: { score: true }
    });
    
    const averageSuh = Math.round(
        allLogs.reduce((acc, log) => acc + log.score, 0) / allLogs.length
    );

    // Update User Profile (SUH Stats + XP Bonus)
    await prisma.user.update({
        where: { id: userId },
        data: {
            suhStats: averageSuh, // Update Radar SUH
            xp: { increment: dailyScore } // Bonus XP sesuai kedisiplinan
        }
    });

    revalidatePath('/dashboard');
    return { success: true, score: dailyScore };

  } catch (error) {
    console.error("Gagal Lapor Harian:", error);
    return { success: false, error: "Gagal menyimpan laporan." };
  }
}