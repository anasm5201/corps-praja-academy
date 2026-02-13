"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. CREATE QUESTION (Membuat Soal Baru)
export async function createQuestion(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  // Bypass ID Check
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") return { error: "Akses Ditolak." };

  // Ambil Data
  const packageId = formData.get("packageId") as string;
  const text = formData.get("text") as string;
  const correctAnswer = formData.get("correctAnswer") as string;
  const explanation = formData.get("explanation") as string;
  const score = parseInt(formData.get("score") as string) || 5; // Default 5

  const optionsArray = [
     { key: "A", text: formData.get("optionA") as string },
     { key: "B", text: formData.get("optionB") as string },
     { key: "C", text: formData.get("optionC") as string },
     { key: "D", text: formData.get("optionD") as string },
     { key: "E", text: formData.get("optionE") as string },
  ];

  try {
    await prisma.tryoutQuestion.create({
      data: {
        packageId,
        text,
        options: JSON.stringify(optionsArray),
        correctAnswer,
        explanation,
        type: "TWK",
        score: score // ✅ Sekarang aman karena Schema sudah diupdate
      }
    });

    revalidatePath(`/dashboard/materials/edit/${packageId}`);
    return { success: true };

  } catch (error) {
    console.error("Gagal Input Soal:", error);
    return { error: "Gagal menyimpan soal." };
  }
}

// 2. DELETE QUESTION (Menghapus Soal) - ✅ INI YANG DICARI TOMBOL DELETE
export async function deleteQuestion(questionId: string, packageId: string) {      
  const session = await getServerSession(authOptions);
  
  const userId = (session?.user as any)?.id;
  if (!userId) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await prisma.tryoutQuestion.delete({
      where: { id: questionId }
    });

    revalidatePath(`/dashboard/materials/edit/${packageId}`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus soal." };
  }
}