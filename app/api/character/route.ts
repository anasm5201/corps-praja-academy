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

    // 2. TENTUKAN WAKTU HARI INI
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const tomorrowStart = new Date(now.setHours(24, 0, 0, 0));

    // 3. CEK LOG HARIAN (FIX ERROR DISINI)
    // Pastikan nama kolom tanggal di schema DailyLog Anda sesuai (biasanya 'createdAt' atau 'date')
    // Di sini saya gunakan 'createdAt' sebagai standar Prisma.
    // Jika di schema Anda menggunakan 'date', silakan ubah 'createdAt' menjadi 'date'.
    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        userId: userId, // Gunakan userId yang aman
        createdAt: { gte: todayStart, lt: tomorrowStart }
      }
    });

    const body = await req.json();
    const { mood, notes } = body; // Sesuaikan dengan input frontend Anda

    // 4. LOGIKA SIMPAN / UPDATE
    if (existingLog) {
      // Jika sudah ada, mungkin update catatan?
      const updatedLog = await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: {
             // notes: notes, // Uncomment jika ada kolom notes
             updatedAt: new Date()
        }
      });
      return NextResponse.json({ message: "Laporan Harian Diupdate", data: updatedLog });
    } else {
      // Jika belum ada, buat baru
      const newLog = await prisma.dailyLog.create({
        data: {
          userId: userId,
          // notes: notes || "", 
          // Masukkan field lain sesuai Schema DailyLog Anda
        }
      });
      return NextResponse.json({ message: "Laporan Harian Diterima", data: newLog }, { status: 201 });
    }

  } catch (error) {
    console.error("Character Log Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}