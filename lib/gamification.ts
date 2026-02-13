import { prisma } from '@/lib/prisma';

// 1. NOMENKLATUR RANK IPDN (TETAP) [cite: 2026-01-05]
export const RANKS = [
  { name: 'KADET PRATAMA', minXp: 0, color: 'text-gray-400' },   // Tingkat I
  { name: 'KADET MUDA', minXp: 5000, color: 'text-blue-400' },    // Tingkat II
  { name: 'KADET MADYA', minXp: 15000, color: 'text-orange-500' }, // Tingkat III
  { name: 'KADET UTAMA', minXp: 40000, color: 'text-red-600' }    // Tingkat IV (Wasana)
];

export const calculateLevel = (totalXp: number) => {
  // Peningkatan level yang lebih menantang sesuai standar IPDN
  return Math.floor(Math.sqrt(totalXp / 150)) + 1;
};

export const getRank = (totalXp: number) => {
  return [...RANKS].reverse().find(r => totalXp >= r.minXp) || RANKS[0];
};

// 2. LOGIKA APRESIASI BINTANG (STAR AWARDING LOGIC) [cite: 2026-01-05 085718]
// Dipanggil setiap kali Daily Log diverifikasi atau diupdate
export async function checkAndAwardStar(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) return;

  // Syarat: Skor SUH Sempurna (100)
  if (user.suhStats >= 100) {
    const newStreak = user.suhStreak + 1;

    // Update Streak Harian
    await prisma.user.update({
      where: { id: userId },
      data: { suhStreak: newStreak }
    });

    // Milestone: 30 Hari Berturut-turut [cite: 2026-01-05 085718]
    if (newStreak === 30) {
      await grantStar(
        userId, 
        'STAR_SUH_30', 
        'BINTANG BHAKTI PENGASUHAN', 
        'Tanda kehormatan tertinggi atas disiplin sempurna selama 30 hari berturut-turut.'
      );
    }
  } else {
    // Sanksi: Reset streak jika skor jatuh di bawah 100 (Disiplin putus)
    // "Nila setitik, rusak susu sebelanga"
    if (user.suhStreak > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { suhStreak: 0 }
      });
    }
  }
}

// Helper: Fungsi Penganugerahan Medali ke Database
async function grantStar(userId: string, code: string, name: string, desc: string) {
  // 1. Pastikan Definisi Achievement ada di Database
  const achievement = await prisma.achievement.upsert({
    where: { code },
    update: {},
    create: { 
      code, 
      name, 
      description: desc, 
      icon: 'Star' // Icon Lucide
    }
  });

  // 2. Cek apakah user sudah punya (hindari duplikat)
  const existingAward = await prisma.userAchievement.findFirst({
    where: { userId, achievementId: achievement.id }
  });

  // 3. Berikan penghargaan jika belum punya
  if (!existingAward) {
    await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id }
    });
    
    // Opsional: Tambahkan Bonus XP besar sebagai hadiah tambahan
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: 5000 } } // Bonus setara naik pangkat
    });
  }
}