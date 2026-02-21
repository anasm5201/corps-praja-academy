import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) { 
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // FILTER DATA (Tambahkan GENDER)
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.image) updateData.image = body.image;
    if (body.gender) updateData.gender = body.gender; // [BARU] Sensor Kesetaraan Gender

    const updatedUser = await prisma.user.update({
        where: { id: userId }, 
        data: updateData
    });

    return NextResponse.json({ message: "Profil Berhasil Diupdate", user: updatedUser });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ message: "Gagal update data user" }, { status: 500 });
  }
}