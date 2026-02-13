import { prisma } from "@/lib/prisma";

export async function generateDailyQuest(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Cek apakah quest hari ini sudah ada?
  const existingLog = await prisma.dailyLog.findFirst({
    where: { userId, date: { gte: today } }
  });

  // PERBAIKAN: Jika log sudah ada DAN targetnya lengkap, return langsung.
  // Tapi jika ada log tapi target kosong (bug), kita lanjut ke bawah untuk RE-GENERATE.
  if (existingLog && existingLog.targetFisik && existingLog.targetAkademik) {
      return existingLog;
  }

  // 2. AMBIL DATA INTELEJENSI TERAKHIR (SINKRONISASI DATA)
  const physical = await prisma.physicalAssessment.findFirst({
    where: { userId }, orderBy: { date: 'desc' }
  });
  
  const exam = await prisma.examAttempt.findFirst({
    where: { userId }, orderBy: { completedAt: 'desc' },
    include: { mission: true }
  });

  // --- A. LOGIKA SINKRONISASI FISIK (LAT) ---
  let misiFisik = "Lakukan Tes Lari 12 Menit (Input Data Awal)"; // Default Mutlak
  const dayOfWeek = new Date().getDay(); // 0=Minggu, 1=Senin, dst.

  if (physical) {
      const run = physical.runDistance;
      
      // LEVEL 1: ROOKIE (Lari < 2000m) - Fokus Pondasi
      if (run < 2000) {
         if (dayOfWeek === 1 || dayOfWeek === 4) misiFisik = "Jogging Kontinu 30 Menit (Nafas Hidung)";
         else if (dayOfWeek === 2 || dayOfWeek === 5) misiFisik = "Circuit Training: Push/Sit/Pull (3 Set)";
         else if (dayOfWeek === 6) misiFisik = "Long Run 3KM (Pace Santai)";
         else misiFisik = "Rest / Stretching Aktif";
      } 
      // LEVEL 2: WARRIOR (Lari 2000m - 2800m) - Fokus Speed & Power
      else if (run < 2800) {
         if (dayOfWeek === 1) misiFisik = "Lari 12 Menit (Simulasi Tes)";
         else if (dayOfWeek === 4) misiFisik = "Lari Interval: Sprint 400m x 4 Reps";
         else if (dayOfWeek === 2 || dayOfWeek === 5) misiFisik = "Pyramid Push-Up & Pull-Up (Max Reps)";
         else if (dayOfWeek === 6) misiFisik = "Fartlek (Lari Variasi Speed) 20 Menit";
         else misiFisik = "Recovery Run 3KM";
      } 
      // LEVEL 3: ELITE (Lari > 2800m) - Maintenance
      else {
         if (dayOfWeek === 6) misiFisik = "Time Trial Samapta Lengkap (A+B)";
         else if (dayOfWeek === 1 || dayOfWeek === 4) misiFisik = "Maintenance Run 5KM + Sprint 100m";
         else misiFisik = "Calisthenics Weighted / Renang";
      }
  }

  // --- B. LOGIKA SINKRONISASI AKADEMIK (JAR) ---
  let misiAkademik = "Kerjakan 1x Tryout Diagnostik (Input Data)"; // Default Mutlak
  
  if (exam) {
      // Kasus 1: Lemah TWK (< 75)
      if (exam.twkScore < 75) {
          const topics = ["Pilar Negara", "Sejarah", "Integritas"];
          const randomTopic = topics[Math.floor(Math.random() * topics.length)];
          misiAkademik = `Pelajari Modul TWK: ${randomTopic}`;
      } 
      // Kasus 2: Lemah TIU (< 85)
      else if (exam.tiuScore < 85) {
          const topics = ["Silogisme", "Hitung Cepat", "Analitis"];
          const randomTopic = topics[Math.floor(Math.random() * topics.length)];
          misiAkademik = `Drilling 20 Soal TIU: ${randomTopic}`;
      } 
      // Kasus 3: Lemah TKP (< 166)
      else if (exam.tkpScore < 166) {
          misiAkademik = "Analisis Soal TKP: Jejaring Kerja & Pelayanan Publik";
      } 
      // Kasus 4: Sudah Bagus Semua (Maintenance)
      else {
          misiAkademik = "Kerjakan 1 Paket Soal HOTS (Level Insane)";
      }
  }

  // 3. Simpan atau Update Database
  if (existingLog) {
      // FIX BUG: Update log yang sudah ada tapi kosong targetnya
      return await prisma.dailyLog.update({
          where: { id: existingLog.id },
          data: { 
            targetFisik: misiFisik, 
            targetAkademik: misiAkademik 
          }
      });
  } else {
      // Buat Log Baru
      return await prisma.dailyLog.create({
        data: {
          userId,
          date: new Date(),
          targetFisik: misiFisik,
          targetAkademik: misiAkademik,
          // Status checklist default false (belum dikerjakan)
        }
      });
  }
}