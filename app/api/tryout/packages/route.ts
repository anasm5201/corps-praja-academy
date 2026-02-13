import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Memanggil koneksi stabil tadi

export async function GET() {
  try {
    // Ambil semua paket yang statusnya Published
    const packages = await prisma.tryoutPackage.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { questions: true }, // Hitung jumlah soal otomatis
        },
      },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data paket' },
      { status: 500 }
    );
  }
}