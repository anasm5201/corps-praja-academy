import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) { // Bisa POST atau PATCH, kita pakai POST agar aman
  try {
    // 1. AMBIL SESI
    const session = await getServerSession(authOptions);

    // ✅ FIX: Bypass Validasi ID (Gunakan 'as any')
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. TERIMA DATA UPDATE
    const body = await req.json();

    // 3. FILTER DATA (Security Best Practice)
    // Hanya izinkan update field tertentu agar user tidak bisa ubah XP/Role sembarangan
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.image) updateData.image = body.image;
    // Tambahkan field lain jika ada di schema User (misal: bio, phone, address)
    // if (body.phone) updateData.phone = body.phone; 

    // 4. EKSEKUSI UPDATE KE DATABASE
    const updatedUser = await prisma.user.update({
        where: { id: userId }, // Gunakan variabel userId yang aman
        data: updateData
    });

    return NextResponse.json({ 
        message: "Profil Berhasil Diupdate", 
        user: updatedUser 
    });

  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ message: "Gagal update data user" }, { status: 500 });
  }
}