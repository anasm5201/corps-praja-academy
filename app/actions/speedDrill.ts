'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

// --- LOGIKA LEVELING CORPS PRAJA ---
const getLevelFromXP = (xp: number) => {
  return Math.floor(xp / 1000) + 1;
};

const getRankName = (level: number) => {
  if (level >= 20) return "Jenderal Kehormatan";
  if (level >= 15) return "Komandan Utama";
  if (level >= 10) return "Kadet Wreda (Tingkat IV)";
  if (level >= 7) return "Kadet Madya (Tingkat III)";
  if (level >= 4) return "Kadet Dewasa (Tingkat II)";
  return "Kadet Pratama (Tingkat I)";
};

// 1. ACTION: AMBIL PETA OPERASI (MENU DRILL)
export async function getSpeedDrillMap() {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Ambil User ID dari Session
  const userId = (session?.user as any)?.id;

  // Jika belum login, kembalikan array kosong atau handle error di UI
  if (!userId) return [];

  // Gunakan 'drillUnit' dan relasi 'history'
  const units = await prisma.drillUnit.findMany({
    orderBy: { unitNumber: 'asc' },
    include: {
      history: { // ✅ Sesuai schema DrillUnit -> history
        where: { userId: userId },
      },
    },
  });

  // Transformasi Data untuk UI
  return units.map((unit) => {
    const progress = unit.history[0]; // Ambil history pertama (karena relation array)
    
    // Logika Status Default
    let status: 'LOCKED' | 'ACTIVE' | 'COMPLETED' = 'LOCKED';
    
    // Unit 1 selalu terbuka
    if (unit.unitNumber === 1 && !progress) status = 'ACTIVE';
    
    if (progress) {
      if (progress.isUnlocked) status = 'ACTIVE';
      if (progress.stars > 0) status = 'COMPLETED';
    }

    return {
      id: unit.unitNumber,
      dbId: unit.id,
      title: unit.title,
      description: unit.description || 'Latihan Refleks Taktis',
      status: status,
      stars: progress?.stars || 0,
    };
  });
}

// 2. ACTION: AMBIL DATA MISI (SOAL)
export async function getMissionData(unitNumber: number) {
  // ✅ Gunakan 'drillUnit'
  const unit = await prisma.drillUnit.findFirst({
    where: { unitNumber: unitNumber },
    include: {
      questions: true // ✅ Tidak perlu include options lagi (karena sudah JSON string)
    }
  });

  if (!unit) return null;

  return {
    ...unit,
    questions: unit.questions
  };
}

// 3. ACTION: LAPOR HASIL (SUBMIT & LEVEL UP)
export async function submitMissionResult(unitNumber: number, score: number, stars: number) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const currentUnit = await prisma.drillUnit.findFirst({
      where: { unitNumber: unitNumber }
    });

    if (!currentUnit) throw new Error("Unit not found");

    // A. Simpan Progress Unit (Gunakan 'drillHistory')
    // Kita gunakan upsert dengan composite key (userId + drillUnitId)
    await prisma.drillHistory.upsert({
      where: {
        userId_drillUnitId: { // ✅ Sesuai @@unique di schema DrillHistory
          userId: userId,
          drillUnitId: currentUnit.id
        }
      },
      update: {
        stars: { set: stars }, // Bisa dibuat logika max(stars, oldStars) jika perlu
        bestScore: { set: score }, // Sama, bisa max(score, oldScore)
        isUnlocked: true
      },
      create: {
        userId: userId,
        drillUnitId: currentUnit.id,
        stars: stars,
        bestScore: score,
        isUnlocked: true
      }
    });

    // B. Buka Unit Selanjutnya
    const nextUnit = await prisma.drillUnit.findFirst({
      where: { unitNumber: unitNumber + 1 }
    });

    if (nextUnit) {
      await prisma.drillHistory.upsert({
        where: { 
            userId_drillUnitId: { userId: userId, drillUnitId: nextUnit.id } 
        },
        update: { isUnlocked: true },
        create: {
          userId: userId,
          drillUnitId: nextUnit.id,
          isUnlocked: true,
          stars: 0,
          bestScore: 0
        }
      });
    }

    // C. UPDATE USER STATS (XP & LEVELING)
    const currentUser = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { xp: true, level: true } 
    });

    let newLevel = 1;
    let newRank = "Kadet Pratama";
    let isLevelUp = false;

    if (currentUser) {
        const newXP = currentUser.xp + score;
        newLevel = getLevelFromXP(newXP);
        newRank = getRankName(newLevel);
        isLevelUp = newLevel > currentUser.level;

        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: newXP,
                level: newLevel,
                rank: newRank,
                // Pastikan field ini ada di User schema, atau hapus jika belum ada
                // latStats: { increment: 1 } 
            }
        });
    }

    revalidatePath('/tryout/speed-drill');
    return { success: true, levelUp: isLevelUp, newRank: newRank };

  } catch (error) {
    console.error("Gagal Lapor Misi:", error);
    return { success: false, error: "Gagal menyimpan data ke markas." };
  }
}