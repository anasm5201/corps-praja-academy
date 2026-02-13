import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { materialId } = await req.json();
    
    // Logika menandai materi selesai (sesuaikan dengan kebutuhan, misal update UserProgress)
    // Contoh sederhana:
    // await prisma.userProgress.create({ ... })

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}