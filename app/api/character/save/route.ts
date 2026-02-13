import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. AMBIL SESI
    const session = await getServerSession(authOptions);
    
    // Bypass Validasi ID (Standard Protocol)
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. TERIMA DATA
    const body = await req.json();
    const { notes } = body; 

    // 3. TENTUKAN RENTANG WAKTU HARI INI
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // 4. CEK LOG HARI INI
    // ✅ FIX: Ganti 'date' menjadi 'createdAt'
    const dailyLog = await prisma.dailyLog.findFirst({
      where: {
        userId: userId,
        createdAt: { // <-- DIUBAH DARI 'date' KE 'createdAt'
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (dailyLog) {
      // UPDATE
      await prisma.dailyLog.update({
        where: { id: dailyLog.id },
        data: {
          notes: notes,
          // updatedAt biasanya otomatis diurus Prisma (@updatedAt)
        }
      });
    } else {
      // CREATE
      await prisma.dailyLog.create({
        data: {
          userId: userId,
          // createdAt otomatis diisi @default(now())
          notes: notes || ""
        }
      });
    }

    return NextResponse.json({ message: "Progress Karakter Disimpan!" });

  } catch (error) {
    console.error("Save Character Error:", error);
    return NextResponse.json({ message: "Gagal menyimpan data." }, { status: 500 });
  }
}