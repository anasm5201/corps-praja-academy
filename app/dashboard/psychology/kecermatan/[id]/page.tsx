import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import KecermatanEngine from "./KecermatanEngine"; // Import Engine

export default async function KecermatanPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Ambil Data Paket
  const pkg = await prisma.tryoutPackage.findUnique({
    where: { id: params.id }
  });

  if (!pkg) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 text-red-500" size={40}/>
            <h1 className="text-xl font-bold">DATA RUSAK</h1>
            <p className="text-neutral-500">Paket latihan tidak ditemukan di database.</p>
            <Link href="/dashboard/psychology" className="mt-4 inline-block text-sm underline">Kembali</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      
      {/* HEADER SIMPLE */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/dashboard/psychology" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase">
            <ArrowLeft size={16}/> BATALKAN
        </Link>
        <div className="text-sm font-black tracking-widest text-orange-500 uppercase">
            {pkg.title}
        </div>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      {/* ENGINE AREA */}
      <div className="flex-1 flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full">
         <KecermatanEngine pkg={pkg} />
      </div>

    </div>
  );
}