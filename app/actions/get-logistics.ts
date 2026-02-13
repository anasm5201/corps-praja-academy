'use server'

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getLogisticsPackages() {
  try {
    // Ambil semua paket kategori SKD
    // Urutkan berdasarkan judul agar Paket 01, 02, dst berurutan
    const packages = await prisma.tryoutPackage.findMany({
      where: {
        category: "SKD",
        isPublished: true,
      },
      orderBy: {
        title: 'asc', // Agar urut Paket 01, Paket 02...
      },
      include: {
        _count: {
          select: { questions: true } // Kita hitung jumlah soalnya sekalian
        }
      }
    })

    return { success: true, data: packages }
  } catch (error) {
    console.error("Gagal mengambil logistik:", error)
    return { success: false, data: [] }
  }
}