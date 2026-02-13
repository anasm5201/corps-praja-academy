export async function getLeaderboardWithStatus() {
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      include: {
        disciplinaryRecords: {
          where: { isResolved: false, type: "SP-3" }
        }
      }
    });
  
    return users.map(user => ({
      ...user,
      isBlacklisted: user.disciplinaryRecords.length > 0 // Terdeteksi SP-3 [cite: 2026-01-05 082717]
    }));
  }