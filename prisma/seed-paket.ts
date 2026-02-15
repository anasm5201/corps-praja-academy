import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// ==========================================
// 🚨 MASUKKAN ID 'PAKET 02' DARI PRISMA STUDIO DI SINI:
const TARGET_PACKAGE_ID = "cmlibw8d2000061qmwuoigsyc"; 
// ==========================================

const TARGET_JSON_FILE = "paket_02.json";

const readJson = (fileName: string) => {
    // 📍 Mengarah tepat ke folder LOGISTICS sesuai gambar Komandan
    const filePath = path.join(process.cwd(), 'data', 'LOGISTICS', 'tryout', fileName);
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ GAGAL: File tidak ditemukan di rute: ${filePath}`);
            return null;
        }
        let raw = fs.readFileSync(filePath, 'utf-8');
        raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(raw);
    } catch (e: any) {
        console.error(`⚠️ Error membaca JSON:`, e.message);
        return null;
    }
};

const formatOptions = (rawOptions: any[], correctAnswerKey: string, qType: string) => {
    return rawOptions.map((opt: any) => {
        let pts = 0;
        if (qType === "TKP") {
            pts = opt.points !== undefined ? opt.points : (opt.score || 0);
        } else {
            pts = (opt.key || opt.label) === correctAnswerKey ? 5 : 0;
        }

        return {
            key: opt.key || opt.label,
            text: opt.text || opt.value,
            points: pts,
            isCorrect: qType === "TKP" ? pts === 5 : (opt.key || opt.label) === correctAnswerKey
        };
    });
};

async function main() {
    console.log(`🚀 MEMULAI OPERASI PENGISIAN ${TARGET_JSON_FILE}`);

    // 🔥 PHASE 0: SAPU BERSIH (Pencegahan duplikat/sisa cacat)
    const existingQ = await prisma.tryoutQuestion.count({
        where: { packageId: TARGET_PACKAGE_ID }
    });

    if (existingQ > 0) {
        console.log(`🧹 Membersihkan ${existingQ} peluru lama/cacat di dalam Paket 02...`);
        await prisma.tryoutQuestion.deleteMany({
            where: { packageId: TARGET_PACKAGE_ID }
        });
    }

    // 🔥 PHASE 1: BACA DATA LOGISTIK
    const rawData = readJson(TARGET_JSON_FILE);
    if (!rawData) return;

    // Adaptasi struktur: Cek apakah data dibungkus dalam properti "questions" atau langsung array
    const questionsToInsert = Array.isArray(rawData) ? rawData : (rawData.questions || []);

    if (questionsToInsert.length === 0) {
        console.error("❌ File JSON kosong atau strukturnya tidak dikenali.");
        return;
    }

    console.log(`📦 Ditemukan ${questionsToInsert.length} butir peluru. Memulai bongkar muat...`);

    // 🔥 PHASE 2: PENEMBAKAN KE DATABASE
    let successCount = 0;
    for (const q of questionsToInsert) {
        let correctKey = q.correctAnswer || "A";
        let qType = q.type || q.category || "UMUM";

        let finalOptions = formatOptions(q.options || [], correctKey, qType);

        if (qType === "TKP") {
            const best = finalOptions.find((o: any) => o.points === 5);
            if (best) correctKey = best.key;
        }

        await prisma.tryoutQuestion.create({
            data: {
                packageId: TARGET_PACKAGE_ID,
                text: q.question || q.text || "Pertanyaan",
                type: qType,
                options: JSON.stringify(finalOptions),
                correctAnswer: correctKey,
                explanation: q.explanation || "Pembahasan eksklusif Pasukan Khusus.",
                image: q.image || null,
            }
        });
        process.stdout.write("."); // Indikator progres
        successCount++;
    }

    console.log(`\n🎉 MISI SUKSES! Total ${successCount} soal berhasil masuk ke Paket 02.`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });