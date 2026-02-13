import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. AMBIL SESI
    const session = await getServerSession(authOptions);
    
    // Bypass Validasi ID (Gunakan 'as any')
    const userId = (session?.user as any)?.id;

    // Cek Login
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // 2. CEK ROLE ADMIN
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden: Akses Ditolak" }, { status: 403 });
    }

    // 3. TERIMA DATA DARI FORM (Frontend mengirim 'contentUrl')
    const body = await req.json();
    const { title, category, type, contentUrl, description, isPremium } = body;

    // Konversi isPremium (String -> Boolean)
    const premiumBool = isPremium === "true" || isPremium === true;

    // 4. SIMPAN KE DATABASE
    // ✅ FIX: Petakan 'contentUrl' ke kolom 'url' (atau 'content')
    const newMaterial = await prisma.material.create({
        data: {
            title,
            category,
            type, // "VIDEO" atau "PDF"
            
            // 👇 PERBAIKAN DI SINI:
            // Database mengenali 'url', tapi frontend kirim 'contentUrl'. Kita sambungkan.
            url: contentUrl, 
            
            description,
            isPremium: premiumBool
        }
    });

    return NextResponse.json({ message: "Materi Berhasil Ditambahkan", data: newMaterial });

  } catch (error) {
    console.error("Create Material Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}