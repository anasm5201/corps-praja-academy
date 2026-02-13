import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. AMBIL SESI
    const session = await getServerSession(authOptions);

    // ✅ FIX: Bypass Validasi ID (Gunakan 'as any')
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. HITUNG ULANG TOTAL SKOR DARI RIWAYAT (AUDIT XP)
    // Kita ambil total skor dari semua tryout yang pernah dikerjakan
    const aggregations = await prisma.tryoutAttempt.aggregate({
      _sum: {
        score: true
      },
      where: {
        userId: userId
      }
    });

    const totalScore = aggregations._sum.score || 0;

    // 3. KALKULASI XP BARU
    // Misal: XP = 50% dari Total Skor Akumulatif
    // Sesuaikan rumus ini dengan Game Design Anda
    const newXP = Math.floor(totalScore * 0.5);

    // 4. UPDATE USER
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP
      }
    });

    return NextResponse.json({ 
        message: "XP Berhasil Disinkronisasi", 
        data: { 
            totalScoreFromHistory: totalScore,
            syncedXP: updatedUser.xp 
        } 
    });

  } catch (error) {
    console.error("Sync XP Error:", error);
    return NextResponse.json({ message: "Gagal melakukan sinkronisasi XP" }, { status: 500 });
  }
}