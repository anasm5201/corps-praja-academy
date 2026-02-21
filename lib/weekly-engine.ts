import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

// Inisialisasi OpenAI - Memakai amunisi yang sudah siap di Vercel Komandan
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function ensureWeeklyPlan(userId: string) {
  // =========================================================================
  // 1. PROTOKOL RE-GENERATE & PENENTUAN WAKTU
  // =========================================================================
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Senin

  // ⚠️ [FORCE REFRESH] Menghapus blueprint lama agar Kadet langsung menerima Doktrin TRI TUNGGAL TERPUSAT
  await prisma.weeklyBlueprint.deleteMany({ where: { userId: userId } });

  let currentPlan = await prisma.weeklyBlueprint.findFirst({
    where: { userId, createdAt: { gte: startOfWeek } }
  });

  if (currentPlan) return currentPlan;

  // =========================================================================
  // 2. EKSTRAKSI INTELIJEN KADET (DATA DRIVEN)
  // =========================================================================
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skdAttempts: { orderBy: { createdAt: 'desc' }, take: 1 },
      physicalLogs: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  if (!user) return null;

  const latestTryout = user.skdAttempts[0] || null;
  const latestPhysical = user.physicalLogs[0] || null;

  const twk = latestTryout?.twkScore || user.initialTwkScore || 0;
  const tiu = latestTryout?.tiuScore || user.initialTiuScore || 0;
  const tkp = latestTryout?.tkpScore || user.initialTkpScore || 0;
  const fisik = latestPhysical ? Math.round(latestPhysical.totalScore) : 0;

  // =========================================================================
  // 3. BRAIN PROMPT: DOKTRIN TRI TUNGGAL TERPUSAT (ELITE COACHING)
  // =========================================================================
  const systemPrompt = `
Anda adalah PELATIH KEPALA di Akademi Digital Persiapan Kedinasan & CPNS.
Tugas: Rancang "Tactical Blueprint" 7 hari dengan Doktrin TRI TUNGGAL TERPUSAT.

DATA KADET: TWK:${twk}, TIU:${tiu}, TKP:${tkp}, FISIK:${fisik}.

GUARDRAILS (HARUS DIPATUHI):
1. DILARANG menyarankan tes menggambar/psikotes proyektif. Fokus pada Sikap Kerja CAT.
2. Gunakan istilah universal: "Sikap Kerja", "Kematangan Mental", "Integritas". HAPUS kata "Polri".
3. Bahasa tegas, militeristik, profesional (Command Directive).
4. Output WAJIB JSON valid.

DOKTRIN TRI TUNGGAL TERPUSAT (STRUKTUR HARIAN):
Setiap hari HARUS mencakup 3 Matra dalam siklus 24 jam:
- "tahap1": [LAT - PAGI] Jasmani spesifik (Contoh: Interval lari, Push-up repetisi).
- "tahap2": [JAR - SIANG] Deep Work Akademik 90 Menit (Active Recall/Pemetaan Logika).
- "tahap3": [SUH - MALAM] Mental & Sikap Kerja 30 Menit (Simulasi, Evaluasi, Tidur 22:00).
`;

  let aiFocusAreas = "PENYELARASAN TRI TUNGGAL";
  let aiEvaluationText = "Kadet, laksanakan instruksi harian dengan disiplin tanpa celah!";
  let aiDailyDrills = [];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Mesin cerdas, cepat, dan efisien
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    aiFocusAreas = parsed.focusAreas || aiFocusAreas;
    aiEvaluationText = parsed.evaluationText || aiEvaluationText;
    aiDailyDrills = parsed.dailyDrills || [];
  } catch (error) {
    console.error("⚠️ AI Gagal, mengaktifkan Protokol Cadangan:", error);
    // FALLBACK: Jaminan sistem tetap muncul meskipun API Down
    aiDailyDrills = Array.from({ length: 7 }).map((_, i) => ({
      title: `HARI ${i + 1}: OPERASI TRI TUNGGAL`,
      duration: "180 Menit",
      tahap1: "[LAT - PAGI] Lari Aerobik 30 Menit & Penguatan Otot Inti (Push-up/Plank).",
      tahap2: "[JAR - SIANG] Deep Work 90 Menit: Bedah materi akademik tersulit berdasarkan data.",
      tahap3: "[SUH - MALAM] Kalibrasi Sikap Kerja & Refleksi Jurnal. Istirahat total jam 22:00."
    }));
  }

  // =========================================================================
  // 4. PENYIMPANAN DATA
  // =========================================================================
  return await prisma.weeklyBlueprint.create({
    data: {
      userId,
      focusAreas: aiFocusAreas,
      evaluationText: aiEvaluationText,
      dailyDrills: JSON.stringify(aiDailyDrills),
      isCompleted: false
    }
  });
}