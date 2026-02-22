import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Calendar, ShieldCheck, MessageSquare } from "lucide-react";
import DrillCard from "@/components/dashboard/DrillCard";
import { ensureWeeklyPlan } from "@/lib/weekly-engine";

export const dynamic = 'force-dynamic';

export default async function BlueprintPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/api/auth/signin");

  // 1. TARIK DATA DARI DATABASE / AI
  let blueprint = null;
  try {
    blueprint = await prisma.weeklyBlueprint.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });

    if (!blueprint) {
        blueprint = await ensureWeeklyPlan(userId); 
    }
  } catch (error) {
     console.error("Gagal load program 7 hari:", error);
  }

  // Jaring Pengaman Lapis 1 (Jika Data Kosong Total)
  if (!blueprint) {
    blueprint = {
      id: "fallback-ops",
      focusAreas: "PENYELARASAN TRITUNGGAL (OFFLINE MODE)",
      evaluationText: "Koneksi ke Markas Besar terganggu. Sistem AI mengaktifkan Protokol Jadwal Darurat. Laksanakan instruksi ini tanpa banyak alasan, Kadet!",
      dailyDrills: "[]"
    } as any;
  }

  // =========================================================================
  // 🚨 2. PARSING DATA & TACTICAL OVERRIDE (ANTI-KARTU KOSONG)
  // =========================================================================
  let parsedDrills: any[] = [];
  try {
    if (blueprint.dailyDrills) {
      // PEMBERSIHAN KOTORAN AI: Menghapus tag markdown ```json yang bikin error
      const cleanJson = blueprint.dailyDrills.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedDrills = JSON.parse(cleanJson);
    }
  } catch (e) {
    console.error("Gagal parsing JSON AI:", e);
  }

  // 🛡️ INJEKSI JADWAL ELIT (JIKA AI GAGAL MEMBERI JADWAL)
  if (!parsedDrills || parsedDrills.length === 0 || !Array.isArray(parsedDrills)) {
    parsedDrills = [
      { title: "HARI 1: SENIN (INISIASI & DAYA TAHAN)", tahap1: "[LAT - PAGI] Aerobic Base Building: Lari Zone 2 (Jogging konstan) selama 35-40 menit.", tahap2: "[JAR - SIANG] Deep Work 90 Menit (TIU): Gempur materi Analitis dan Silogisme.", tahap3: "[SUH - MALAM] Goal Setting & Visualisasi: Tulis 3 target absolut minggu ini." },
      { title: "HARI 2: SELASA (KEKUATAN OTOT & RETENSI)", tahap1: "[LAT - PAGI] Strength Conditioning: Push-up, Sit-up, dan Pull-up (3 Set x Repetisi Maks).", tahap2: "[JAR - SIANG] Deep Work 90 Menit (TWK): Hafalkan sejarah konstitusi dan butir Pancasila.", tahap3: "[SUH - MALAM] Time Audit: Evaluasi 24 jam terakhirmu." },
      { title: "HARI 3: RABU (KETANGKASAN & TEKANAN)", tahap1: "[LAT - PAGI] Anaerobic Interval: Lari Sprint 400m x 5 Set.", tahap2: "[JAR - SIANG] Speed Drill Terpadu: Hajar 50 soal TIU Numerik dalam 30 menit.", tahap3: "[SUH - MALAM] Stress Inoculation (Box Breathing): Lakukan teknik napas taktis militer." },
      { title: "HARI 4: KAMIS (PEMULIHAN AKTIF)", tahap1: "[LAT - PAGI] Active Recovery: Jalan cepat 20 menit dilanjutkan peregangan statis.", tahap2: "[JAR - SIANG] Deep Work 90 Menit (TKP): Pelajari studi kasus Pelayanan Publik.", tahap3: "[SUH - MALAM] Bedah Integritas: Pelajari studi kasus anti-korupsi." },
      { title: "HARI 5: JUMAT (INTEGRASI TAKTIS)", tahap1: "[LAT - PAGI] Fartlek Training 30 Menit: Lari dengan ritme acak (lambat, sedang, sprint).", tahap2: "[JAR - SIANG] Weakness Targeted Review: Hajar materi yang nilainya paling merah.", tahap3: "[SUH - MALAM] Resiliensi Mental: Evaluasi alasan kegagalan di masa lalu." },
      { title: "HARI 6: SABTU (SIMULASI MEDAN TEMPUR)", tahap1: "[LAT - PAGI] Tryout Samapta Total: Simulasi lari 12 menit murni.", tahap2: "[JAR - SIANG] Full CAT SKD (110 Soal): Latih stamina duduk dan fokus mata.", tahap3: "[SUH - MALAM] After Action Review (AAR): Bedah hasil simulasi hari ini." },
      { title: "HARI 7: MINGGU (RESTORASI TOTAL)", tahap1: "[LAT - PAGI] Total Rest & Mobility: Peregangan ringan, biarkan otot pulih.", tahap2: "[JAR - SIANG] Off-Grid: Baca literatur ringan, tanpa tekanan menghafal.", tahap3: "[SUH - MALAM] Pengisian Tangki Spiritual: Ibadah, meditasi, dan kumpul keluarga." }
    ];
  }

  // 3. RENDER WAR ROOM
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans pb-20 selection:bg-blue-900">
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER NAVIGASI */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="h-12 w-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-500 transition-all group shadow-lg">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <Calendar className="text-blue-500" /> PROGRAM 7 HARI
              </h1>
              <p className="text-[10px] text-neutral-500 font-mono mt-1 uppercase tracking-widest">
                SIKLUS AKTIF • TARGET OPS: <span className="text-blue-400 font-bold">{blueprint.focusAreas}</span>
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-900/80 border border-neutral-800 px-6 py-3 rounded-lg flex items-center gap-4 shadow-xl backdrop-blur-md">
            <ShieldCheck className={blueprint.id === "fallback-ops" ? "text-amber-500" : "text-emerald-500"} size={24} />
            <div className="text-[10px] font-black uppercase tracking-widest leading-none">
              <span className="text-neutral-500 block mb-1">STATUS SISTEM</span>
              <span className={blueprint.id === "fallback-ops" ? "text-amber-400 animate-pulse" : "text-emerald-400"}>
                 {blueprint.id === "fallback-ops" ? "OFFLINE PROTOCOL" : "AKTIF TERKENDALI"}
              </span>
            </div>
          </div>
        </div>

        {/* EVALUASI MENTOR */}
        <div className={`bg-neutral-900/50 border-l-4 ${blueprint.id === "fallback-ops" ? 'border-amber-500' : 'border-blue-600'} p-6 rounded-r-xl shadow-lg relative overflow-hidden group mb-4`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare size={100} /></div>
          <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2 ${blueprint.id === "fallback-ops" ? 'text-amber-500' : 'text-blue-500'}`}>
             [DIRECTIVE] ARAHAN MENTOR MINGGU INI
          </h4>
          <p className="text-lg md:text-xl font-medium text-neutral-200 leading-relaxed italic font-serif">
            "{blueprint.evaluationText}"
          </p>
        </div>

        {/* GRID KARTU MISI (ANTI KOSONG) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4 border-t border-neutral-800/50">
          {parsedDrills.map((drill: any, idx: number) => (
            <DrillCard key={idx} blueprintId={blueprint.id} drill={drill} index={idx} />
          ))}
        </div>

      </div>
    </div>
  );
}