'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardData() {
  const userId = "user_demo_id"; // Tetap gunakan agen dummy

  // 1. Ambil Data User Lengkap
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      // Hitung berapa unit speed drill yang sudah terbuka
      speedProgress: {
        where: { isUnlocked: true }
      }
    }
  });

  if (!user) return null;

  // 2. Hitung Statistik Tambahan
  // Rumus XP ke Level selanjutnya (Sederhana: Level * 1000)
  const nextLevelXP = user.level * 1000;
  const progressXP = (user.xp % 1000) / 1000 * 100; // Persentase bar XP
  
  // Hitung Progres Speed Drill
  // Total Unit ada 30 (Hardcode sementara atau fetch count)
  const totalSpeedUnits = 30; 
  const completedSpeedUnits = user.speedProgress.length; 
  const speedProgressPercent = (completedSpeedUnits / totalSpeedUnits) * 100;

  return {
    profile: {
      name: user.name,
      rank: user.rank || "Kadet Pratama",
      level: user.level,
      xp: user.xp,
      nextLevelXP,
      xpProgress: progressXP,
      hearts: 5, // Default sementara (karena field belum ada di DB)
    },
    academic: {
      speedDrill: {
        unlocked: completedSpeedUnits,
        total: totalSpeedUnits,
        percentage: speedProgressPercent
      },
      // Nanti ditambah Samapta dll
    }
  };
}