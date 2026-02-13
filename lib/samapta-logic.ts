// lib/samapta-logic.ts

/**
 * LOGIKA PENILAIAN JASMANI POLRI (PRIA GOL I)
 * Sumber: Standar Kesamaptaan Jasmani Polri
 */

export const getScoreLari = (meter: number): number => {
    if (meter >= 3444) return 100;
    if (meter >= 3000) return 85;
    if (meter >= 2500) return 65;
    if (meter >= 2000) return 41; // Ambang batas minimal
    if (meter >= 1500) return 20;
    if (meter < 1000) return 0;
    // Interpolasi sederhana untuk demo (bisa diperlengkap sesuai tabel asli)
    return Math.floor((meter / 3444) * 100);
  };
  
  export const getScorePullUp = (count: number): number => {
    if (count >= 17) return 100;
    if (count <= 0) return 0;
    const scores: Record<number, number> = { 
      16: 94, 15: 88, 14: 82, 13: 76, 12: 70, 11: 64, 10: 58, 
      9: 52, 8: 46, 7: 40, 6: 34, 5: 28, 4: 22, 3: 16, 2: 10, 1: 4 
    };
    return scores[count] || 0;
  };
  
  export const getScorePushUp = (count: number): number => {
    if (count >= 43) return 100;
    if (count <= 0) return 0;
    return Math.min(Math.round((count / 43) * 100), 100);
  };
  
  export const getScoreSitUp = (count: number): number => {
    if (count >= 40) return 100;
    if (count <= 0) return 0;
    return Math.min(Math.round((count / 40) * 100), 100);
  };
  
  export const getScoreShuttleRun = (detik: number): number => {
    if (detik <= 16.2 && detik > 0) return 100;
    if (detik >= 25.0 || detik === 0) return 0;
    // Semakin kecil detik, semakin besar nilai
    return Math.max(0, Math.round(((25 - detik) / (25 - 16.2)) * 100));
  };
  
  export const calculateFinalSamapta = (scores: { lari: number, pull: number, push: number, sit: number, shuttle: number }) => {
    const avgB = (scores.pull + scores.push + scores.sit + scores.shuttle) / 4;
    const final = (scores.lari + avgB) / 2;
    
    // Syarat MS: Rata-rata >= 41 dan tidak ada nilai 0
    const hasZero = Object.values(scores).some(s => s === 0);
    const isMS = final >= 41 && !hasZero;
  
    return {
      finalScore: parseFloat(final.toFixed(2)),
      status: isMS ? "MS (MEMENUHI SYARAT)" : "TMS (TIDAK MEMENUHI SYARAT)",
      color: isMS ? "text-emerald-500" : "text-red-500"
    };
  };