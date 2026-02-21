import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

// Inisialisasi OpenAI - Memakai kunci yang sudah ada di Vercel Komandan
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function ensureWeeklyPlan(userId: string) {
  // =========================================================================
  // 1. CEK BLUEPRINT MINGGU INI & PROTOKOL RE-GENERATE
  // =========================================================================
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Senin

  // ⚠️ [HACK TAKTIS] Menghapus jadwal lama agar AI membuat yang baru dengan doktrin terbaru.
  await prisma.weeklyBlueprint.deleteMany({ where: { userId: userId } });

  let currentPlan = await prisma.weeklyBlueprint.findFirst({
    where: {
      userId: userId,
      createdAt: { gte: startOfWeek }
    }
  });

  if (currentPlan) return currentPlan;

  // =========================================================================
  // 2. KUMPULKAN DATA INTELIJEN KADET
  // =========================================================================
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skdAttempts: { orderBy: { createdAt: 'desc' }, take: 1 },
      physicalLogs: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

  if (!user) throw new Error("Data personel tidak ditemukan.");

  const latestTryout = user.skdAttempts[0] || null;
  const latestPhysical = user.physicalLogs[0] || null;

  const twk = latestTryout?.twkScore || user.initialTwkScore || 0;
  const tiu = latestTryout?.tiuScore || user.initialTiuScore || 0;
  const tkp = latestTryout?.tkpScore || user.initialTkpScore || 0;
  const fisik = latestPhysical ? Math.round(latestPhysical.totalScore) : 0;
  const currentXP = user.xp || 0;

  let trainingPhase = "FASE 1: ADAPTASI & PRA-KONDISI";
  if (currentXP > 1000) trainingPhase = "FASE 2: EKSKALASI & INTENSITAS TINGGI";
  if (currentXP > 5000) trainingPhase = "FASE 3: SIMULASI MEDAN TEMPUR (STRESS TEST)";

  // =========================================================================
  // 3. BRAIN PROMPT: DOKTRIN ELITE COACHING & TRI TUNGGAL TERPUSAT
  // =========================================================================
  const systemPrompt = `
Anda adalah PELATIH KEPALA (Elite Coach) profesional di Akademi Digital untuk persiapan CPNS dan Sekolah Kedinasan.
Tugas Anda merancang "Tactical Blueprint" (Jadwal Latihan 7 Hari) yang brutal, presisi, dan berbasis data untuk Kadet.

DATA KADET SAAT INI:
- Fase Latihan: ${trainingPhase}
- Nilai TWK: ${twk}/150, Nilai TIU: ${tiu}/175, Nilai TKP: ${tkp}/225, Nilai Jasmani (LAT): ${fisik}/100.

ATURAN MUTLAK (GUARDRAILS):
1. DILARANG KERAS menyarankan tes menggambar (Pohon/Wartegg) atau tes koran. Fokus pada simulasi pilihan ganda/CAT.
2. Dilarang menggunakan istilah spesifik instansi seperti "Polri/TNI". Gunakan istilah universal: "Sikap Kerja", "Kematangan Mental", atau "Integritas".
3. Bahasa tegas, militeristik, profesional (Command Directive).
4. Output HARUS murni JSON valid, tanpa teks markdown, tanpa backticks.

DOKTRIN "TRI TUNGGAL TERPUSAT":
Setiap hari wajib berisi 3 elemen (LAT, JAR, SUH) dalam siklus 24 jam:
- "tahap1": [LAT - PAGI] Latihan jasmani spesifik (Contoh: Interval lari 5 set, Push-up repetisi maksimal). Berikan metodenya secara profesional.
- "tahap2": [JAR - SIANG/SORE] Deep Work Akademik minimal 90 Menit. Gunakan teknik cerdas (Active Recall, Feynman, Pemetaan Logika). Fokus pada kelemahan nilai kadet.
- "tahap3": [SUH - MALAM] Latihan Mental/Sikap Kerja minimal 30 Menit. (Contoh: Simulasi Sikap Kerja di bawah tekanan, Kalibrasi Mental, Evaluasi Jurnal, Tidur 22:00).

FORMAT JSON:
{
  "focusAreas": "...",
  "evaluationText": "...",
  "dailyDrills": [
    {
      "title": "HARI 1: SENIN (...)",
      "duration": "180 Menit Total",
      "tahap1": "[LAT - PAGI] ...",
      "tahap2": "[JAR - SIANG] ...",
      "tahap3": "[SUH - MALAM] ..."
    }
  ]
}
`;

  // =========================================================================
  // 4. TEMBAKKAN KE OPENAI (MENGGUNAKAN GPT-4O / GPT-3.5-TURBO)
  // =========================================================================
  let aiFocusAreas = "PENYELARASAN AWAL";
  let aiEvaluationText = "Laksanakan perintah dengan disiplin tempur!";
  let aiDailyDrills = "[]";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Menggunakan model terbaru yang cepat dan cerdas
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" }, // Memastikan output JSON murni
      temperature: 0.7,
    });

    const parsedData = JSON.parse(response.choices[0].message.content || "{}");
    
    if (parsedData.focusAreas) aiFocusAreas = parsedData.focusAreas;
    if (parsedData.evaluationText) aiEvaluationText = parsedData.evaluationText;
    if (parsedData.dailyDrills) aiDailyDrills = JSON.stringify(parsedData.dailyDrills);

  } catch (error) {
    console.error("⚠️ [OPENAI FAILURE]:", error);
    // Fallback manual tetap disediakan sebagai pengaman
    const fallbackDrills = Array.from({ length: 7 }).map((_, i) => ({
      title: `HARI ${i + 1}: PROTOKOL DARURAT`,
      duration: "120 Menit",
      tahap1: "[LAT - PAGI] Kardio Dasar 30 Menit.",
      tahap2: "[JAR - SIANG] Deep Work 60 Menit Materi Lemah.",
      tahap3: "[SUH - MALAM] Kalibrasi Sikap Kerja & Tidur 22:00."
    }));
    aiDailyDrills = JSON.stringify(fallbackDrills);
  }

  // =========================================================================
  // 5. SIMPAN KE DATABASE
  // =========================================================================
  return await prisma.weeklyBlueprint.create({
    data: {
      userId,
      focusAreas: aiFocusAreas,
      evaluationText: aiEvaluationText,
      dailyDrills: aiDailyDrills,
      isCompleted: false
    }
  });
}