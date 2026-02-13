import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 MEMBUAT AGEN DUMMY...');

  const userId = "user_demo_id"; // ID TETAP UNTUK DEVELOPMENT

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {}, 
    create: {
      id: userId,
      email: "kadet.demo@praja.id",
      name: "Kadet Percobaan",
      password: "rahasia_negara", 
      role: "CADET",
      rank: "Kadet Pratama (Tingkat I)",
      level: 1,
      xp: 0,
      // hearts: 5, <--- BARIS INI KITA HAPUS KARENA BELUM ADA DI DB
    },
  });

  console.log(`✅ Agen Siap: ${user.name} (${user.email})`);
}

main()
  .catch((e) => {
    console.error("❌ Gagal membuat user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });