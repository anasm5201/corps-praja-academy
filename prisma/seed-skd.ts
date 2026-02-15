import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// ==========================================
// 🚨 MASUKKAN ID PAKET 'SIMULASI SKD - TRIAL' DI SINI!
// ==========================================
const TARGET_PACKAGE_ID = "cmlmbj6mo0000zeyawqpdxz5w"; 

// ==========================================
// [HELPER] BACA JSON AMUNISI
// ==========================================
const readJson = (fileName: string) => {
    const filePath = path.join(process.cwd(), 'data', 'TO_FREE_01', fileName);
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ GAGAL: File tidak ditemukan di ${filePath}`);
            return [];
        }
        let raw = fs.readFileSync(filePath, 'utf-8');
        raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(raw);
    } catch (e: any) {
        return [];
    }
};

const formatOptions = (rawOptions: any[], correctAnswerKey: string) => {
    return rawOptions.map((opt: any) => ({
        key: opt.key || opt.label,
        text: opt.text || opt.value,
        points: opt.key === correctAnswerKey ? 5 : 0,
        isCorrect: opt.key === correctAnswerKey
    }));
};

const formatOptionsTKP = (rawOptions: any[]) => {
    return rawOptions.map((opt: any) => ({
        key: opt.key || opt.label,
        text: opt.text || opt.value,
        points: opt.points || opt.score || 0,
        isCorrect: (opt.points || opt.score) === 5 
    }));
};

// ==========================================
// [MAIN] OPERASI PENGISIAN AMUNISI
// ==========================================
async function main() {
    console.log(`🚀 MEMULAI OPERASI SUPLAI AMUNISI KE PAKET: ${TARGET_PACKAGE_ID}`);

        // 🔥 [PHASE 0] PROTOKOL PEMBERSIHAN (ANTI-DUPLIKAT)
    console.log(`\n🧹 Mengecek sisa amunisi lama di gudang...`);
    const existingQ = await prisma.tryoutQuestion.count({
        where: { packageId: TARGET_PACKAGE_ID }
    });

    if (existingQ > 0) {
        console.log(`⚠️ Ditemukan ${existingQ} peluru lama. Mengosongkan gudang...`);
        await prisma.tryoutQuestion.deleteMany({
            where: { packageId: TARGET_PACKAGE_ID }
        });
        console.log(`✅ Gudang berhasil disterilkan.`);
    } else {
        console.log(`✅ Gudang kosong, aman untuk diisi.`);
    }

    // 🔥 [PHASE 1] PENGISIAN SOAL
    const files = [
        // TWK (30 Soal)
        { name: "twk_batch1.json", type: "TWK", limit: 10 },
        { name: "twk_batch2.json", type: "TWK", limit: 10 },
        { name: "twk_batch3.json", type: "TWK", limit: 10 },
        // TIU (35 Soal)
        { name: "tiu_cerita.json", type: "TIU", limit: 10 }, 
        { name: "tiu_figural.json", type: "TIU", limit: 5 },
        { name: "tiu_numerik.json", type: "TIU", limit: 10 },
        { name: "tiu_verbal.json", type: "TIU", limit: 10 },
        // TKP (45 Soal)
        { name: "tkp_batch1.json", type: "TKP", limit: 15 },
        { name: "tkp_batch2.json", type: "TKP", limit: 15 },
        { name: "tkp_batch3.json", type: "TKP", limit: 15 },
    ];

    let totalSoalMasuk = 0;

    for (const file of files) {
        console.log(`\n📂 Membuka berkas: ${file.name} (${file.type})...`);
        const rawData = readJson(file.name);

        if (!rawData || rawData.length === 0) continue;

        const questionsToInsert = rawData.slice(0, file.limit); 

        for (const q of questionsToInsert) {
            let finalOptions;
            let correctKey = q.correctAnswer || "A";

            if (file.type === "TKP") {
                finalOptions = formatOptionsTKP(q.options);
                const best = finalOptions.find((o: any) => o.points === 5);
                correctKey = best ? best.key : "A";
            } else {
                finalOptions = formatOptions(q.options, correctKey);
            }

            await prisma.tryoutQuestion.create({
                data: {
                    packageId: TARGET_PACKAGE_ID,
                    text: q.question || q.text,
                    type: file.type, 
                    options: JSON.stringify(finalOptions),
                    correctAnswer: correctKey,
                    explanation: q.explanation || "Pembahasan lengkap tersedia untuk akun Premium.",
                    image: q.image || null,
                }
            });
            process.stdout.write("."); 
        }
        totalSoalMasuk += questionsToInsert.length;
        console.log(` ✅ ${questionsToInsert.length} butir peluru dimuat.`);
    }

    console.log(`\n🎉 MISI SUKSES! Total ${totalSoalMasuk} soal berhasil dimasukkan ke Paket Trial.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });