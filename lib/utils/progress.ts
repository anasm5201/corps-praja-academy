export function calculateMatraStats(dailyDrills: any[], completedDrills: string[]) {
    // Total misi per matra (7 hari x 1 misi/hari = 7 misi per matra)
    const totalPerMatra = 7;
    
    // Hitung jumlah yang selesai berdasarkan ID unik (misal: "day1_tahap1")
    const latDone = completedDrills.filter(id => id.includes('tahap1')).length;
    const jarDone = completedDrills.filter(id => id.includes('tahap2')).length;
    const suhDone = completedDrills.filter(id => id.includes('tahap3')).length;
  
    return {
      lat: Math.round((latDone / totalPerMatra) * 100),
      jar: Math.round((jarDone / totalPerMatra) * 100),
      suh: Math.round((suhDone / totalPerMatra) * 100),
    };
  }