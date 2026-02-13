import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, subDays } from "date-fns";

// KONFIGURASI TARGET FISIK (LAT) - BATAS AMAN
const TARGET_FISIK = {
  LARI: 2000,      // Meter (Minimal agar tidak merah)
  PUSHUP: 30,      // Reps
  PULLUP: 5,       // Reps
  SHUTTLE: 18.0    // Detik (Maksimal)
};

/**
 * 🚀 FUNGSI UTAMA: MENJAMIN ADANYA RENCANA MINGGUAN (VERSI JAR-LAT-SUH)
 * Menganalisa Otak (JAR), Otot (LAT), dan Mental (SUH) secara bersamaan.
 */
export async function ensureWeeklyPlan(userId: string) {
  // 1. Tentukan ID Minggu Ini
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const weekId = `${now.getFullYear()}-W${weekNumber}`;

  // 2. CEK STATUS: Apakah rencana minggu ini sudah ada?
  // Menggunakan findFirst agar lebih aman jika unique index belum ter-set sempurna
  const existingPlan = await prisma.weeklyPlan.findFirst({
    where: {
      userId,
      weekNumber: weekNumber // Menggunakan field weekNumber integer sesuai schema terakhir
    }
  });

  if (existingPlan) {
    return existingPlan; 
  }

  // 3. JIKA BELUM ADA -> JALANKAN OPERASI INTELIJEN GABUNGAN
  console.log(`🧠 AI JAR-LAT-SUH: Generasi Rencana Mingguan Kadet ${userId}...`);
  
  const startDate = subDays(now, 7); // Data 7 hari terakhir
  
  // =================================================================
  // A. INTELIJEN JAR (AKADEMIK) - DRILL & TRYOUT
  // =================================================================
  const drills = await prisma.drillHistory.findMany({
    where: { userId, createdAt: { gte: startDate } },
    include: { drillUnit: { include: { questions: true } } }
  });

  const tryouts = await prisma.tryoutAttempt.findMany({
    where: { userId, startedAt: { gte: startDate }, isFinished: true },
    include: { package: { include: { questions: true } } }
  });

  // Map untuk menyimpan skor rata-rata per kategori
  const weaknessMap = new Map<string, { totalScore: number, count: number, category: "JAR" | "LAT" | "SUH" }>();

  const recordStat = (name: string, score: number, category: "JAR" | "LAT" | "SUH") => {
    if (!name) return;
    const current = weaknessMap.get(name) || { totalScore: 0, count: 0, category };
    current.totalScore += score;
    current.count += 1;
    weaknessMap.set(name, current);
  };

  // Proses Data Akademik
  drills.forEach(d => {
    d.drillUnit.questions.forEach(q => {
      if (q.subCategory) recordStat(q.subCategory, d.score, "JAR");
    });
  });

  tryouts.forEach(t => {
    // Penyerdehanaan: Skor Tryout dipukul rata ke semua soal di dalamnya
    const normalizedScore = Math.min(100, (t.score / 500) * 100); 
    t.package.questions.forEach(q => {
      if (q.subCategory) recordStat(q.subCategory, normalizedScore, "JAR");
    });
  });

  // =================================================================
  // B. INTELIJEN LAT (JASMANI) - SAMAPTA LOG
  // =================================================================
  const physicalLogs = await prisma.physicalLog.findMany({
    where: { userId, createdAt: { gte: startDate } },
    orderBy: { createdAt: 'desc' }
  });

  if (physicalLogs.length > 0) {
    // Ambil log terakhir untuk cek kondisi terkini
    const latest = physicalLogs[0];

    // Cek Lari (Endurance)
    if (latest.lariMeter < TARGET_FISIK.LARI) {
      recordStat("FISIK_LARI_INTERVAL", 40, "LAT"); // Nilai 40 = PRIORITAS TINGGI
    }
    // Cek Pushup (Upper Body)
    if (latest.pushUp < TARGET_FISIK.PUSHUP) {
      recordStat("FISIK_PUSH_UP", 45, "LAT");
    }
    // Cek Pullup (Back)
    if (latest.pullUp < TARGET_FISIK.PULLUP) {
      recordStat("FISIK_PULL_UP", 45, "LAT");
    }
    // Cek Shuttle (Agility)
    if (latest.shuttleRun > TARGET_FISIK.SHUTTLE) {
      recordStat("FISIK_KELINCAHAN", 50, "LAT");
    }
  } else {
    // ⚠️ BAHAYA: TIDAK PERNAH LATIHAN FISIK MINGGU INI
    recordStat("DISIPLIN_SAMAPTA", 20, "SUH"); // Nilai 20 = SUPER PRIORITAS
  }

  // =================================================================
  // C. INTELIJEN SUH (MENTAL/DISIPLIN) - USER ACTIVITY
  // =================================================================
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // Jika XP rendah minggu ini (Kadet Malas)
  if (user && user.xp < 500) {
    recordStat("DISIPLIN_LOGIN", 30, "SUH");
  }

  // =================================================================
  // 5. PENENTUAN STRATEGI (SORTING)
  // =================================================================
  const ranking = Array.from(weaknessMap.entries()).map(([name, data]) => ({
    focus: name,
    avgScore: data.totalScore / data.count,
    category: data.category
  }));

  // Urutkan dari skor TERENDAH (Makin rendah skor, makin butuh diperbaiki)
  ranking.sort((a, b) => a.avgScore - b.avgScore);

  // Ambil 3 Kelemahan Utama
  let topWeaknesses = ranking.slice(0, 3).map(r => r.focus);

  // FAILSAFE: Jika data kosong total (User Baru)
  if (topWeaknesses.length === 0) {
    topWeaknesses = ["PEMAHAMAN_MATERI", "LARI_JOGGING", "ADAPTASI_SISTEM"]; 
  }

  // =================================================================
  // 6. EKSEKUSI (SIMPAN RENCANA)
  // =================================================================
  const newPlan = await prisma.weeklyPlan.create({
    data: {
      userId,
      weekNumber, // Integer
      // Simpan fokus area sebagai JSON string
      focusAreas: JSON.stringify(topWeaknesses),      
      status: "ACTIVE"
    }
  });

  return newPlan;
}

// --- HELPER: MENGHITUNG NOMOR MINGGU ---
function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
}