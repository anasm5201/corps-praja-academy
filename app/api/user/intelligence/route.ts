import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. AMBIL SESI
    const session = await getServerSession(authOptions);

    // ✅ FIX: Bypass Validasi ID (Gunakan 'as any')
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. AMBIL LAPORAN TEMPUR TERAKHIR
    const lastAttempt = await prisma.tryoutAttempt.findFirst({
      where: { userId: userId },
      orderBy: { finishedAt: 'desc' } // Gunakan finishedAt atau createdAt
    });

    if (!lastAttempt) {
        return NextResponse.json({ 
            message: "Belum ada data intelijen.", 
            data: null 
        });
    }

    // 3. BEDAH DATA (PARSING JSON)
    // Karena rincian nilai ada di dalam JSON 'answers', kita bongkar dulu.
    let scores = { twk: 0, tiu: 0, tkp: 0 };
    
    try {
        if (lastAttempt.answers && typeof lastAttempt.answers === 'string') {
            const parsed = JSON.parse(lastAttempt.answers);
            // Struktur yang kita buat di submit: { details: { twk, tiu, tkp }, ... }
            if (parsed.details) {
                scores = parsed.details;
            }
        }
    } catch (e) {
        console.log("Gagal parsing detail nilai intelijen, menggunakan default 0");
    }

    // 4. GENERATE ANALISA INTELIJEN
    const intelligence = [
        {
            category: "TWK",
            score: scores.twk,
            // Passing Grade TWK: 65
            status: scores.twk >= 65 ? "AMAN" : "BAHAYA",
            advice: scores.twk >= 65 ? "Pertahankan wawasan kebangsaan." : "Perbanyak baca pilar negara dan sejarah!"
        },
        {
            category: "TIU",
            score: scores.tiu,
            // Passing Grade TIU: 80
            status: scores.tiu >= 80 ? "AMAN" : "KRITIS",
            advice: scores.tiu >= 80 ? "Logika Anda tajam." : "Latih hitungan, deret, dan silogisme rutin."
        },
        {
            category: "TKP",
            score: scores.tkp,
            // Passing Grade TKP: 166
            status: scores.tkp >= 166 ? "AMAN" : "PERLU EVALUASI",
            advice: scores.tkp >= 166 ? "Mentalitas pelayanan baik." : "Fokus pada pelayanan publik dan jejaring kerja."
        }
    ];

    return NextResponse.json({ 
        message: "Laporan Intelijen Diterima",
        totalScore: lastAttempt.score,
        analysis: intelligence
    });

  } catch (error) {
    console.error("Intelligence Error:", error);
    return NextResponse.json({ message: "Gagal memuat intelijen" }, { status: 500 });
  }
}