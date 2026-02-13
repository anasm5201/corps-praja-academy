"use client";

import Link from "next/link";
import { toast } from "sonner"; // [UPDATE] Integrasi Notifikasi
import { 
  ArrowLeft, Play, FileText, CheckCircle, 
  Clock, Shield, Download, Brain, AlertTriangle
} from "lucide-react";

// --- SIMULASI DATABASE ---
const MOCK_DB: Record<string, any> = {
  "materi-001": {
    title: "Bedah UUD 1945 & Amandemen",
    category: "TWK",
    type: "VIDEO",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "45 Min",
    description: "Analisis mendalam pasal-pasal vital yang sering keluar di SKD. Materi ini mencakup sejarah amandemen 1-4 dan implikasinya terhadap sistem ketatanegaraan saat ini.",
    points: ["Sejarah Pembentukan BPUPKI", "Batang Tubuh UUD 1945", "Pasal-pasal Hak Asasi Manusia"],
    xp: 500
  },
  "materi-002": {
    title: "Logika Silogisme & Analitik",
    category: "TIU",
    type: "PDF",
    url: "/docs/silogisme.pdf",
    duration: "12 Halaman",
    description: "Rumus cepat menaklukkan soal logika tanpa pusing. Pelajari teknik penarikan kesimpulan modus ponens, tollens, dan silogisme kategorik.",
    points: ["Modus Ponens & Tollens", "Penarikan Kesimpulan", "Jebakan Logika 'Semua' vs 'Sebagian'"],
    xp: 350
  },
  "materi-003": {
    title: "[RAHASIA] Pola Pikir Jejaring Kerja",
    category: "TKP",
    type: "VIDEO",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "60 Min",
    description: "Teknik menjawab TKP level HOTS dengan poin maksimal 5.",
    points: ["Indikator Jejaring Kerja", "Komunikasi Efektif", "Studi Kasus Kantor"],
    xp: 1000
  },
  "materi-004": {
    title: "Mastering Deret Angka",
    category: "TIU",
    type: "VIDEO",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "30 Min",
    description: "Pola-pola deret angka yang wajib dikuasai kadet.",
    points: ["Fibonacci", "Deret Tingkat Dua", "Pola Larik"],
    xp: 400
  }
};

export default function IntelDetailPage({ params }: { params: { id: string } }) {
  // 1. Cari data berdasarkan ID dari URL
  const data = MOCK_DB[params.id];

  // 2. Jika data tidak ditemukan (Handling 404 Manual)
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-black text-white uppercase mb-2">Akses Ditolak</h1>
        <p className="text-gray-500 mb-6">Dokumen intelijen dengan ID <span className="text-red-500 font-mono">{params.id}</span> tidak ditemukan atau telah dimusnahkan.</p>
        <Link href="/dashboard/intel" className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest rounded hover:bg-gray-200 transition-colors">
          Kembali ke Markas
        </Link>
      </div>
    );
  }

  // [UPDATE] Handler untuk Interaksi Tombol
  const handleAction = (action: string) => {
      if(action === 'download') {
          toast.info("Mengunduh Dokumen Terenkripsi...", { description: "Harap tunggu verifikasi server." });
      } else {
          toast.success("Progres Disimpan", { description: "XP akan ditambahkan setelah misi selesai." });
      }
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 relative px-4 sm:px-6">
       {/* Background Grid */}
       <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] -z-10"></div>

      {/* HEADER NAVIGASI */}
      <div className="mb-8 mt-4">
        <Link href="/dashboard/intel" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest mb-4">
          <ArrowLeft size={14} /> Kembali ke Pusat Intel
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border
                         ${data.category === 'TWK' ? 'bg-red-900/20 text-red-500 border-red-500/30' : 
                           data.category === 'TIU' ? 'bg-blue-900/20 text-blue-500 border-blue-500/30' : 
                           'bg-green-900/20 text-green-500 border-green-500/30'}
                    `}>
                        {data.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-zinc-900 px-2 py-1 rounded border border-white/5">
                        <Clock size={12} /> {data.duration}
                    </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none">
                    {data.title}
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                    <p className="text-[10px] text-gray-500 font-mono uppercase">Potential Reward</p>
                    <p className="text-xl font-black text-yellow-500">+{data.xp} XP</p>
                </div>
            </div>
        </div>
      </div>

      {/* KONTEN UTAMA (PLAYER / VIEWER) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri: Player Area */}
          <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden relative group shadow-2xl shadow-blue-900/10">
                  {data.type === 'VIDEO' ? (
                      <iframe 
                        src={data.url} 
                        title="Video Player"
                        className="w-full h-full object-cover"
                        allowFullScreen
                      />
                  ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-gray-500 p-10 text-center">
                          <FileText size={64} className="mb-4 text-blue-500 opacity-50" />
                          <h3 className="text-white font-bold uppercase mb-2">Dokumen Terenkripsi</h3>
                          <p className="text-xs max-w-md">Dokumen PDF siap diakses. Silakan unduh atau baca melalui penampil dokumen aman di bawah ini.</p>
                          <button 
                            onClick={() => handleAction('download')}
                            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded flex items-center gap-2 transition-all"
                          >
                              <Download size={14} /> Unduh Dokumen
                          </button>
                      </div>
                  )}
              </div>

              {/* Deskripsi & Poin Kunci */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white uppercase mb-4 flex items-center gap-2">
                      <Brain className="text-blue-500" size={20}/> Briefing Intelijen
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {data.description}
                  </p>

                  <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Target Pembelajaran:</h4>
                      {data.points?.map((point: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-white/5">
                              <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-gray-300">{point}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Kolom Kanan: Sidebar Aksi */}
          <div className="space-y-6">
              {/* Status Progress */}
              <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Status Misi</h3>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                            In Progress
                        </span>
                        </div>
                        <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">
                            30%
                        </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200/20">
                        <div style={{ width: "30%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAction('continue')}
                    className="w-full py-3 bg-white text-black font-bold uppercase text-xs tracking-widest rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                      <Play size={14} className="fill-black" /> Lanjutkan Misi
                  </button>
              </div>

              {/* Materi Terkait */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Shield size={14} /> Dokumen Terkait
                  </h3>
                  <div className="space-y-4">
                      {/* Dummy Cross Selling */}
                      <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                            <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center shrink-0">
                                <FileText size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">Bedah Soal TWK Hots 2024</h4>
                                <p className="text-[10px] text-gray-600">PDF • 15 Min</p>
                            </div>
                      </div>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
}