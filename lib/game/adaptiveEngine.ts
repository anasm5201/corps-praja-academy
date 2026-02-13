import { prisma } from "@/lib/prisma";

export async function generateAdaptiveMissions(userId: string) {
  // 1. CEK APAKAH SUDAH ADA MISI HARI INI?
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.dailyMission.findMany({
    where: { userId, createdAt: { gte: today, lt: tomorrow } }
  });

  if (existing.length > 0) return existing; // Sudah ada, jangan generate lagi

  // 2. TARIK DATA INTELIJEN KADET
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      skdAttempts: { orderBy: { createdAt: 'desc' }, take: 5 },     // Data JAR
      psychAttempts: { orderBy: { createdAt: 'desc' }, take: 5 },   // Data JAR (Psikologi)
      physicalLogs: { orderBy: { date: 'desc' }, take: 1 }          // Data LAT
    }
  });

  if (!user) return [];

  const missions = [];
  const examDate = user.profile?.examDate || new Date(new Date().getFullYear(), 11, 31);
  const daysToExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // ============================================================
  // LOGIKA 1: DIAGNOSA JAR (AKADEMIK)
  // ============================================================
  
  // Skenario A: User Baru (Belum ada data Tryout)
  if (user.skdAttempts.length === 0) {
      missions.push({
          userId, category: "JAR",
          title: "DIAGNOSTIC TEST: SKD",
          description: "Data kemampuan Anda kosong. Lakukan tes pemetaan awal sekarang.",
          xpReward: 500,
          actionUrl: "/dashboard/tryout/free-diagnostic",
          expiresAt: tomorrow
      });
  } 
  // Skenario B: User Aktif (Analisa Kelemahan)
  else {
      // Hitung Rata-rata Parsial
      let avgTWK = 0, avgTIU = 0, avgTKP = 0;
      user.skdAttempts.forEach(att => {
          avgTWK += att.scoreTWK; avgTIU += att.scoreTIU; avgTKP += att.scoreTKP;
      });
      avgTWK /= user.skdAttempts.length;
      avgTIU /= user.skdAttempts.length;

      // Logic "Suntikan Vitamin" (Drilling Kelemahan)
      if (avgTIU < 80) { // Ambang batas TIU aman
          missions.push({
              userId, category: "JAR",
              title: "DRILL LOGIKA & NUMERIK",
              description: `Rata-rata TIU Anda (${Math.round(avgTIU)}) masih di zona bahaya. Kerjakan 1 Paket Numerik.`,
              xpReward: 200,
              actionUrl: "/dashboard/psychology/kecerdasan_02", // Arahkan ke Numerik
              expiresAt: tomorrow
          });
      } else {
          // Jika TIU aman, maintain performa umum
          missions.push({
              userId, category: "JAR",
              title: "MAINTENANCE: PAKET CAMPURAN",
              description: "Jaga performa otak Anda tetap panas.",
              xpReward: 150,
              actionUrl: "/dashboard/psychology/kecerdasan_03", // Arahkan ke Figural
              expiresAt: tomorrow
          });
      }
  }

  // ============================================================
  // LOGIKA 2: DIAGNOSA LAT (FISIK)
  // ============================================================
  
  const lastPhys = user.physicalLogs[0];
  
  // Skenario A: Belum pernah input data fisik
  if (!lastPhys) {
      missions.push({
          userId, category: "LAT",
          title: "INPUT DATA AWAL JASMANI",
          description: "Kami butuh data Lari 12 menit Anda untuk menyusun program.",
          xpReward: 300,
          actionUrl: "/dashboard/physical/input",
          expiresAt: tomorrow
      });
  } 
  // Skenario B: Evaluasi Fisik
  else {
      // Target Lari Polri: 3200m (Ideal) - 2500m (Batas Bawah)
      if (lastPhys.runDistance < 2500) {
          missions.push({
              userId, category: "LAT",
              title: "INTERVAL RUNNING: SPEED",
              description: `Lari terakhir ${lastPhys.runDistance}m. Tingkatkan VO2Max dengan lari interval.`,
              xpReward: 250,
              actionUrl: "/dashboard/physical",
              expiresAt: tomorrow
          });
      } else {
          missions.push({
              userId, category: "LAT",
              title: "STRENGTH: PUSH-UP & PULL-UP",
              description: "Fokus pembentukan otot tubuh bagian atas hari ini.",
              xpReward: 200,
              actionUrl: "/dashboard/physical",
              expiresAt: tomorrow
          });
      }
  }

  // ============================================================
  // LOGIKA 3: DIAGNOSA SUH (MENTAL & DISIPLIN)
  // ============================================================
  
  // Misi Wajib: Review Kesalahan (Belajar dari kegagalan)
  missions.push({
      userId, category: "SUH",
      title: "INTROSPEKSI DIRI (REVIEW)",
      description: "Cek kembali soal yang salah pada Tryout terakhir. Jangan ulangi kesalahan.",
      xpReward: 100,
      actionUrl: "/dashboard/history",
      expiresAt: tomorrow
  });

  // 3. EKSEKUSI PENYIMPANAN KE DATABASE
  await prisma.dailyMission.createMany({ data: missions });

  return missions;
}