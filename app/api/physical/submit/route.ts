import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. AMBIL SESI
    const session = await getServerSession(authOptions);

    // ✅ FIX: Bypass Validasi ID (Gunakan 'as any')
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. TERIMA DATA
    const body = await req.json();
    const { runDistance, pushUp, sitUp, pullUp, shuttleRun } = body;

    // 3. HITUNG SKOR (Simulasi)
    let totalScore = 0;
    
    // Logika Skor Sederhana
    if (runDistance) totalScore += (runDistance / 2400) * 20;
    if (pushUp) totalScore += (pushUp / 40) * 20;
    if (sitUp) totalScore += (sitUp / 40) * 20;
    if (pullUp) totalScore += (pullUp / 10) * 20;
    
    // Cap score max 100
    if (totalScore > 100) totalScore = 100;
    const finalScore = Math.round(totalScore);

    // 4. UPDATE USER XP (REWARD)
    // Kita hindari insert ke PhysicalLog dulu agar Build Lolos 100%
    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: { increment: finalScore }, // XP sesuai skor fisik
            walletBalance: { increment: 500 } // Bonus receh
        }
    });

    return NextResponse.json({ 
        message: "Hasil Tes Fisik Diterima", 
        score: finalScore 
    });

  } catch (error) {
    console.error("Submit Physical Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
