import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 OPERASI FINAL: INJEKSI AMUNISI SKD (ANTI-CRASH MODE)...');

  const dataDir = path.join(process.cwd(), 'data/speed-drill-source');
  
  // WIPE DATA LAMA
  console.log('🧹 MENGOSONGKAN GUDANG AMUNISI LAMA...');
  try {
    await prisma.userSpeedProgress.deleteMany({});
    await prisma.speedQuestion.deleteMany({});
    await prisma.speedUnit.deleteMany({});
  } catch(e) { console.log('Info: Database sudah bersih/baru.'); }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  console.log(`📦 MEMERIKSA ${files.length} KONTAINER DATA...\n`);

  for (const file of files) {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      try {
          // COBA PARSE JSON
          const json = JSON.parse(content);

          // JIKA BERHASIL, LANJUT PROSES
          let phase = 1;
          if (json.unit_id > 10) phase = 2;
          if (json.unit_id > 20) phase = 3;

          await prisma.speedUnit.create({
              data: {
                  order: json.unit_id,
                  phase: phase,
                  title: json.title,
                  description: json.description || "",
                  questions: {
                      create: json.questions.map((q: any) => ({
                          type: q.type,
                          content: q.text || q.content || "TEKS KOSONG", 
                          explanation: q.explanation || "Tidak ada pembahasan.",
                          options: JSON.stringify(q.options),
                          correctAnswer: "AUTO"
                      }))
                  }
              }
          });
          
          // BERHASIL
          console.log(`✅ SUKSES: ${file} (Unit ${json.unit_id})`);

      } catch (e) {
          // JIKA GAGAL (INI YANG KITA CARI)
          console.error(`\n❌❌❌ FILE RUSAK DITEMUKAN: ${file} ❌❌❌`);
          console.error(`   Penyebab: File ini berisi KODE PROGRAM ('use client'?), bukan JSON murni.`);
          console.error(`   TINDAKAN: Hapus file '${file}' atau perbaiki isinya menjadi JSON valid.\n`);
          // Script lanjut ke file berikutnya, tidak crash.
      }
  }

  console.log('\n🏁 OPERASI SELESAI. Cek jika ada file bertanda SILANG MERAH (❌).');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });