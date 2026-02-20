import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateDailyMissions } from "@/lib/mission-engine"; 
import { ensureWeeklyPlan } from "@/lib/weekly-engine";
import Link from "next/link";
import MissionCard from "@/components/dashboard/MissionCard"; 
import { 
  Target, 
  Zap, 
  ChevronsUp, 
  Star, 
  Activity,
  BookOpen,
  Laptop2,
  Dumbbell,
  ShieldAlert,
  ScanFace,
  CalendarCheck,
  ArrowRight,
  Terminal, // [TAMBAHAN AI-SUH]
  AlertOctagon // [TAMBAHAN AI-SUH]
} from "lucide-react";

export const dynamic = 'force-dynamic';

// --- KOMPONEN RADAR CHARTS (INTEGRATED JAR-LAT-SUH) ---
const IntelligenceRadar = ({ jar, lat, suh }: { jar: number, lat: number, suh: number }) => {
  const getCoord = (value: number, angle: number) => {
    const r = (Math.min(value, 100) / 100) * 40; 
    const rad = (angle - 90) * (Math.PI / 180);
    return `${50 + r * Math.cos(rad)},${50 + r * Math.sin(rad)}`;
  };
  
  const ptsActual = `${getCoord(jar, 0)} ${getCoord(lat, 120)} ${getCoord(suh, 240)}`;
  const ptsTarget = `${getCoord(100, 0)} ${getCoord(100, 120)} ${getCoord(100, 240)}`; 

  return (
    <div className="relative w-full h-64 flex items-center justify-center bg-neutral-900/20 rounded-sm border border-neutral-800">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {[20, 40, 60, 80, 100].map((r) => (
           <circle key={r} cx="50" cy="50" r={r * 0.4} fill="none" stroke="#333" strokeWidth="0.5" strokeDasharray="2 2" />
        ))}
        {[0, 120, 240].map((deg) => (
           <line key={deg} x1="50" y1="50" x2={getCoord(100, deg).split(',')[0]} y2={getCoord(100, deg).split(',')[1]} stroke="#333" strokeWidth="0.5" />
        ))}
        <polygon points={ptsTarget} fill="rgba(255,255,255,0.02)" stroke="#444" strokeWidth="0.5" strokeDasharray="4 2" />
        <polygon points={ptsActual} fill="rgba(220, 38, 38, 0.4)" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
        
        <text x="50" y="8" textAnchor="middle" fill="#3b82f6" fontSize="4" fontWeight="bold">JAR (AKADEMIK)</text>
        <text x="88" y="85" textAnchor="middle" fill="#f59e0b" fontSize="4" fontWeight="bold">LAT (JASMANI)</text>
        <text x="12" y="85" textAnchor="middle" fill="#a855f7" fontSize="4" fontWeight="bold">SUH (MENTAL)</text>
      </svg>
      <div className="absolute top-2 left-2 flex flex-col gap-1 bg-black/50 p-1 rounded backdrop-blur-sm">
         <span className="text-[10px] font-mono text-blue-500 font-bold">JAR: {jar}</span>
         <span className="text-[10px] font-mono text-amber-500 font-bold">LAT: {lat}</span>
         <span className="text-[10px] font-mono text-purple-500 font-bold">SUH: {suh}</span>
      </div>
    </div>
  );
};

// --- KOMPONEN HEALTH BAR ---
const HealthBar = ({ hp }: { hp: number }) => {
  let colorClass = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  let statusText = "PRIMA";
  
  if (hp < 70) {
    colorClass = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
    statusText = "WASPADA";
  }
  if (hp < 40) {
    colorClass = "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse";
    statusText = "KRITIS";
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10px] font-bold text-neutral-400 tracking-widest flex items-center gap-2">
          <Activity size={14} className={hp < 40 ? "text-red-500 animate-pulse" : "text-emerald-500"} /> 
          KONDISI KADET: <span className={hp < 40 ? "text-red-500" : hp < 70 ? "text-amber-500" : "text-emerald-500"}>{statusText}</span>
        </span>
        <span className="text-xs font-mono font-bold text-white">{hp}%</span>
      </div>
      <div className="h-3 w-full bg-neutral-900 border border-neutral-800 rounded-sm p-[1px] relative">
        <div className={`h-full ${colorClass} transition-all duration-1000 ease-out relative overflow-hidden`} style={{ width: `${Math.max(5, hp)}%` }}>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:10px_10px]"></div>
        </div>
      </div>
    </div>
  );
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // ✅ AMANKAN USER ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/api/auth/signin"); 
  }

  // --- ENGINE EXECUTION ---
  let weeklyPlan = null;
  try {
    await generateDailyMissions(userId);
    weeklyPlan = await ensureWeeklyPlan(userId); 
  } catch (error) {
    console.error("⚠️ [COMMANDER WARNING] Engine Failure:", error);
  }

  // --- FETCH USER DATA ---
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        missions: { 
            where: { isCompleted: false },
            orderBy: { xpReward: 'desc' }, 
            take: 3
        }
    }
  });
  if (!userId) {
    redirect("/api/auth/signin"); 
  }

  // ==============================================================
  // 💥 SUNTIKAN VIP SEMENTARA UNTUK KOMANDAN (HAPUS NANTI) 💥
  // ==============================================================
  await prisma.user.update({
    where: { id: userId },
    data: {
      role: "ADMIN",
      subscriptionType: "INTENSIVE_SQUAD",
      subscriptionStatus: "ACTIVE"
    }
  });

  if (!user) return <div className="p-10 text-red-500 font-mono text-center mt-20">DATA PERSONEL HILANG. LAKUKAN REGISTER ULANG.</div>;

  if (!user.hasCompletedScreening) {
      redirect("/dashboard/assessment");
  }

  // --- INTELLIGENCE DATA GATHERING ---
  
  // 1. DATA DRILL
  let drillProgress = 0;
  let completedDrillsCount = 0;
  try {
      const drillUnitsCount = await prisma.drillUnit.count();
      const completedDrills = await prisma.drillHistory.findMany({
        where: { userId: user.id },
        select: { drillUnitId: true },
        distinct: ['drillUnitId']
      });
      completedDrillsCount = completedDrills.length;
      drillProgress = drillUnitsCount > 0 ? Math.round((completedDrillsCount / drillUnitsCount) * 100) : 0;
  } catch (e) {
      console.log("Drill data unavailable");
  }

  // 2. LAT SCORE
  const latestPhysical = await prisma.physicalLog.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  const latScore = latestPhysical 
      ? latestPhysical.totalScore 
      : Math.min(100, Math.round(((user.initialRunDistance || 0) / 3000) * 100));

  // 3. JAR SCORE (AKADEMIK TERBARU)
  const latestTryout = await prisma.tryoutAttempt.findFirst({
    where: { userId: user.id, isFinished: true },
    orderBy: { finishedAt: 'desc' }
  });
  const initialTotalScore = (user.initialTwkScore || 0) + (user.initialTiuScore || 0) + (user.initialTkpScore || 0);
  const jarScore = latestTryout 
      ? Math.round((latestTryout.score / 550) * 100) 
      : Math.round((initialTotalScore / 550) * 100);

  // 4. SUH SCORE
  const mentalBase = Math.round(((user.initialTkpScore || 0) / 225) * 100); 
  const disciplineBonus = user.xp > 2000 ? 10 : 0; 
  const suhScore = Math.min(100, mentalBase + disciplineBonus);

  // HP
  const hp = Math.round((jarScore + latScore + suhScore) / 3);

  // ===================================================================================
  // 🔥 [NEW] AI-SUH LOGIC: THE DIGITAL COMMANDER (TARGET CHARLIE)
  // ===================================================================================
  const twk = latestTryout ? (latestTryout.twkScore || 0) : (user.initialTwkScore || 0);
  const tiu = latestTryout ? (latestTryout.tiuScore || 0) : (user.initialTiuScore || 0);
  const tkp = latestTryout ? (latestTryout.tkpScore || 0) : (user.initialTkpScore || 0);
  const hasTakenTryout = latestTryout !== null || initialTotalScore > 0;

  let aiCommand = {
      level: "INFO", // CRITICAL, WARNING, INFO
      title: "KONDISI TEMPUR OPTIMAL",
      message: "Pertahankan ritme tempur, Kadet! Parameter akademik dan fisik stabil. Selesaikan sisa Modul Psikologi untuk mengasah insting dan mental Anda.",
      actionText: "BONGKAR LAB PSIKOLOGI",
      actionLink: "/dashboard/psychology",
      color: "border-blue-500/30 bg-blue-950/20 text-blue-400",
      iconColor: "text-blue-500"
  };

  if (!hasTakenTryout) {
      aiCommand = {
          level: "CRITICAL",
          title: "BUTA PETA KEKUATAN MUSUH",
          message: "KADET! Radar intelijen kosong. Kami tidak bisa memetakan kemampuan Anda sama sekali. Laksanakan Simulasi SKD sebagai baseline (patokan) awal Anda sekarang juga!",
          actionText: "LAKSANAKAN SIMULASI SKD",
          actionLink: "/dashboard/tryout",
          color: "border-red-600/50 bg-red-950/40 text-red-200",
          iconColor: "text-red-500 animate-pulse"
      };
  } else if (twk < 65) {
      aiCommand = {
          level: "WARNING",
          title: "KEBOCORAN SEKTOR TWK DETECTED",
          message: `KADET! Radar kami mendeteksi kelemahan fatal di sektor Wawasan Kebangsaan (Skor Anda: ${twk} | Ambang Batas: 65). Perintah hari ini: Hancurkan minimal 1 Modul TWK di Speed Drill untuk menutup lubang pertahanan!`,
          actionText: "LAKSANAKAN DRILL TWK",
          actionLink: "/dashboard/speed-drill",
          color: "border-amber-500/40 bg-amber-950/30 text-amber-200",
          iconColor: "text-amber-500"
      };
  } else if (tiu < 80) {
      aiCommand = {
          level: "WARNING",
          title: "LOGIKA TIU DI BAWAH STANDAR",
          message: `KADET! Parameter Logika & Numerik Anda kritis (Skor Anda: ${tiu} | Ambang Batas: 80). Lawan Anda sedang berlatih keras. Perintah: Sikat habis Modul TIU di lintasan Speed Drill sekarang!`,
          actionText: "LAKSANAKAN DRILL TIU",
          actionLink: "/dashboard/speed-drill",
          color: "border-amber-500/40 bg-amber-950/30 text-amber-200",
          iconColor: "text-amber-500"
      };
  } else if (tkp < 166) {
      aiCommand = {
          level: "WARNING",
          title: "KRISIS MENTAL TKP",
          message: `KADET! Parameter Karakteristik Pribadi Anda jeblok (Skor Anda: ${tkp} | Ambang Batas: 166). Jangan gugur sebelum bertempur. Segera lakukan kalibrasi mental!`,
          actionText: "LAKSANAKAN DRILL TKP",
          actionLink: "/dashboard/speed-drill",
          color: "border-amber-500/40 bg-amber-950/30 text-amber-200",
          iconColor: "text-amber-500"
      };
  } else if (latScore < 60) {
      aiCommand = {
          level: "WARNING",
          title: "DEGRADASI FISIK (SAMAPTA)",
          message: `KADET! Parameter jasmani Anda melemah (Skor LAT: ${latScore}). Otak cerdas tidak berguna jika fisik tumbang di medan tempur. Segera lakukan latihan fisik dan input hasilnya!`,
          actionText: "INPUT DATA SAMAPTA",
          actionLink: "/dashboard/physical/input",
          color: "border-amber-500/40 bg-amber-950/30 text-amber-200",
          iconColor: "text-amber-500"
      };
  }

  // AI BRIEFING LAMA (Hanya untuk radar kecil di bawah)
  let aiBriefing = "Lanjutkan latihan sesuai instruksi. Jaga konsistensi!";
  let aiMood = "NEUTRAL";
  if (latScore < 60) { aiBriefing = "PERINGATAN: Fisik (LAT) di bawah standar! Tingkatkan interval lari."; aiMood = "ANGRY"; }
  else if (jarScore < 60) { aiBriefing = "PERINGATAN: Logika (JAR) tumpul! Perbanyak simulasi CAT."; aiMood = "ANGRY"; }
  else if (hp > 85) { aiBriefing = "LUAR BIASA! Kondisi Prima. Pertahankan ritme tempur ini."; aiMood = "HAPPY"; }
  // ===================================================================================

  // RANK LOGIC
  const currentXP = user.xp || 0;
  const RANK_LEVELS = [
    { name: "KADET PRATAMA", threshold: 0, stars: 0, isPurna: false },
    { name: "KADET MUDA", threshold: 1001, stars: 1, isPurna: false },
    { name: "KADET MADYA", threshold: 5001, stars: 2, isPurna: false },
    { name: "KADET UTAMA", threshold: 10001, stars: 3, isPurna: false },
    { name: "PURNA PRAJA CPA", threshold: 20001, stars: 0, isPurna: true }
  ];
  
  let currentRankIndex = RANK_LEVELS.findIndex((r, i) => currentXP >= r.threshold && (i === RANK_LEVELS.length - 1 || currentXP < RANK_LEVELS[i + 1].threshold));
  if (currentRankIndex === -1) currentRankIndex = 0;
  
  const currentRank = RANK_LEVELS[currentRankIndex];
  const nextRank = currentRankIndex < RANK_LEVELS.length - 1 ? RANK_LEVELS[currentRankIndex + 1] : null;
  
  let rankProgressPercent = 100;
  let xpToNext = 0;
  if (nextRank) {
      const range = nextRank.threshold - currentRank.threshold;
      const currentPos = currentXP - currentRank.threshold;
      rankProgressPercent = Math.min(100, Math.max(0, (currentPos / range) * 100));
      xpToNext = nextRank.threshold - currentXP;
  }

  // WEEKLY PLAN PARSING
  let focusAreas: string[] = [];
  try { 
      focusAreas = weeklyPlan ? JSON.parse(weeklyPlan.focusAreas || "[]") : []; 
  } catch (e) { 
      focusAreas = []; 
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-red-900 pb-20">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(to right, #555 1px, transparent 1px), linear-gradient(to bottom, #555 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative p-4 md:p-6 max-w-7xl mx-auto">
        
        {/* HEADER: PANGKAT & HP */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-b border-neutral-800 pb-8 mb-8">
          {/* Bagian Kiri: Profil & Rank */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-4 mb-4">
               {/* Rank Insignia */}
               <div className="h-20 w-20 bg-gradient-to-br from-red-950 to-black border border-red-600 rounded-md flex flex-col items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.3)] relative overflow-hidden group">
                 <div className="absolute inset-0 bg-red-600/10 blur-xl group-hover:bg-red-600/20 transition-all"></div>
                 <div className="relative z-10 flex gap-0.5 items-center justify-center mb-1">
                    {currentRank.isPurna ? (
                        <div className="w-10 h-5 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 rounded-sm shadow-lg animate-pulse"></div>
                    ) : (
                        Array.from({ length: currentRank.stars }).map((_, i) => (
                            <Star key={i} size={16} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
                        ))
                    )}
                 </div>
                 <span className="text-[8px] text-red-500 font-black mt-1 uppercase tracking-widest relative z-10">CORPS PRAJA</span>
               </div>
               
               {/* Rank Text & XP */}
               <div className="flex-1">
                 <h2 className="text-2xl font-black text-white tracking-widest uppercase leading-none mb-2 drop-shadow-md">{currentRank.name}</h2>
                 <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono bg-neutral-900/50 inline-block px-3 py-1 rounded-full border border-neutral-800">
                   <span className="text-red-500 font-bold">{currentXP.toLocaleString()} XP</span>
                   <span className="opacity-50">/</span>
                   <span>{nextRank ? nextRank.threshold.toLocaleString() : "MAX"} XP</span>
                 </div>
               </div>
            </div>
            
            {/* Rank Progress Bar */}
            <div className="w-full">
              <div className="h-2 w-full bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-red-900 via-red-600 to-amber-500 transition-all duration-1000" style={{ width: `${rankProgressPercent}%` }}></div>
              </div>
              <div className="flex justify-between mt-1.5 text-[9px] text-neutral-500 font-mono uppercase tracking-wide">
                <span>Progress Kenaikan Tingkat</span>
                {nextRank && <span className="text-amber-500 flex items-center gap-1 font-bold animate-pulse"><ChevronsUp size={10} /> +{xpToNext.toLocaleString()} XP</span>}
              </div>
            </div>
          </div>

          {/* Bagian Kanan: Health Bar */}
          <div className="w-full lg:w-1/3 bg-neutral-950 p-5 border border-neutral-800 rounded-sm shadow-xl">
             <HealthBar hp={hp} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🔥 BLOK AI-SUH (SURAT PERINTAH HARIAN) - MUNCUL PALING ATAS SETELAH HEADER */}
        {/* ========================================================================= */}
        <div className={`mb-10 border rounded-xl p-6 relative overflow-hidden ${aiCommand.color}`}>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <AlertOctagon size={120} />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Terminal size={16} className={`${aiCommand.iconColor}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${aiCommand.iconColor}`}>
                        [AI-SUH] TRANSMISI PERINTAH HARIAN
                    </span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2">
                    {aiCommand.title}
                </h3>
                
                <p className="text-sm font-mono opacity-90 leading-relaxed mb-6 max-w-3xl">
                    <span className="animate-pulse mr-2">_</span>{aiCommand.message}
                </p>
                
                <Link href={aiCommand.actionLink} className="inline-block">
                    <button className={`px-6 py-3 text-xs font-black uppercase tracking-widest bg-black/40 hover:bg-black/60 border border-current rounded-sm flex items-center gap-3 transition-all group`}>
                        {aiCommand.actionText} 
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </Link>
            </div>
        </div>

        {/* WEEKLY PLAN & REMEDIAL */}
        {focusAreas.length > 0 && (
            <div className="mb-10 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CalendarCheck size={100} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400 border border-blue-500/30"><CalendarCheck size={20} /></div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">INSTRUKSI PELATIH</h3>
                            <p className="text-[10px] text-neutral-400 font-mono uppercase">Diagnosa Kelemahan Mingguan</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {focusAreas.map((area, idx) => (
                            <span key={idx} className="px-3 py-1 bg-red-950/40 text-red-400 border border-red-900/60 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <Target size={12} /> {area.replace("_", " ")}
                            </span>
                        ))}
                    </div>
                    <Link href="/dashboard/tryout" className="text-xs font-bold text-blue-400 hover:text-white flex items-center gap-2 uppercase tracking-widest transition-colors group">
                        LAKSANAKAN REMEDIAL <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                    </Link>
                </div>
            </div>
        )}

        {/* DAILY MISSIONS GRID */}
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 border border-yellow-500/20"><ShieldAlert size={20} /></div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">MISI PRIORITAS HARI INI</h3>
            </div>
            {user.missions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.missions.map((mission) => (
                        // ✅ FIX: SANITASI DATA 'description' (Handle Null)
                        <MissionCard 
                            key={mission.id} 
                            mission={{
                                ...mission,
                                description: mission.description || "Instruksi rahasia. Laksanakan misi untuk membuka detail."
                            }} 
                        />
                    ))}
                </div>
            ) : (
                <div className="p-6 border border-dashed border-neutral-800 rounded-xl text-center text-neutral-500 text-sm">
                    Tidak ada misi aktif. Istirahat yang cukup, Kadet!
                </div>
            )}
        </div>

        {/* ANALYTICS GRID (PETA KEKUATAN) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Radar Chart Block */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-black border border-neutral-800 p-1 rounded-sm relative group hover:border-red-900/50 transition-colors h-full flex flex-col">
                <div className="p-3 border-b border-neutral-900 flex justify-between items-center bg-neutral-950">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Target size={14} className="text-red-500" /> PETA KEKUATAN
                    </h3>
                </div>
                <div className="p-4 flex-1 flex items-center">
                    <IntelligenceRadar jar={jarScore} lat={latScore} suh={suhScore} />
                </div>
                <div className={`p-3 border-t text-[10px] font-mono flex items-start gap-2 ${aiMood === "ANGRY" ? "bg-red-950/20 text-red-400" : "bg-neutral-950 text-neutral-400"}`}>
                    <Zap size={14} className="shrink-0 mt-0.5" />
                    <span>"{aiBriefing}"</span>
                </div>
            </div>
          </div>

          {/* Stats & Shortcuts Block */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* SPEED DRILL HIGHLIGHT */}
            <Link href="/dashboard/speed-drill">
                <div className="bg-gradient-to-r from-orange-950/30 to-black border border-orange-500/30 p-5 rounded-sm flex flex-col md:flex-row items-center justify-between hover:border-orange-500 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap size={80} className="text-orange-500" />
                    </div>
                    
                    <div className="flex gap-4 items-center relative z-10 w-full">
                        <div className="p-3 bg-neutral-950 rounded-sm border border-orange-900/50 text-orange-500 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">SPEED DRILL <span className="text-orange-500">(REFLEKS TAKTIS)</span></h4>
                            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">LAT: PENINGKATAN KECEPATAN JAWAB</p>
                            
                            {/* Progress Drill */}
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-white leading-none">{completedDrillsCount}</span>
                                    <span className="text-[9px] text-neutral-500 font-mono uppercase leading-tight">UNIT<br/>SELESAI</span>
                                </div>
                                <div className="h-6 w-[1px] bg-neutral-800"></div>
                                <div className="flex-1 max-w-[200px]">
                                    <div className="flex justify-between text-[9px] text-orange-500 font-bold uppercase mb-1">
                                        <span>PROGRESS</span>
                                        <span>{drillProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500" style={{ width: `${drillProgress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ArrowRight size={24} className="text-orange-500 hidden md:block group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>
            </Link>

            {/* AKADEMIK & FISIK SMALL CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900/30 border border-neutral-800 p-4 rounded-sm flex items-center gap-4 hover:bg-neutral-900/50 transition-colors">
                    <div className="p-3 bg-neutral-950 rounded-sm border border-neutral-800 text-blue-600"><BookOpen size={24} /></div>
                    <div>
                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">AKADEMIK (JAR)</h4>
                        <p className="text-2xl font-black text-white">{jarScore} <span className="text-[10px] text-neutral-500 font-normal">PTS</span></p>
                    </div>
                </div>
                <div className="bg-neutral-900/30 border border-neutral-800 p-4 rounded-sm flex items-center gap-4 hover:bg-neutral-900/50 transition-colors">
                    <div className="p-3 bg-neutral-950 rounded-sm border border-neutral-800 text-amber-600"><Dumbbell size={24} /></div>
                    <div>
                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">JASMANI (LAT)</h4>
                        <p className="text-2xl font-black text-white">{latScore} <span className="text-[10px] text-neutral-500 font-normal">PTS</span></p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* SHORTCUTS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link href="/dashboard/tryout" className="group bg-red-950/40 hover:bg-red-900/60 text-white p-6 rounded-xl flex flex-col items-center gap-3 transition-all border border-red-900/50 shadow-lg relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors"></div>
                <Laptop2 size={24} className="group-hover:scale-110 transition-transform relative z-10 text-red-400" /> 
                <span className="text-[10px] font-black uppercase tracking-widest text-center relative z-10 text-red-100">SIMULASI CAT</span>
            </Link>

            <Link href="/dashboard/speed-drill" className="group bg-orange-950/40 hover:bg-orange-900/60 text-white p-6 rounded-xl flex flex-col items-center gap-3 transition-all border border-orange-900/50 shadow-lg relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-orange-600/5 group-hover:bg-orange-600/10 transition-colors"></div>
                <Zap size={24} fill="currentColor" className="group-hover:animate-pulse relative z-10 text-orange-400" /> 
                <span className="text-[10px] font-black uppercase tracking-widest text-center relative z-10 text-orange-100">SPEED DRILL</span>
            </Link>

            <Link href="/dashboard/physical/input" className="group bg-neutral-900/40 hover:bg-neutral-800/60 p-6 rounded-xl flex flex-col items-center gap-3 transition-all border border-neutral-800 backdrop-blur-sm">
                <Dumbbell size={24} className="text-amber-500 group-hover:rotate-12 transition-transform" /> 
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">INPUT FISIK</span>
            </Link>

            <Link href="/dashboard/psychology" className="group bg-neutral-900/40 hover:bg-neutral-800/60 p-6 rounded-xl flex flex-col items-center gap-3 transition-all border border-neutral-800 backdrop-blur-sm">
                <ScanFace size={24} className="text-emerald-500 group-hover:scale-110 transition-transform" /> 
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">LAB PSIKOLOGI</span>
            </Link>

            <Link href="/dashboard/materials" className="group bg-neutral-900/40 hover:bg-neutral-800/60 p-6 rounded-xl flex flex-col items-center gap-3 transition-all border border-neutral-800 backdrop-blur-sm">
                <BookOpen size={24} className="text-blue-500 group-hover:-translate-y-1 transition-transform" /> 
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">PLAZA MENZA</span>
            </Link>
        </div>

      </div>
    </div>
  );
}