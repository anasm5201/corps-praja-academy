import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Helper untuk generate kode opsi (A, B, C, D, E) jika kosong
const getOptionCode = (index: number) => {
  const codes = ['A', 'B', 'C', 'D', 'E'];
  return codes[index] || 'X';
};

async function main() {
  console.log("🚀 MEMULAI OPERASI SEEDING SKD (ANTI-GAGAL)...");

  // 1. DEFINISI PAKET TARGET
  const packageData = {
    title: "SKD DIAGNOSTIC FREE",
    category: "SKD",
    duration: 100, // 100 Menit
    description: "Simulasi CAT SKD Gratis untuk pemetaan awal.",
    isPublished: true
  };

  // 2. BACA FILE (Path Disesuaikan dengan Struktur Anda)
  // Berdasarkan screenshot, folder TO_FREE_01 ada di dalam data/
  const sourceDir = path.join(process.cwd(), 'data/TO_FREE_01'); 
  
  if (!fs.existsSync(sourceDir)) {
      console.error(`❌ ERROR FATAL: Folder tidak ditemukan di ${sourceDir}`);
      console.log("Saran: Cek apakah folder 'TO_FREE_01' ada di dalam folder 'data'?");
      process.exit(1);
  }

  const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'));
  let allQuestions = [];

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Deteksi Tipe Soal
    let type = "TWK";
    if (file.toLowerCase().includes("tiu")) type = "TIU";
    else if (file.toLowerCase().includes("tkp")) type = "TKP";

    // Normalize Structure
    const rawQuestions = Array.isArray(data) ? data : (data.questions || []);

    const mappedQuestions = rawQuestions.map((q: any) => {
        // [FIX] Validasi Opsi yang lebih kuat
        const safeOptions = (q.options || []).map((opt: any, idx: number) => {
            // Coba ambil kode dari berbagai kemungkinan key
            let code = opt.code || opt.label || opt.key || getOptionCode(idx);
            
            // Pastikan text tidak kosong
            let text = opt.text || opt.value || "Opsi Kosong";

            // Skor logic
            let score = 0;
            if (type === "TKP") {
                score = parseInt(opt.score) || (opt.isCorrect ? 5 : 0);
            } else {
                score = (opt.isCorrect || opt.score == 5) ? 5 : 0;
            }

            return {
                code: String(code), // Paksa jadi string
                text: String(text),
                score: score,
                isCorrect: score === 5 // Asumsi poin max 5 itu benar
            };
        });

        return {
            text: q.question || q.text || "Pertanyaan Tanpa Teks",
            type: type,
            image: q.image || null,
            explanation: q.explanation || "Pembahasan lengkap tersedia di versi Premium.",
            options: { create: safeOptions }
        };
    });

    allQuestions.push(...mappedQuestions);
    console.log(`✅ Loaded ${mappedQuestions.length} soal dari ${file}`);
  }

  // 3. SEEDING DATABASE
  console.log(`📦 Mengemas total ${allQuestions.length} butir soal...`);

  const existing = await prisma.tryoutPackage.findFirst({
      where: { title: packageData.title } 
  });
  
  if (existing) {
      console.log("🗑️ Menghapus paket lama...");
      await prisma.tryoutPackage.delete({ where: { id: existing.id } });
  }

  const newPkg = await prisma.tryoutPackage.create({
    data: {
      ...packageData,
      questions: {
        create: allQuestions
      }
    }
  });

  console.log(`🎉 SUKSES! Paket ID: ${newPkg.id}`);
}

main()
  .catch((e) => {
    console.error("❌ ERROR SAAT SEEDING:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });