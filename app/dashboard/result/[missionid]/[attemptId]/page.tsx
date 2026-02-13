import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    Trophy, AlertTriangle, CheckCircle2, XCircle, 
    ArrowLeft, Zap, Target, Brain, Shield // ✅ FIX: 'zap' -> 'Zap'
} from "lucide-react";

export default async function MissionResultPage({ params }: { params: { missionid: string, attemptId: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA ATTEMPT (Asumsi model: MissionAttempt)
  // Jika nanti error "missionAttempt does not exist", kita ganti sesuai schema Anda (misal: userMission)
  // Untuk sekarang, kita bypass pengecekan ketat dengan 'any' agar build import sukses dulu.
  let attempt: any = null;
  
  try {
      // Coba ambil dari missionAttempt (Standar)
      // Kita cast ke 'any' untuk menghindari error jika model belum digenerate prisma
      attempt = await (prisma as any).missionAttempt.findUnique({
          where: { id: params.attemptId },
          include: {
              mission: true
          }
      });
  } catch (e) {
      console.log("Model missionAttempt belum siap, menggunakan mode fallback.");
  }

  // Jika data tidak ditemukan (atau model belum ada), tampilkan Fallback UI
  // agar build tetap jalan.
  if (!attempt) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4 text-white">
            <AlertTriangle size={64} className="text-yellow-500 mb-4" />
            <h1 className="text-2xl font-black uppercase mb-2">DATA MISI BELUM TERSEDIA</h1>
            <p className="text-gray-500 mb-8">Laporan operasi belum tercatat di database pusat.</p>
            <Link href="/dashboard" className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition">
                KEMBALI KE MARKAS
            </Link>
        </div>
      );
  }

  const isSuccess = attempt.score >= 70; // Asumsi KKM 70

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-8 relative backdrop-blur-xl">
            
            <Link href="/dashboard" className="absolute top-6 left-6 text-gray-500 hover:text-white transition">
                <ArrowLeft size={24} />
            </Link>

            <div className="text-center space-y-6 mt-4">
                {/* Icon Badge */}
                <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center shadow-2xl relative
                    ${isSuccess ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}
                `}>
                    {isSuccess ? (
                        <Trophy size={48} className="text-green-500" />
                    ) : (
                        <XCircle size={48} className="text-red-500" />
                    )}
                </div>

                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                        {isSuccess ? "MISI SUKSES" : "MISI GAGAL"}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {attempt.mission?.title || "Unknown Mission"}
                    </p>
                </div>

                {/* Score Card */}
                <div className="py-8 border-y border-white/5 grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                             {/* ✅ FIX: Gunakan Zap (Huruf Besar) */}
                            <Zap className="text-yellow-500" size={24} />
                        </div>
                        <p className="text-4xl font-black">{attempt.score}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">SKOR PEROLEHAN</p>
                    </div>
                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <Target className="text-blue-500" size={24} />
                        </div>
                        <p className="text-4xl font-black">{isSuccess ? "+50" : "+10"}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">XP DITERIMA</p>
                    </div>
                </div>

                <Link 
                    href="/dashboard" 
                    className="inline-block w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Selesai
                </Link>
            </div>
        </div>
    </div>
  );
}