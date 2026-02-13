import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import KecerdasanEngine from "@/components/exam/KecerdasanEngine";

interface PageProps {
  params: {
    packageId: string;
  };
}

export default async function KecerdasanGamePage({ params }: PageProps) {
  // 1. Ambil Data Paket + Soal-soalnya
  const pkg = await prisma.psychologyPackage.findUnique({
    where: { id: params.packageId },
    include: {
        questions: true // Include soal
    }
  });

  if (!pkg) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-2">DATA KOSONG</h1>
                <p className="text-gray-500">Belum ada soal untuk paket ini.</p>
            </div>
        </div>
    );
  }

  // 2. Parse Config Duration
  let duration = pkg.duration || 900; // Default 15 menit
   try {
       // --- MANUVER BYPASS TYPE CHECKING ---
       const safePkg = pkg as any; // Kita paksa TypeScript tutup mata
       
       if (safePkg.config) {
           // Jaga-jaga jika config sudah berbentuk object atau masih string
           const cfg = typeof safePkg.config === 'string' 
               ? JSON.parse(safePkg.config) 
               : safePkg.config;
               
           if (cfg?.duration) duration = cfg.duration;
       }
   } catch (e) {
       console.error("Gagal membaca konfigurasi:", e);
   }

  // 3. Render Engine
  return (
    <KecerdasanEngine 
      packageId={pkg.id}
      questions={pkg.questions}
      duration={duration}
    />
  );
}