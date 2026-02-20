import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SpeedDrillClient from "./SpeedDrillClient";

// 🔥 PENTING: PAKSA REFRESH AGAR STATUS SELALU UPDATE
export const dynamic = "force-dynamic";

export default async function SpeedDrillPage() {
  // 1. AMBIL SESI & AMANKAN ID
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/auth/login");

  // 2. CEK STATUS KEPEMILIKAN AKSES (Premium & Trial)
  const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true, createdAt: true }
  });

  const isPremium = ["SOLO_FIGHTER", "INTENSIVE_SQUAD"].includes(user?.subscriptionType || "FREE");
  const joinDate = new Date(user?.createdAt || new Date()).getTime();
  const hoursSinceJoin = (new Date().getTime() - joinDate) / (1000 * 60 * 60);
  const isTrialActive = hoursSinceJoin < 2;

  // 3. TARIK DATA UNIT & RIWAYAT (HISTORY)
  const units = await prisma.drillUnit.findMany({
    orderBy: { unitNumber: 'asc' },
  });

  const history = await prisma.drillHistory.findMany({
    where: { userId: userId },
    select: { drillUnitId: true },
    distinct: ['drillUnitId'] 
  });

  const completedUnitIds = new Set(history.map(h => h.drillUnitId));

  // 4. LOGIKA UNLOCK ADAPTIF + JEBAKAN FREEMIUM
  const serializedUnits = units.map((unit) => {
    let isLockedByProgression = false;
    let isCompleted = completedUnitIds.has(unit.id);
    let isActive = false;

    // Logika Progresi Normal
    if (unit.unitNumber === 1) {
        isActive = !isCompleted;
    } else {
        const prevUnit = units.find(u => u.unitNumber === unit.unitNumber - 1);
        const prevFinished = prevUnit ? completedUnitIds.has(prevUnit.id) : false;
        isLockedByProgression = !prevFinished;
        isActive = prevFinished && !isCompleted;
    }

    // 🔥 KUNCI FREEMIUM: Digembok JIKA bukan premium, bukan trial, DAN bukan Unit 1
    const isPaywalled = !isPremium && !isTrialActive && unit.unitNumber > 1;

    return {
        id: unit.id,
        unitNumber: unit.unitNumber,
        title: unit.title,
        isLockedByProgression,
        isCompleted,
        isActive,
        isPaywalled
    };
  });

  const completedCount = completedUnitIds.size;

  return (
      <SpeedDrillClient 
          units={serializedUnits} 
          completedCount={completedCount} 
          totalUnits={units.length} 
      />
  );
}