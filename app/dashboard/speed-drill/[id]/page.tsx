import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, ChevronLeft } from "lucide-react";
// Sesuaikan path ini dengan lokasi DrillCore Anda.
import DrillCore from "@/components/drill/DrillCore"; 

// 🔥 PAKSA DATA SELALU BARU (ANTI-CACHE)
export const dynamic = "force-dynamic";

export default async function DrillUnitPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/auth/login");

  // =========================================================================
  // 🛡️ PROTOKOL KEAMANAN: GEMBOK BAJA SERVER (ANTI-BYPASS URL)
  // =========================================================================
  // 1. Cek Status Kepemilikan Akses Kadet
  const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true, createdAt: true }
  });

  const isPremium = ["SOLO_FIGHTER", "INTENSIVE_SQUAD"].includes(user?.subscriptionType || "FREE");
  const joinDate = new Date(user?.createdAt || new Date()).getTime();
  const hoursSinceJoin = (new Date().getTime() - joinDate) / (1000 * 60 * 60);
  const isTrialActive = hoursSinceJoin < 2;

  // 2. QUERY KE DATABASE UNIT (Tanpa Soal Dulu untuk Cek Cepat)
  const unitCheck = await prisma.drillUnit.findUnique({
      where: { id: params.id },
      select: { unitNumber: true }
  });

  // Jika unit tidak ada, biarkan lanjut ke bawah agar kena layar "TARGET HILANG (404)"
  if (unitCheck) {
      // 3. LOGIKA TENDANGAN (KICK)
      // JIKA: Bukan Premium, Bukan Trial, DAN mencoba akses Unit selain Unit 1
      if (!isPremium && !isTrialActive && unitCheck.unitNumber > 1) {
          // Tendang penyusup kembali ke halaman Subscription!
          redirect("/dashboard/subscription");
      }
  }
  // =========================================================================

  // 4. JIKA LOLOS PENGECEKAN, MUAT SEMUA AMUNISI SOAL
  const unit = await prisma.drillUnit.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { createdAt: 'asc' } } } 
  });

  // 5. HANDLE JIKA DATA TIDAK DITEMUKAN
  if (!unit) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 font-sans">
        <div className="p-4 bg-red-900/20 rounded-full mb-4 animate-pulse">
            <AlertTriangle size={48} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2 tracking-widest">TARGET HILANG (404)</h1>
        <p className="text-neutral-400 max-w-md mx-auto mb-8 font-mono text-xs">
            ID UNIT TIDAK VALID ATAU TELAH DIHAPUS DARI PETA OPERASI.
        </p>
        <a href="/dashboard/speed-drill" className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-sm font-bold transition tracking-wider border border-neutral-700">
            KEMBALI KE BASE
        </a>
      </div>
    );
  }

  // 6. DATA SANITIZATION (FIX ERROR TYPE MISMATCH)
  const safeQuestions = unit.questions.map((q) => ({
      ...q,
      explanation: q.explanation ?? undefined,   
      image: q.image ?? undefined,               
      svgCode: q.svgCode ?? undefined,           
      subCategory: q.subCategory ?? undefined,   
      drillUnitId: q.drillUnitId ?? undefined,
      packageId: q.packageId ?? undefined
  }));

  // 7. TAMPILKAN ARENA
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-900 pb-20 relative overflow-hidden">
        
       {/* Background Grid Taktis */}
       <div className="fixed inset-0 pointer-events-none opacity-10" 
            style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
       </div>

       {/* Header Sticky */}
       <div className="border-b border-neutral-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
              <a href="/dashboard/speed-drill" className="text-xs font-bold text-neutral-500 hover:text-white flex items-center gap-2 transition group uppercase tracking-widest">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> KEMBALI
              </a>
              <h1 className="text-sm font-black uppercase tracking-widest text-white truncate max-w-[200px] md:max-w-none">
                  {unit.title}
              </h1>
              <div className="w-8"></div> {/* Spacer penyeimbang */}
          </div>
       </div>

       {/* Arena Utama */}
       <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
           {/* Mengirim Data Unit & Soal YANG SUDAH DIBERSIHKAN ke Mesin DrillCore */}
           <DrillCore unitId={unit.id} questions={safeQuestions} />
       </div>
    </div>
  );
}