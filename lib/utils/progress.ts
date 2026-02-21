// File: lib/utils/progress.ts

/**
 * Engine Kalkulasi Sinergi Matra (Tri Tunggal Terpusat)
 * Merubah data mentah dari database menjadi persentase kesiapan tempur.
 */
export function calculateMatraStats(parsedDrills: any[], completedDrillsRaw: any) {
    // 1. PROTOKOL ANTI-CRASH: Amankan data yang masuk
    let completed: string[] = [];
    
    if (Array.isArray(completedDrillsRaw)) {
      completed = completedDrillsRaw;
    } else if (typeof completedDrillsRaw === 'string') {
      try { 
        completed = JSON.parse(completedDrillsRaw); 
      } catch(e) {
        console.warn("⚠️ [SYSTEM WARNING] Gagal membaca data progres Kadet. Menggunakan nilai 0.");
      }
    }
  
    // 2. DINAMISASI TOTAL: Menyesuaikan jumlah hari secara otomatis
    // Jika suatu saat Komandan ingin jadwal 14 hari, sistem ini tidak perlu diubah.
    const totalDays = parsedDrills && parsedDrills.length > 0 ? parsedDrills.length : 7;
    
    // 3. IDENTIFIKASI PENYELESAIAN MISI (Berdasarkan ID tahap)
    // Format ID yang diharapkan dari tombol selesai: "day0_tahap1", "day3_tahap2", dst.
    const latDone = completed.filter(id => id?.includes('tahap1')).length;
    const jarDone = completed.filter(id => id?.includes('tahap2')).length;
    const suhDone = completed.filter(id => id?.includes('tahap3')).length;
  
    // 4. KALKULASI PERSENTASE AMAN (Mencegah pembagian dengan 0)
    return {
      lat: totalDays > 0 ? Math.min(100, Math.round((latDone / totalDays) * 100)) : 0,
      jar: totalDays > 0 ? Math.min(100, Math.round((jarDone / totalDays) * 100)) : 0,
      suh: totalDays > 0 ? Math.min(100, Math.round((suhDone / totalDays) * 100)) : 0,
    };
  }