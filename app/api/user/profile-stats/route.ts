import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🚨 [KUNCI ANTI-CRASH VERCEL] 
// Memaksa API ini untuk selalu beroperasi secara real-time (membaca session Kadet), 
// dan mencegah Vercel membekukannya menjadi halaman statis saat proses build.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Verifikasi Keamanan (Hanya Kadet terdaftar yang bisa meminta data)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Akses Ditolak. Sesi tidak valid." }, { status: 401 });
    }

    // 2. Bongkar Brankas Database untuk Mengambil Rekam Jejak Kadet
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skdAttempts: { select: { id: true } },
        physicalLogs: { select: { id: true } },
        missions: { where: { isCompleted: true }, select: { id: true } }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Data Personel tidak ditemukan." }, { status: 404 });
    }

    // 3. Kemas Intelijen menjadi Paket Data yang Siap Ditampilkan di Layar
    const statsData = {
      name: user.name || "",
      gender: user.gender || "", // SANGAT KRUSIAL UNTUK AI!
      xp: user.xp || 0,
      rank: user.rank || "CADET",
      skdCount: user.skdAttempts.length,
      physicalCount: user.physicalLogs.length,
      missionCount: user.missions.length
    };

    return NextResponse.json(statsData);

  } catch (error) {
    console.error("[PROFILE_STATS_API_ERROR]", error);
    return NextResponse.json({ error: "Gagal menarik data dari markas." }, { status: 500 });
  }
}