'use server'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Tipe data input
type AssessmentData = {
  physique: {
    lari: number;
    pushup: number;
    situp: number;
    pullup: number;
  };
  academic: {
    twk: number;
    tiu: number;
    tkp: number;
  };
};

export async function submitAssessment(data: AssessmentData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  // 1. CARI USER ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) throw new Error("User not found");

  try {
    // 2. SIMPAN DATA SCREENING
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hasCompletedScreening: true,
        initialRunDistance: data.physique.lari,
        initialPushup: data.physique.pushup,
        initialSitup: data.physique.situp,
        initialPullup: data.physique.pullup,
        initialTwkScore: data.academic.twk,
        initialTiuScore: data.academic.tiu,
        initialTkpScore: data.academic.tkp,
      }
    });

    // ---------------------------------------------------------
    // 🧠 CPA-BRAIN: ANALISA & GENERATE MISI PERTAMA
    // ---------------------------------------------------------
    
    // Hapus misi lama (jika ada) biar fresh
    await prisma.dailyMission.deleteMany({
        where: { userId: user.id }
    });

    const missionsToCreate = [];

    // [LOGIKA 1]: ANALISA FISIK (Standar Lari: 2400m)
    if (data.physique.lari < 2400) {
        missionsToCreate.push({
            userId: user.id,
            title: "PENINGKATAN VO2 MAX (PRIORITAS)",
            category: "FISIK",
            difficulty: "HARD",
            xpReward: 150,
            isCompleted: false,
            description: `Hasil screening lari anda ${data.physique.lari}m (Kurang ${2400 - data.physique.lari}m dari standar). Lakukan Lari Interval 20 menit hari ini!`
        });
    } else {
        // Jika fisik sudah bagus, maintenance saja
        missionsToCreate.push({
            userId: user.id,
            title: "MAINTENANCE STAMINA",
            category: "FISIK",
            difficulty: "EASY",
            xpReward: 50,
            isCompleted: false,
            description: "Pertahankan performa. Lari santai 15 menit."
        });
    }

    // [LOGIKA 2]: ANALISA AKADEMIK (TWK/TIU)
    // Jika skor rendah, kasih misi belajar Doktrin. Jika tinggi, kasih Drilling.
    if (data.academic.twk < 50 || data.academic.tiu < 50) {
        missionsToCreate.push({
            userId: user.id,
            title: "PELAJARI DOKTRIN DASAR",
            category: "AKADEMIK",
            difficulty: "MEDIUM",
            xpReward: 100,
            isCompleted: false,
            description: "Logika dasar anda masih lemah. Buka Plaza Menza dan baca 'DOKTRIN V: SILOGISME'."
        });
    } else {
        missionsToCreate.push({
            userId: user.id,
            title: "SPEED DRILL: UJI KECEPATAN",
            category: "MENTAL",
            difficulty: "HARD",
            xpReward: 120,
            isCompleted: false,
            description: "Refleks anda bagus. Tantang diri anda di Speed Drill Unit 1 sampai skor 80+."
        });
    }

    // [LOGIKA 3]: MISI WAJIB PERTAMA (KALIBRASI LANJUTAN)
    // Karena 3 soal tidak cukup, kita paksa mereka Tryout Full besoknya
    missionsToCreate.push({
        userId: user.id,
        title: "DIAGNOSA SKD LENGKAP (FULL)",
        category: "AKADEMIK",
        difficulty: "BOSS",
        xpReward: 500,
        isCompleted: false,
        description: "Screening awal selesai. Lakukan Tryout SKD-01 (110 Soal) untuk mendapatkan Peta Kekuatan yang akurat."
    });

    // EKSEKUSI PEMBUATAN MISI
    if (missionsToCreate.length > 0) {
        await prisma.dailyMission.createMany({
            data: missionsToCreate
        });
    }

    // Refresh dashboard
    revalidatePath('/dashboard');
    
  } catch (error) {
    console.error("CPA-BRAIN ERROR:", error);
    throw new Error("Gagal memproses data intelijen.");
  }

  // Redirect ke Dashboard
  redirect('/dashboard');
}