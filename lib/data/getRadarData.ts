import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getIntelligenceRadar() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // 1. Ambil semua riwayat tes user
  const attempts = await prisma.psychologyAttempt.findMany({
    where: { userId: session.user.id },
    include: { package: true },
    orderBy: { finishedAt: 'desc' }
  });

  // 2. Inisialisasi Akumulator Nilai
  const stats = {
    verbal: { total: 0, count: 0 },
    numerik: { total: 0, count: 0 },
    figural: { total: 0, count: 0 },
    kecermatan: { total: 0, count: 0 }, // Endurance
  };

  // 3. Proses Data (Mapping Logic)
  attempts.forEach(att => {
    const title = att.package.title.toLowerCase();
    const score = att.totalScore;

    if (title.includes("verbal")) {
      stats.verbal.total += score;
      stats.verbal.count++;
    } else if (title.includes("numerik") || title.includes("angka")) {
      stats.numerik.total += score;
      stats.numerik.count++;
    } else if (title.includes("figural") || title.includes("spasial") || title.includes("kubus")) {
      stats.figural.total += score;
      stats.figural.count++;
    } else if (att.package.type === "KECERMATAN") {
      stats.kecermatan.total += score;
      stats.kecermatan.count++;
    }
  });

  // 4. Hitung Rata-rata (Avg)
  const formatScore = (total: number, count: number) => count > 0 ? Math.round(total / count) : 0;

  const radarData = [
    { subject: 'Verbal', A: formatScore(stats.verbal.total, stats.verbal.count), fullMark: 100 },
    { subject: 'Numerik', A: formatScore(stats.numerik.total, stats.numerik.count), fullMark: 100 },
    { subject: 'Spasial', A: formatScore(stats.figural.total, stats.figural.count), fullMark: 100 },
    { subject: 'Ketahanan', A: formatScore(stats.kecermatan.total, stats.kecermatan.count), fullMark: 100 }, // Endurance
  ];

  return radarData;
}