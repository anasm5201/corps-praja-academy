"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createMission(formData: FormData) {
  // 1. Ambil Data Session (PENTING: Misi butuh pemilik/userId)
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return { error: "Akses Ditolak: Anda harus login." };
  }

  const userId = (session.user as any).id;

  // 2. Ambil Data Form
  const title = formData.get("title") as string;
  const category = formData.get("category") as string; 
  const difficulty = formData.get("difficulty") as string;
  const duration = parseInt(formData.get("duration") as string);
  const xpReward = parseInt(formData.get("xpReward") as string);
  const questionsJson = formData.get("questionsJson") as string;

  // 3. Validasi Input Dasar
  if (!title || !category || !questionsJson) {
    return { error: "Data misi tidak lengkap. Mohon isi semua field." };
  }

  let questionsData;
  try {
    // 4. Parsing JSON Input
    questionsData = JSON.parse(questionsJson);
  } catch (e) {
    console.error("JSON PARSE ERROR:", e);
    return { error: "Format JSON Soal TIDAK VALID. Cek kembali tanda koma, kurung kurawal, atau tanda kutip." };
  }

  // 5. Validasi Struktur Data Soal
  if (!Array.isArray(questionsData)) {
    return { error: "Format JSON harus berupa Array of Objects [...]" };
  }

  try {
    // 6. Eksekusi Database Transaction
    // Kita gunakan 'prisma.dailyMission' sesuai skema yang sudah diperbaiki
    await prisma.dailyMission.create({
      data: {
        userId: userId, // ✅ Wajib ada sesuai relasi User
        title,
        category,
        difficulty,
        duration: String(duration), // Konversi ke String sesuai Schema
        xpReward,
        status: "AVAILABLE",
        description: "Simulasi standar CAT BKN.",
        image: "/mission-default.jpg", 
        
        // Nested Write: Simpan Soal Sekaligus
        questions: {
          create: questionsData.map((q: any) => ({
             text: q.text,
             image: q.image || null, 
             
             // Enkripsi Array Options ke JSON String
             options: JSON.stringify(q.options), 
             
             // Pastikan correctOption adalah Int (Default 0 jika error)
             correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0, 
             
             explanation: q.explanation || "Pembahasan belum tersedia.",
             category: category, 
             isHOTS: q.text.length > 100 // Deteksi otomatis HOTS berdasarkan panjang soal
          }))
        }
      }
    });

    revalidatePath("/dashboard/mission");
    return { success: "MISI BERHASIL DITERJUNKAN! Siap untuk simulasi." };

  } catch (error: any) {
    console.error("DATABASE ERROR:", error);
    return { error: `Gagal menyimpan ke database: ${error.message}` };
  }
}