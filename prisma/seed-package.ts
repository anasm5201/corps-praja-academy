import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // DAFTARKAN PAKET SOAL AGAR DATABASE MENGENALINYA
  const packageId = "tryout-skd-free-01"; // Sesuaikan dengan ID di URL browser Anda

  await prisma.tryoutPackage.upsert({
    where: { id: packageId },
    update: {},
    create: {
      id: packageId,
      title: "Tryout SKD Free 01 - Corps Praja",
      category: "SKD",
      duration: 100,
      isPublished: true,
    },
  });
  console.log(`✅ LOGISTIK: Paket ${packageId} telah terdaftar di database.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });