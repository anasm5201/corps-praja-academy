import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KecermatanEngine from "./KecermatanEngine";

export default async function PsychologyStartPage({ params }: { params: { pkgId: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA PAKET
  const pkg = await prisma.psychologyPackage.findUnique({
      where: { id: params.pkgId },
      include: {
          questions: true // Ambil soal-soal
      }
  });

  if (!pkg) return notFound();

  // 3. KONFIGURASI DEFAULT
  const durationPerCol = 60; 

  // 4. MAPPING DATA (FIX ERROR 'text' -> 'question')
  const formattedQuestions = pkg.questions.map(q => ({
      id: q.id,
      // ✅ FIX: Di database namanya 'question', di UI kita butuh 'text'
      text: q.question,       
      // ✅ FIX: Handle null option dengan string kosong
      options: q.options || "" 
  }));

  return (
     <div className="min-h-screen w-full bg-zinc-950 overflow-hidden">
        <KecermatanEngine 
            pkgId={pkg.id} 
            questions={formattedQuestions} 
            durationPerCol={durationPerCol} 
        />
     </div>
  );
}