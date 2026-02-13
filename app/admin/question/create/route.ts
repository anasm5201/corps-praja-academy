import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. AMBIL SESI & BYPASS AUTH
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. CEK ROLE ADMIN
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 3. TERIMA DATA DARI FRONTEND
    const body = await req.json();
    const { 
        packageId, // WAJIB ADA
        category,  // Dipetakan ke 'type'
        questionText, // Dipetakan ke 'text'
        // Input Opsi Terpisah (Format Lama)
        optionA, optionB, optionC, optionD, optionE, 
        correctAnswer, 
        explanation, // Dipetakan ke 'discussion' (jika ada)
        score 
    } = body;

    // Validasi Logistik
    if (!packageId) {
        return NextResponse.json({ message: "ID Paket (packageId) wajib diisi!" }, { status: 400 });
    }

    // 4. KONVERSI OPSI MENJADI JSON (Standard Baru)
    // Kita buat array object agar struktur datanya rapi
    const optionsArray = [
        { code: "A", text: optionA || "" },
        { code: "B", text: optionB || "" },
        { code: "C", text: optionC || "" },
        { code: "D", text: optionD || "" },
        { code: "E", text: optionE || "" },
    ].filter(opt => opt.text !== ""); // Hapus opsi kosong

    // 5. SIMPAN KE DATABASE (TryoutQuestion)
    const newQuestion = await prisma.tryoutQuestion.create({
        data: {
            packageId: packageId,
            type: category || "TWK", // Default ke TWK
            
            // Gunakan 'text' (sesuai analisa terakhir kita)
            text: questionText || body.question || "Soal Tanpa Teks", 
            
            // Simpan Options sebagai JSON String
            options: JSON.stringify(optionsArray),
            
            correctAnswer: correctAnswer,
            score: parseInt(score) || 5,
            
            // discussion: explanation // COMMENT OUT DULU (Sesuai error sebelumnya)
        }
    });

    return NextResponse.json({ message: "Soal Berhasil Ditambahkan", data: newQuestion });

  } catch (error) {
    console.error("Create Question Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}