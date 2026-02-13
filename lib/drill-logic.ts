export function identifyCriticalSector(timeLeakData: any) {
    // Mencari sektor dengan rata-rata waktu > 100 detik (Sangat Lambat)
    const critical = timeLeakData.find((data: any) => data.avgTime > 100);
    
    return {
      sector: critical?.name || "TIU", // Default ke TIU jika data minim
      urgency: "HIGH",
      targetTime: 30 // Target baru untuk menghancurkan Time Leak
    };
  }