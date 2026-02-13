// Logika untuk mengirimkan notifikasi darurat jika arahan diabaikan
export const triggerRedAlert = async (userId: string, sector: string) => {
    const message = `⚠️ DARURAT: Sektor ${sector} dalam kondisi kritis selama lebih dari 24 jam! Segera laksanakan arahan atau poin SUH akan dikurangi.`;
    
    // Kirim notifikasi melalui sistem internal atau push notification
    await sendPushNotification(userId, {
      title: 'RED ALERT: DISCIPLINE BREACH',
      body: message,
      priority: 'HIGH'
    });
  
    // Catat pelanggaran di database untuk audit pengasuh
    await prisma.disciplinaryAction.create({
      data: {
        userId,
        reason: `Mengabaikan arahan taktis sektor ${sector} > 24 jam`,
        penaltyPoints: 10
      }
    });
  };
  