export const RANKS = [
  // TINGKAT 0 (BASIS)
  { name: "CALON PRAJA", minXp: 0, icon: "🛡️" },
  
  // TINGKAT I (JUNIOR)
  { name: "PRAJA MUDA", minXp: 1000, icon: "⭐" },
  
  // TINGKAT II (SENIOR)
  { name: "PRAJA MADYA", minXp: 2500, icon: "⭐⭐" },
  
  // TINGKAT III (UPPER)
  { name: "PRAJA UTAMA", minXp: 5000, icon: "⭐⭐⭐" },
  
  // TINGKAT IV (ULTIMATE GOAL - PRESTISE TERTINGGI)
  { name: "ADHI MAKAYASA", minXp: 10000, icon: "👑" },
];

// FUNGSI UTAMA (UI)
export function getRankInfo(currentXp: number) {
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (currentXp >= RANKS[i].minXp) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || null;
    } else {
      break; 
    }
  }

  let progress = 0;
  let xpToNext = 0;

  if (nextRank) {
    const range = nextRank.minXp - currentRank.minXp;
    const gained = currentXp - currentRank.minXp;
    // Hindari pembagian dengan nol
    if (range > 0) {
        progress = Math.min(100, Math.round((gained / range) * 100));
    }
    xpToNext = nextRank.minXp - currentXp;
  } else {
    progress = 100; // Sudah ADHI MAKAYASA (Max Level)
    xpToNext = 0;
  }

  return {
    current: currentRank,
    next: nextRank,
    progress: progress,
    xpToNext: xpToNext
  };
}

// --- FUNGSI TAMBAHAN (UNTUK MEMPERBAIKI BUILD ERROR) ---

// 1. Konversi XP ke Level (1 - 5)
export const getLevelFromXP = (xp: number): number => {
  let level = 1;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      level = i + 1; // Level 1 = Index 0
    } else {
      break;
    }
  }
  return level;
};

// 2. Konversi Level ke Nama Pangkat
export const getRankFromLevel = (level: number): string => {
  // Pastikan index valid (0 s/d panjang array - 1)
  const index = Math.max(0, Math.min(level - 1, RANKS.length - 1));
  return RANKS[index].name;
};