import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    Clock, Target, Shield, AlertTriangle, 
    PlayCircle, ArrowLeft, FileText 
} from "lucide-react";

export default async function MissionBriefingPage({ params }: { params: { id: string } }) {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA MISI (Gunakan 'tryoutPackage' bukan 'mission')
  const mission = await prisma.tryoutPackage.findUnique({
      where: { id: params.id },
      include: {
          questions: {
              select: { id: true } // Kita hanya butuh jumlah soal untuk briefing
          }
      }
  });

  if (!mission) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <AlertTriangle size={48} className="mb-4 text-red-500" />
              <h1 className="text-xl font-bold text-white">Misi Tidak Ditemukan</h1>
              <p className="mt-2">Paket operasi ini mungkin telah ditarik atau dihapus dari database.</p>
              <Link href="/dashboard/tryout" className="mt-6 px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  Kembali ke Markas
              </Link>
          </div>
      );
  }

  // Konversi data untuk tampilan
  const questionCount = mission.questions.length;
  // Jika duration tidak ada di DB, default ke 100 menit (standar SKD)
  const duration = mission.duration || 100; 

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50"></div>
        <div className="absolute -left-20 top-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>

        <div className="max-w-2xl w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-8 md:p-12 relative backdrop-blur-xl">
            
            {/* Back Button */}
            <Link href="/dashboard/tryout" className="absolute top-6 left-6 text-gray-500 hover:text-white transition">
                <ArrowLeft size={24} />
            </Link>

            <div className="text-center space-y-6">
                
                {/* Icon Badge */}
                <div className="w-20 h-20 mx-auto bg-blue-900/20 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                    <Target size={40} className="text-blue-500" />
                </div>

                {/* Title */}
                <div>
                    <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-2">Briefing Operasi</h2>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                        {mission.title}
                    </h1>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-8 my-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-2"><Clock className="text-gray-500" size={20}/></div>
                        <p className="text-2xl font-black">{duration}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Menit</p>
                    </div>
                    <div className="text-center border-x border-white/5">
                        <div className="flex justify-center mb-2"><FileText className="text-gray-500" size={20}/></div>
                        <p className="text-2xl font-black">{questionCount}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Soal</p>
                    </div>
                    <div className="text-center">
                        <div className="flex justify-center mb-2"><Shield className="text-gray-500" size={20}/></div>
                        <p className="text-2xl font-black">SKD</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Tipe</p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto">
                    {mission.description || "Simulasi Seleksi Kompetensi Dasar (SKD) standar CAT BKN. Kerjakan dengan jujur, teliti, dan penuh integritas."}
                </p>

                {/* Action Button */}
                <div className="pt-4">
                    <Link 
                        href={`/dashboard/tryout/start/${mission.id}`} 
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-xl transition-all w-full md:w-auto shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1"
                    >
                        <PlayCircle className="fill-white text-blue-600" size={24} />
                        Mulai Operasi
                    </Link>
                    <p className="text-[10px] text-gray-600 mt-4 font-mono">
                        *Waktu akan dimulai segera setelah tombol ditekan.
                    </p>
                </div>

            </div>
        </div>
    </div>
  );
}