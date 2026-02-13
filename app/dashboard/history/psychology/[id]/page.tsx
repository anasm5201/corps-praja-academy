import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Brain, CheckCircle, XCircle } from "lucide-react";

export default async function PsychologyDetailPage({ params }: { params: { id: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;

  // 2. CEK LOGIN
  if (!userId) {
    redirect("/auth/login");
  }

  // 3. AMBIL DATA DARI DB
  // Pastikan model 'psychologyAttempt' ada di schema.prisma
  const attempt = await prisma.psychologyAttempt.findUnique({
    where: { id: params.id },
    include: {
        package: true
    }
  });

  // 4. VALIDASI KEPEMILIKAN
  // ✅ FIX: Gunakan variable 'userId' yang sudah diamankan
  if (!attempt || attempt.userId !== userId) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-mono font-bold">
             AKSES DITOLAK: DOKUMEN RAHASIA.
        </div>
      );
  }

  // 5. PARSING JAWABAN (Jika perlu, sesuaikan dengan struktur data psikologi Anda)
  // Untuk saat ini kita tampilkan skor dasar dulu
  const isPassed = attempt.score >= 70; // Contoh passing grade psikologi

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 p-6 md:p-12">
        
        {/* HEADER */}
        <div className="max-w-4xl mx-auto mb-8">
            <Link href="/dashboard/history" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-4 transition">
                <ArrowLeft size={16}/> KEMBALI KE ARSIP
            </Link>
            <div className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2 flex items-center gap-3">
                        <Brain className="text-pink-500" size={32}/> Laporan Psikologi
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                        Misi: {attempt.package?.title || "Unknown Mission"} • {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Skor Kecerdasan</p>
                    <p className={`text-4xl font-black ${isPassed ? 'text-green-500' : 'text-yellow-500'}`}>
                        {attempt.score}
                    </p>
                </div>
            </div>
        </div>

        {/* STATUS CARD */}
        <div className="max-w-4xl mx-auto mb-12">
            <div className={`p-6 rounded-2xl border ${isPassed ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30'} flex items-center gap-4`}>
                {isPassed ? <CheckCircle size={32} className="text-green-500"/> : <XCircle size={32} className="text-red-500"/>}
                <div>
                    <h3 className={`text-xl font-bold ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                        {isPassed ? "DISARANKAN (MEMENUHI SYARAT)" : "DIPERTIMBANGKAN (BELUM MEMENUHI)"}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Berdasarkan hasil analisa psikometrik, profil Anda menunjukkan potensi yang {isPassed ? 'kuat' : 'perlu ditingkatkan'} dalam aspek stabilitas emosi dan penyesuaian diri.
                    </p>
                </div>
            </div>
        </div>

        {/* WARNING JIKA FITUR BELUM LENGKAP */}
        <div className="max-w-4xl mx-auto text-center border border-dashed border-white/10 rounded-xl p-8">
            <p className="text-gray-500 text-sm italic">
                Detail analisa jawaban per dimensi (Kecerdasan, Kepribadian, Sikap Kerja) sedang didekripsi oleh tim psikolog markas.
            </p>
        </div>

    </div>
  );
}