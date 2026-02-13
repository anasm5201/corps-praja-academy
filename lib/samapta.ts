// STANDAR PENILAIAN SAMAPTA (APPROXIMATION FOR MVP)
// Mengacu pada standar umum Kedinasan/Polri (Pria)

export function calculateSamaptaScore(
    lariMeter: number,
    pushUp: number,
    sitUp: number,
    pullUp: number,
    shuttleRunSeconds: number
  ) {
    // 1. HITUNG NILAI SAMAPTA A (LARI 12 MENIT)
    // Target Max (100) ≈ 3444 meter | Target Min (0) ≈ 1300 meter
    let scoreA = 0;
    if (lariMeter >= 3444) scoreA = 100;
    else if (lariMeter <= 1300) scoreA = 0;
    else {
      // Rumus Interpolasi Linear Sederhana
      scoreA = ((lariMeter - 1300) / (3444 - 1300)) * 100;
    }
  
    // 2. HITUNG NILAI SAMAPTA B (PER ITEM)
    
    // B1. Push Up (1 Menit) - Max 43
    let scorePush = (pushUp / 43) * 100;
    if (scorePush > 100) scorePush = 100;
  
    // B2. Sit Up (1 Menit) - Max 40
    let scoreSit = (sitUp / 40) * 100;
    if (scoreSit > 100) scoreSit = 100;
  
    // B3. Pull Up (1 Menit) - Max 17
    let scorePull = (pullUp / 17) * 100;
    if (scorePull > 100) scorePull = 100;
  
    // B4. Shuttle Run (Detik) - Target 16.2s (100) sampai 25s (0)
    // Semakin kecil waktu, semakin besar nilai
    let scoreShuttle = 0;
    if (shuttleRunSeconds <= 16.2) scoreShuttle = 100;
    else if (shuttleRunSeconds >= 25.0) scoreShuttle = 0;
    else {
      scoreShuttle = 100 - ((shuttleRunSeconds - 16.2) / (25.0 - 16.2)) * 100;
    }
  
    // 3. RATA-RATA SAMAPTA B
    const scoreB = (scorePush + scoreSit + scorePull + scoreShuttle) / 4;
  
    // 4. NILAI AKHIR (A + B) / 2
    const finalScore = (scoreA + scoreB) / 2;
  
    // 5. GENERATE FEEDBACK TAKTIS (UNTUK AI)
    let feedback = [];
    if (scoreA < 70) feedback.push("Lari masih kurang! Tingkatkan interval training.");
    if (scorePush < 70) feedback.push("Otot lengan lemah (Push-up). Lakukan diamond push-up.");
    if (scoreSit < 70) feedback.push("Core muscle lemah (Sit-up). Rutinkan plank.");
    if (scorePull < 70) feedback.push("Otot punggung/sayap kurang (Pull-up).");
    if (scoreShuttle < 70) feedback.push("Kelincahan kaki lambat (Shuttle Run).");
    
    if (feedback.length === 0) feedback.push("Kondisi Fisik PRIMA! Pertahankan intensitas.");
  
    return {
      scoreA: Math.round(scoreA),
      scoreB: Math.round(scoreB),
      totalScore: Math.round(finalScore),
      feedback: feedback.join(" ")
    };
  }