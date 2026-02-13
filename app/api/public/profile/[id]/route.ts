import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        
        // ❌ ERROR: Kolom 'image' tidak ditemukan di database.
        // Kita nonaktifkan sementara agar Build Lolos.
        // image: true, 
        
        email: true, // Email biasanya aman ada
        xp: true,
        
        // Pastikan kolom ini benar-benar ada. Jika error lagi, hapus baris ini.
        // suhStats: true, 
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Personel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ 
        message: "Profil Ditemukan", 
        data: user 
    });

  } catch (error) {
    console.error("Public Profile Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}