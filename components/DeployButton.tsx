"use client";

import { useRouter } from "next/navigation";

export default function DeployButton({ missionId }: { missionId: string }) {
  const router = useRouter();

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // Mencegah bentrok dengan elemen lain
        // Paksa navigasi
        router.push(`/dashboard/quiz?missionId=${missionId}`);
      }}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded shadow-lg shadow-red-900/20 transition-transform active:scale-95 tracking-widest text-sm cursor-pointer z-50 relative"
    >
      DEPLOY MISI ➔
    </button>
  );
}