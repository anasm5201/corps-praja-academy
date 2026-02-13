import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. AMBIL SESI
    const session = await getServerSession(authOptions);

    // Bypass Validasi ID
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. AMBIL RIWAYAT
    const history = await prisma.tryoutAttempt.findMany({
      where: { userId: userId },
      include: {
        // ✅ FIX: KEMBALIKAN KE 'package'
        package: { 
            select: { 
                title: true, 
                // description: true // Opsional
            } 
        }
      },
      // Urutkan berdasarkan waktu dibuat (paling aman)
      orderBy: { createdAt: 'desc' } 
    });

    return NextResponse.json(history);

  } catch (error) {
    console.error("History Error:", error);
    return NextResponse.json([]);
  }
}