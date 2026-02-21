import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inisialisasi Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ [COMMANDER WARNING] GEMINI_API_KEY tidak ditemukan di .env");
}
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function ensureWeeklyPlan(userId: string) {
  // =========================================================================
  // 1. CEK BLUEPRINT MINGGU INI & PROTOKOL RE-GENERATE
  // =========================================================================
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Senin

  // ⚠️ [HACK TAKTIS UNTUK TESTING] 
  // Menghapus jadwal lama milik Kadet ini agar AI dipaksa membuat yang baru dengan doktrin terbaru.
  // Jika sistem sudah stabil dan berjalan di Production, HAPUS ATAU BERI KOMENTAR (//) PADA BARIS DI BAWAH INI.
  await prisma.weeklyBlueprint.deleteMany({ where: { userId: userId } });

  let currentPlan = await prisma.weeklyBlueprint.findFirst({
    where: {
      userId: userId,
      createdAt: { gte: startOfWeek }
    }
  });

  if (currentPlan) return currentPlan; // Jika sudah ada, lewati pembuatan baru

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

  // Penentuan "Fase Latihan" Jangka Panjang berdasarkan XP Kadet
  let trainingPhase = "FASE 1: ADAPTASI & PRA-KONDISI";
  if (currentXP > 1000) trainingPhase = "FASE 2: EKSKALASI & INTENSITAS TINGGI";
  if (currentXP > 5000) trainingPhase = "FASE 3: SIMULASI MEDAN TEMPUR (STRESS TEST)";

  // =========================================================================
  // 3. BRAIN PROMPT: DOKTRIN ELITE COACHING & TRI TUNGGAL TERPUSAT
  // =========================================================================
  const systemPrompt = `
Anda adalah PELATIH KEPALA (Elite Coach) di Akademi Digital untuk persiapan CPNS dan Sekolah Kedinasan.
Tugas Anda merancang "Tactical Blueprint" (Jadwal Latihan 7 Hari) yang brutal, presisi, dan berbasis data untuk Kadet.

DATA KADET SAAT INI:
- Fase Latihan: ${trainingPhase}
- Nilai TWK: ${twk}/150 (Standar aman: 65)
- Nilai TIU: ${tiu}/175 (Standar aman: 80)
- Nilai TKP (Sikap Kerja/Kepribadian): ${tkp}/225 (Standar aman: 166)
- Nilai Jasmani (LAT): ${fisik}/100 (Standar aman: 65)

ATURAN MUTLAK (GUARDRAILS) - JIKA DILANGGAR SISTEM AKAN HANCUR:
1. DILARANG KERAS menyarankan tes menggambar (Pohon/Orang/Wartegg) atau tes koran. Tes psikologi di platform ini murni simulasi pilihan ganda/CAT (Kecerdasan, Kepribadian, Sikap Kerja).
2. Dilarang menggunakan istilah spesifik instansi seperti "Psikologi Polri" atau "TNI". Gunakan istilah universal: "Sikap Kerja", "Kematangan Mental", "Integritas", atau "Tes Kepribadian Kedinasan".
3. Bahasa Anda harus tegas, militeristik, tajam, dan profesional (Command Directive). Bukan "Mari kita belajar", tapi "Masuk ke ruang isolasi dan kerjakan!".
4. HARUS membuat jadwal lengkap untuk 7 HARI berturut-turut (Senin - Minggu).
5. Output HARUS murni JSON valid, tanpa teks markdown, tanpa backticks, dan tanpa pengantar apapun.

DOKTRIN "TRI TUNGGAL TERPUSAT" (SANGAT PENTING):
Di setiap objek hari, Anda harus membagi 3 tahap menjadi siklus hidup 24 jam yang menyatukan Jasmani (LAT), Akademik (JAR), dan Pengasuhan/Mental (SUH):
- "tahap1": [LAT - PAGI] Latihan jasmani spesifik (Contoh: Interval lari 5 set, Push-up repetisi maksimal). Jangan hanya bilang "Olahraga", berikan metodenya.
- "tahap2": [JAR - SIANG/SORE] Deep Work Akademik minimal 90 Menit. Beri instruksi teknik (Contoh: Buat pemetaan logika, Active Recall, Feynman). Fokus utama pada kelemahan terbesar Kadet dari data nilainya.
- "tahap3": [SUH - MALAM] Latihan Mental/Sikap Kerja minimal 30 Menit. (Contoh: Jawab 20 soal Sikap Kerja di bawah tekanan waktu, Kalibrasi Mental, Evaluasi Jurnal, Tidur maksimal 22:00).

FORMAT JSON WAJIB:
{
  "focusAreas": "Kardio Ekstrem & Logika Analitis",
  "evaluationText": "Kadet, nilaimu memalukan di sektor logika. Minggu ini kita hancurkan kelemahan itu. Disiplin adalah harga mati!",
  "dailyDrills": [
    {
      "title": "HARI 1: SENIN (OPERASI PENYELARASAN AWAL)",
      "duration": "180 Menit Total",
      "tahap1": "[LAT - 05:00] Lari Interval 400m x 5 Set. Istirahat 1 menit per set. Paksa paru-parumu!",
      "tahap2": "[JAR - 19:00] Deep Work 90 Menit: TIU Analitis. Buat skema pemetaan logika di kertas buram. Kerjakan 40 soal tanpa ampun.",
      "tahap3": "[SUH - 21:00] 15 Menit Simulasi Sikap Kerja. Jawab 20 soal dengan rasional. Pemulihan otot, tidur 22:00."
    },
    ... (Lanjutkan struktur yang persis sama sampai HARI 7: MINGGU)
  ]
}
`;

  // =========================================================================
  // 4. TEMBAKKAN KE GEMINI AI (EKSEKUSI TRIASE)
  // =========================================================================
  let aiFocusAreas = "PENYELARASAN AWAL";
  let aiEvaluationText = "Laksanakan perintah dengan disiplin tempur!";
  let aiDailyDrills = "[]";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(systemPrompt);
    let responseText = result.response.text();
    
    // PEMBEDAHAN JSON: Membersihkan sisa markdown (```json ... ```) dari output AI
    responseText = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    const parsedData = JSON.parse(responseText);
    
    if (parsedData.focusAreas) aiFocusAreas = parsedData.focusAreas;
    if (parsedData.evaluationText) aiEvaluationText = parsedData.evaluationText;
    if (parsedData.dailyDrills && Array.isArray(parsedData.dailyDrills)) {
      aiDailyDrills = JSON.stringify(parsedData.dailyDrills);
    }
  } catch (error) {
    console.error("⚠️ [AI GENERATION FAILED] Menggunakan Fallback Manual.", error);
    // PROTOKOL DARURAT: Jika satelit AI gagal, gunakan jadwal cadangan berstandar
    aiFocusAreas = "KARDIO & KETELITIAN";
    aiEvaluationText = "Satelit AI terganggu. Laksanakan protokol standar. Jaga fisik dan asah logikamu!";
    const fallbackDrills = Array.from({ length: 7 }).map((_, i) => ({
      title: `HARI ${i + 1}: PROTOKOL STANDAR`,
      duration: "120 Menit",
      tahap1: "[LAT - PAGI] Lari Ketahanan (Zone 2) 30 Menit. Pemanasan statis dan dinamis.",
      tahap2: "[JAR - SIANG/SORE] Deep Work 60 Menit. Bedah dan evaluasi modul SKD yang paling Anda benci.",
      tahap3: "[SUH - MALAM] Evaluasi Sikap Kerja. Refleksi mental harian dan tidur tepat waktu 22:00."
    }));
    aiDailyDrills = JSON.stringify(fallbackDrills);
  }

  // =========================================================================
  // 5. SIMPAN KE BRANKAS DATABASE
  // =========================================================================
  const newBlueprint = await prisma.weeklyBlueprint.create({
    data: {
      userId: userId,
      focusAreas: aiFocusAreas,
      evaluationText: aiEvaluationText,
      dailyDrills: aiDailyDrills,
      isCompleted: false
    }
  });

  return newBlueprint;
}