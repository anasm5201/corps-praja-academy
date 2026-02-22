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
    // Coba cari di database dulu agar tidak terus-menerus memanggil AI
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

 // =========================================================================
  // 🚨 SISTEM ANTI-BLANK MUTLAK (THE ELITE FALLBACK PROTOCOL)
  // Dirancang khusus oleh Elite Coach dengan standar Periodisasi Militer.
  // =========================================================================
  if (!blueprint) {
    blueprint = {
      id: "fallback-ops",
      focusAreas: "PENYELARASAN TRITUNGGAL (STANDAR OPERASI ELIT)",
      evaluationText: "Kadet! Koneksi AI ke Markas Besar terganggu, namun di medan tempur sejati tidak ada alasan untuk berhenti. Saya mengambil alih komando manual. Ini adalah siklus periodisasi yang dirancang untuk menghancurkan kelemahanmu secara sistematis. Laksanakan tanpa ragu!",
      dailyDrills: JSON.stringify([
        { 
          title: "HARI 1: SENIN (INISIASI & DAYA TAHAN)", 
          tahap1: "[LAT - PAGI] Aerobic Base Building: Lari Zone 2 (Jogging konstan) selama 35-40 menit. Fokus pada ritme napas, bukan kecepatan. Bangun kapasitas paru-parumu (VO2 Max).", 
          tahap2: "[JAR - SIANG] Deep Work 90 Menit (TIU): Otakmu paling segar di awal minggu. Gempur materi Analitis dan Silogisme. Pecahkan logika, jangan pakai asumsi.", 
          tahap3: "[SUH - MALAM] Goal Setting & Visualisasi: Tulis 3 target absolut minggu ini. Visualisasikan dirimu memakai seragam abdi negara. Kunci mentalmu sebelum tidur." 
        },
        { 
          title: "HARI 2: SELASA (KEKUATAN OTOT & RETENSI MEMORI)", 
          tahap1: "[LAT - PAGI] Strength Conditioning: Istirahatkan kaki. Eksekusi Push-up, Sit-up, dan Pull-up (3 Set x Repetisi Maksimal). Akhiri dengan Plank 2 menit untuk kekuatan otot inti.", 
          tahap2: "[JAR - SIANG] Deep Work 90 Menit (TWK): Retensi memorimu sedang kuat. Hafalkan sejarah konstitusi, pasal UUD 1945, dan pengamalan butir Pancasila.", 
          tahap3: "[SUH - MALAM] Time Audit: Evaluasi 24 jam terakhirmu. Cari tahu di jam berapa kamu membuang waktu secara sia-sia. Perketat disiplin!" 
        },
        { 
          title: "HARI 3: RABU (KETANGKASAN & RESPON TEKANAN)", 
          tahap1: "[LAT - PAGI] Anaerobic Interval: Lari Sprint 400m x 5 Set. Jeda jalan kaki 1 menit tiap set. Latih daya ledak jantungmu untuk mengejar waktu Samapta.", 
          tahap2: "[JAR - SIANG] Speed Drill Terpadu: Hajar 50 soal TIU Numerik & Deret dalam 30 menit. Latih otakmu berpikir jernih di bawah tekanan waktu yang mencekik.", 
          tahap3: "[SUH - MALAM] Stress Inoculation (Box Breathing): Lakukan teknik napas taktis militer (Tarik 4s, Tahan 4s, Hembus 4s, Tahan 4s). Turunkan hormon kortisolmu." 
        },
        { 
          title: "HARI 4: KAMIS (PEMULIHAN AKTIF & KARAKTER)", 
          tahap1: "[LAT - PAGI] Active Recovery: Jangan diam. Lakukan jalan cepat 20 menit dilanjutkan peregangan dinamis (Dynamic Stretching) total. Lancarkan peredaran darah ke otot yang robek.", 
          tahap2: "[JAR - SIANG] Deep Work 90 Menit (TKP): Tubuh yang rileks sangat cocok untuk materi empati. Pelajari studi kasus Pelayanan Publik dan Sosial Budaya.", 
          tahap3: "[SUH - MALAM] Bedah Integritas: Pelajari studi kasus radikalisme dan korupsi. Selaraskan pola pikirmu dengan nilai mutlak integritas aparatur negara." 
        },
        { 
          title: "HARI 5: JUMAT (INTEGRASI TAKTIS & ADAPTASI)", 
          tahap1: "[LAT - PAGI] Fartlek Training 30 Menit: Lari dengan ritme acak (lambat, sedang, sprint) tanpa aturan baku. Biasakan tubuhmu merespons perubahan situasi mendadak.", 
          tahap2: "[JAR - SIANG] Weakness Targeted Review: Buka rapot Tryout terakhir. Hajar secara brutal materi yang nilainya paling merah. Jangan lari dari kelemahanmu.", 
          tahap3: "[SUH - MALAM] Resiliensi Mental: Evaluasi alasan kegagalanmu di masa lalu. Ubah rasa takut gagal menjadi bahan bakar agresi belajar untuk esok hari." 
        },
        { 
          title: "HARI 6: SABTU (SIMULASI MEDAN TEMPUR)", 
          tahap1: "[LAT - PAGI] Tryout Samapta Total: Lakukan simulasi lari 12 menit murni, disusul seluruh rangkaian kekuatan fisik. Catat skormu dengan jujur di sistem!", 
          tahap2: "[JAR - SIANG] Full CAT SKD (110 Soal): Duduk tenang, matikan gangguan. Latih stamina duduk dan fokus matamu untuk simulasi ujian sesungguhnya.", 
          tahap3: "[SUH - MALAM] After Action Review (AAR): Bedah hasil simulasi hari ini secara dingin dan objektif. Apa yang salah? Apa yang lambat? Catat untuk diperbaiki Senin depan." 
        },
        { 
          title: "HARI 7: MINGGU (RESTORASI TOTAL & SPIRITUAL)", 
          tahap1: "[LAT - PAGI] Total Rest & Mobility: Tidak ada beban fisik berat. Lakukan peregangan statis ringan. Biarkan ototmu pulih dan tumbuh hari ini.", 
          tahap2: "[JAR - SIANG] Off-Grid: Jauhkan modul berat. Baca literatur ringan, pantau berita nasional atau isu kebijakan publik terkini tanpa tekanan menghafal.", 
          tahap3: "[SUH - MALAM] Pengisian Tangki Spiritual: Ibadah, meditasi, dan habiskan waktu bersama keluarga. Kosongkan pikiran agar kamu kembali buas di hari Senin." 
        }
      ])
    } as any;
  }

  // 2. PARSING DATA
  let parsedDrills = [];
  try {
    parsedDrills = JSON.parse(blueprint.dailyDrills || "[]");
  } catch (e) {
    console.error("Gagal parsing dailyDrills:", e);
  }

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

        {/* GRID KARTU MISI */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4 border-t border-neutral-800/50">
          {parsedDrills.map((drill: any, idx: number) => (
            <DrillCard key={idx} blueprintId={blueprint.id} drill={drill} index={idx} />
          ))}
        </div>

      </div>
    </div>
  );
}