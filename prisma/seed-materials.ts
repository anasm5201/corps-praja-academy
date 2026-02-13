import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 MEMULAI OPERASI PERBAIKAN DATA & AKSES...');

  // 1. BERSIHKAN DATA LAMA (Agar tidak duplikat)
  try {
      await prisma.material.deleteMany({});
      console.log('🧹 Data lama dibersihkan.');
  } catch (e) {
      console.log('⚠️ Gudang siap diisi.');
  }

  // 2. DATA DOKTRIN (SESUAI KONFIGURASI KOMANDAN - TIDAK DIUBAH)
  const materials = [
    {
      title: "DOKTRIN 1 UUD & PANCASILA", 
      description: "Fondasi ideologi negara dan konstitusi dasar.",
      category: "DOKTRIN",
      type: "PDF",
      url: "/materials/doktrin 1 uud & pancasila.pdf", 
      isLocked: false,
    },
    {
      title: "DOKTRIN 2 ANTI KORUPSI",
      description: "Integritas perisai abdi negara.",
      category: "DOKTRIN",
      type: "PDF",
      url: "/materials/doktrin 2 anti korupsi.pdf",
      isLocked: false,
    },
    {
      title: "DOKTRIN 3 BAHASA INDONESIA",
      description: "Komunikasi taktis pemersatu bangsa.",
      category: "DOKTRIN",
      type: "PDF",
      url: "/materials/doktrin 3 bahasa indonesia.pdf",
      isLocked: false,
    },
    {
      title: "DOKTRIN 4 NUMERIK", 
      description: "Ketajaman logika hitungan dan kuantitatif.",
      category: "DOKTRIN",
      type: "PDF",
      url: "/materials/doktrin 4 numerik.pdf",
      isLocked: false,
    },
    {
      title: "DOKTRIN 5 SILOGISME &ANALOGI", 
      description: "Pola pikir deduktif akurat dalam pengambilan keputusan.",
      category: "DOKTRIN",
      type: "PDF",
      url: "/materials/doktrin 5 silogisme &analogi.pdf", 
      isLocked: false,
    },
    {
      title: "DOKTRIN 7 PILAR NEGARA",
      description: "Empat pilar kebangsaan sebagai poros utama.",
      category: "DOKTRIN",
      type: "PDF",
      url: "/materials/doktrin 7 pilar negara.pdf",
      isLocked: false,
    },
    {
      title: "DOKTRIN 8 LOGIKA SEJARAH",
      description: "Memahami masa lalu untuk strategi masa depan.",
      category: "DOKTRIN",
      type: "PDF",
      url: "/materials/doktrin 8 logika sejarah.pdf",
      isLocked: false,
    },
    {
      title: "DOKTRIN 9 PSIKOLOGI TKP", 
      description: "Analisa karakter mental dan kepribadian.",
      category: "DOKTRIN",
      type: "PDF",
      url: "/materials/doktrin 9 psikologi TKP.pdf", 
      isLocked: false, 
    },
    {
      title: "DOKTRIN 10 GRAND STRATEGY",
      description: "Visi jangka panjang korps dan strategi nasional.",
      category: "DOKTRIN",
      type: "PDF",
      url: "/materials/doktrin 10 grand strategy.pdf",
      isLocked: false, 
    },
  ];

  // 3. EKSEKUSI PENYAMBUNGAN
  console.log('🚀 Mengirim logistik materi ke Plaza Menza...');
  
  for (const item of materials) {
    await prisma.material.create({
        data: {
            ...item,
            // TEKNIS: Menambahkan stempel waktu agar validasi database lolos mulus
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });
    console.log(`   ✅ Dropped: ${item.title}`);
  }

  console.log(`\n✅ ${materials.length} DOKTRIN DIPERBARUI: PLAZA MENZA SIAP!`);
}

main()
  .catch((e) => {
    console.error("❌ GAGAL DROP:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });