import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 MEMULAI OPERASI PEMBERSIHAN DUPLIKAT...');

  // 1. Ambil semua paket, urutkan dari yang paling AWAL dibuat
  // (Kita akan pertahankan yang pertama, hapus yang datang belakangan)
  const allPackages = await prisma.tryoutPackage.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { questions: true } }
      }
  });

  console.log(`📊 Terdeteksi Total: ${allPackages.length} Paket di Database.`);

  const seenKeys = new Set();
  let deletedCount = 0;

  for (const pkg of allPackages) {
      // Kita buat "Sidik Jari" unik: GABUNGAN JUDUL + KATEGORI
      // Contoh: "PAKET 18-SKD"
      const uniqueKey = `${pkg.title.trim().toUpperCase()}-${pkg.category}`;

      if (seenKeys.has(uniqueKey)) {
          // 🚨 ALARM: Sidik jari ini sudah ada sebelumnya! Berarti ini DUPLIKAT (Hantu).
          console.log(`   🗑️  MENGHAPUS DUPLIKAT: "${pkg.title}" (ID: ${pkg.id.substring(0,8)}...)`);
          
          try {
              // Hapus Soal-soalnya dulu (Foreign Key)
              await prisma.tryoutQuestion.deleteMany({
                  where: { packageId: pkg.id }
              });

              // Hapus Riwayat Pengerjaan (jika ada yang nyasar)
              await prisma.tryoutAttempt.deleteMany({
                  where: { packageId: pkg.id }
              });

              // Terakhir, Hapus Paketnya
              await prisma.tryoutPackage.delete({
                  where: { id: pkg.id }
              });

              deletedCount++;
          } catch (e) {
              console.log(`       ⚠️ Gagal hapus paket ini: ${e}`);
          }

      } else {
          // ✅ AMAN: Ini adalah paket Asli (Pertama kali ditemukan)
          seenKeys.add(uniqueKey);
      }
  }

  console.log('---------------------------------------------------');
  console.log(`✅ OPERASI SELESAI!`);
  console.log(`💀 Total Paket Hantu Dimusnahkan: ${deletedCount}`);
  console.log(`🛡️  Sisa Paket Valid: ${allPackages.length - deletedCount}`);
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });