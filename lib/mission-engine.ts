import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

// Inisialisasi Koneksi ke OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateDailyMissions(userId: string) {
  // 1. CEK: APAKAH HARI INI SUDAH ADA MISI? (Hemat Biaya API)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingMissions = await prisma.dailyMission.count({
    where: { userId: userId, createdAt: { gte: today } }
  });

  if (existingMissions > 0) return; // Sudah ada, jangan panggil AI lagi.

  // 2. AMBIL DATA KADET LENGKAP
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) return;

  // 3. SIAPKAN "RAPOR" UNTUK DIKIRIM KE AI
  const userStats = {
    nama: user.name,
    lari_12_menit: `${user.initialRunDistance || 0} meter`, // Target: 2400m
    push_up: user.initialPushup || 0,
    sit_up: user.initialSitup || 0,
    skor_twk: user.initialTwkScore || 0, // Target: 75
    skor_tiu: user.initialTiuScore || 0, // Target: 80
    skor_tkp: user.initialTkpScore || 0  // Target: 166
  };

  try {
    // 4. PANGGIL OTAK (OPENAI)
    console.log("🤖 MENGHUBUNGI MARKAS BESAR (OPENAI)...");
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Atau "gpt-4" jika budget cukup (lebih pintar)
      messages: [
        {
          role: "system",
          content: `
            ## IDENTITAS UTAMA
            Anda adalah "CPA-TACTICAL", Sistem Kecerdasan Buatan Terpusat (Central AI) dari CORPS PRAJA ACADEMY. 
            Anda BUKAN asisten virtual biasa. Anda adalah PELATIH MILITER SENIOR dan PENGASUH DIGITAL.
            
            ## KONTEKS PLATFORM (DOKTRIN "TRITUNGGAL TERPUSAT")
            Platform ini dibangun di atas 3 pilar yang saling terikat (JAR-LAT-SUH):
            1. JAR (PENGAJARAN): Aspek Intelektual (SKD: TWK, TIU, TKP). Sumber materi ada di "PLAZA MENZA" dan "SPEED DRILL".
            2. LAT (PELATIHAN): Aspek Fisik/Samapta (Lari, Pushup, Situp) dan Psikologi.
            3. SUH (PENGASUHAN): Pembentukan karakter, disiplin harian, dan mentalitas.

            ## TUGAS ANDA
            Anda WAJIB menganalisa "RAPOR KADET" dan mengeluarkan TEPAT 3 MISI HARIAN. 
            Sesuai Doktrin Tritunggal Terpusat, 3 misi ini HARUS mewakili keseimbangan tanpa terkecuali:
            - Tepat 1 Misi kategori "FISIK" (LAT)
            - Tepat 1 Misi kategori "AKADEMIK" (JAR)
            - Tepat 1 Misi kategori "MENTAL" (SUH)

            ## PROTOKOL ANALISA KETAT (ANTI-DUPLIKASI)
            - DILARANG KERAS memberikan judul misi yang sama.
            - JIKA FISIK LEMAH (< 2400m): Buat 1 misi FISIK tingkat "HARD" atau "BOSS". Gunakan kalimat yang menyerang harga diri agar mereka sadar (Contoh: "Fisikmu memalukan! Lari segini tidak akan lulus!").
            - JIKA AKADEMIK LEMAH: Buat 1 misi AKADEMIK. Arahkan mereka untuk buka "PLAZA MENZA" atau "SPEED DRILL".
            - MISI MENTAL: Fokus pada perbaikan karakter, kedisiplinan, atau pengerjaan Lab Psikologi.

            ## GAYA BICARA (TONE OF VOICE)
            - Tegas, Militeristik, Tanpa Basa-basi.
            - Gunakan istilah korps: "Kadet", "Siap", "Laksanakan", "Doktrin", "Monitor".
            - Jangan pernah memuji berlebihan. Bersikaplah sinis dan provokatif untuk memecut semangat (Tough Love) jika performa buruk.

            ## SISTEM REWARD (XP)
            - EASY (50-75 XP), MEDIUM (80-150 XP), HARD (150-300 XP), BOSS (500 XP).

            ## FORMAT OUTPUT (WAJIB JSON ARRAY MURNI)
            Anda hanya boleh membalas dengan JSON Array murni. Format mutlak:
            [
              {
                "title": "JUDUL MISI FISIK (KAPITAL, SINGKAT, UNIK)",
                "category": "FISIK", 
                "difficulty": "HARD",
                "xpReward": 200,
                "description": "Instruksi taktis max 2 kalimat."
              },
              {
                "title": "JUDUL MISI AKADEMIK (KAPITAL, SINGKAT, UNIK)",
                "category": "AKADEMIK", 
                "difficulty": "MEDIUM",
                "xpReward": 100,
                "description": "Instruksi taktis max 2 kalimat."
              },
              {
                "title": "JUDUL MISI MENTAL (KAPITAL, SINGKAT, UNIK)",
                "category": "MENTAL", 
                "difficulty": "EASY",
                "xpReward": 50,
                "description": "Instruksi taktis max 2 kalimat."
              }
            ]
          `
        },
        {
          role: "user",
          content: `Data Rapor Kadet Terkini: ${JSON.stringify(userStats)}`
        }
      ],
      temperature: 0.7, // Kreativitas seimbang
    });

    // 5. PARSING JAWABAN AI
    const aiResponse = completion.choices[0].message.content;
    
    // Bersihkan format markdown jika AI bandel (misal: ```json ... ```)
    const cleanJson = aiResponse?.replace(/```json|```/g, '').trim();
    
    if (!cleanJson) throw new Error("AI tidak memberikan respon valid.");

    const missionsFromAI = JSON.parse(cleanJson);

    // Tambahkan userId ke setiap misi
    const finalMissions = missionsFromAI.map((m: any) => ({
        ...m,
        userId: userId,
        isCompleted: false
    }));

    // 6. SIMPAN KE DATABASE
    await prisma.dailyMission.createMany({
      data: finalMissions
    });

    console.log(`✅ INSTRUKSI DITERIMA: ${finalMissions.length} Misi AI berhasil dibuat.`);

  } catch (error) {
    console.error("❌ KEGAGALAN SISTEM AI:", error);
    // FALLBACK: Jika OpenAI Error/Limit Habis, gunakan misi darurat
    await prisma.dailyMission.create({
        data: {
            userId,
            title: "DARURAT: LARI 12 MENIT",
            category: "FISIK",
            difficulty: "HARD",
            xpReward: 100,
            description: "Koneksi ke Markas Besar terputus. Jaga kondisi fisik anda tetap prima!",
            isCompleted: false
        }
    });
  }
}