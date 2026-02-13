import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResultClient from "./ResultClient";

interface PageProps {
  params: { id: string };
  searchParams: { attemptId: string };
}

export default async function ResultPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (!searchParams.attemptId) {
    return <div className="p-10 text-red-500 font-mono">ERROR: MISSING_ATTEMPT_ID</div>;
  }

  // 1. Ambil Data Attempt SANGAT LENGKAP (Deep Fetch)
  const attempt = await prisma.tryoutAttempt.findUnique({
    where: { id: searchParams.attemptId },
    include: {
      // Kita panggil package beserta seluruh soal di dalamnya
      package: {
        include: {
          questions: {
            orderBy: { id: 'asc' } // Urutkan biar konsisten
          }
        }
      }
    }
  });

  // Validasi Kepemilikan Data
  if (!attempt || !session?.user || attempt.userId !== (session.user as any).id) {
    redirect("/dashboard/mission");
  }

  // ----------------------------------------------------------------------
  // OPERASI PENYATUAN DATA (PARSING & MERGING)
  // ----------------------------------------------------------------------
  
  // A. Bongkar String JSON menjadi Array
  let parsedAnswers: any[] = [];
  try {
      parsedAnswers = attempt.answers ? JSON.parse(attempt.answers as string) : [];
  } catch (error) {
      console.error("Gagal bongkar JSON Answers", error);
  }

  // B. Gabungkan jawaban dengan data soal aslinya
  const answersWithQuestions = parsedAnswers.map((ans: any) => {
      // Cari soal asli berdasarkan questionId
      const originalQuestion = attempt.package?.questions?.find((q: any) => q.id === ans.questionId);
      
      // Amankan dan urutkan opsi jawaban (karena opsi di DB juga berpotensi berupa JSON String)
      let parsedOptions = [];
      if (originalQuestion) {
          try {
              parsedOptions = typeof originalQuestion.options === 'string' 
                  ? JSON.parse(originalQuestion.options) 
                  : (originalQuestion.options || []);
              
              // Sort opsi jawaban agar selalu urut A, B, C, D, E
              parsedOptions.sort((a: any, b: any) => a.code.localeCompare(b.code));
          } catch (e) {
              console.error("Gagal parse options pada soal", e);
          }
      }

      return {
          ...ans,
          question: {
              ...originalQuestion,
              options: parsedOptions
          }
      };
  });

  // ----------------------------------------------------------------------
  // SERIALISASI AKHIR
  // ----------------------------------------------------------------------
  
  // Mengubah Date object jadi string agar aman masuk Client Component
  const safeAttempt = {
    ...attempt,
    createdAt: attempt.createdAt.toISOString(),
    answers: answersWithQuestions // Masukkan array yang sudah matang!
  };

  return (
    <div className="min-h-screen bg-[#000000] text-gray-200 font-sans relative">
       {/* Background Grid Taktis */}
       <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]"></div>
       </div>

       {/* Panggil Client Component */}
       <ResultClient attempt={safeAttempt} />
    </div>
  );
}