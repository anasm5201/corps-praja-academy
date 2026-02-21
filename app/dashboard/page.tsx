import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureWeeklyPlan } from "@/lib/weekly-engine"; 
import Link from "next/link";
import DashboardCharts from "./DashboardCharts"; 
import { 
  Target, Zap, ChevronsUp, Star, Activity, BookOpen, Laptop2, Dumbbell,
  ShieldAlert, ScanFace, CalendarCheck, ArrowRight, Terminal, AlertOctagon,
  Clock, MessageSquare, CheckCircle 
} from "lucide-react";
import DrillCard from "@/components/dashboard/DrillCard";

export const dynamic = 'force-dynamic';

// ============================================================================
// 🧠 BUKU PINTAR: MATRIKS NALAR MENTOR (THE MENTOR'S DICTIONARY)
// ============================================================================
const MENTOR_DICTIONARY: Record<string, any> = {
  // --- TWK (8 PILAR) ---
  "NASIONALISME": { title: "PENGUATAN NASIONALISME", message: "Kadet, jiwa cintamu pada tanah air harus diwujudkan dalam pemahaman konseptual. Radar melihat kamu masih goyah membedakan Nasionalisme dan Chauvinisme. Buka modul di Plaza Menza.", actionText: "BACA MODUL TWK ➔", actionLink: "/dashboard/materials", color: "border-amber-500/40 bg-amber-950/30 text-amber-200", iconColor: "text-amber-500" },
  "INTEGRITAS": { title: "KRISIS INTEGRITAS DETECTED", message: "Sebagai calon aparatur, kejujuran adalah harga mati. Kamu tampak bimbang pada studi kasus anti-korupsi. Pelajari kembali SOP integritas di Plaza Menza.", actionText: "PELAJARI INTEGRITAS ➔", actionLink: "/dashboard/materials", color: "border-red-500/40 bg-red-950/30 text-red-200", iconColor: "text-red-500" },
  "BELA_NEGARA": { title: "WAWASAN KETAHANAN MELEMAH", message: "Ancaman negara kini bukan cuma fisik, tapi juga perang siber dan ideologi. Pemahamanmu tentang Ketahanan Nasional perlu dipertajam. Asah refleks analisamu di Simulasi CAT.", actionText: "ASAH LOGIKA KETAHANAN ➔", actionLink: "/dashboard/tryout", color: "border-amber-500/40 bg-amber-950/30 text-amber-200", iconColor: "text-amber-500" },
  "PANCASILA": { title: "FONDASI IDEOLOGI GOYAH", message: "Pancasila lahir dari proses panjang. Kamu tampak kebingungan dengan sejarah BPUPKI dan butir pengamalan sila. Kembali ke Plaza Menza dan petakan ulang sejarahnya.", actionText: "PELAJARI SEJARAH PANCASILA ➔", actionLink: "/dashboard/materials", color: "border-amber-500/40 bg-amber-950/30 text-amber-200", iconColor: "text-amber-500" },
  "UUD_1945": { title: "KEBOCORAN KONSTITUSI", message: "Pemahaman hierarki hukum tidak boleh keliru satu kata pun. Kamu sering terjebak di wewenang lembaga negara dan amandemen UUD. Kuasai kembali di Plaza Menza.", actionText: "KUASAI KONSTITUSI ➔", actionLink: "/dashboard/materials", color: "border-amber-500/40 bg-amber-950/30 text-amber-200", iconColor: "text-amber-500" },
  "NKRI": { title: "DEFISIT MEMORI SEJARAH", message: "Bangsa yang besar tidak melupakan sejarahnya. Rekam jejakmu menunjukkan kelemahan di periode sejarah kemerdekaan. Latih memori sejarahmu di Speed Drill.", actionText: "LATIHAN MEMORI SEJARAH ➔", actionLink: "/dashboard/speed-drill", color: "border-amber-500/40 bg-amber-950/30 text-amber-200", iconColor: "text-amber-500" },
  "BHINNEKA_TUNGGAL_IKA": { title: "RESOLUSI KONFLIK SARA", message: "Indonesia berdiri di atas ribuan perbedaan. Kamu masih kesulitan saat dihadapkan pada skenario konflik SARA. Perbaiki perspektif kebhinekaanmu di Plaza Menza.", actionText: "PELAJARI KEBERAGAMAN ➔", actionLink: "/dashboard/materials", color: "border-amber-500/40 bg-amber-950/30 text-amber-200", iconColor: "text-amber-500" },
  "BAHASA_INDONESIA": { title: "KETELITIAN BAHASA MENURUN", message: "Bahasa adalah alat komando yang vital. Ketelitianmu mencari ide pokok atau menganalisa PUEBI masih di bawah standar. Latih kecepatan membacamu di Speed Drill.", actionText: "ASAH KETELITIAN BAHASA ➔", actionLink: "/dashboard/speed-drill", color: "border-amber-500/40 bg-amber-950/30 text-amber-200", iconColor: "text-amber-500" },
  "TWK_GENERAL": { title: "DEFISIT WAWASAN KEBANGSAAN", message: "Radar mendeteksi kelemahan secara umum di sektor TWK. Fondasi kebangsaanmu harus segera diperkokoh.", actionText: "PERKUAT MATERI TWK ➔", actionLink: "/dashboard/materials", color: "border-amber-500/40 bg-amber-950/30 text-amber-200", iconColor: "text-amber-500" },

  // --- TIU (10 PILAR) ---
  "VERBAL_ANALOGI": { title: "KOSAKATA ANALOGI TERBATAS", message: "Analogi bukan sekadar menebak, tapi menemukan pola hubungan kata secara presisi. Latih refleksmu di Speed Drill.", actionText: "PERKAYA KOSAKATA ➔", actionLink: "/dashboard/speed-drill", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },
  "VERBAL_SILOGISME": { title: "KEBOCORAN LOGIKA SILOGISME", message: "Kamu sering terkecoh pada penarikan Kesimpulan Logis karena menggunakan asumsi pribadi. Gunakan rumus murni (Modus Ponens/Tollens)!", actionText: "ASAH LOGIKA DEDUKTIF ➔", actionLink: "/dashboard/materials", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },
  "VERBAL_ANALITIS": { title: "PENALARAN ANALITIS KACAU", message: "Otakmu kewalahan menerima informasi bertumpuk (syarat, urutan posisi). Penalaran analitismu harus lebih terstruktur. Gempur soal di Simulasi CAT.", actionText: "LATIHAN ANALISA DATA ➔", actionLink: "/dashboard/tryout", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },
  "NUMERIK_BERHITUNG": { title: "REFLEKS HITUNG LAMBAT", message: "Ketangkasanmu berhitung pecahan dan desimal masih sangat lambat. Jangan bergantung pada kalkulator! Uji refleks hitungmu di Speed Drill.", actionText: "ASAH REFLEKS HITUNG ➔", actionLink: "/dashboard/speed-drill", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },
  "NUMERIK_DERET": { title: "KEPEKAAN POLA TUMPUL", message: "Deret angka adalah tes kejelian melihat ritme tersembunyi. Kamu masih gagal melihat pola lompatan. Tonton rumus deret di Plaza Menza.", actionText: "PELAJARI POLA DERET ➔", actionLink: "/dashboard/materials", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },
  "NUMERIK_PERBANDINGAN": { title: "TERJEBAK HITUNGAN KULI", message: "Kamu membuang waktu menghitung detail pada soal kuantitatif (X dan Y). Ini tes nalar matematis, bukan hitung kuli! Pelajari trik eliminasinya di Plaza Menza.", actionText: "TRIK PERBANDINGAN ANGKA ➔", actionLink: "/dashboard/materials", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },
  "NUMERIK_CERITA": { title: "PANIK NARASI SOAL CERITA", message: "Jangan panik melihat narasi panjang. Kamu masih goyah menerjemahkan teks ke rumus Aritmatika Sosial. Biasakan diri di Simulasi CAT.", actionText: "TAKHLUKKAN SOAL CERITA ➔", actionLink: "/dashboard/tryout", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },
  "FIGURAL_ANALOGI": { title: "RELASI VISUAL KAKU", message: "Kecerdasan visualmu butuh pemanasan. Kamu gagal menangkap relasi perubahan antar gambar. Latih kejelian matamu di Speed Drill.", actionText: "LATIHAN RELASI VISUAL ➔", actionLink: "/dashboard/speed-drill", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },
  "FIGURAL_KETIDAKSAMAAN": { title: "KURANG TELITI (ANOMALI)", message: "Di medan operasi, ketelitian melihat hal ganjil adalah nyawa. Kamu masih luput mencari pola gambar yang berbeda. Asah di Simulasi CAT.", actionText: "ASAH KETELITIAN MATA ➔", actionLink: "/dashboard/tryout", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },
  "FIGURAL_SERIAL": { title: "IMAJINASI SPASIAL LEMAH", message: "Imajinasi spasialmu kaku saat merotasi atau melipat gambar (Jaring-jaring). Latih otak kananmu di Lab Psikologi.", actionText: "LATIH IMAJINASI SPASIAL ➔", actionLink: "/dashboard/psychology", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },
  "TIU_GENERAL": { title: "LOGIKA INTELEGENSIA MELEMAH", message: "Radar mendeteksi kecepatan dan ketepatan logikamu berada di bawah standar. Asah kembali insting numerik dan verbalmu!", actionText: "HAJAR SIMULASI TIU ➔", actionLink: "/dashboard/tryout", color: "border-blue-500/40 bg-blue-950/30 text-blue-200", iconColor: "text-blue-500" },

  // --- TKP (6 PILAR) ---
  "PELAYANAN_PUBLIK": { title: "EMPATI PELAYANAN RENDAH", message: "Ingat, kita pelayan rakyat! Kamu terpancing emosi dan abai SOP saat menghadapi komplain warga. Kalibrasi mentalmu di Lab Psikologi.", actionText: "KALIBRASI EMPATI ➔", actionLink: "/dashboard/psychology", color: "border-purple-500/40 bg-purple-950/30 text-purple-200", iconColor: "text-purple-500" },
  "JEJARING_KERJA": { title: "SINDROM INDIVIDUALIS", message: "Kerja besar tak bisa diselesaikan sendiri. Rekam jejakmu menunjukkan sifat individualis. Perbaiki sikap profesionalmu di Simulasi CAT.", actionText: "PELAJARI KOLABORASI TIM ➔", actionLink: "/dashboard/tryout", color: "border-purple-500/40 bg-purple-950/30 text-purple-200", iconColor: "text-purple-500" },
  "SOSIAL_BUDAYA": { title: "INTOLERANSI LINGKUNGAN", message: "Abdi negara harus siap ditugaskan di mana saja. Insting adaptasimu di lingkungan multikultural sangat kaku.", actionText: "ASAH KECERDASAN SOSIAL ➔", actionLink: "/dashboard/materials", color: "border-purple-500/40 bg-purple-950/30 text-purple-200", iconColor: "text-purple-500" },
  "TIK": { title: "RAWAN TERTINGGAL TEKNOLOGI", message: "Dunia bergerak cepat! Kamu tampak menghindari digitalisasi di pekerjaan (gaptek) dan rentan hoaks.", actionText: "PERKUAT LITERASI DIGITAL ➔", actionLink: "/dashboard/psychology", color: "border-purple-500/40 bg-purple-950/30 text-purple-200", iconColor: "text-purple-500" },
  "PROFESIONALISME": { title: "PRIORITAS TUGAS GOYAH", message: "Tugas negara adalah amanah. Kamu bimbang memisahkan urusan personal (keluarga/cuti) dengan deadline pekerjaan.", actionText: "MANTAPKAN PROFESIONALISME ➔", actionLink: "/dashboard/tryout", color: "border-purple-500/40 bg-purple-950/30 text-purple-200", iconColor: "text-purple-500" },
  "ANTI_RADIKALISME": { title: "RADAR IDEOLOGI TUMPUL", message: "Keamanan bangsa di tangan kita. Kamu kurang responsif menolak ekstremisme. Bekali pemahaman yang benar di Plaza Menza.", actionText: "BENTENGI IDEOLOGI NEGARA ➔", actionLink: "/dashboard/materials", color: "border-purple-500/40 bg-purple-950/30 text-purple-200", iconColor: "text-purple-500" },
  "TKP_GENERAL": { title: "KEMATANGAN PSIKOLOGI MINUS", message: "Karakteristik pribadimu saat menghadapi tekanan kerja terpantau belum matang. Jangan sampai gugur di tahap akhir.", actionText: "KALIBRASI MENTAL ➔", actionLink: "/dashboard/psychology", color: "border-purple-500/40 bg-purple-950/30 text-purple-200", iconColor: "text-purple-500" },

  // --- LAT / FISIK ---
  "FISIK_KRITIS": { title: "DEGRADASI FISIK (SAMAPTA)", message: "Kadet! Otak cerdas tidak akan berguna jika fisik tumbang di medan tempur. Parameter jasmanimu jauh di bawah standar lulus. Perintah hari ini: Segera eksekusi lari interval, push-up, dan input hasilnya!", actionText: "INPUT DATA SAMAPTA ➔", actionLink: "/dashboard/physical/input", color: "border-red-600/50 bg-red-950/40 text-red-200", iconColor: "text-red-500 animate-pulse" }
};

// ============================================================================
// KOMPONEN RADAR CHARTS (INTEGRATED JAR-LAT-SUH)
// ============================================================================
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

// ============================================================================
// KOMPONEN HEALTH BAR
// ============================================================================
const HealthBar = ({ hp }: { hp: number }) => {
  let colorClass = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  let statusText = "PRIMA";
  
  if (hp < 70) { colorClass = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"; statusText = "WASPADA"; }
  if (hp < 40) { colorClass = "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse"; statusText = "KRITIS"; }

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
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/api/auth/signin"); 

  // --- MENGHIDUPKAN OTAK KURIKULUM MINGGUAN (BLUEPRINT ENGINE) ---
  let weeklyBlueprint = null;
  try {
    weeklyBlueprint = await ensureWeeklyPlan(userId); 
  } catch (error) {
    console.error("⚠️ [COMMANDER WARNING] Blueprint Engine Failure:", error);
  }

  // Parse JSON Drills dari Database
  let parsedDrills: any[] = [];
  if (weeklyBlueprint && weeklyBlueprint.dailyDrills) {
      try { parsedDrills = JSON.parse(weeklyBlueprint.dailyDrills); } catch (e) { parsedDrills = []; }
  }

  // --- FETCH USER DATA ---
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return <div className="p-10 text-red-500 font-mono text-center mt-20">DATA PERSONEL HILANG. LAKUKAN REGISTER ULANG.</div>;
  if (!user.hasCompletedScreening) redirect("/dashboard/assessment");

  // ============================================================================
  // 🔥 MENGAMBIL DATA UNTUK GRAFIK VISUAL & AI MENTOR
  // ============================================================================
  
  const historyTryouts = await prisma.tryoutAttempt.findMany({
    where: { userId: userId, isFinished: true },
    orderBy: { finishedAt: 'asc' }, 
    take: 5
  });
  const latestTryout = historyTryouts.length > 0 ? historyTryouts[historyTryouts.length - 1] : null;

  const skdHistory = historyTryouts.map((t, index) => ({
    name: `TO-${index + 1}`,
    twk: t.twkScore || 0,
    tiu: t.tiuScore || 0,
    tkp: t.tkpScore || 0,
    total: t.score
  }));

  const historyPhysical = await prisma.physicalLog.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'asc' },
    take: 5
  });
  const latestPhysical = historyPhysical.length > 0 ? historyPhysical[historyPhysical.length - 1] : null;

  const physicalHistory = historyPhysical.map((p) => ({
    date: new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    score: Math.round(p.totalScore)
  }));

  // C. Perhitungan Skor Baseline
  let drillProgress = 0;
  let completedDrillsCount = 0;
  try {
      const drillUnitsCount = await prisma.drillUnit.count();
      const completedDrills = await prisma.drillHistory.findMany({ where: { userId: user.id }, select: { drillUnitId: true }, distinct: ['drillUnitId'] });
      completedDrillsCount = completedDrills.length;
      drillProgress = drillUnitsCount > 0 ? Math.round((completedDrillsCount / drillUnitsCount) * 100) : 0;
  } catch (e) {}

  const latScore = latestPhysical ? latestPhysical.totalScore : Math.min(100, Math.round(((user.initialRunDistance || 0) / 3000) * 100));
  const initialTotalScore = (user.initialTwkScore || 0) + (user.initialTiuScore || 0) + (user.initialTkpScore || 0);
  const jarScore = latestTryout ? Math.round((latestTryout.score / 550) * 100) : Math.round((initialTotalScore / 550) * 100);
  const mentalBase = Math.round(((latestTryout?.tkpScore || user.initialTkpScore || 0) / 225) * 100); 
  const disciplineBonus = user.xp > 2000 ? 10 : 0; 
  const suhScore = Math.min(100, mentalBase + disciplineBonus);
  const hp = Math.round((jarScore + latScore + suhScore) / 3);

  // ============================================================================
  // 🧠 OTAK AI-SUH: DYNAMIC MENTOR MATRIX (SISTEM TRIASE)
  // ============================================================================
  const TARGET_TWK = 65;
  const TARGET_TIU = 80;
  const TARGET_TKP = 166;
  const TARGET_LAT = 65;

  const twkScore = latestTryout ? (latestTryout.twkScore || 0) : (user.initialTwkScore || 0);
  const tiuScore = latestTryout ? (latestTryout.tiuScore || 0) : (user.initialTiuScore || 0);
  const tkpScore = latestTryout ? (latestTryout.tkpScore || 0) : (user.initialTkpScore || 0);
  const hasTakenTryout = latestTryout !== null || initialTotalScore > 0;

  let analysisData = { worstTwk: "AMAN", worstTiu: "AMAN", worstTkp: "AMAN" };
  if (latestTryout && latestTryout.analysis) {
      try { analysisData = JSON.parse(latestTryout.analysis); } catch(e) {}
  }

  const assessments = [
      { id: "TWK", deficit: TARGET_TWK - twkScore, isCritical: twkScore < TARGET_TWK, worstCategory: analysisData.worstTwk },
      { id: "TIU", deficit: TARGET_TIU - tiuScore, isCritical: tiuScore < TARGET_TIU, worstCategory: analysisData.worstTiu },
      { id: "TKP", deficit: TARGET_TKP - tkpScore, isCritical: tkpScore < TARGET_TKP, worstCategory: analysisData.worstTkp },
      { id: "LAT", deficit: TARGET_LAT - latScore, isCritical: latScore < TARGET_LAT, worstCategory: "FISIK_KRITIS" }
  ];

  const sortedAssessments = assessments.sort((a, b) => b.deficit - a.deficit);
  const primaryWeakness = sortedAssessments[0];

  let aiCommand;
  if (!hasTakenTryout) {
      aiCommand = {
          level: "CRITICAL", title: "BUTA PETA KEKUATAN MUSUH",
          message: "Kadet! Radar intelijen kosong. Kami tidak bisa memetakan kemampuanmu secara spesifik. Laksanakan Simulasi CAT sekarang sebagai 'Titik Nol' agar Kakak Asuh bisa merumuskan resep latihanmu!",
          actionText: "LAKSANAKAN SIMULASI SKD ➔", actionLink: "/dashboard/tryout", color: "border-red-600/50 bg-red-950/40 text-red-200", iconColor: "text-red-500 animate-pulse"
      };
  } else if (primaryWeakness.isCritical) {
      const dictKey = (primaryWeakness.worstCategory === "LAINNYA" || !primaryWeakness.worstCategory) 
                      ? `${primaryWeakness.id}_GENERAL` 
                      : primaryWeakness.worstCategory;
      aiCommand = MENTOR_DICTIONARY[dictKey] || MENTOR_DICTIONARY[`${primaryWeakness.id}_GENERAL`];
  } else {
      aiCommand = {
          level: "INFO", title: "KONDISI TEMPUR OPTIMAL",
          message: "Luar Biasa, Kadet! Seluruh parameter akademik (JAR) dan jasmani (LAT) berada di atas ambang batas. Jangan cepat puas. Terus asah instingmu, baca literatur tambahan di luar aplikasi, dan matangkan mentalmu!",
          actionText: "BONGKAR LAB PSIKOLOGI ➔", actionLink: "/dashboard/psychology", color: "border-emerald-500/40 bg-emerald-950/30 text-emerald-200", iconColor: "text-emerald-500"
      };
  }

  let aiBriefing = "Lanjutkan latihan sesuai instruksi. Jaga konsistensi!";
  let aiMood = "NEUTRAL";
  if (primaryWeakness.isCritical && primaryWeakness.id === "LAT") { aiBriefing = `PERINGATAN: Fisik (LAT) di bawah standar (${latScore})! Prioritaskan kardio.`; aiMood = "ANGRY"; } 
  else if (primaryWeakness.isCritical) { aiBriefing = `FOKUS SEKTOR ${primaryWeakness.id}: Kelemahan terdeteksi di subtes ${primaryWeakness.worstCategory.replace("_", " ")}.`; aiMood = "ANGRY"; } 
  else if (hp > 80) { aiBriefing = "LUAR BIASA! Kondisi Prima. Pertahankan ritme tempur ini."; aiMood = "HAPPY"; }

  // ============================================================================
  // RANK LOGIC 
  // ============================================================================
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

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-red-900 pb-20">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #555 1px, transparent 1px), linear-gradient(to bottom, #555 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative p-4 md:p-6 max-w-7xl mx-auto">
        
        {/* --- HEADER: PANGKAT & HP --- */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-b border-neutral-800 pb-8 mb-8">
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-4 mb-4">
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
               
               <div className="flex-1">
                 <h2 className="text-2xl font-black text-white tracking-widest uppercase leading-none mb-2 drop-shadow-md">{currentRank.name}</h2>
                 <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono bg-neutral-900/50 inline-block px-3 py-1 rounded-full border border-neutral-800">
                   <span className="text-red-500 font-bold">{currentXP.toLocaleString()} XP</span>
                   <span className="opacity-50">/</span>
                   <span>{nextRank ? nextRank.threshold.toLocaleString() : "MAX"} XP</span>
                 </div>
               </div>
            </div>
            
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

          <div className="w-full lg:w-1/3 bg-neutral-950 p-5 border border-neutral-800 rounded-sm shadow-xl">
             <HealthBar hp={hp} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🔥 BLOK AI-SUH (DIAGNOSA TERBARU) */}
        {/* ========================================================================= */}
        <div className={`mb-10 border rounded-xl p-6 relative overflow-hidden ${aiCommand.color}`}>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <AlertOctagon size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Terminal size={16} className={`${aiCommand.iconColor}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${aiCommand.iconColor}`}>
                        [AI-MENTOR] DIAGNOSA TRIASE TERKINI
                    </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2">
                    {aiCommand.title}
                </h3>
                <p className="text-sm font-mono opacity-90 leading-relaxed mb-6 max-w-4xl">
                    <span className="animate-pulse mr-2">_</span>{aiCommand.message}
                </p>
                <Link href={aiCommand.actionLink} className="inline-block">
                    <button className={`px-6 py-3 text-xs font-black uppercase tracking-widest bg-black/40 hover:bg-black/60 border border-current rounded-sm flex items-center gap-3 transition-all group active:scale-95`}>
                        {aiCommand.actionText} 
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </Link>
            </div>
        </div>

        {/* ========================================================================= */}
        {/* 🚀 TACTICAL BLUEPRINT MINGGUAN (PENGGANTI MISI HARIAN ACAK) */}
        {/* ========================================================================= */}
        {weeklyBlueprint && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-900/20 rounded-lg text-blue-500 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CalendarCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-black text-white uppercase tracking-wider">TACTICAL BLUEPRINT (7 HARI)</h3>
                  <p className="text-xs text-neutral-400 font-mono">Fokus Ops Minggu Ini: <span className="text-blue-400 font-bold">{weeklyBlueprint.focusAreas || "PENYELARASAN TRITUNGGAL"}</span></p>
                </div>
            </div>

            {/* Evaluasi Bersambung Mentor */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 mb-8 border-l-4 border-l-blue-500 shadow-lg">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 flex items-center gap-2">
                 <MessageSquare size={12}/> EVALUASI & INSTRUKSI MINGGUAN MENTOR
               </h4>
               <p className="text-sm font-mono text-neutral-300 leading-relaxed italic">
                 "{weeklyBlueprint.evaluationText || "Laksanakan instruksi ini dengan penuh disiplin dan tanggung jawab. Jangan ada yang terlewat!"}"
               </p>
            </div>

            {/* Grid 7 Hari (Menu Drill Expert) */}
            {parsedDrills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                 {parsedDrills.map((drill, idx) => (
                    <DrillCard 
                        key={idx} 
                        blueprintId={weeklyBlueprint.id} 
                        drill={drill} 
                        index={idx} 
                    />
                 ))}
              </div>
            ) : (
              <div className="p-10 border border-dashed border-neutral-800 rounded-xl text-center text-neutral-500 text-sm font-mono bg-neutral-900/20">
                 Menyusun ulang data komando... (Silakan muat ulang halaman jika menu belum tampil)
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 🔥 PAPAN VISUAL: GRAFIK REKAM JEJAK SKD & SAMAPTA */}
        {/* ========================================================================= */}
        <DashboardCharts skdHistory={skdHistory} physicalHistory={physicalHistory} />

        {/* ========================================================================= */}
        {/* --- ANALYTICS GRID (RADAR & SHORTCUTS) --- */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 mt-10">
          
          <div className="lg:col-span-1 h-full">
            <div className="bg-black border border-neutral-800 p-1 rounded-sm relative group hover:border-red-900/50 transition-colors h-full flex flex-col">
                <div className="p-3 border-b border-neutral-900 flex justify-between items-center bg-neutral-950">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Target size={14} className="text-red-500" /> PETA KEKUATAN KESELURUHAN
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

          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/dashboard/speed-drill">
                <div className="bg-gradient-to-r from-orange-950/30 to-black border border-orange-500/30 p-5 rounded-sm flex flex-col md:flex-row items-center justify-between hover:border-orange-500 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={80} className="text-orange-500" /></div>
                    <div className="flex gap-4 items-center relative z-10 w-full">
                        <div className="p-3 bg-neutral-950 rounded-sm border border-orange-900/50 text-orange-500 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">SPEED DRILL <span className="text-orange-500">(REFLEKS TAKTIS)</span></h4>
                            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">LAT: PENINGKATAN KECEPATAN JAWAB</p>
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-white leading-none">{completedDrillsCount}</span>
                                    <span className="text-[9px] text-neutral-500 font-mono uppercase leading-tight">UNIT<br/>SELESAI</span>
                                </div>
                                <div className="h-6 w-[1px] bg-neutral-800"></div>
                                <div className="flex-1 max-w-[200px]">
                                    <div className="flex justify-between text-[9px] text-orange-500 font-bold uppercase mb-1">
                                        <span>PROGRESS</span><span>{drillProgress}%</span>
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

        {/* --- SHORTCUTS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link href="/dashboard/tryout" className="group bg-red-950/40 hover:bg-red-900/60 text-white p-6 rounded-xl flex flex-col items-center gap-3 transition-all border border-red-900/50 shadow-lg relative overflow-hidden backdrop-blur-sm">
                <Laptop2 size={24} className="group-hover:scale-110 transition-transform relative z-10 text-red-400" /> 
                <span className="text-[10px] font-black uppercase tracking-widest text-center relative z-10 text-red-100">SIMULASI CAT</span>
            </Link>
            <Link href="/dashboard/speed-drill" className="group bg-orange-950/40 hover:bg-orange-900/60 text-white p-6 rounded-xl flex flex-col items-center gap-3 transition-all border border-orange-900/50 shadow-lg relative overflow-hidden backdrop-blur-sm">
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