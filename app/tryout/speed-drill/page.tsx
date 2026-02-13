import { getSpeedDrillMap } from '@/app/actions/speedDrill';
import UnitMapClient from './UnitMapClient';
import { prisma } from '@/lib/prisma';

// MEMASTIKAN DATA SELALU FRESH (REALTIME)
export const dynamic = 'force-dynamic';

export default async function SpeedDrillPage() {
  // 1. Ambil Data Peta (Map) dari Server Action
  // Fungsi ini otomatis mengecek userId = "user_demo_id" (sesuai yang kita tulis di actions)
  const units = await getSpeedDrillMap();

  // 2. Ambil Data Statistik User (XP)
  const user = await prisma.user.findUnique({
    where: { id: "user_demo_id" }, // Menggunakan user dummy yang baru kita seed
    select: { xp: true }
  });

  // 3. Konversi Data agar sesuai dengan tipe di Client
  const formattedUnits = units.map(u => ({
    ...u,
    status: u.status as 'LOCKED' | 'ACTIVE' | 'COMPLETED'
  }));

  // 4. Render Komponen Klien dengan Data Asli
  return (
    <UnitMapClient 
      units={formattedUnits} 
      userStats={{ xp: user?.xp || 0 }} 
    />
  );
}