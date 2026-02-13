import { getMissionData } from '@/app/actions/speedDrill';
import MissionClient from './MissionClient';
import { notFound } from 'next/navigation';

export default async function SpeedDrillMissionPage({ params }: { params: { unitId: string } }) {
  // 1. Ambil Unit ID dari URL
  const unitNumber = parseInt(params.unitId);
  
  // 2. Ambil Data Soal dari Server Action (Database)
  const unitData = await getMissionData(unitNumber);

  // 3. Jika Unit tidak ditemukan (misal user ketik URL ngawur), tampilkan 404
  if (!unitData) {
    return notFound();
  }

  // 4. Render Engine Klien
  return (
    <MissionClient unitData={unitData} />
  );
}