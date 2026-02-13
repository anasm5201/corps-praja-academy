import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // ✅ FIX: Ganti 'prisma.question' menjadi 'prisma.tryoutQuestion'
    // Mengambil soal secara acak/terbaru dari database
    const questions = await prisma.tryoutQuestion.findMany({
        take: 20, // Kita ambil 20 soal untuk satu sesi
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(questions);
    
  } catch (error) {
    console.error("Fetch Questions Error:", error);
    return NextResponse.json(
        { message: "Gagal mengambil data soal." }, 
        { status: 500 }
    );
  }
}