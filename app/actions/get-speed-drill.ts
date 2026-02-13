"use server";

import { prisma } from "@/lib/prisma";

export async function getSpeedDrillUnits() {
  try {
    // Ambil data unit, urutkan berdasarkan unitNumber (1, 2, 3...)
    const units = await prisma.drillUnit.findMany({
      orderBy: { unitNumber: "asc" },
      include: {
        _count: { select: { questions: true } },
      },
    });

    return { success: true, data: units };
  } catch (error) {
    console.error("Gagal mengambil data Speed Drill:", error);
    return { success: false, data: [] };
  }
}