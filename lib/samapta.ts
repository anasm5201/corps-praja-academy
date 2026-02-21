// STANDAR PENILAIAN SAMAPTA DENGAN KESETARAAN GENDER (PRIA/WANITA)
// Mengacu pada standar umum Kedinasan/TNI/Polri

export function calculateSamaptaScore(
  gender: string | null | undefined, // [BARU] Menerima data jenis kelamin
  lariMeter: number,
  pushUp: number,
  sitUp: number,
  pullUp: number, // Pria: Pull-up | Wanita: Chinning
  shuttleRunSeconds: number
) {
  // Normalisasi Gender (Default ke 'PRIA' jika Kadet belum mengatur profilnya)
  const isWanita = gender?.toUpperCase() === "WANITA";

  // ====================================================================
  // 1. HITUNG NILAI SAMAPTA A (LARI 12 MENIT)
  // ====================================================================
  const targetLariMax = isWanita ? 3095 : 3444; // Nilai 100
  const targetLariMin = isWanita ? 1100 : 1300; // Nilai 0 (Batas bawah)

  let scoreA = 0;
  if (lariMeter >= targetLariMax) scoreA = 100;
  else if (lariMeter <= targetLariMin) scoreA = 0;
  else {
    scoreA = ((lariMeter - targetLariMin) / (targetLariMax - targetLariMin)) * 100;
  }

  // ====================================================================
  // 2. HITUNG NILAI SAMAPTA B (PER ITEM)
  // ====================================================================
  
  // Target Maksimal (Nilai 100) berdasarkan Gender
  const targetPushUp = isWanita ? 37 : 43;
  const targetSitUp = isWanita ? 50 : 40; // Wanita lebih tinggi target sit-up nya
  const targetPullUp = isWanita ? 72 : 17; // Wanita: Chinning (72x), Pria: Pull-up (17x)

  const scorePush = pushUp <= 0 ? 0 : Math.min((pushUp / targetPushUp) * 100, 100);
  const scoreSit = sitUp <= 0 ? 0 : Math.min((sitUp / targetSitUp) * 100, 100);
  const scorePull = pullUp <= 0 ? 0 : Math.min((pullUp / targetPullUp) * 100, 100);

  // Shuttle Run (Makin cepat detik = Makin besar nilai)
  const targetShuttleMax = isWanita ? 17.6 : 16.2; // Nilai 100
  const targetShuttleMin = isWanita ? 26.0 : 25.0; // Nilai 0

  let scoreShuttle = 0;
  if (shuttleRunSeconds <= 0 || shuttleRunSeconds >= targetShuttleMin) {
      scoreShuttle = 0; // Cegah kecurangan jika input 0 detik
  } else if (shuttleRunSeconds <= targetShuttleMax) {
      scoreShuttle = 100;
  } else {
      scoreShuttle = 100 - ((shuttleRunSeconds - targetShuttleMax) / (targetShuttleMin - targetShuttleMax)) * 100;
  }

  // ====================================================================
  // 3. RATA-RATA & NILAI AKHIR MUTLAK
  // ====================================================================
  const scoreB = (scorePush + scoreSit + scorePull + scoreShuttle) / 4;
  const finalScore = (scoreA + scoreB) / 2;

  // ====================================================================
  // 4. GENERATE DIAGNOSA TAKTIS (BAHAN MENTAH UNTUK AI MENTOR)
  // ====================================================================
  let feedback = [];
  if (scoreA < 70) feedback.push(`[KARDIO] Lari ${lariMeter}m masih di bawah standar tempur ${isWanita ? 'Putri' : 'Putra'}.`);
  if (scorePush < 70) feedback.push("[OTOT LENGAN] Repetisi Push-up di bawah standar.");
  if (scoreSit < 70) feedback.push("[CORE] Otot perut rapuh, bahaya cedera punggung.");
  if (scorePull < 70) feedback.push(`[OTOT TARIK] Kekuatan ${isWanita ? 'Chinning' : 'Pull-up'} sangat minim.`);
  if (scoreShuttle < 70) feedback.push("[AGILITY] Kelincahan kaki (Shuttle Run) lambat.");
  
  if (feedback.length === 0) feedback.push("KONDISI FISIK PRIMA! Kadet siap tempur.");

  return {
    scoreA: Math.round(scoreA),
    scoreB: Math.round(scoreB),
    totalScore: Math.round(finalScore),
    feedback: feedback.join(" ")
  };
}