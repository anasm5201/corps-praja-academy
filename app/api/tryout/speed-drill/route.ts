import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Supaya selalu fresh (tidak di-cache)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. AMBIL SOAL SPEED DRILL
    // Skenario: Latihan cepat 10 soal TIU (atau acak) untuk melatih kecepatan
    
    // ✅ FIX: Ganti 'prisma.question' jadi 'prisma.tryoutQuestion'
    const rawQuestions = await prisma.tryoutQuestion.findMany({
      where: {
        // Fokus ke TIU karena biasanya ini yang butuh speed drill
        type: 'TIU' 
      },
      take: 10, // Ambil 10 soal saja
      // orderBy: { createdAt: 'desc' } // Bisa diacak atau ambil terbaru
    });

    // 2. FORMAT DATA (PARSING JSON OPTIONS)
    // Sama seperti di file exam, kita harus ubah String JSON jadi Object
    const drillQuestions = rawQuestions.map((q) => ({
        id: q.id,
        type: q.type,
        category: q.type, // Frontend mungkin butuh field 'category'
        text: q.text,
        questionText: q.text, // Cadangan
        image: q.image || null,
        
        // Mapping Explanation -> Discussion
        discussion: q.explanation || "Pembahasan belum tersedia",
        
        // Parsing Options
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        
        correctAnswer: q.correctAnswer,
        score: q.score || 5
    }));

    return NextResponse.json(drillQuestions);

  } catch (error) {
    console.error("Speed Drill Error:", error);
    return NextResponse.json({ message: "Gagal memuat Speed Drill" }, { status: 500 });
  }
}