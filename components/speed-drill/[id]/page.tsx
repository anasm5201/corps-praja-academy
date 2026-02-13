import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DrillGame from "@/components/speed-drill/DrillGame"; 
import { AlertTriangle } from "lucide-react";

export default async function DrillUnitPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 1. QUERY KE TABEL BARU (DrillUnit)
  const unit = await prisma.drillUnit.findUnique({
    where: { id: params.id },
    include: {
      questions: true 
    }
  });

  // 2. HANDLE JIKA DATA TIDAK DITEMUKAN (404 Handling)
  if (!unit) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
        <div className="p-4 bg-red-900/20 rounded-full mb-4 animate-pulse">
            <AlertTriangle size={48} className="text-red-600" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">TARGET HILANG (404)</h1>
        <p className="text-neutral-400 max-w-md mx-auto mb-8">
            Unit latihan dengan ID <span className="font-mono text-red-500 text-xs">{params.id}</span> tidak ditemukan dalam database logistik.
        </p>
        <a href="/dashboard/speed-drill" className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-bold transition">
            KEMBALI KE BASE
        </a>
      </div>
    );
  }

  // --- FIX: TAKTIK ADAPTOR AMUNISI ---
  // Kita konversi format database agar sesuai dengan cetakan komponen DrillGame
  const formattedUnit = {
    ...unit,
    questions: unit.questions.map((q) => ({
      ...q,
      question: q.text,                // Konversi 'text' menjadi 'question'
      answer: q.correctAnswer,         // Konversi 'correctAnswer' menjadi 'answer'
      explanation: q.explanation || "" // Pastikan string, bukan null
    }))
  };

  // 3. JIKA ADA, TAMPILKAN GAME ARENA
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-900 pb-20">
       
       {/* Background Grid */}
       <div className="fixed inset-0 pointer-events-none opacity-10" 
            style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
       </div>

       {/* Top Bar */}
       <div className="border-b border-neutral-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
              <a href="/dashboard/speed-drill" className="text-xs font-bold text-neutral-500 hover:text-white flex items-center gap-2 transition">
                  ← BATALKAN MISI
              </a>
              <h1 className="text-sm font-black uppercase tracking-widest text-white">
                 {unit.title}
              </h1>
              <div className="w-8"></div> {/* Spacer */}
          </div>
       </div>

       {/* Game Container */}
       <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
           {/* PANGGIL KOMPONEN GAME DENGAN DATA YANG SUDAH DIADAPTASI */}
           {/* Tambahkan "as any" untuk membungkam sisa peringatan TypeScript */}
           <DrillGame unit={formattedUnit as any} />
       </div>

    </div>
  );
}