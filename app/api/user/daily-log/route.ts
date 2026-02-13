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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. TENTUKAN REWARD HARIAN
    const xpGained = 50; // XP Harian standar

    // 3. UPDATE USER
    // Kita update XP dan Stats (suhStats)
    const updatedUser = await prisma.user.update({
      where: { id: userId }, // Gunakan variabel userId yang aman
      data: {
        xp: { increment: xpGained },
        
        // Pastikan kolom 'suhStats' ada di schema.prisma Anda.
        // Jika error "Unknown argument", beri komentar (//) pada baris ini.
        // Berdasarkan laporan sebelumnya, sepertinya kolom ini ada.
        suhStats: { increment: 1 } 
      }
    });

    return NextResponse.json({ 
        message: "Daily Log Berhasil dicatat", 
        data: { xp: updatedUser.xp } 
    });

  } catch (error) {
    console.error("Daily Log Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}