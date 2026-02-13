import { prisma } from "@/lib/prisma";

export async function generateAdaptiveMissions(userId: string) {
  // 1. AMBIL DATA INTELIJEN KADET
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      skdAttempts: { orderBy: { createdAt: 'desc' }, take: 3 }, // 3 Tryout Terakhir
      psychAttempts: { orderBy: { createdAt: 'desc' }, take: 3 }, // 3 Psikologi Terakhir
      physicalLogs: { orderBy: { date: 'desc' }, take: 1 } // Kondisi Fisik Terakhir
    }
  });

  if (!user) return;

  const today = new Date();
  const examDate = user.profile?.examDate || new Date(today.getFullYear(), 11, 31); // Default Akhir Tahun jika belum set
  
  // Hitung Sisa Waktu (H-Hari)
  const daysToExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Tentukan Fase Latihan (Periodisasi)
  let phase = "FOUNDATION"; // Persiapan Umum
  if (daysToExam < 30) phase = "PEAKING"; // Genjot Habis (H-30)
  else if (daysToExam < 90) phase = "SPECIFIC"; // Fokus Kelemahan (H-90)

  const missions = [];

  // ==========================================
  // SEKTOR JAR (PENGAJARAN - OTAK)
  // ==========================================
  
  // Analisa Kelemahan SKD
  let weakMap = { twk: 0, tiu: 0, tkp: 0 };
  user.skdAttempts.forEach(att => {
      // Logika deteksi kelemahan (Mock logic)
      if (att.scoreTIU < 80) weakMap.tiu++;
      if (att.scoreTWK < 65) weakMap.twk++;
  });

  // Misi JAR Adaptif
  if (phase === "PEAKING") {
      // H-30: Fokus Simulasi Total
      missions.push({
          type: "JAR",
          title: "SIMULASI AKBAR SKD (CAT SYSTEM)",
          description: "Waktu menipis. Latih manajemen waktu sekarang!",
          xp: 500,
          actionUrl: "/dashboard/tryout/simulation"
      });
  } else {
      // Fase Normal: Perbaiki yang Rusak
      if (weakMap.tiu > weakMap.twk) {
          missions.push({
              type: "JAR",
              title: "DRILL INTENSIF: NUMERIK & LOGIKA",
              description: "Data menunjukkan nilai TIU Anda kritis. Perbaiki hari ini.",
              xp: 200,
              actionUrl: "/dashboard/materials/tiu"
          });
      } else {
          missions.push({
              type: "JAR",
              title: "HAFALAN & WAWASAN: MATERI TWK",
              description: "Perkuat pilar kebangsaan Anda.",
              xp: 200,
              actionUrl: "/dashboard/materials/twk"
          });
      }
  }

  // Analisa Psikologi (Kecermatan vs Kecerdasan)
  const lastPsych = user.psychAttempts[0];
  if (!lastPsych || lastPsych.totalScore < 60) {
       missions.push({
          type: "JAR",
          title: "ASAH KECERDASAN SPASIAL (FIGURAL)",
          description: "IQ Visual perlu dilatih rutin.",
          xp: 150,
          actionUrl: "/dashboard/psychology/kecerdasan_03" // Arahkan ke paket SVG kita
      });
  }

  // ==========================================
  // SEKTOR LAT (PELATIHAN - FISIK)
  // ==========================================
  
  // Cek Laporan Jasmani Terakhir
  const lastPhys = user.physicalLogs[0];
  const lariTarget = 3000; // Standar 3000m
  const currentLari = lastPhys?.runDistance || 0;

  if (currentLari < lariTarget) {
      missions.push({
          type: "LAT",
          title: "INTERVAL RUNNING 12 MENIT",
          description: `Target Anda: ${lariTarget}m. Capaian: ${currentLari}m. Kejar defisit!`,
          xp: 300,
          inputType: "PHYSICAL_LOG" // Minta input data baru
      });
  } else {
      missions.push({
          type: "LAT",
          title: "MAINTENANCE: PUSH-UP & PULL-UP",
          description: "Jaga tonus otot inti.",
          xp: 200,
          inputType: "PHYSICAL_LOG"
      });
  }

  // ==========================================
  // SEKTOR SUH (PENGASUHAN - MENTAL/DISIPLIN)
  // ==========================================
  
  // Misi Wajib Setiap Hari: Lapor Diri (Jurnal)
  missions.push({
      type: "SUH",
      title: "APEL MALAM DIGITAL (REFLEKSI)",
      description: "Isi jurnal harian. Apa yang sudah diperbaiki hari ini?",
      xp: 100,
      inputType: "DAILY_JOURNAL"
  });

  return missions;
}