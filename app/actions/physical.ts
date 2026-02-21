'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateSamaptaScore } from "@/lib/samapta";

export async function submitPhysicalLog(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!session || !userId) {
    throw new Error("Unauthorized: Akses ditolak. Silakan login kembali.");
  }

 // 1. AMBIL DATA FORM DARI KADET
 const lariMeter = parseInt(formData.get("lariMeter") as string) || 0;
 const pushUp = parseInt(formData.get("pushUp") as string) || 0;
 const sitUp = parseInt(formData.get("sitUp") as string) || 0;
 const pullUp = parseInt(formData.get("pullUp") as string) || 0;
 const shuttleRun = parseFloat(formData.get("shuttleRun") as string) || 0; 

 // [BARU] AMBIL IDENTITAS GENDER DARI DATABASE
 const user = await prisma.user.findUnique({ where: { id: userId } });
 const userGender = user?.gender || "PRIA"; // Default Pria jika kosong

 // 2. KALKULASI SKOR MUTLAK (SISTEM BKN/TNI)
 let result;
 try {
     // Masukkan userGender ke urutan pertama!
     result = calculateSamaptaScore(userGender, lariMeter, pushUp, sitUp, pullUp, shuttleRun);
 } catch (e) {
     console.error("[SAMAPTA CALC ERROR]", e);
     result = { totalScore: 0, feedback: "Kalkulasi Error", scoreA: 0, scoreB: 0 };
 }

  // 3. SIMPAN KE RADAR INTELIJEN (Database)
  // Data ini kelak akan diendus oleh weekly-engine.ts untuk membuat Blueprint minggu depan!
  await prisma.physicalLog.create({
    data: {
      userId: userId, 
      lariMeter,
      pushUp,
      sitUp,
      pullUp,
      shuttleRun,
      totalScore: result.totalScore,
      aiFeedback: result.feedback
    }
  });

  // =========================================================================
  // ⛔ PENGHAPUSAN PROTOKOL LAMA: 
  // Logika "prisma.dailyMission.create" dihapus total.
  // Pengasuhan Remedial (SUH) kini 100% dikendalikan oleh Weekly Blueprint Engine
  // agar tidak ada misi yang bertabrakan atau overtraining.
  // =========================================================================

  // 4. CAIRKAN TUNJANGAN KEDISIPLINAN (XP)
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: 50 } } // 50 XP karena sudah berani lapor hasil fisik
  });

  // 5. REFRESH & KEMBALIKAN KADET KE MARKAS UTAMA
  revalidatePath("/dashboard/physical");
  revalidatePath("/dashboard"); 
  redirect("/dashboard");
}