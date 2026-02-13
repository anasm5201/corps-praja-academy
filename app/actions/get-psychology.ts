"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getPsychologyPackages() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    // KITA AMBIL SEMUA DATA YANG BUKAN SKD
    // Ini cara paling aman agar Kecermatan, Kecerdasan, dan Kepribadian muncul semua
    const packages = await prisma.tryoutPackage.findMany({
      where: {
        category: { not: "SKD" }, // Ambil semua yang BUKAN SKD
        isPublished: true,
      },
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { data: packages };
  } catch (error) {
    console.error("Database Error:", error);
    return { error: "Failed to fetch packages" };
  }
}