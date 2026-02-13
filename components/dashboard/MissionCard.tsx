"use client";

import { useState, useEffect, useRef } from "react";
import { claimMissionReward } from "@/app/actions/missionActions";
import { useReward } from "@/context/RewardContext"; 
import { 
  ChevronRight, 
  Loader2, 
  Star, 
  CheckCircle, 
  Lock,
  FileText,
  ShieldCheck,
  Timer,
  Info,
  AlertTriangle,
  Play,
  Zap,
  Coffee,
  Headphones,
  StopCircle,
  Dumbbell,    // Icon LAT
  BookOpen,    // Icon JAR
  BrainCircuit, // Icon SUH
  ShieldAlert   // Icon Priority
} from "lucide-react";

interface MissionProps {
  mission: {
    id: string;
    userId: string;
    title: string;
    category: string;
    description: string;
    xpReward: number;
    isCompleted: boolean;
    difficulty: string;
  };
}

type MissionStatus = 'IDLE' | 'BRIEFING' | 'IN_PROGRESS' | 'REPORTING' | 'COMPLETED';

export default function MissionCard({ mission }: MissionProps) {
  const [status, setStatus] = useState<MissionStatus>(
    mission.isCompleted ? 'COMPLETED' : 'IDLE'
  );
  
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [reportText, setReportText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { triggerReward } = useReward(); 

  // --- 🔥 LOGIKA "BLACK BOX" (PERSISTENCE) TETAP DIPERTAHANKAN 🔥 ---
  useEffect(() => {
    if (mission.isCompleted) return;

    // Cek apakah ada misi gantung di LocalStorage
    const savedStartTime = localStorage.getItem(`mission_start_${mission.id}`);
    
    if (savedStartTime) {
        const startTime = parseInt(savedStartTime);
        const now = Date.now();
        const diffInSeconds = Math.floor((now - startTime) / 1000);

        // Pulihkan status
        setElapsedTime(diffInSeconds);
        setStatus('IN_PROGRESS');
    }
  }, [mission.id, mission.isCompleted]);
  // --------------------------------------------------

  // --- CONFIG: INTEGRASI WARNA JAR-LAT-SUH ---
  const getCategoryConfig = () => {
    switch(mission.category) {
        // LAT (FISIK) -> AMBER (Jingga/Api)
        case 'FISIK': 
        case 'JASMANI':
            return { 
                color: "text-amber-500", 
                bg: "bg-amber-500/10", 
                border: "border-amber-500/20",
                icon: <Dumbbell size={10} />
            };
        // JAR (AKADEMIK) -> BLUE (Biru/Teknologi)
        case 'AKADEMIK': 
        case 'JAR':
            return { 
                color: "text-blue-500", 
                bg: "bg-blue-500/10", 
                border: "border-blue-500/20",
                icon: <BookOpen size={10} />
            };
        // SUH (MENTAL) -> PURPLE (Ungu/Psikologi)
        case 'MENTAL': 
        case 'SUH':
            return { 
                color: "text-purple-500", 
                bg: "bg-purple-500/10", 
                border: "border-purple-500/20",
                icon: <BrainCircuit size={10} />
            };
        default: 
            return { 
                color: "text-neutral-500", 
                bg: "bg-neutral-500/10", 
                border: "border-neutral-500/20",
                icon: <Star size={10} />
            };
    }
  };
  const catConfig = getCategoryConfig();

  // --- CONFIG: REFLEKSI & BRIEFING ---
  const getReflectionConfig = () => {
    switch(mission.category) {
        case 'FISIK': return { label: "LAPORAN JASMANI", placeholder: "Izin lapor! Jarak tempuh: ... | Repetisi: ... | Kendala otot: ...", hint: "Sertakan statistik fisik detail." };
        case 'AKADEMIK': return { label: "INTISARI MATERI", placeholder: "Siap! Bab yang dipelajari: ... | Rumus/Konsep kunci: ... ", hint: "Jelaskan pemahaman materi." };
        case 'MENTAL': return { label: "KONDISI PSIKOLOGIS", placeholder: "Kondisi saat ini: (Tenang/Cemas) | Faktor pengganggu: ... ", hint: "Refleksikan mental anda." };
        default: return { label: "LAPORAN UMUM", placeholder: "Jelaskan hasil pelaksanaan...", hint: "Laporan detail dibutuhkan." };
    }
  };
  const reflection = getReflectionConfig();

  const getTacticalAdvice = () => {
    switch(mission.category) {
        case 'FISIK': return { prep: "Pemanasan Wajib", tool: "Stopwatch/GPS", toolIcon: <Zap size={16} className="text-amber-500"/>, warning: "Jangan memaksakan cedera." };
        case 'AKADEMIK': return { prep: "Mode Hening", tool: "Kertas Coretan", toolIcon: <FileText size={16} className="text-blue-500"/>, warning: "Dilarang membuka kunci jawaban." };
        case 'MENTAL': return { prep: "Ruang Sunyi", tool: "Earphone (Musik Fokus)", toolIcon: <Headphones size={16} className="text-purple-500"/>, warning: "Jujur pada diri sendiri." };
        default: return { prep: "Baca Instruksi", tool: "Fokus", toolIcon: <Coffee size={16} className="text-gray-500"/>, warning: "Integritas nomor satu." };
    }
  };
  const advice = getTacticalAdvice();

  // --- LOGIKA WARNA KESULITAN (BARU) ---
  const getDifficultyColor = (diff: string) => {
      switch(diff) {
          case 'HARD': return 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse';
          case 'NORMAL': return 'bg-blue-600 text-white';
          case 'EASY': return 'bg-emerald-600 text-white';
          default: return 'bg-neutral-600 text-white';
      }
  };

  // --- TIMER LOGIC (KEEP) ---
  useEffect(() => {
    if (status === 'IN_PROGRESS') {
      timerRef.current = setInterval(() => {
        const savedStartTime = localStorage.getItem(`mission_start_${mission.id}`);
        if (savedStartTime) {
            const now = Date.now();
            const diff = Math.floor((now - parseInt(savedStartTime)) / 1000);
            setElapsedTime(diff);
        } else {
            setElapsedTime((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if(timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if(timerRef.current) clearInterval(timerRef.current); };
  }, [status, mission.id]);

  // --- HANDLERS (KEEP) ---
  const handleOpenBriefing = () => { if (!mission.isCompleted) setStatus('BRIEFING'); };
  
  const handleStartMission = () => {
    localStorage.setItem(`mission_start_${mission.id}`, Date.now().toString());
    setElapsedTime(0);
    setStatus('IN_PROGRESS');
  };

  const handleFinishMission = () => { setStatus('REPORTING'); };

  const handleCancelMission = () => {
    if(window.confirm("Batalkan Misi? Progress akan dihapus.")) { 
        localStorage.removeItem(`mission_start_${mission.id}`);
        setStatus('IDLE'); 
        setElapsedTime(0); 
    }
  };

  const handleSubmitReport = async () => {
    if (reportText.length < 5) { alert("⚠️ Laporan terlalu singkat!"); return; }
    setIsLoading(true);
    try {
        const res = await claimMissionReward(mission.id);
        if (res.success) {
            localStorage.removeItem(`mission_start_${mission.id}`);
            setStatus('COMPLETED');
            triggerReward({ xp: mission.xpReward, title: mission.title });
        } else { alert(`❌ GAGAL: ${res.message}`); }
    } catch (error) { alert("❌ ERROR JARINGAN"); } finally { setIsLoading(false); }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
    {/* KARTU VISUAL */}
    <div className={`relative p-5 rounded-lg border transition-all duration-500 group overflow-hidden flex flex-col justify-between h-full
        ${status === 'COMPLETED'
            ? "bg-neutral-900/30 border-neutral-800 opacity-60 cursor-not-allowed" 
            : status === 'IN_PROGRESS'
            ? "bg-neutral-900 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] scale-[1.02]" 
            : `bg-neutral-900/50 border-neutral-800 hover:border-opacity-50 hover:shadow-lg ${catConfig.border.replace('border-', 'hover:border-')}`}
    `}>
        {status === 'IN_PROGRESS' && (
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
        )}

        <div>
            {/* HEADER BADGES */}
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider border flex items-center gap-1.5 ${catConfig.color} ${catConfig.bg} ${catConfig.border}`}>
                    {catConfig.icon} {mission.category}
                </span>
                
                {status === 'IN_PROGRESS' ? (
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-600 text-black animate-pulse flex items-center gap-1">
                        <Timer size={10} /> ON DUTY
                    </span>
                ) : (
                    <div className={`px-2 py-0.5 text-[9px] font-black uppercase rounded shadow-sm flex items-center gap-1 ${getDifficultyColor(mission.difficulty)}`}>
                        {mission.difficulty === 'HARD' && <ShieldAlert size={10} />}
                        {mission.difficulty}
                    </div>
                )}
            </div>
            
            <h4 className={`text-sm font-bold mb-2 uppercase transition-colors leading-tight
                ${status === 'COMPLETED' ? "text-neutral-500 line-through" : 
                  status === 'IN_PROGRESS' ? "text-amber-500" : "text-white group-hover:text-amber-400"}
            `}>
                {mission.title}
            </h4>
            <p className="text-xs text-zinc-500 font-mono mb-4 line-clamp-3 leading-relaxed">
                {mission.description}
            </p>
        </div>
        
        {/* FOOTER ACTION */}
        <div className="flex justify-between items-center border-t border-neutral-800 pt-3 mt-auto">
            {status !== 'IN_PROGRESS' && (
                 <span className={`text-xs font-black flex items-center gap-1 ${status === 'COMPLETED' ? "text-neutral-600" : "text-amber-500"}`}>
                    <Star size={12} fill="currentColor" /> {mission.xpReward} XP
                 </span>
            )}

            {status === 'IDLE' && (
                <button onClick={handleOpenBriefing} className="ml-auto text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-all hover:translate-x-1 group-hover:text-amber-400">
                    LAKSANAKAN <ChevronRight size={10} />
                </button>
            )}

            {status === 'IN_PROGRESS' && (
                <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-2 text-amber-500 font-mono font-bold text-sm">
                        <Timer size={14} className="animate-spin-slow"/> 
                        {formatTime(elapsedTime)}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleCancelMission} className="px-2 py-1 text-[9px] text-zinc-500 hover:text-red-500 font-bold uppercase border border-transparent hover:border-red-900 rounded">
                            BATAL
                        </button>
                        <button onClick={handleFinishMission} className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black text-[9px] font-black uppercase rounded shadow-[0_0_10px_rgba(245,158,11,0.4)] flex items-center gap-1 animate-pulse">
                            <StopCircle size={10} fill="currentColor"/> SELESAI
                        </button>
                    </div>
                </div>
            )}

            {status === 'REPORTING' && (
                 <button onClick={() => setStatus('REPORTING')} className="ml-auto text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 animate-bounce">
                    ISI LAPORAN <FileText size={10} />
                </button>
            )}

            {status === 'COMPLETED' && (
                <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-neutral-600 cursor-not-allowed">
                    TERKUNCI <Lock size={10} />
                </span>
            )}
        </div>
    </div>

    {/* MODAL 1: BRIEFING */}
    {status === 'BRIEFING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-neutral-900 border border-neutral-700 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex items-center gap-3">
                    <Info className={catConfig.color.replace('text-', 'text-')} size={20} />
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">BRIEFING MISI</h3>
                </div>
                <div className="p-5 space-y-4">
                    <div className="bg-neutral-800/50 p-3 rounded border border-neutral-700">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">TARGET UTAMA:</p>
                        <p className="text-sm font-bold text-white leading-relaxed">{mission.description}</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5"><Zap size={16} className="text-amber-500"/></div>
                            <div><p className="text-xs font-bold text-zinc-300">Persiapan</p><p className="text-[10px] text-zinc-500">{advice.prep}</p></div>
                        </div>
                        <div className="flex items-start gap-3">
                             <div className="mt-0.5">{advice.toolIcon}</div>
                             <div><p className="text-xs font-bold text-zinc-300">Alat</p><p className="text-[10px] text-zinc-500">{advice.tool}</p></div>
                        </div>
                    </div>
                    <div className="bg-red-900/10 border border-red-900/30 p-2 rounded flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-500" />
                        <p className="text-[10px] text-red-400 font-mono">{advice.warning}</p>
                    </div>
                </div>
                <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end gap-3">
                    <button onClick={() => setStatus('IDLE')} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-white uppercase">BATAL</button>
                    <button onClick={handleStartMission} className="bg-white hover:bg-zinc-200 text-black px-5 py-2 rounded text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all">
                        MULAI MISI <Play size={10} fill="currentColor"/>
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* MODAL 2: LAPORAN */}
    {status === 'REPORTING' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md rounded-xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4 text-white border-b border-neutral-800 pb-3">
                    <ShieldCheck size={20} className="text-emerald-500"/>
                    <h3 className="text-lg font-black uppercase tracking-wider">{reflection.label}</h3>
                </div>
                <div className="flex justify-between items-center mb-4 text-xs font-mono text-zinc-500">
                    <span>Durasi: <span className="text-white font-bold">{formatTime(elapsedTime)}</span></span>
                    <span>Status: <span className="text-emerald-500 font-bold">SELESAI</span></span>
                </div>
                <p className="text-xs text-zinc-400 mb-2 font-mono">{reflection.hint}</p>
                <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder={reflection.placeholder} className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none h-32 mb-4 font-mono transition-all placeholder:text-neutral-700" autoFocus />
                <div className="flex justify-end gap-3">
                    <button onClick={handleSubmitReport} disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        {isLoading ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14}/>}
                        KIRIM LAPORAN & KLAIM {mission.xpReward} XP
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
}