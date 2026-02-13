import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚑 MEMULAI OPERASI PENYELAMATAN PSIKOLOGI (RESCUE MISSION)...');

  const filesToRescue = [
    'kecerdasan_01.json',
    'kecerdasan_02.json', // PASTIKAN ANDA JUGA MEMPERBAIKI FILE INI DULU
    'kecerdasan_05.json'  // PASTIKAN ANDA JUGA MEMPERBAIKI FILE INI DULU
  ];

  const psychoDir = path.join(process.cwd(), 'data/LOGISTICS/psychology');

  for (const fileName of filesToRescue) {
    const filePath = path.join(psychoDir, fileName);
    
    if (fs.existsSync(filePath)) {
      try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData); // Akan error jika JSON masih rusak

        let category = "KECERDASAN"; 
        
        // Buat Paket
        const pkg = await prisma.psychologyPackage.create({
          data: {
            title: data.title || fileName.replace('.json', '').toUpperCase(),
            category: category,
          }
        });

        // Masukkan Soal
        const questions = data.questions || [];
        for (const q of questions) {
            await prisma.psychologyQuestion.create({
                data: {
                    packageId: pkg.id,
                    text: q.question || q.text || "Soal...",
                    image: q.image || null, // Ambil gambar/SVG jika ada
                    options: JSON.stringify(q.options || [])
                }
            });
        }
        console.log(`✅ BERHASIL MENYELAMATKAN: ${fileName}`);

      } catch (e) {
        console.error(`❌ GAGAL RESCUE ${fileName}. JSON MASIH RUSAK! Cek koma/kurung kurawal.`);
      }
    } else {
      console.warn(`⚠️ File ${fileName} tidak ditemukan.`);
    }
  }

  console.log('🏁 OPERASI PENYELAMATAN SELESAI.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });