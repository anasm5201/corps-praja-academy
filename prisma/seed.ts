import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// ==========================================
// [HELPER 0] TACTICAL DELAY (AGAR DB TIDAK PUTUS)
// ==========================================
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// [HELPER 1] BACA JSON
// ==========================================
const readJson = (filePath: string) => {
    try {
        if (!fs.existsSync(filePath)) return null;
        let raw = fs.readFileSync(filePath, 'utf-8');
        raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        raw = raw.replace(/,(\s*[\]}])/g, '$1');
        return JSON.parse(raw);
    } catch (e: any) {
        return null;
    }
};

// ==========================================
// [HELPER 2] INSERT SOAL MANUAL
// ==========================================
async function insertQuestions(pkgId: string, data: any) {
    const questions = Array.isArray(data) ? data : (data.questions || []);
    let savedCount = 0;

    for (const q of questions) {
        let correctKey = "A";
        if (q.options && Array.isArray(q.options)) {
            const winner = q.options.find((o:any) => o.isCorrect) || q.options.find((o:any) => (o.points||0) === 5);
            if (winner) correctKey = winner.label || winner.key || "A";
        }

        await prisma.tryoutQuestion.create({
            data: {
                packageId: pkgId,
                text: q.text || q.question || "Pertanyaan",
                image: q.image || null,
                svgCode: q.svgCode || null,
                type: q.category || "UMUM",
                options: JSON.stringify(q.options || []),
                correctAnswer: correctKey,
                explanation: q.explanation || "-"
            }
        });
        savedCount++;
    }
    return savedCount;
}

// ==========================================
// [HELPER 3] GENERATOR KECERMATAN (AUTO-AMMO)
// ==========================================
async function generateKecermatanQuestions(pkgId: string, symbols: string[]) {
    const questionsToCreate = [];
    const mapKey = ["A", "B", "C", "D", "E"];

    // Kita buat 50 Kolom Soal
    for (let i = 0; i < 50; i++) {
        const correctIndex = Math.floor(Math.random() * 5); 
        const correctKey = mapKey[correctIndex];

        const optionsData = symbols.map((s, idx) => ({ 
            label: mapKey[idx], 
            text: s,
            isCorrect: idx === correctIndex 
        }));

        questionsToCreate.push({
            packageId: pkgId,
            text: `Kolom Kecermatan No. ${i + 1}`,
            type: "KECERMATAN",
            options: JSON.stringify(optionsData),
            correctAnswer: correctKey,
            explanation: "Fokus dan kecepatan adalah kunci."
        });
    }

    // Tembak massal ke database
    await prisma.tryoutQuestion.createMany({ data: questionsToCreate });
    return 50; 
}

// ==========================================
// [MAIN] OPERASI PEMULIHAN TOTAL (DENGAN JEDA)
// ==========================================
async function main() {
    console.log('🚀 MEMULAI OPERASI "RESTORE KECERMATAN" (ANTI-DISCONNECT)...');

    // --- PHASE 1: BERSIHKAN KECERMATAN LAMA ---
    console.log('\n🧹 [PHASE 1] MEMBERSIHKAN AREA KECERMATAN...');
    try {
        await prisma.tryoutPackage.deleteMany({
            where: { category: "KECERMATAN" } 
        });
        console.log('   ✅ Area Kecermatan steril.');
    } catch (e) {
        console.log('   ⚠️ Area aman.');
    }

    console.log('\n🛡️ [PHASE 2 & 3] SKD & JAR/SUH: DILOMPATI (DATA AMAN).');

    // --- PHASE 4: KECERMATAN (FULL FORCE RESTORE) ---
    console.log('\n⚡ [PHASE 4] MENGEMBALIKAN 12 PAKET KECERMATAN...');
    
    const kecermatanPackages = [
        { title: "Kecermatan 01 - Simbol Dasar", desc: "Latihan dasar (JAR)", config: { duration: 60, symbols: ["★", "▲", "●", "■", "♦"] } },
        { title: "Kecermatan 02 - Angka (POLRI)", desc: "Standar Tes Koran", config: { duration: 60, symbols: ["0", "2", "4", "6", "8"] } },
        { title: "Kecermatan 03 - Huruf Acak", desc: "Fokus tinggi", config: { duration: 60, symbols: ["A", "K", "L", "M", "N"] } },
        { title: "Kecermatan 04 - Panah Arah", desc: "Spasial", config: { duration: 60, symbols: ["⬅", "⬆", "⬇", "➡", "⬈"] } },
        { title: "Kecermatan 05 - Kartu Remi", desc: "Visual", config: { duration: 60, symbols: ["♠", "♣", "♥", "♦", "⚜"] } },
        { title: "Kecermatan 06 - Angka Ganjil", desc: "Numerik", config: { duration: 60, symbols: ["1", "3", "5", "7", "9"] } },
        { title: "Kecermatan 07 - Kapital A-E", desc: "Huruf", config: { duration: 60, symbols: ["A", "B", "C", "D", "E"] } },
        { title: "Kecermatan 08 - Kapital K-O", desc: "Huruf", config: { duration: 60, symbols: ["K", "L", "M", "N", "O"] } },
        { title: "Kecermatan 09 - Vokal", desc: "Verbal", config: { duration: 60, symbols: ["A", "I", "U", "E", "O"] } },
        { title: "Kecermatan 10 - Simbol Mirip", desc: "Hard Mode", config: { duration: 60, symbols: ["C", "G", "O", "Q", "U"] } },
        { title: "Kecermatan 11 - Rotasi", desc: "Hard Mode", config: { duration: 60, symbols: ["M", "W", "Z", "N", "E"] } },
        { title: "Kecermatan 12 - HELL WEEK", desc: "Expert Mode", config: { duration: 45, symbols: ["6", "9", "8", "3", "0"] } }
    ];

    for (const pkg of kecermatanPackages) {
        // 1. Buat Paket
        const createdPkg = await prisma.tryoutPackage.create({
            data: {
                title: pkg.title,
                category: "KECERMATAN", 
                description: pkg.desc,
                duration: 1, 
                isPublished: true
            }
        });

        // 2. Generate Soal
        const qCount = await generateKecermatanQuestions(createdPkg.id, pkg.config.symbols);
        console.log(`   ✅ RESTORED: ${pkg.title} -> ${qCount} Soal Siap.`);

        // 🔥 TACTICAL DELAY: JEDA 1 DETIK ANTAR PAKET
        // Ini mencegah "Server has closed the connection"
        await delay(1000); 
    }

    console.log('\n✅✅ MISI PEMULIHAN SELESAI! REFRESH BROWSER SEKARANG! ✅✅');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });