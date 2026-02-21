'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileInfo(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    
    if (!userId) return { success: false, message: "Akses ditolak." };

    const name = formData.get("name") as string;
    const gender = formData.get("gender") as string;

    if (!name || name.trim() === "") {
        return { success: false, message: "Nama tidak boleh kosong." };
    }

    if (!gender || (gender !== "PRIA" && gender !== "WANITA")) {
        return { success: false, message: "Pilih jenis kelamin yang valid." };
    }

    // Eksekusi Update ke Database
    await prisma.user.update({
      where: { id: userId },
      data: { 
          name: name,
          gender: gender 
      }
    });

    revalidatePath("/dashboard/profile");
    return { success: true, message: "Identitas Personel berhasil diperbarui!" };

  } catch (error) {
    console.error("[PROFILE UPDATE ERROR]", error);
    return { success: false, message: "Gagal menyimpan data." };
  }
}