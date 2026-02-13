import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExamClient from "./ExamClient"; // KEMBALI MENGGUNAKAN EXAM CLIENT
import { startExam } from "@/app/actions/examActions"; 

export default async function TryoutPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 1. AMBIL PAKET SOAL DARI DATABASE
  const pkg = await prisma.tryoutPackage.findUnique({
    where: { id: params.id },
    include: {
        questions: true 
    }
  });

  if (!pkg) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <p className="font-mono text-red-500">ERR_404: PAKET SOAL TIDAK DITEMUKAN / RUSAK.</p>
        </div>
      );
  }

  // 2. MULAI SESI UJIAN (CREATE ATTEMPT)
  const startResult = await startExam(pkg.id);
  
  if (!startResult.success || !startResult.attemptId) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-red-950/20 border border-red-500/50 p-8 rounded-2xl text-center">
                <h1 className="font-black text-2xl mb-2 text-red-500 uppercase">GAGAL MEMULAI MISI</h1>
                <p className="text-gray-400 text-sm mb-6">
                    Sistem gagal membuat sesi ujian baru. Kemungkinan masalah koneksi database atau sesi Anda tidak valid.
                </p>
                <a href="/dashboard/materials" className="inline-block px-6 py-3 bg-white text-black font-bold rounded-lg uppercase tracking-widest hover:bg-gray-200 transition">
                    KEMBALI KE GUDANG
                </a>
            </div>
        </div>
      );
  }

  // 3. KIRIM DATA KE CLIENT ENGINE
  return (
    <ExamClient 
        pkg={pkg} 
        user={session.user} 
        attemptId={startResult.attemptId} 
    />
  );
}