import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ambil catatan disiplin terbaru sebagai Log Amnesti
    const logs = await prisma.disciplinaryRecord.findMany({
      include: {
        // Ambil info nama & pangkat user terkait
        user: { 
            select: { 
                name: true, 
                // rank: true // Uncomment jika ada kolom rank di tabel User
            } 
        }
      },
      // ✅ FIX: Ganti 'issuedAt' menjadi 'createdAt'
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(logs);

  } catch (error) {
    console.error("Amnesty Log Error:", error);
    // Return array kosong agar frontend tidak crash jika error
    return NextResponse.json([]);
  }
}