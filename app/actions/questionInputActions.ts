"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createQuestion(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX 1: Bypass Validasi ID (Gunakan 'as any')
  // Ini adalah solusi taktis untuk error "Property id does not exist"
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
      return { error: "Unauthorized: Silakan Login." };
  }

  // Security Check: Hanya Admin
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") {
      return { error: "Akses Ditolak. Hubungi Komandan." };
  }

  // Ambil Data dari Form
  const packageId = formData.get("packageId") as string;
  const text = formData.get("text") as string;
  const correctAnswer = formData.get("correctAnswer") as string;
  const explanation = formData.get("explanation") as string;
  
  // Ambil input score (jika ada di form), default ke 5
  const scoreInput = formData.get("score");
  const score = scoreInput ? parseInt(scoreInput as string) : 5;
  
  // Format Opsi ke JSON
  const optionsArray = [
     { key: "A", text: formData.get("optionA") as string },
     { key: "B", text: formData.get("optionB") as string },
     { key: "C", text: formData.get("optionC") as string },
     { key: "D", text: formData.get("optionD") as string },
     { key: "E", text: formData.get("optionE") as string },
  ];

  try {
    // ✅ FIX 2: Gunakan 'tryoutQuestion' (Nama Model Baru)
    await prisma.tryoutQuestion.create({
      data: {
        packageId,
        text,
        options: JSON.stringify(optionsArray), // Simpan sebagai JSON String
        correctAnswer,
        explanation,
        type: "TWK", // Default
        score: score // ✅ Field Score sudah aman karena schema sudah diupdate
      }
    });

    // Refresh halaman agar soal langsung muncul
    revalidatePath(`/dashboard/materials/edit/${packageId}`);
    return { success: true };

  } catch (error) {
    console.error("Gagal Input Soal:", error);
    return { error: "Gagal menyimpan soal ke database." };
  }
}