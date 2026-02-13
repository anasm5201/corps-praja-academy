import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    ShieldAlert, ArrowLeft, BookOpen, Clock, 
    HelpCircle, Play 
} from "lucide-react";

export default async function MissionOverviewPage({ params }: { params: { missionid: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA MISI (Target: TryoutPackage)
  // ✅ FIX: Ganti 'prisma.mission' -> 'prisma.tryoutPackage'
  const mission = await prisma.tryoutPackage.findUnique({
      where: { id: params.missionid },
      include: {
          questions: {
              select: { id: true } // Efisiensi: Cuma butuh jumlah soal
          }
      }
  });

  if (!mission) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4 text-white">
            <ShieldAlert size={64} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-black uppercase mb-2">MISI TIDAK DITEMUKAN</h1>
            <p className="text-gray-500 mb-8">Data operasi tidak tersedia dalam arsip.</p>
            <Link href="/dashboard" className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition">
                KEMBALI KE MARKAS
            </Link>
        </div>
      );
  }

  // Default values
  const title = (mission as any).title || "Misi Operasi";
  const category = (mission as any).category || "UMUM";
  const duration = (mission as any).duration || 90;
  const questionCount = mission.questions.length;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-8 md:p-12 relative backdrop-blur-xl">
            
            <Link href="/dashboard" className="absolute top-6 left-6 text-gray-500 hover:text-white transition">
                <ArrowLeft size={24} />
            </Link>

            <div className="text-center space-y-6 mt-4">
                <div className="w-20 h-20 mx-auto bg-blue-900/20 border border-blue-500/30 rounded-2xl flex items-center justify-center">
                    <BookOpen size={40} className="text-blue-500" />
                </div>

                <div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-2">
                        {title}
                    </h1>
                    <span className="px-3 py-1 rounded bg-blue-900/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                        {category}
                    </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-8 my-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-2"><Clock className="text-gray-500" size={24}/></div>
                        <p className="text-3xl font-black text-white">{duration}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">MENIT</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <div className="flex justify-center mb-2"><HelpCircle className="text-gray-500" size={24}/></div>
                        <p className="text-3xl font-black text-white">{questionCount}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">SOAL</p>
                    </div>
                </div>

                <Link 
                    href={`/dashboard/quiz/${mission.id}/play`} 
                    className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl transition-all hover:bg-gray-200"
                >
                    <Play size={20} fill="currentColor" />
                    LAKSANAKAN MISI
                </Link>
            </div>
        </div>
    </div>
  );
}