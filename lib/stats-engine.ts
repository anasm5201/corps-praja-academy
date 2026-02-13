import { prisma } from "@/lib/prisma";

export async function getUserStats(userId: string) {
  // 1. AMBIL DATA MENTAH
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skdAttempts: { where: { isFinished: true } }, // Data Tryout
      speedProgress: { where: { isCompleted: true } }, // Data Speed Drill
      physicalLogs: { orderBy: { createdAt: 'desc' }, take: 5 } // Data Fisik (Ambil 5 terakhir)
    }
  });

  if (!user) return { jar: 0, lat: 0, suh: 0, hp: 100 };

  // --- A. HITUNG KOMPONEN JAR (PENGAJARAN) ---
  // Sumber: Nilai Tryout SKD (Skala 550) dikonversi ke Skala 100
  let jarScore = 0;
  if (user.skdAttempts.length > 0) {
    const totalSkd = user.skdAttempts.reduce((acc, curr) => acc + curr.score, 0);
    const avgSkd = totalSkd / user.skdAttempts.length;
    // Asumsi: Max skor SKD = 550.
    // Rumus: (Rata-rata / 550) * 100
    jarScore = Math.round((avgSkd / 550) * 100);
  }

  // --- B. HITUNG KOMPONEN LAT (PELATIHAN) ---
  // Sumber: Speed Drill (Skor Game) + Misi Harian (XP Activity)
  let latScore = 0;
  if (user.speedProgress.length > 0) {
    // Speed Drill punya skor variatif. Kita ambil rata-rata skor mereka.
    // Anggap target skor per unit adalah 100 poin.
    const totalSpeed = user.speedProgress.reduce((acc, curr) => acc + curr.score, 0);
    const avgSpeed = totalSpeed / user.speedProgress.length;
    // Cap di 100
    latScore = Math.min(100, Math.round(avgSpeed)); 
  } else {
    latScore = 10; // Nilai dasar jika belum pernah latihan
  }

  // --- C. HITUNG KOMPONEN SUH (PENGASUHAN / SAMAPTA) ---
  // Sumber: Input Lari 12 Menit, Pushup, Situp.
  // Jika belum ada fitur input, kita ambil default atau nilai dari user profile
  let suhScore = user.suhStats || 50; 
  
  // LOGIKA CANGGIH: Jika ada log fisik, hitung rata-rata nilai samapta
  if (user.physicalLogs.length > 0) {
      const totalFisik = user.physicalLogs.reduce((acc, curr) => acc + curr.totalScore, 0);
      suhScore = Math.round(totalFisik / user.physicalLogs.length);
  }

  // --- D. HITUNG HEALTH POINT (KONDISI) ---
  // Logika: Jarang latihan = HP Turun. Rajin Misi = HP Naik.
  // Untuk sekarang kita set statis atau ambil dari DB
  let hp = 100;

  return {
    jar: jarScore,
    lat: latScore,
    suh: suhScore,
    hp: hp
  };
}