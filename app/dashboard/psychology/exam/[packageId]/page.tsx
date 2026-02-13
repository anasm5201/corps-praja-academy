import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    Brain, Clock, AlertTriangle, PlayCircle, 
    CheckCircle2, HelpCircle 
} from "lucide-react";

export default async function PsychologyExamBriefing({ params }: { params: { packageId: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA PAKET
  const pkg = await prisma.psychologyPackage.findUnique({
      where: { id: params.packageId },
      include: {
          _count: {
              select: { questions: true }
          }
      }
  });

  if (!pkg) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-mono">
              DATA INTELEJEN HILANG: PAKET TIDAK DITEMUKAN.
          </div>
      );
  }

  // 3. KONFIGURASI DEFAULT (BYPASS 'pkg.config')
  // ✅ FIX: Hapus akses ke pkg.config yang menyebabkan error
  // Kita gunakan default values atau ambil dari duration
  const config = {
      timeLimit: pkg.duration || 60, // Default 60 menit jika duration null
      passingGrade: 75,              // Default passing grade
      shuffleQuestions: true,
      showTimer: true
  };

  /* OPSIONAL: Jika Anda menyimpan config di description sebagai JSON string,
     Anda bisa uncomment kode di bawah ini:
     
     try {
        if (pkg.description && pkg.description.startsWith('{')) {
            const parsed = JSON.parse(pkg.description);
            Object.assign(config, parsed);
        }
     } catch (e) {}
  */

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Ambience */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-600 to-transparent opacity-50"></div>
        <div className="absolute -right-20 bottom-1/2 w-64 h-64 bg-pink-600/10 rounded-full blur-[100px]"></div>

        <div className="max-w-2xl w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-8 md:p-12 relative backdrop-blur-xl">
            
            {/* Header */}
            <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-pink-900/20 border border-pink-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.2)]">
                    <Brain size={40} className="text-pink-500" />
                </div>

                <div>
                    <h2 className="text-xs font-black text-pink-500 uppercase tracking-[0.3em] mb-2">Psikometri Test</h2>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                        {pkg.title}
                    </h1>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-8 my-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-2"><Clock className="text-gray-500" size={20}/></div>
                        <p className="text-2xl font-black">{config.timeLimit}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Menit</p>
                    </div>
                    <div className="text-center border-x border-white/5">
                        <div className="flex justify-center mb-2"><HelpCircle className="text-gray-500" size={20}/></div>
                        <p className="text-2xl font-black">{pkg._count?.questions || 0}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Soal</p>
                    </div>
                    <div className="text-center">
                        <div className="flex justify-center mb-2"><CheckCircle2 className="text-gray-500" size={20}/></div>
                        <p className="text-2xl font-black">{config.passingGrade}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">KKM</p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="text-left bg-black/40 p-6 rounded-xl border border-white/5 mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-yellow-500"/> Instruksi Pengerjaan
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-400 leading-relaxed list-disc pl-4">
                        <li>Jawablah dengan jujur sesuai kondisi diri Anda.</li>
                        <li>Tidak ada jawaban benar atau salah dalam tes kepribadian.</li>
                        <li>Waktu akan berjalan otomatis saat tombol <strong>MULAI</strong> ditekan.</li>
                        <li>Pastikan koneksi internet stabil selama tes berlangsung.</li>
                    </ul>
                </div>

                {/* Action */}
                <div>
                    <Link 
                        href={`/dashboard/psychology/exam/${pkg.id}/start`} 
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest rounded-xl transition-all w-full md:w-auto shadow-lg shadow-pink-600/20 hover:shadow-pink-600/40 hover:-translate-y-1"
                    >
                        <PlayCircle className="fill-white text-pink-600" size={24} />
                        Mulai Tes Psikologi
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
}