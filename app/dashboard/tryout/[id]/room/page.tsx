import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// 🔥 PERHATIKAN BARIS INI: 
// Kita ganti "./ExamInterface" menjadi "@/components/ExamInterface"
// Ini akan memaksa sistem mengambil tampilan BARU (Tes Koran).
import ExamInterface from "@/components/ExamInterface"; 

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    // Menangkap dynamic route, entah itu [id] atau [packageId]
    [key: string]: string; 
  };
}

export default async function RoomPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // Deteksi ID paket dari URL (bisa 'id' atau 'packageId')
  const packageId = params.id || params.packageId;

  // 1. AMBIL DATA PAKET + SOALNYA
  const pkg = await prisma.tryoutPackage.findUnique({
    where: { id: packageId },
    include: {
      questions: {
        orderBy: { id: 'asc' } 
      } 
    }
  });

  if (!pkg) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-mono tracking-widest">
            ⚠️ AKSES DITOLAK: PAKET TIDAK DITEMUKAN
        </div>
    );
  }

  // 2. CEK LOGISTIK
  if (!pkg.questions || pkg.questions.length === 0) {
     return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono p-10 text-center">
            <h1 className="text-4xl mb-4">⚠️ ERROR LOGISTIK</h1>
            <p>PAKET INI KOSONG (0 SOAL). HUBUNGI INSTRUKTUR.</p>
        </div>
     );
  }

  // 3. MANAJEMEN SESI (ATTEMPT)
  let attempt = await prisma.tryoutAttempt.findFirst({
    where: {
      userId: userId,
      packageId: pkg.id,
      isFinished: false
    }
  });

  if (!attempt) {
    attempt = await prisma.tryoutAttempt.create({
      data: {
        userId: userId,
        packageId: pkg.id,
        score: 0,
        answers: JSON.stringify({}), 
        startedAt: new Date(),
        isFinished: false
      }
    });
  }

  // 4. SINKRONISASI WAKTU
  const durationMs = (pkg.duration || 100) * 60 * 1000;
  const startTime = new Date(attempt.startedAt).getTime();
  const endTime = startTime + durationMs;

  // 5. SIAPKAN DATA AMAN UNTUK CLIENT
  const safeQuestions = pkg.questions.map(q => ({
    id: q.id,
    text: q.text,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options, 
    type: q.type,
    image: q.image, 
    svgCode: q.svgCode,
    correctAnswer: q.correctAnswer // PENTING: Untuk logika kunci jawaban tes koran
  }));

  // 6. PARSING JAWABAN TERSIMPAN
  let savedAnswers = {};
  try {
      if (typeof attempt.answers === 'string') {
          savedAnswers = JSON.parse(attempt.answers);
      } else {
          savedAnswers = attempt.answers || {};
      }
  } catch (e) {
      savedAnswers = {};
  }

  // 7. KIRIM KE GARIS DEPAN
  return (
    <ExamInterface 
      pkg={pkg} 
      attemptId={attempt.id}
      questions={safeQuestions}
      duration={pkg.duration}
      endTime={endTime.toString()} 
      savedAnswers={savedAnswers} 
      user={session?.user}
    />
  );
}