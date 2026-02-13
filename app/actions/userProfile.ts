"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTargetProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Bypass Validasi ID (Gunakan 'as any')
  // Ini mencegah error "Property 'id' does not exist on type..."
  const userId = (session?.user as any)?.id;

  if (!userId) return { error: "Unauthorized" };

  const targetInstance = formData.get("targetInstance") as string;
  const examDateRaw = formData.get("examDate") as string;
  const name = formData.get("name") as string;

  if (!examDateRaw) return { error: "Tanggal tempur wajib diisi!" };

  try {
    // 1. Update Tabel User (Nama dasar)
    await prisma.user.update({
        where: { id: userId }, // Gunakan userId yang aman
        data: { name: name }
    });

    // 2. Update/Create UserProfile (Target & Tanggal)
    // Pastikan model 'UserProfile' ada di schema.prisma Anda.
    // Jika error "Property 'userProfile' does not exist", berarti Anda harus membuat modelnya dulu.
    await prisma.userProfile.upsert({
      where: { userId: userId },
      create: {
        userId: userId,
        targetInstance: targetInstance,
        examDate: new Date(examDateRaw),
      },
      update: {
        targetInstance: targetInstance,
        examDate: new Date(examDateRaw),
        updatedAt: new Date()
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    
    return { success: true, message: "Target Operasi Berhasil Dikunci!" };

  } catch (error) {
    console.error("Profile Update Error:", error);
    return { error: "Gagal mengupdate profil." };
  }
}