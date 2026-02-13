import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log(`🚀 MEMULAI OPERASI IMPORT (VERSI PRECISION STRIKE - FINAL FIX)...`);

  // 1. BERSIHKAN AREA DULU (CLEAN SLATE PROTOCOL)
  console.log(`🧹 Membersihkan sisa-sisa data lama...`);
  
  try {
      // Hapus History User
      await prisma.drillHistory.deleteMany({});
      
      // 🔥 PERBAIKAN: Gunakan TryoutQuestion sesuai schema Anda, bukan Question!
      await prisma.tryoutQuestion.deleteMany({
        where: { drillUnitId: { not: null } }
      });
      
      // Hapus Unit
      await prisma.drillUnit.deleteMany({});
      
      console.log(`✨ Area bersih. Siap injeksi data.`);
  } catch (e) {
      console.log(`⚠️ Peringatan saat pembersihan (abaikan jika db baru):`, e);
  }

  // 2. DETEKSI LOKASI DATA
  const dataRoot = path.join(process.cwd(), 'data');
  const targetFolder = path.join(dataRoot, 'drill_source');

  if (!fs.existsSync(targetFolder)) {
      console.error(`❌ GAGAL: Folder ${targetFolder} tidak ditemukan.`);
      console.error(`   Pastikan folder 'data/drill_source' ada dan berisi file JSON.`);
      return;
  }

  // 3. BACA DAN URUTKAN FILE
  const files = fs.readdirSync(targetFolder);
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  let totalQuestions = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    console.log(`\n📦 Memproses Supply: ${file}...`);
    
    try {
        const filePath = path.join(targetFolder, file);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const content = JSON.parse(rawContent);

        const questionsArray = content.questions || [];

        if (questionsArray.length === 0) {
            console.log(`   ⚠️ File ini kosong. Skip.`);
            continue;
        }

        // A. TENTUKAN NOMOR UNIT & LEVEL
        const unitMatch = file.match(/(\d+)/);
        const unitNumber = unitMatch ? parseInt(unitMatch[1]) : 0;
        
        let level = "PRATAMA";
        if (unitNumber > 10) level = "MUDA";
        if (unitNumber > 20) level = "MADYA";

        // B. BUAT UNIT BARU
        const unit = await prisma.drillUnit.create({
          data: {
            unitNumber: unitNumber, 
            title: content.title || `SPEED DRILL UNIT ${unitNumber}`,
            category: "SKD", 
            description: content.description || `Latihan Refleks Taktis Level ${unitNumber}`,
            level: level, 
            duration: 120, 
          }
        });

        // C. INJEKSI SOAL
        let count = 0;

        for (const q of questionsArray) {
          const questionText = q.text || q.content || "Pertanyaan tanpa teks"; 
          const options = q.options || [];
          
          const correctOption = options.reduce((prev: any, current: any) => {
              return (prev.score > current.score) ? prev : current;
          }, { key: 'A', score: 0 });

          const answerKey = correctOption.key; 
          const qType = q.type || "TIU"; 

          // 🔥 PERBAIKAN: Gunakan TryoutQuestion, BUKAN Question!
          await prisma.tryoutQuestion.create({
            data: {
              drillUnitId: unit.id,
              text: questionText,      
              type: qType,
              options: JSON.stringify(options),
              correctAnswer: answerKey, 
              explanation: q.explanation || "Pembahasan lengkap tersedia di mode review.",
            }
          });
          count++;
        }
        
        console.log(`   ✅ Unit ${unitNumber} (${level}): Sukses (${count} Soal).`);
        totalQuestions += count;

    } catch (err) {
        console.error(`   ⚠️ Error pada file ${file}:`, err);
    }
  }

  console.log(`\n🏁 MISI SELESAI! Total ${totalQuestions} amunisi soal siap digunakan.`);
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