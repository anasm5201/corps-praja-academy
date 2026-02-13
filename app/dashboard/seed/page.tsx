import { prisma } from "@/lib/prisma";
import { ShieldAlert, CheckCircle2, Database } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SeedPage() {
  // ⚠️ PROTOKOL PENGAMAN:
  const existingPackage = await prisma.tryoutPackage.findFirst();

  if (existingPackage) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
        <Database size={64} className="text-blue-500 mb-4" />
        <h1 className="text-2xl font-black uppercase mb-2">DATABASE SUDAH TERISI</h1>
        <p className="text-gray-500 max-w-md">
          Protokol Seeding dibatalkan karena terdeteksi data operasi yang sudah ada. 
        </p>
      </div>
    );
  }

  // --- EKSEKUSI SEEDING ---
  try {
    // 1. Buat Paket Tryout (SKD)
    // TryoutPackage biasanya lebih lengkap (ada price, isFree, category)
    await prisma.tryoutPackage.create({
      data: {
        title: "SKD TAHAP 1: SELEKSI DASAR",
        category: "CAT SKD", 
        description: "Simulasi Computer Assisted Test untuk calon praja. Meliputi TWK, TIU, dan TKP.",
        duration: 100,
        price: 0,
        isFree: true,
        questions: {
            create: [
                {
                    text: "Ideologi dasar negara Indonesia adalah...",
                    options: JSON.stringify([
                        { code: "A", label: "Pancasila", score: 5 },
                        { code: "B", label: "Liberalisme", score: 0 },
                        { code: "C", label: "Komunisme", score: 0 },
                        { code: "D", label: "Sosialisme", score: 0 },
                        { code: "E", label: "Kapitalisme", score: 0 }
                    ]),
                    correctAnswer: "A",
                    explanation: "Pancasila adalah dasar negara.",
                    type: "TWK",
                    score: 5
                }
            ]
        }
      }
    });

    // 2. Buat Paket Psikologi (Kecermatan)
    await prisma.psychologyPackage.create({
        data: {
            title: "TES KECERMATAN: SIMBOL HILANG",
            type: "PSIKOLOGI_KECERMATAN", 
            description: "Uji ketahanan fokus dan kecepatan mata.",
            duration: 10,
            // ✅ FIX: Hapus 'price' & 'isFree' (Kolom tidak ada di PsychologyPackage)
            questions: {
                create: [
                    {
                        question: "A B C D E", 
                        options: "D A C E B",  
                        correct: "", 
                    }
                ]
            }
        }
    });

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle2 size={64} className="text-green-500 mb-4" />
        <h1 className="text-2xl font-black uppercase mb-2">SEEDING BERHASIL</h1>
        <p className="text-gray-500">
          Data awal operasi telah disuntikkan ke dalam sistem.
        </p>
      </div>
    );

  } catch (error) {
    console.error("Seed Error:", error);
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-black uppercase mb-2">SEEDING GAGAL</h1>
        <p className="text-red-400 font-mono text-xs max-w-lg text-left bg-red-900/20 p-4 rounded border border-red-500/30">
          {String(error)}
        </p>
      </div>
    );
  }
}