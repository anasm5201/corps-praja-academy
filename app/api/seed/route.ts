import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. CEK APAKAH SUDAH ADA PAKET SEBELUMNYA
    // Pastikan pakai 'title' sesuai perbaikan sebelumnya
    const existingPackage = await prisma.tryoutPackage.findFirst({
        where: { title: "SIMULASI SKD - PAKET BRAVO (HOTS)" }
    });

    if (existingPackage) {
        return NextResponse.json({ message: "Paket Latihan sudah tersedia di Gudang Senjata." });
    }

    // 2. BUAT PAKET TRYOUT BARU
    const newPackage = await prisma.tryoutPackage.create({
      data: {
        title: "SIMULASI SKD - PAKET BRAVO (HOTS)",
        description: "Simulasi CAT BKN 110 Soal (Mini Version). Fokus pada Analisis & TKP Jejaring Kerja.",
        price: 0,
        
        // 3. MASUKKAN AMUNISI (SOAL)
        questions: {
            create: [
                {
                    type: "TWK",
                    // Pastikan field ini 'text' (standar Prisma)
                    text: "Pancasila sebagai dasar negara mengandung makna bahwa nilai-nilai yang terkandung di dalamnya menjadi...",
                    options: JSON.stringify([
                        { code: "A", text: "Pedoman tingkah laku warga negara" },
                        { code: "B", text: "Dasar penyelenggaraan negara" },
                        { code: "C", text: "Sumber hukum materiil" },
                        { code: "D", text: "Jati diri bangsa Indonesia" },
                        { code: "E", text: "Pandangan hidup bangsa" }
                    ]),
                    correctAnswer: "B",
                    score: 5,
                    // ❌ DISCUSSION DINONAKTIFKAN (Penyebab Error)
                    // discussion: "Sebagai dasar negara, Pancasila adalah sumber dari segala sumber hukum."
                },
                {
                    type: "TIU",
                    text: "Semua Praja adalah disiplin. Sebagian yang disiplin adalah atlet.",
                    options: JSON.stringify([
                        { code: "A", text: "Semua atlet adalah Praja" },
                        { code: "B", text: "Sebagian atlet adalah Praja" },
                        { code: "C", text: "Semua yang disiplin adalah Praja" },
                        { code: "D", text: "Sebagian Praja adalah atlet" },
                        { code: "E", text: "Tidak dapat disimpulkan" }
                    ]),
                    correctAnswer: "D",
                    score: 5,
                    // discussion: "Silogisme kategorik."
                },
                {
                    type: "TKP",
                    text: "Anda melihat rekan kerja melakukan pelanggaran kode etik ringan...",
                    options: JSON.stringify([
                        { code: "A", text: "Membiarkannya karena bukan urusan saya" },
                        { code: "B", text: "Melaporkan kepada atasan langsung" },
                        { code: "C", text: "Menegurnya secara personal dan mengingatkan" },
                        { code: "D", text: "Membicarakannya dengan rekan lain" },
                        { code: "E", text: "Menyindirnya saat rapat" }
                    ]),
                    correctAnswer: "C", 
                    score: 5, 
                    // discussion: "Aspek Jejaring Kerja & Integritas: Menegur personal lebih elegan."
                }
            ]
        }
      }
    });

    return NextResponse.json({ 
        message: "Paket Latihan Berhasil Didrop!", 
        data: newPackage 
    });

  } catch (error) {
    console.error("Seeding Error:", error);
    return NextResponse.json({ message: "Gagal melakukan seeding." }, { status: 500 });
  }
}