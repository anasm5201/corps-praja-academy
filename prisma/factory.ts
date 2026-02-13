import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// DEFINISI TIPE DATA MENTAH
type RawQuestion = {
  category: string;
  type?: string; // Handle variasi nama field
  text: string;
  image?: string | null;
  explanation?: string;
  options: {
    key?: string;
    code?: string; // Handle variasi 'key' atau 'code'
    text: string;
    score: number;
  }[];
};

async function injectPackage(packageCode: string, title: string, filename: string) {
  const filePath = path.join(process.cwd(), 'data', 'LOGISTICS', filename);
  
  console.log(`\n🚀 MEMULAI OPERASI INJEKSI: ${packageCode}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ERROR: File logistik ${filename} tidak ditemukan di folder data/LOGISTICS!`);
    return;
  }

  // 1. BACA DATA JSON
  const rawData: RawQuestion[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`📦 Muatan ditemukan: ${rawData.length} butir amunisi (soal).`);

  // 2. DAFTARKAN PAKET KE DATABASE
  await prisma.tryoutPackage.upsert({
    where: { id: packageCode },
    update: {},
    create: {
      id: packageCode,
      title: title,
      category: "SKD",
      duration: 100, // 100 Menit standar SKD
      isPublished: true,
      price: 0, 
    }
  });

  // 3. BERSIHKAN DATA LAMA (JIKA ADA REVISI)
  await prisma.question.deleteMany({ where: { packageId: packageCode } });
  console.log(`🧹 Area pembersihan selesai. Memulai injeksi data baru...`);

  // 4. INJEKSI SOAL (BATCH PROCESSING)
  let counter = 0;
  for (const q of rawData) {
    const category = q.category || q.type || 'TIU'; // Default TIU jika null
    
    // Normalisasi Opsi Jawaban
    const formattedOptions = q.options.map(opt => ({
      code: opt.key || opt.code || 'A',
      text: opt.text,
      score: opt.score
    }));

    await prisma.question.create({
      data: {
        packageId: packageCode,
        text: q.text,
        image: q.image || null,
        type: category,
        explanation: q.explanation || "Pembahasan taktis belum tersedia.",
        options: {
          create: formattedOptions
        }
      }
    });
    counter++;
  }

  console.log(`✅ SUKSES: ${counter} soal berhasil ditanamkan ke Paket ${packageCode}.`);
}

async function main() {
  // --- DAFTAR ANTRIAN PRODUKSI (UNCOMMENT UNTUK MENJALANKAN) ---
  
  // Contoh:
  // await injectPackage('SKD_PREMIUM_02', 'Tryout SKD Premium - Batch 02', 'paket_02.json');
  // await injectPackage('SKD_PREMIUM_03', 'Tryout SKD Premium - Batch 03', 'paket_03.json');
  
  console.log("🏭 PABRIK DATA CORPS PRAJA: STANDBY.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });