import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function ensureWeeklyPlan(userId: string) {
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

  // 1. PROTOKOL PEMBERSIHAN (PASTIKAN JADWAL LAMA MUSNAH)
  await prisma.weeklyBlueprint.deleteMany({ where: { userId } });

  // 2. AMBIL DATA KADET
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skdAttempts: { orderBy: { createdAt: 'desc' }, take: 1 },
      physicalLogs: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  if (!user) return null;

  // 3. INSTRUKSI DOKTRIN TRI TUNGGAL TERPUSAT
  const systemPrompt = `Anda adalah ELITE COACH. Rancang jadwal 7 hari (Senin-Minggu) DOKTRIN TRI TUNGGAL TERPUSAT. 
  Setiap hari wajib 3 tahap: [LAT - PAGI] (Fisik Spesifik), [JAR - SIANG] (Deep Work Akademik 90 Menit), [SUH - MALAM] (Sikap Kerja/Mental). 
  Gunakan bahasa militer, profesional, tanpa kata 'Polri'. Output WAJIB JSON.`;

  let aiFocus = "PENYELARASAN TRI TUNGGAL";
  let aiEval = "Laksanakan instruksi TRI TUNGGAL TERPUSAT dengan disiplin baja!";
  let aiDrills = [];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Menggunakan model paling stabil untuk menjamin eksekusi
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    aiFocus = parsed.focusAreas || aiFocus;
    aiEval = parsed.evaluationText || aiEval;
    aiDrills = parsed.dailyDrills || [];
  } catch (error) {
    console.error("AI Sabotage Detected, activating fallback:", error);
    // FALLBACK: JAMINAN 100% PAPAN MISI MUNCUL
    aiDrills = [
      { title: "HARI 1: SENIN (OPS KETAHANAN)", tahap1: "[LAT - PAGI] Lari Interval 400m x 5 Set. Istirahat 1 menit.", tahap2: "[JAR - SIANG] Deep Work 90 Menit: Bedah materi TIU Analitis & Pemetaan Logika.", tahap3: "[SUH - MALAM] Kalibrasi Sikap Kerja & Refleksi Jurnal. Tidur 22:00." },
      { title: "HARI 2: SELASA (OPS AKADEMIK)", tahap1: "[LAT - PAGI] Penguatan Otot Inti (Push-up & Plank) 3 Set.", tahap2: "[JAR - SIANG] Deep Work 90 Menit: Pendalaman TWK Nasionalisme & Integritas.", tahap3: "[SUH - MALAM] Simulasi Kepribadian Kedinasan & Tidur 22:00." },
      { title: "HARI 3: RABU (OPS MENTAL)", tahap1: "[LAT - PAGI] Lari Aerobik (Zone 2) 30 Menit Konsisten.", tahap2: "[JAR - SIANG] Deep Work 90 Menit: Speed Drill TIU Numerik & Berhitung.", tahap3: "[SUH - MALAM] Evaluasi Etika Kerja & Jurnal Kedisiplinan. Tidur 22:00." },
      { title: "HARI 4: KAMIS (OPS TAKTIS)", tahap1: "[LAT - PAGI] Latihan Ketangkasan (Pull-up/Sit-up) Repetisi Maksimal.", tahap2: "[JAR - SIANG] Deep Work 90 Menit: Analisa Soal Cerita TIU & Pola Gambar.", tahap3: "[SUH - MALAM] Kalibrasi Respon Stress & Manajemen Emosi. Tidur 22:00." },
      { title: "HARI 5: JUMAT (OPS INTEGRASI)", tahap1: "[LAT - PAGI] Fartlek Training 20 Menit (Variasi Kecepatan).", tahap2: "[JAR - SIANG] Deep Work 90 Menit: Review Materi TWK Pilar Negara & UUD.", tahap3: "[SUH - MALAM] Simulasi Sikap Profesional Kedinasan. Tidur 22:00." },
      { title: "HARI 6: SABTU (OPS EVALUASI)", tahap1: "[LAT - PAGI] Jalan Cepat/Jogging Ringan 45 Menit (Recovery).", tahap2: "[JAR - SIANG] Deep Work 90 Menit: Simulasi CAT SKD Mini (60 Soal).", tahap3: "[SUH - MALAM] Review Hasil Mingguan & Strategi Perbaikan. Tidur 22:00." },
      { title: "HARI 7: MINGGU (OPS RECOVERY)", tahap1: "[LAT - PAGI] Peregangan Statis & Mobilitas Sendi (Full Body).", tahap2: "[JAR - SIANG] Membaca Ringkas Literatur Wawasan Kebangsaan (30 Menit).", tahap3: "[SUH - MALAM] Ibadah, Persiapan Mental & Logistik Senin. Tidur 21:00." }
    ];
  }

 // 4. SIMPAN KE DATABASE
 return await prisma.weeklyBlueprint.create({
  data: {
    userId,
    focusAreas: aiFocus,
    evaluationText: aiEval,
    dailyDrills: JSON.stringify(aiDrills)
    // BARIS isCompleted: false TELAH DIHAPUS DARI SINI
  }
});
}