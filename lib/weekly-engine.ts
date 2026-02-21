import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function ensureWeeklyPlan(userId: string) {
  try {
    const now = new Date();

    // =========================================================================
    // 🛡️ 1. PENJAGA GERBANG (COST-SAVING PROTOCOL)
    // =========================================================================
    // Cek apakah ada jadwal minggu ini yang masih aktif dan belum kedaluwarsa
    const activeBlueprint = await prisma.weeklyBlueprint.findFirst({
      where: {
        userId: userId,
        endDate: { gt: now }, // 'gt' = greater than (Lebih besar dari waktu sekarang)
        isActive: true
      }
    });

    // Jika jadwal masih berlaku, STOP proses di sini. OpenAI diistirahatkan.
    if (activeBlueprint) {
        return activeBlueprint;
    }

    // =========================================================================
    // 📡 2. PENGUMPULAN DATA INTELIJEN & AWOL RADAR
    // =========================================================================
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Kadet tidak ditemukan di markas.");

    const latestTryout = await prisma.tryoutAttempt.findFirst({
      where: { userId: userId, isFinished: true },
      orderBy: { finishedAt: 'desc' }
    });

    const latestPhysical = await prisma.physicalLog.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    // --- LOGIKA CERDAS DETEKSI KEMALASAN (AWOL) ---
    const nowTime = now.getTime();
    // Jika belum pernah Tryout/Fisik, gunakan tanggal pendaftaran akun sebagai titik awal
    const tryoutTime = latestTryout?.finishedAt ? latestTryout.finishedAt.getTime() : user.createdAt.getTime();
    const physicalTime = latestPhysical?.createdAt ? latestPhysical.createdAt.getTime() : user.createdAt.getTime();

    const daysSinceTryout = Math.floor((nowTime - tryoutTime) / (1000 * 3600 * 24));
    const daysSincePhysical = Math.floor((nowTime - physicalTime) / (1000 * 3600 * 24));

    // Kadet dinyatakan DESERSI jika menghilang lebih dari 7 hari
    const isAwol = (daysSinceTryout > 7 && daysSincePhysical > 7);

    const stats = {
      nama: user.name,
      lari_meter: latestPhysical ? latestPhysical.totalScore * 30 : (user.initialRunDistance || 0),
      twk: latestTryout?.twkScore ?? user.initialTwkScore ?? 0,
      tiu: latestTryout?.tiuScore ?? user.initialTiuScore ?? 0,
      tkp: latestTryout?.tkpScore ?? user.initialTkpScore ?? 0,
      analisa_kelemahan: latestTryout?.analysis || "Peta kelemahan masih buta",
      status_kedisiplinan: isAwol
        ? `DESERSI! Menghilang tanpa latihan selama lebih dari 7 hari!`
        : `AKTIF. Konsisten menyetorkan data.`
    };

    // =========================================================================
    // 🧠 3. PEMANGGILAN PAKAR KURIKULUM (OPENAI)
    // =========================================================================
    console.log(`[WEEKLY ENGINE] Menyusun Kurikulum untuk ${stats.nama} (Status: ${isAwol ? 'AWOL' : 'AKTIF'})...`);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        {
          role: "system",
          content: `
            Anda adalah "CPA-TACTICAL", Pelatih Fisik VVIP dan Dosen Kurikulum di CORPS PRAJA ACADEMY.
            Doktrin Utama: "TRITUNGGAL TERPUSAT" (JAR: Akademik, LAT: Fisik, SUH: Mental/Karakter).

            TUGAS: Buat "TACTICAL BLUEPRINT" (Jadwal Latihan 7 Hari) berdasarkan Rapor Kadet.

            PROTOKOL DESERSI (AWOL):
            - Jika status_kedisiplinan = "DESERSI": Anda HARUS SANGAT MARAH, HINA kemalasannya ("Tough Love"). Rombak jadwal menjadi HUKUMAN FISIK DASAR (Push up/Sit up tinggi) dan TRYOUT KALIBRASI di awal minggu untuk mengukur penurunan otaknya.
            - Jika "AKTIF": Nada tegas, puji progres jika ada, lalu susun kurikulum spesifik.

            METODOLOGI EXPERT:
            - LAT: HIIT, Fartlek, Active Recovery. Pecah jadi Pemanasan, Inti, Pendinginan.
            - JAR: Active Recall, Feynman Technique, Pomodoro.
            - SUH: Stress Inoculation (Mengerjakan tes saat lelah fisik).

            STRUKTUR 7 HARI (Senin s.d Minggu):
            Selang-seling antara LAT, JAR, dan SUH. Jangan biarkan overtraining.

            FORMAT JSON MUTLAK (Tanpa awalan markdown):
            {
              "evaluationText": "Evaluasi/Omelan 3 kalimat taktis.",
              "focusAreas": "KATA KUNCI (Max 4 kata, cth: PEMULIHAN DISIPLIN & KARDIO)",
              "dailyDrills": [
                {
                  "day": "Senin",
                  "category": "LAT",
                  "title": "NAMA DRILL KAPITAL",
                  "duration": "45 Menit",
                  "tahap1": "Detail Pemanasan...",
                  "tahap2": "Detail Eksekusi Inti...",
                  "tahap3": "Detail Pendinginan..."
                }
              ]
            }
          `
        },
        {
          role: "user",
          content: `Data Kadet Terkini: ${JSON.stringify(stats)}`
        }
      ],
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    const cleanJson = aiResponse?.replace(/```json|```/g, '').trim();

    if (!cleanJson) throw new Error("Format AI kosong atau rusak.");

    const blueprintData = JSON.parse(cleanJson);

    // =========================================================================
    // 💾 4. PENYIMPANAN AMAN KE BRANKAS (DATABASE)
    // =========================================================================
    
    // Matikan jadwal lama agar tidak bentrok
    await prisma.weeklyBlueprint.updateMany({
        where: { userId: userId, isActive: true },
        data: { isActive: false }
    });

    // Set Masa Berlaku 7 Hari
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);

    const newBlueprint = await prisma.weeklyBlueprint.create({
      data: {
        userId: userId,
        startDate: now,
        endDate: endDate,
        evaluationText: blueprintData.evaluationText,
        focusAreas: blueprintData.focusAreas,
        dailyDrills: JSON.stringify(blueprintData.dailyDrills),
        isActive: true
      }
    });

    console.log(`✅ [WEEKLY ENGINE] Blueprint 7 Hari sukses dicetak & dikunci!`);
    return newBlueprint;

  } catch (error) {
    console.error("❌ [WEEKLY ENGINE ERROR]:", error);
    
    // =========================================================================
    // 🚨 5. PROTOKOL DARURAT (FALLBACK PLAN)
    // =========================================================================
    // Jika OpenAI Down/Limit habis, sistem tidak boleh mati. Buat jadwal Offline!
    const emergencyDrills = Array.from({ length: 7 }).map((_, i) => ({
        day: `Hari ${i + 1}`,
        category: "LAT",
        title: "OPERASI KEMANDIRIAN FISIK",
        duration: "30 Menit",
        tahap1: "Jogging ringan 5 menit untuk adaptasi detak jantung.",
        tahap2: "Lari ketahanan (Endurance) tanpa henti selama 20 Menit.",
        tahap3: "Pendinginan statis dan peregangan kaki."
    }));

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);

    // Tetap simpan jadwal darurat ke database agar tidak looping manggil error terus
    const fallbackBlueprint = await prisma.weeklyBlueprint.create({
      data: {
        userId: userId,
        startDate: now,
        endDate: endDate,
        evaluationText: "KONEKSI KE SATELIT TERPUTUS! AI Mentor sedang dalam perbaikan jaringan. Tetap laksanakan latihan fisik mandiri agar ototmu tidak menyusut!",
        focusAreas: "PEMELIHARAAN DARURAT",
        dailyDrills: JSON.stringify(emergencyDrills),
        isActive: true
      }
    });

    return fallbackBlueprint;
  }
}