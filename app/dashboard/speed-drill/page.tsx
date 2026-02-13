import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
    Zap, Lock, Play, CheckCircle2, Trophy, Target, Star
} from "lucide-react";

// 🔥 PENTING: PAKSA REFRESH AGAR STATUS SELALU UPDATE
export const dynamic = "force-dynamic";

export default async function SpeedDrillPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Amankan User ID (Bypass Type Check)
  // Ini mencegah error "session.user possibly undefined"
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  // 2. AMBIL DATA UNIT (URUTKAN DARI 1 SAMPAI 30)
  // Pastikan model 'drillUnit' ada di schema, jika belum ada, sesuaikan dengan model yang ada.
  const units = await prisma.drillUnit.findMany({
    orderBy: { unitNumber: 'asc' },
  });

  // 3. AMBIL PROGRESS KADET (DARI TABEL: DrillHistory)
  const history = await prisma.drillHistory.findMany({
    where: { userId: userId }, // ✅ Gunakan userId yang sudah diamankan
    select: { drillUnitId: true },
    distinct: ['drillUnitId'] 
  });

  // Buat Set ID agar pencarian cepat (O(1))
  const completedUnitIds = new Set(history.map(h => h.drillUnitId));

  // 4. LOGIKA UNLOCK (ADAPTIF)
  const getUnitStatus = (currentUnitNum: number) => {
    // Unit 1 Selalu Terbuka
    if (currentUnitNum === 1) {
        const myUnitId = units.find(u => u.unitNumber === 1)?.id;
        const isFinished = myUnitId ? completedUnitIds.has(myUnitId) : false;
        
        return { 
            isLocked: false, 
            isCompleted: isFinished, 
            isActive: !isFinished 
        };
    }

    // Cek Unit Sebelumnya (n-1)
    const prevUnit = units.find(u => u.unitNumber === currentUnitNum - 1);
    
    // Jika unit sebelumnya tidak ada (error data), kunci unit ini
    if (!prevUnit) return { isLocked: true, isCompleted: false, isActive: false };

    // Apakah unit sebelumnya sudah selesai?
    const prevFinished = completedUnitIds.has(prevUnit.id);

    // Cek status unit ini
    const myUnit = units.find(u => u.unitNumber === currentUnitNum);
    const amIFinished = myUnit ? completedUnitIds.has(myUnit.id) : false;

    return {
        isLocked: !prevFinished, // Terkunci jika sebelumnya belum beres
        isCompleted: amIFinished,
        isActive: prevFinished && !amIFinished // Aktif jika sebelumnya beres & ini belum
    };
  };

  const completedCount = completedUnitIds.size;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-900 overflow-hidden relative pb-20">
      
      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 pointer-events-none opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative max-w-lg mx-auto min-h-screen border-x border-neutral-900/50 bg-neutral-950/80 backdrop-blur-sm">
        
        {/* HUD HEADER */}
        <div className="sticky top-0 z-50 bg-black/90 border-b border-red-900/30 p-5 flex justify-between items-center backdrop-blur-md shadow-lg shadow-black/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-red-600 tracking-[0.3em]">SKD FAST TRACK</span>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-white">
              SPEED <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">DRILL</span>
            </h1>
            <p className="text-[10px] text-neutral-500 font-mono mt-1">
              LATIHAN REFLEKS TWK - TIU - TKP
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-sm">
            <Trophy size={14} className="text-yellow-500" />
            <span className="text-xs font-mono font-bold text-neutral-300">{completedCount}/{units.length} UNIT</span>
          </div>
        </div>

        {/* JALUR PETA (THE PATH) */}
        <div className="flex flex-col items-center py-12 space-y-2 px-4">
          
          {units.length === 0 ? (
             <div className="text-center py-20 opacity-50 text-xs font-mono border border-dashed border-neutral-800 p-8 rounded-xl">
               <Zap size={40} className="mx-auto mb-4 text-neutral-700"/>
               DATA DRILL BELUM DIMUAT.<br/>
               <span className="text-neutral-600">Jalankan npx tsx prisma/seed-drill.ts</span>
             </div>
          ) : (
             units.map((unit, index) => {
                const { isLocked, isCompleted, isActive } = getUnitStatus(unit.unitNumber);
                
                // LOGIKA ZIG-ZAG (Kiri - Kanan)
                const offset = index % 2 === 0 ? "translate-x-12" : "-translate-x-12";

                return (
                  <div key={unit.id} className={`relative flex flex-col items-center transition-transform duration-500 ${offset}`}>
                    
                    {/* KABEL PENGHUBUNG */}
                    {index < (units.length - 1) && (
                        <div className={`absolute top-10 h-28 w-[2px] -z-10 
                          ${index % 2 === 0 ? "-rotate-[25deg] origin-top-left left-1/2" : "rotate-[25deg] origin-top-right right-1/2"}
                          ${isCompleted ? "bg-red-800 shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "bg-neutral-800"}`} 
                        />
                    )}

                    {/* TOMBOL HEXAGON */}
                    <div className="relative group">
                      
                      {/* Efek Radar jika Aktif */}
                      {isActive && (
                        <div className="absolute inset-0 bg-red-600 blur-xl opacity-30 animate-pulse rounded-full"></div>
                      )}
                      
                      {/* BINTANG PRESTASI (Jika Selesai) */}
                      {isCompleted && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5 z-20">
                             <Star size={12} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
                             <Star size={12} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
                             <Star size={12} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
                          </div>
                      )}

                      <Link href={isLocked ? "#" : `/dashboard/speed-drill/${unit.id}`} className={isLocked ? "cursor-default" : "cursor-pointer"}>
                        <button disabled={isLocked}
                          className={`w-24 h-24 flex flex-col items-center justify-center relative transition-all duration-300 transform hover:scale-105 active:scale-95
                          ${isActive 
                            ? "bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] z-10" 
                            : isCompleted 
                              ? "bg-neutral-900 border-2 border-red-900/50 text-red-500" 
                              : "bg-neutral-950 border-2 border-neutral-800 text-neutral-600 grayscale opacity-80"
                          }`}
                          style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                        >
                          {/* IKON TENGAH */}
                          {isLocked ? (
                            <Lock size={20} />
                          ) : isActive ? (
                            <Play size={28} fill="currentColor" className="ml-1 animate-bounce" />
                          ) : (
                            <CheckCircle2 size={24} />
                          )}
                          
                          {/* LABEL NOMOR */}
                          <span className="text-[9px] font-black mt-1 opacity-80 tracking-widest">
                            UNIT {unit.unitNumber}
                          </span>
                        </button>
                      </Link>
                    </div>

                    {/* LABEL JUDUL (Floating Bottom) */}
                    <div className="absolute top-24 w-40 text-center pointer-events-none z-20">
                          <h3 className={`text-[9px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-sm border border-neutral-800 px-3 py-1 rounded-full shadow-lg inline-block
                            ${isActive ? 'text-white border-red-500/30' : 'text-neutral-500'}`}>
                              {unit.title.replace(`UNIT ${unit.unitNumber}:`, "").replace(`Unit ${unit.unitNumber}:`, "").trim() || "LATIHAN"}
                          </h3>
                    </div>

                    {/* PENANDA FASE (CHECKPOINT SETIAP 10 UNIT) */}
                    {(unit.unitNumber % 10 === 0 && unit.unitNumber !== 30) && (
                      <div className="mt-24 mb-12 w-64 flex items-center justify-center gap-3 opacity-60">
                        <div className="h-[1px] w-12 bg-red-500/50"></div>
                        <div className="px-3 py-1 bg-red-950/50 border border-red-900/50 rounded-full flex items-center gap-2">
                          <Target size={10} className="text-red-500" />
                          <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest">
                            FASE {Math.ceil(unit.unitNumber / 10)} TUNTAS
                          </span>
                        </div>
                        <div className="h-[1px] w-12 bg-red-500/50"></div>
                      </div>
                    )}

                  </div>
                );
             })
          )}
          
          {/* FINAL BADGE */}
          {units.length > 0 && (
            <div className="mt-10 pt-10 text-center opacity-80">
                <div className="inline-block p-6 border border-neutral-800 bg-neutral-900/50 rounded-sm">
                  <Trophy size={32} className="text-red-600 mx-auto mb-2" />
                  <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em]">MISSION COMPLETE</p>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}