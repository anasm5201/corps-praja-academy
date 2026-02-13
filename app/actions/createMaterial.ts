"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMaterial(formData: FormData) {
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const type = formData.get("type") as string; // VIDEO, PDF
  const contentUrl = formData.get("contentUrl") as string;
  const description = formData.get("description") as string;
  const duration = formData.get("duration") as string; // e.g. "15 Menit" or "10 Halaman"
  const isPremium = formData.get("isPremium") === "on";

  if (!title || !category || !contentUrl || !description) {
    return { error: "Data materi tidak lengkap. Mohon isi semua field wajib." };
  }

  // Validasi URL Youtube (Opsional, untuk memastikan embed bisa jalan)
  let finalUrl = contentUrl;
  if (type === "VIDEO" && contentUrl.includes("youtube.com/watch?v=")) {
      // Ubah link biasa jadi embed link agar bisa diputar di aplikasi
      const videoId = contentUrl.split("v=")[1].split("&")[0];
      finalUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (type === "VIDEO" && contentUrl.includes("youtu.be/")) {
      const videoId = contentUrl.split("youtu.be/")[1];
      finalUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  try {
    await prisma.material.create({
      data: {
        title,
        category,
        type,
        url: finalUrl, // <--- UBAH JADI 'content'
        description,
        //duration: duration || (type === "VIDEO" ? "10 Min" : "5 Pages"),
        isPremium,
      }
    });

    revalidatePath("/dashboard/intel"); // Refresh halaman materi kadet
    return { success: "DOKUMEN INTEL BERHASIL DI-UPLOAD!" };

  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    return { error: "Gagal menyimpan materi ke database." };
  }
}