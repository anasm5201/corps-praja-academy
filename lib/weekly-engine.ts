import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================================
// 🧠 INISIASI OTAK AI (GEMINI ENGINE)
// ============================================================================
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function ensureWeeklyPlan(userId: string) {
  try {
    // ------------------------------------------------------------------------
    // 1. CEK SIKLUS MINGGU INI (MENCEGAH DUPLIKASI DATA)
    // ------------------------------------------------------------------------
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const startOfWeek = new Date(now.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0);

    const existingPlan = await prisma.weeklyBlueprint.findFirst({
      where: { 
        userId: userId, 
        createdAt: { gte: startOfWeek } 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Jika jadwal minggu ini sudah ada, kembalikan data tersebut! AI tidak perlu kerja lagi.
    if (existingPlan) return existingPlan;


    // ------------------------------------------------------------------------
    // 2. OPERASI PENGUMPULAN INTELIJEN (DATA GATHERING)
    // ------------------------------------------------------------------------
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Kadet tidak ditemukan di markas!");

    // Sedot 1 Rapor Akademik Terakhir yang sudah Selesai
    const latestTryout = await prisma.tryoutAttempt.findFirst({
      where: { userId: userId, isFinished: true },
      orderBy: { finishedAt: 'desc' }
    });

    // Sedot 1 Rapor Fisik Terakhir
    const latestPhysical = await prisma.physicalLog.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    // Kalibrasi Amunisi Data
    const twkScore = latestTryout?.twkScore || user?.initialTwkScore || 0;
    const tiuScore = latestTryout?.tiuScore || user?.initialTiuScore || 0;
    const tkpScore = latestTryout?.tkpScore || user?.initialTkpScore || 0;
    const latScore = latestPhysical?.totalScore || 0;
    
    // Ambil Analisa Kelemahan (Jika ada)
    let weakPoints = "Kadet ini belum memiliki riwayat analisis kelemahan yang spesifik. Fokus pada penguatan dasar.";
    if (latestTryout && latestTryout.analysis) {
        try {
            const parsedAnalysis = JSON.parse(latestTryout.analysis);
            weakPoints = `Lemah di TWK: ${parsedAnalysis.worstTwk || 'Aman'}, TIU: ${parsedAnalysis.worstTiu || 'Aman'}, TKP: ${parsedAnalysis.worstTkp || 'Aman'}`;
        } catch (e) {
            weakPoints = latestTryout.analysis;
        }
    }

    // ------------------------------------------------------------------------
    // 3. THE MASTER PROMPT (DOKTRINASI AI)
    // ------------------------------------------------------------------------
    const prompt = `
Anda adalah Elite Military Coach di Corps Praja Academy. Tugas Anda adalah menyusun "Tactical Blueprint 7 Hari" untuk seorang Kadet.
Gunakan bahasa yang TEGAS, DISIPLIN, MILITERISTIK, PEDAS TAPI MEMBANGUN. Panggil dia "Kadet".

[DATA INTELIJEN KADET SAAT INI]
- Nilai Jasmani (LAT): ${latScore}/100 (Ambang batas aman: 65)
- Nilai TWK (Akademik): ${twkScore}/150 (Ambang batas aman: 65)
- Nilai TIU (Akademik): ${tiuScore}/175 (Ambang batas aman: 80)
- Nilai TKP (Mental): ${tkpScore}/225 (Ambang batas aman: 166)
- Laporan Kelemahan Detail: ${weakPoints}

[INSTRUKSI PENYUSUNAN JADWAL (WAJIB DIIKUTI)]
1. EVALUASI (evaluationText): Tulis 2-3 kalimat evaluasi pedas berdasarkan data di atas. Jika Jasmani < 65, tegur fisiknya yang lemah. Jika TIU < 80, tegur logikanya yang tumpul.
2. FOKUS (focusAreas): Tulis 1 frasa singkat (Maksimal 6 kata) tentang target utama minggu ini. (Contoh: "PENINGKATAN VO2MAX & LOGIKA ANALITIS")
3. JADWAL (dailyDrills): Buat jadwal 7 Hari (Senin-Minggu). Setiap hari HARUS memiliki:
   - tahap1: Misi Jasmani (Pagi). Sesuaikan intensitas dengan Nilai Jasmani. (Kardio/Kekuatan Otot).
   - tahap2: Misi Akademik (Siang). Hajar kelemahannya berdasarkan Data Intelijen di atas.
   - tahap3: Misi Mental/Pengasuhan (Malam). (Contoh: Evaluasi, Meditasi, Review Jurnal).
   - HARI 6 wajib Simulasi Tryout. HARI 7 wajib Active Recovery.

[FORMAT BALASAN MUTLAK]
Anda HANYA boleh membalas dengan objek JSON murni. JANGAN gunakan tag \`\`\`json. Formatnya harus tepat seperti ini:
{
  "focusAreas": "...",
  "evaluationText": "...",
  "dailyDrills": [
    { "title": "HARI 1: SENIN", "tahap1": "...", "tahap2": "...", "tahap3": "..." },
    { "title": "HARI 2: SELASA", "tahap1": "...", "tahap2": "...", "tahap3": "..." },
    { "title": "HARI 3: RABU", "tahap1": "...", "tahap2": "...", "tahap3": "..." },
    { "title": "HARI 4: KAMIS", "tahap1": "...", "tahap2": "...", "tahap3": "..." },
    { "title": "HARI 5: JUMAT", "tahap1": "...", "tahap2": "...", "tahap3": "..." },
    { "title": "HARI 6: SABTU", "tahap1": "...", "tahap2": "...", "tahap3": "..." },
    { "title": "HARI 7: MINGGU", "tahap1": "...", "tahap2": "...", "tahap3": "..." }
  ]
}
`;

    // ------------------------------------------------------------------------
    // 4. EKSEKUSI PEMANGGILAN AI
    // ------------------------------------------------------------------------
    let aiPayload;
    
    // Jika API Key tidak disetel, lewati pemanggilan AI (masuk ke Fallback)
    if (apiKey) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // PEMBERSIHAN KOTORAN AI: Hapus format markdown jika AI membandel
        const cleanJsonText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        aiPayload = JSON.parse(cleanJsonText);
    } else {
        throw new Error("Kunci Satelit (Gemini API Key) belum terpasang.");
    }

    // ------------------------------------------------------------------------
    // 5. PENYIMPANAN KE BRANKAS (DATABASE)
    // ------------------------------------------------------------------------
    const newPlan = await prisma.weeklyBlueprint.create({
      data: {
        userId: userId,
        focusAreas: aiPayload.focusAreas || "PENYELARASAN TRITUNGGAL",
        evaluationText: aiPayload.evaluationText || "Laksanakan instruksi dengan disiplin baja!",
        dailyDrills: JSON.stringify(aiPayload.dailyDrills),
        completedDrills: "[]"
      }
    });

    return newPlan;

  } catch (error) {
    console.error("⚠️ [COMMANDER WARNING] AI Engine Gagal Bekerja:", error);
    
    // ------------------------------------------------------------------------
    // 6. THE FALLBACK PROTOCOL (JIKA AI / API MATI)
    // AI boleh mati, tapi sistem Pelatihan tidak boleh berhenti!
    // ------------------------------------------------------------------------
    return await prisma.weeklyBlueprint.create({
        data: {
          userId: userId,
          focusAreas: "PROTOKOL DARURAT: PENYELARASAN TRITUNGGAL",
          evaluationText: "Kadet! Koneksi AI ke Markas Besar terputus. Saya mengambil alih komando manual. Ini adalah siklus periodisasi elit. Laksanakan tanpa ragu!",
          completedDrills: "[]",
          dailyDrills: JSON.stringify([
            { title: "HARI 1: SENIN (DAYA TAHAN)", tahap1: "[LAT] Lari Zone 2 (Jogging konstan) 35-40 menit.", tahap2: "[JAR] Deep Work 90 Menit: Gempur materi Analitis dan Silogisme.", tahap3: "[SUH] Goal Setting: Tulis 3 target absolut minggu ini." },
            { title: "HARI 2: SELASA (KEKUATAN)", tahap1: "[LAT] Strength: Push-up, Sit-up, dan Pull-up (3 Set x Max).", tahap2: "[JAR] Deep Work 90 Menit: Hafalkan sejarah konstitusi dan butir Pancasila.", tahap3: "[SUH] Time Audit: Evaluasi waktu 24 jam terakhirmu." },
            { title: "HARI 3: RABU (KETANGKASAN)", tahap1: "[LAT] Interval: Lari Sprint 400m x 5 Set.", tahap2: "[JAR] Speed Drill: Hajar 50 soal TIU Numerik dalam 30 menit.", tahap3: "[SUH] Stress Inoculation (Box Breathing)." },
            { title: "HARI 4: KAMIS (PEMULIHAN AKTIF)", tahap1: "[LAT] Active Recovery: Jalan cepat 20 menit + Peregangan.", tahap2: "[JAR] Deep Work 90 Menit: Pelajari studi kasus TKP Pelayanan Publik.", tahap3: "[SUH] Bedah Integritas: Evaluasi studi kasus anti-korupsi." },
            { title: "HARI 5: JUMAT (INTEGRASI)", tahap1: "[LAT] Fartlek Training 30 Menit: Ritme acak.", tahap2: "[JAR] Targeted Review: Hajar materi Tryout yang paling merah.", tahap3: "[SUH] Resiliensi Mental: Ubah rasa takut menjadi agresi." },
            { title: "HARI 6: SABTU (SIMULASI)", tahap1: "[LAT] Tryout Samapta Total: Lari 12 menit murni.", tahap2: "[JAR] Full CAT SKD: Latih stamina duduk dan fokus mata.", tahap3: "[SUH] After Action Review: Bedah hasil simulasi hari ini." },
            { title: "HARI 7: MINGGU (RESTORASI)", tahap1: "[LAT] Total Rest & Mobility.", tahap2: "[JAR] Off-Grid: Baca literatur ringan.", tahap3: "[SUH] Pengisian Tangki Spiritual: Ibadah dan keluarga." }
          ])
        }
      });
  }
}