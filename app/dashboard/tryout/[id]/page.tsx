// LOKASI: app/dashboard/tryout/[id]/page.tsx
// Halaman ini hanya jembatan. Langsung lempar ke /room.

import { redirect } from "next/navigation";

export default function PackageDetailPage({ params }: { params: { id: string } }) {
  // Langsung arahkan ke ruang ujian
  redirect(`/dashboard/tryout/${params.id}/room`);
}