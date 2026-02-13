'use server'

import { PrismaClient } from "@prisma/client"
import { getRankInfo } from "@/lib/rank-system" // PASTIKAN FILE INI SUDAH ADA

const prisma = new PrismaClient()

// STANDAR KELULUSAN (TARGET)
const TARGET_STANDARDS = {
  jar: 75, // Target SKD (skor ~412/550)
  lat: 80, // Target Speed Drill (Akurasi & Kecepatan tinggi)
  suh: 70  // Target Kestabilan Mental
};

export async function getDashboardAnalytics(userId: string) {
  try {
    // --- [1. AMBIL DATA DARI DATABASE] ---

    // A. DATA SKD (JAR)
    const skdAttempts = await prisma.tryoutAttempt.findMany({
      where: { userId: userId },
      select: { score: true }
    });
    
    // B. DATA PSIKOLOGI (SUH & XP)
    // Kita ambil semua tipe psikologi untuk perhitungan XP
    const allPsychoAttempts = await prisma.psychologyAttempt.findMany({
      where: { userId: userId },
      select: { score: true, package: { select: { type: true } } }
    });

    // --- [2. HITUNG XP & PANGKAT (GAMIFICATION)] ---
    
    // Rumus XP: Total Skor SKD + Total Skor Psikologi
    // (Anda bisa memodifikasi bobotnya nanti, misal SKD x 1, Psikologi x 2)
    const totalScoreSKD = skdAttempts.reduce((acc, curr) => acc + curr.score, 0);
    const totalScorePsycho = allPsychoAttempts.reduce((acc, curr) => acc + curr.score, 0);
    
    // Total XP User
    // *Catatan: Tambahkan bonus awal (+1250) agar user baru langsung terlihat progressnya saat demo*
    const currentXP = totalScoreSKD + totalScorePsycho + 1250; 

    // Dapatkan Data Pangkat dari Library
    const rankData = getRankInfo(currentXP);


    // --- [3. HITUNG NILAI ANALISA (0-100)] ---

    // A. Nilai JAR (Akademik)
    let jarScore = 0;
    if (skdAttempts.length > 0) {
      // Rata-rata skor dibagi max skor SKD (550) dikali 100
      const avgSKD = totalScoreSKD / skdAttempts.length;
      jarScore = Math.round((avgSKD / 550) * 100);
    }

    // B. Nilai LAT (Kecermatan/Speed)
    // Simulasi sementara karena tabel SpeedProgress belum penuh
    // Nanti diganti dengan query real dari tabel speed
    let latScore = 45; 

    // C. Nilai SUH (Mental/Kepribadian)
    // Filter hanya paket KEPRIBADIAN untuk grafik radar SUH
    const kepribadianAttempts = allPsychoAttempts.filter(p => p.package.type === 'KEPRIBADIAN');
    let suhScore = 0;
    
    if (kepribadianAttempts.length > 0) {
      const totalKepribadian = kepribadianAttempts.reduce((acc, curr) => acc + curr.score, 0);
      // Asumsi skor kepribadian max 100
      suhScore = Math.round(totalKepribadian / kepribadianAttempts.length);
    } else {
      suhScore = 60; // Nilai default (Netral) jika belum tes
    }

    // --- [4. HITUNG HEALTH POINT (HP)] ---
    // Rata-rata dari ketiga pilar
    const avgPerformance = (jarScore + latScore + suhScore) / 3;
    const hp = Math.min(100, Math.max(0, Math.round(avgPerformance))); 

    // --- [5. KIRIM DATA KE DASHBOARD] ---
    return {
      success: true,
      stats: {
        // Data Grafik Radar
        jar: jarScore,
        lat: latScore,
        suh: suhScore,
        
        // Data Status
        hp: hp,
        totalSkd: skdAttempts.length,
        totalPsycho: allPsychoAttempts.length,
        
        // Data Gamifikasi (Pangkat)
        xp: currentXP,
        rank: rankData
      },
      target: TARGET_STANDARDS
    }

  } catch (error) {
    console.error("Gagal analisa data:", error);
    
    // Return Data Aman (Fallback) jika terjadi error database
    // Agar Dashboard tidak crash
    return { 
      success: false, 
      stats: { 
        jar: 0, lat: 0, suh: 0, 
        hp: 100, 
        totalSkd: 0, totalPsycho: 0,
        xp: 0,
        rank: getRankInfo(0) // Default Rank: CALON TARUNA
      },
      target: TARGET_STANDARDS
    }
  }
}