'use client'

import { useState } from "react";
import { 
  Activity, 
  Brain, 
  ChevronRight, 
  Dumbbell, 
  Target, 
  Cpu, 
  Radar,
  Save,
  Timer, // Icon untuk Shuttle Run
  AlertTriangle
} from "lucide-react";
import { submitAssessment } from "@/app/actions/assessment"; 

export default function AssessmentPage() {
  
  // --- STATE ---
  const [step, setStep] = useState(1); // 1: Intro, 2: Fisik, 3: Akademik, 4: Processing
  const [loading, setLoading] = useState(false);

  // DATA FISIK (UPDATED: Added Shuttle Run)
  const [physique, setPhysique] = useState({
    lari: 0,    // meter (Target: 3444m)
    pushup: 0,  // reps (Target: 43)
    situp: 0,   // reps (Target: 40)
    pullup: 0,  // reps (Target: 17)
    shuttle: 0.0 // detik (Target: 16.2s)
  });

  // DATA AKADEMIK (Simulasi Mini Quiz)
  const [quizAnswers, setQuizAnswers] = useState<{[key:number]: number}>({});
  
  // SOAL SCREENING (UPGRADED: HOTS STANDARD IPDN/SKD)
  const questions = [
    {
      id: 1, type: "TWK", 
      label: "INTEGRITAS & NASIONALISME",
      q: "Anda menemukan indikasi mark-up anggaran yang melibatkan atasan langsung Anda demi 'menyelamatkan' penyerapan anggaran dinas. Atasan meminta Anda diam demi nama baik instansi. Tindakan Anda sesuai UU ASN No. 5 Tahun 2014 adalah...",
      options: [
        "Menuruti perintah atasan karena loyalitas adalah harga mati bagi ASN.",
        "Menolak secara halus dan pura-pura tidak tahu agar aman.",
        "Menolak tegas dan melaporkan indikasi tersebut melalui Whistleblowing System.",
        "Mendiskusikan dengan rekan kerja lain untuk mencari perlindungan."
      ],
      key: 2 // Opsi ke-3 (Index 2) adalah jawaban paling berintegritas
    },
    {
      id: 2, type: "TIU", 
      label: "LOGIKA SILOGISME",
      q: "Semua Praja IPDN memiliki disiplin tinggi. Sebagian orang yang memiliki disiplin tinggi sukses menjadi pemimpin daerah. Simpulan yang paling tepat adalah...",
      options: [
        "Semua Praja IPDN sukses menjadi pemimpin daerah.",
        "Sebagian Praja IPDN sukses menjadi pemimpin daerah.",
        "Semua pemimpin daerah adalah Praja IPDN.",
        "Tidak dapat ditarik kesimpulan."
      ],
      key: 1 // Opsi ke-2 (Index 1) - Sebagian A adalah B, Sebagian B adalah C -> Sebagian A adalah C (Probabilitas)
    },
    {
      id: 3, type: "TKP", 
      label: "PELAYANAN PUBLIK",
      q: "Sistem antrean digital di kantor Anda mendadak error sehingga warga menumpuk dan mulai marah-marah. Sebagai petugas garda depan, respon taktis Anda?",
      options: [
        "Meminta warga tenang dan menunggu teknisi IT datang.",
        "Segera beralih ke sistem antrean manual (kertas) dan melayani dengan senyum.",
        "Menutup loket sementara sampai sistem perbaikan selesai.",
        "Melapor ke atasan bahwa situasi tidak kondusif."
      ],
      scores: [3, 5, 1, 2] // Poin TKP (Skala 1-5). Manual + Solutif = 5 Poin.
    }
  ];

  // --- LOGIC ---
  const handlePhysiqueChange = (field: string, val: string) => {
    // Handle float untuk Shuttle Run, Integer untuk lainnya
    const numVal = field === 'shuttle' ? parseFloat(val) : parseInt(val);
    setPhysique(prev => ({...prev, [field]: numVal || 0}));
  };

  const finishAssessment = async () => {
    setStep(4); // Animasi Processing
    setLoading(true);

    // Hitung Skor Akademik (Simulasi Cepat)
    const academic = {
        twk: quizAnswers[1] === 2 ? 100 : 40, // TWK benar 100, salah 40 (biar ga 0 banget)
        tiu: quizAnswers[2] === 1 ? 100 : 0, 
        tkp: questions[2].scores ? questions[2].scores[quizAnswers[3]] * 20 : 0 // Konversi 1-5 ke skala 100
    };

    // Delay buatan biar terlihat "Mikir" (Tactical Effect)
    setTimeout(async () => {
        await submitAssessment({ physique, academic });
    }, 3000); 
  };

  // =========================================================================
  // VIEW: PROCESSING AI (STEP 4)
  // =========================================================================
  if (step === 4) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-mono">
         {/* Grid Background */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px]"></div>
         
         <div className="relative z-10">
             <Cpu size={100} className="text-red-600 animate-pulse mx-auto mb-8 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]"/>
             <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">CPA-OS MENGANALISA</h2>
             
             {/* Progress Bar Loading */}
             <div className="w-64 h-2 bg-gray-900 rounded-full mx-auto overflow-hidden border border-gray-800">
                 <div className="h-full bg-red-600 animate-[width_3s_ease-in-out_forwards]" style={{width: '0%'}}></div>
             </div>
             
             <div className="mt-8 text-left max-w-xs mx-auto text-xs text-red-500 space-y-1 opacity-80 font-bold">
                {/* Ganti '>' menjadi '&gt;' */}
                <p className="animate-pulse">&gt; MENGKALKULASI VO2 MAX & AGILITY...</p>
                <p className="animate-pulse delay-75">&gt; MENILAI KEMATANGAN LOGIKA...</p>
                <p className="animate-pulse delay-150">&gt; MENDETEKSI POTENSI KEPEMIMPINAN...</p>
                <p className="animate-pulse delay-300">&gt; GENERATING BLUEPRINT LATIHAN...</p>
              </div>
         </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: FORM INPUT
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-900 pb-20">
      
      {/* Progress Bar Atas */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-900 z-50">
          <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
      </div>

      <div className="max-w-3xl mx-auto p-6 md:p-12 pt-20">
        
        {/* --- STEP 1: INTRO --- */}
        {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
                <div className="border-l-4 border-red-600 pl-6">
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">
                        SCREENING <span className="text-red-600">AWAL</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">
                        Identifikasi Kekuatan Tempur & Kelemahan Taktis.
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl space-y-6 backdrop-blur-sm">
                    <div className="flex gap-4">
                        <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-500 h-fit"><Dumbbell /></div>
                        <div>
                            <h3 className="font-bold text-white uppercase tracking-wider">1. Parameter Fisik (Samapta A & B)</h3>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                Input data Lari 12 menit, Push-up, Sit-up, Pull-up, dan <strong>Shuttle Run</strong>. Pastikan data akurat untuk kalkulasi VO2 Max.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg text-blue-500 h-fit"><Brain /></div>
                        <div>
                            <h3 className="font-bold text-white uppercase tracking-wider">2. Diagnosa Logika (HOTS)</h3>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                Tes cepat 3 soal High Order Thinking Skill (TWK Integritas, TIU Analitis, TKP Pelayanan) untuk mengukur refleks otak.
                            </p>
                        </div>
                    </div>
                </div>

                <button onClick={() => setStep(2)} className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-[0.2em] rounded-lg transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    MULAI DIAGNOSA <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                </button>
            </div>
        )}

        {/* --- STEP 2: INPUT FISIK --- */}
        {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-10 fade-in duration-500">
                <div className="flex items-center gap-3 text-red-600 mb-6 border-b border-zinc-800 pb-4">
                    <Activity size={24} className="animate-pulse"/>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-white">DATA SAMAPTA</h2>
                </div>

                <div className="bg-red-900/10 border border-red-900/20 p-4 rounded-lg flex gap-3 items-start mb-6">
                    <AlertTriangle className="text-red-500 shrink-0" size={18} />
                    <p className="text-xs text-red-300 leading-relaxed">
                        <strong>PERHATIAN KOMANDAN:</strong> Input data sesuai hasil tes mandiri terakhir. Sistem akan menggunakan data ini untuk menentukan program latihan (LAT).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Samapta A */}
                    <div className="bg-zinc-900/80 p-5 rounded-xl border border-zinc-800 focus-within:border-red-600 transition-colors group md:col-span-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 tracking-wider group-focus-within:text-red-500 transition-colors">
                            SAMAPTA A: LARI 12 MENIT (METER)
                        </label>
                        <input 
                            type="number" 
                            placeholder="Target: 3444m (100 Poin)"
                            className="w-full bg-transparent border-none outline-none text-4xl font-black text-white placeholder-zinc-800"
                            onChange={(e) => handlePhysiqueChange("lari", e.target.value)}
                        />
                    </div>

                    {/* Samapta B Items */}
                    {[
                        { label: "Push Up (1 Menit)", id: "pushup", ph: "Max: 43" },
                        { label: "Sit Up (1 Menit)", id: "situp", ph: "Max: 40" },
                        { label: "Pull Up (1 Menit)", id: "pullup", ph: "Max: 17" },
                    ].map((item) => (
                        <div key={item.id} className="bg-zinc-900/80 p-5 rounded-xl border border-zinc-800 focus-within:border-red-600 transition-colors group">
                            <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 tracking-wider group-focus-within:text-red-500 transition-colors">{item.label}</label>
                            <input 
                                type="number" 
                                placeholder={item.ph}
                                className="w-full bg-transparent border-none outline-none text-3xl font-black text-white placeholder-zinc-800"
                                onChange={(e) => handlePhysiqueChange(item.id, e.target.value)}
                            />
                        </div>
                    ))}

                    {/* Shuttle Run (New Item) */}
                    <div className="bg-zinc-900/80 p-5 rounded-xl border border-zinc-800 focus-within:border-yellow-500 transition-colors group">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider group-focus-within:text-yellow-500 transition-colors">SHUTTLE RUN (DETIK)</label>
                            <Timer size={14} className="text-zinc-600 group-focus-within:text-yellow-500"/>
                        </div>
                        <input 
                            type="number" 
                            step="0.1"
                            placeholder="Target: 16.2s"
                            className="w-full bg-transparent border-none outline-none text-3xl font-black text-white placeholder-zinc-800"
                            onChange={(e) => handlePhysiqueChange("shuttle", e.target.value)}
                        />
                        <p className="text-[9px] text-zinc-600 mt-1">*Makin kecil waktu, makin baik.</p>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button onClick={() => setStep(1)} className="px-8 py-4 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 font-bold rounded-lg uppercase text-xs tracking-widest transition-all">Kembali</button>
                    <button 
                        onClick={() => setStep(3)} 
                        disabled={!physique.lari}
                        className="flex-1 py-4 bg-red-700 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black uppercase tracking-widest rounded-lg transition-all shadow-lg flex justify-center gap-2"
                    >
                        LANJUT KE AKADEMIK <ChevronRight size={16}/>
                    </button>
                </div>
            </div>
        )}

        {/* --- STEP 3: MINI QUIZ --- */}
        {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-10 fade-in duration-500">
                <div className="flex items-center gap-3 text-blue-500 mb-6 border-b border-zinc-800 pb-4">
                    <Radar size={24} className="animate-spin-slow"/>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-white">DIAGNOSA SKD (HOTS)</h2>
                </div>

                <div className="space-y-8">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-8xl text-zinc-700">{idx + 1}</div>
                            
                            <div className="flex flex-col gap-2 mb-4 relative z-10">
                                <span className={`w-fit text-[10px] font-black px-3 py-1 rounded text-white tracking-widest ${q.type === 'TWK' ? 'bg-red-600' : q.type === 'TIU' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                                    {q.type} • {q.label}
                                </span>
                                <p className="text-white font-medium leading-relaxed text-lg">{q.q}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 relative z-10">
                                {q.options.map((opt, optIdx) => (
                                    <button 
                                        key={optIdx}
                                        onClick={() => setQuizAnswers(prev => ({...prev, [q.id]: optIdx}))}
                                        className={`p-4 text-left text-sm border rounded-lg transition-all flex items-start gap-3 group ${quizAnswers[q.id] === optIdx ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "bg-black/50 border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"}`}
                                    >
                                        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${quizAnswers[q.id] === optIdx ? "border-black bg-black" : "border-zinc-600 group-hover:border-zinc-400"}`}>
                                            {quizAnswers[q.id] === optIdx && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="leading-snug">{opt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-zinc-900">
                    <button 
                        onClick={finishAssessment} 
                        className="w-full py-5 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.01] transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                        disabled={Object.keys(quizAnswers).length < 3}
                    >
                        <Save size={20} /> {loading ? "MENGIRIM KE MARKAS..." : "SIMPAN & ANALISA PERFORMA"}
                    </button>
                    <p className="text-center text-[10px] text-zinc-600 mt-4 font-mono">
                        *AI akan menentukan Peta Kekuatan (JAR-LAT-SUH) berdasarkan data ini.
                    </p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}