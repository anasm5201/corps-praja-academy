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

    // 2. TERIMA JAWABAN DARI KADET
    const body = await req.json();
    const { missionId, answers } = body; // missionId = packageId

    if (!missionId || !answers) {
        return NextResponse.json({ message: "Data Misi Tidak Lengkap" }, { status: 400 });
    }

    // 3. AMBIL DATA PAKET SOAL (GUNAKAN 'tryoutPackage')
    // ✅ FIX: Ganti 'prisma.mission' menjadi 'prisma.tryoutPackage'
    const mission = await prisma.tryoutPackage.findUnique({
      where: { id: missionId },
      include: { 
          questions: true // Pastikan relasi di schema bernama 'questions'
      }
    });

    if (!mission) {
        return NextResponse.json({ message: "Misi/Paket tidak ditemukan!" }, { status: 404 });
    }

    // 4. HITUNG SKOR (SCORING ENGINE)
    let totalScore = 0;
    let correctCount = 0;
    
    // Iterasi setiap soal di database
    mission.questions.forEach((q) => {
        // Ambil jawaban user untuk soal ini
        const userAnswer = answers[q.id]; 
        
        // Cek Kebenaran (Case Insensitive)
        if (userAnswer && userAnswer.toUpperCase() === q.correctAnswer.toUpperCase()) {
            totalScore += (q.score || 5); // Default skor 5 per soal
            correctCount++;
        }
    });

    // 5. UPDATE PROGRESS USER (REWARD)
    // Berikan XP dan Coin berdasarkan performa
    const xpGained = totalScore * 2;
    const moneyGained = totalScore * 100;

    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: { increment: xpGained },
            walletBalance: { increment: moneyGained },
            // Jika ada field 'totalScore' atau stats lain, bisa diupdate di sini
        }
    });

    // Opsional: Simpan Riwayat Pengerjaan (Jika ada tabel UserTryout/History)
    /* await prisma.tryoutHistory.create({
        data: { userId, packageId: missionId, score: totalScore }
    });
    */

    return NextResponse.json({ 
        message: "Misi Selesai!", 
        result: {
            score: totalScore,
            correct: correctCount,
            totalQuestions: mission.questions.length,
            rewards: { xp: xpGained, money: moneyGained }
        }
    });

  } catch (error) {
    console.error("Submit Mission Error:", error);
    return NextResponse.json({ message: "Gagal Mengirim Laporan Misi." }, { status: 500 });
  }
}