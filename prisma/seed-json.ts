import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// LOKASI FOLDER DATA ANDA (Sesuai gambar)
const DATA_FOLDER = path.join(process.cwd(), 'data', 'TO_FREE_01');

async function main() {
  console.log(`🚀 MEMULAI OPERASI MASS INJECTION DARI: ${DATA_FOLDER}`);

  // 1. BUAT WADAH PAKETNYA DULU
  const pkg = await prisma.tryoutPackage.create({
    data: {
      title: "SKD - SELEKSI KOMPETENSI DASAR (FULL PACKAGE)",
      description: "Paket lengkap hasil import otomatis dari Bank Soal.",
      duration: 100, // 100 Menit Standar SKD
    }
  });

  console.log(`📦 Paket Terbuat: ${pkg.title}`);

  // 2. BACA SEMUA FILE DI FOLDER
  const files = fs.readdirSync(DATA_FOLDER);
  
  let totalSoal = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue; // Lewati jika bukan JSON

    const filePath = path.join(DATA_FOLDER, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const questions = JSON.parse(fileContent);

    console.log(`📂 Memproses file: ${file} (${questions.length} soal)...`);

    // 3. LOOPING SETIAP SOAL DALAM JSON
    for (const q of questions) {
      
      // LOGIKA JENIUS: MENCARI KUNCI JAWABAN OTOMATIS
      // Kita cari opsi yang score-nya paling tinggi (biasanya 5)
      // Jika TKP (skala 1-5), tetap kita ambil yang 5 sebagai "CorrectAnswer" referensi
      const options = q.options || [];
      
      // Cari opsi dengan skor tertinggi
      const bestOption = options.reduce((prev: any, current: any) => 
        (prev.score > current.score) ? prev : current
      , { score: -1, key: 'X' });

      // SIMPAN KE DATABASE
      await prisma.question.create({
        data: {
          packageId: pkg.id,
          text: q.text,
          // Convert array options dari JSON Anda menjadi String untuk disimpan di DB
          options: JSON.stringify(q.options), 
          correctAnswer: bestOption.key, // Otomatis ambil kunci misal "A" atau "C"
          explanation: q.explanation || "Pembahasan tersedia di kelas."
        }
      });
    }

    totalSoal += questions.length;
  }

  console.log(`✅ SUKSES! Total ${totalSoal} amunisi soal telah dimasukkan ke gudang.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });