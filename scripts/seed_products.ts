import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 MEMULAI OPERASI LOGISTIK (TRINITY STRATEGY + SPEED DRILL)...");

  // 1. BERSIHKAN DATA LAMA
  await prisma.purchase.deleteMany({}); 
  await prisma.tryoutPackage.deleteMany({}); 
  await prisma.psychologyPackage.deleteMany({});

  // ---------------------------------------------------------
  // TIER 1: LEAD MAGNET (GRATIS)
  // ---------------------------------------------------------
  await prisma.tryoutPackage.create({
    data: {
      title: "TES DIAGNOSTIK: SELEKSI AWAL",
      category: "SKD",
      duration: 100,
      price: 0, 
      description: "Uji kemampuan dasar Anda sekarang. Paket ini hanya berisi Tes SKD Dasar. Fitur Speed Drill & Analisa Grafik Jasmani TERKUNCI.",
      isPublished: true,
      questions: { create: [] }
    }
  });

  // ---------------------------------------------------------
  // TIER 2: MANDIRI ACCESS (MID TICKET) - RP 249.000
  // ---------------------------------------------------------
  await prisma.tryoutPackage.create({
    data: {
      title: "AKSES MANDIRI: FULL ARSENAL",
      category: "SKD", 
      duration: 110,
      price: 249000, 
      description: "✅ UNLIMITED SPEED DRILL (Kecermatan) + Bank Soal SKD Lengkap + E-Book Strategi. Akses sepuasnya untuk latihan mandiri (Self-Paced).",
      isPublished: true,
       questions: { create: [] }
    }
  });

  // ---------------------------------------------------------
  // TIER 3: VIP MENTORING (HIGH TICKET) - RP 1.499.000
  // ---------------------------------------------------------
  await prisma.tryoutPackage.create({
    data: {
      title: "PROGRAM MENTORING VIP (BATCH 1)",
      category: "SKD", 
      duration: 110,
      price: 1499000, 
      description: "👑 FASILITAS KOMANDAN: Monitoring Grafik Speed Drill & Jasmani Mingguan, Grup WhatsApp VIP, Konsultasi Personal, dan Jaminan Bimbingan H-1 Tes. Terbatas 20 Slot.",
      isPublished: true,
       questions: { create: [] }
    }
  });
  
  // ---------------------------------------------------------
  // ASET TAMBAHAN (SUPAYA KATEGORI PSIKOLOGI MUNCUL)
  // ---------------------------------------------------------
  await prisma.psychologyPackage.create({
    data: {
      title: "SPEED DRILL: KECERMATAN SIMBOL",
      type: "KECERMATAN", // Tipe Khusus
      price: 10000000, // Harga dummy mahal (biar ga dibeli eceran)
      description: "Modul pelatihan refleks saraf dan ketahanan fokus. Termasuk dalam Paket Mandiri & VIP.",
      isPublished: true
    }
  });

  console.log("✅ GUDANG LOGISTIK SIAP. FITUR SPEED DRILL TELAH DI-HIGHLIGHT.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });