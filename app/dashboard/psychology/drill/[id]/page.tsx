import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DrillEngine from "./DrillEngine";

export default async function DrillPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Validasi ID Drill
  const validDrills = ["simbol-hilang", "angka-hilang", "huruf-hilang"];
  if (!validDrills.includes(params.id)) {
      return <div className="p-10 text-white">JENIS LATIHAN TIDAK DIKENALI.</div>;
  }

  return (
    <DrillEngine drillType={params.id} user={session.user} />
  );
}