'use client';

import { useState } from "react";
import Link from "next/link";
import { 
  Trophy, Home, ShieldAlert, CheckCircle2, XCircle, 
  BarChart3, FileText, ChevronLeft, ChevronRight, Target, Clock, AlertTriangle, RotateCcw 
} from 'lucide-react';

// PASSING GRADE CONFIG
const PG = { TWK: 65, TIU: 80, TKP: 166 };

export default function ResultClient({ attempt }: { attempt: any }) {
  const [activeTab, setActiveTab] = useState<'stats' | 'review'>('stats');
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);

  // Status Kelulusan per Mapel
  const statusTWK = attempt.scoreTwk >= PG.TWK;
  const statusTIU = attempt.scoreTiu >= PG.TIU;
  const statusTKP = attempt.scoreTkp >= PG.TKP;

  // --- SUB-VIEW: STATISTIK (Dashboard Style) ---
  const StatisticsView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* SCOREBOARD BESAR */}
        <div className="border-2 border-red-900/50 bg-[#0A0A0A] relative p-1 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
            <div className={`p-8 md:p-12 text-center relative overflow-hidden ${attempt.passed ? 'bg-gradient-to-b from-green-950/20 to-black' : 'bg-gradient-to-b from-red-950/20 to-black'}`}>
                {attempt.passed ? <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" /> : <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-[#dc2626]" />}
                <h1 className="text-4xl md:text-5xl font-black uppercase font-mono tracking-tighter italic mb-2">
                    {attempt.passed ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
                </h1>
                <p className="text-gray-500 text-xs font-mono tracking-[0.3em] uppercase">Status Operasi Final</p>
            </div>
            
            {/* GRID SKOR */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-red-900/30 bg-[#080808]">
                <div className="p-6 text-center border-r border-red-900/20 border-b md:border-b-0 border-white/5">
                    <span className="block text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">Total Score</span>
                    <span className="text-4xl font-black text-white tabular-nums">{attempt.totalScore}</span>
                </div>
                <ScoreItem label="TWK" score={attempt.scoreTwk} target={PG.TWK} />
                <ScoreItem label="TIU" score={attempt.scoreTiu} target={PG.TIU} />
                <ScoreItem label="TKP" score={attempt.scoreTkp} target={PG.TKP} isLast />
            </div>
        </div>

        {/* GRAFIK PROGRESS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0A0A0A] border border-white/10 p-6">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#dc2626] mb-6 border-b border-white/5 pb-4">
                    <BarChart3 className="w-4 h-4"/> Ambang Batas Analysis
                </h4>
                <div className="space-y-6">
                    <ProgressBar label="TWK (Wawasan Kebangsaan)" score={attempt.scoreTwk} target={PG.TWK} max={150} color="bg-yellow-500" />
                    <ProgressBar label="TIU (Intelegensia Umum)" score={attempt.scoreTiu} target={PG.TIU} max={175} color="bg-blue-500" />
                    <ProgressBar label="TKP (Karakteristik Pribadi)" score={attempt.scoreTkp} target={PG.TKP} max={225} color="bg-purple-500" />
                </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 p-6 flex flex-col justify-center items-center text-center">
                <Trophy className={`w-12 h-12 mb-4 ${attempt.passed ? 'text-green-500' : 'text-gray-700'}`} />
                <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">Evaluasi Komando</h3>
                <p className="text-gray-500 text-xs max-w-xs leading-relaxed font-mono">
                {attempt.passed 
                    ? "Perfoma luar biasa. Anda telah memenuhi standar kualifikasi. Lanjutkan drill untuk menjaga ketajaman." 
                    : "Perhatian! Skor masih di bawah standar operasi. Segera lakukan evaluasi pada sektor berwarna merah."}
                </p>
            </div>
        </div>
    </div>
  );

  // --- SUB-VIEW: PEMBAHASAN (Review Style) ---
  const ReviewView = () => {
    // --- [UPGRADE] TAMPILAN KOSONG / ERROR HANDLING ---
    // Jika data jawaban kosong (biasanya karena DB reset saat user sedang mengerjakan)
    if (!attempt.answers || attempt.answers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-[#0A0A0A] border border-white/5 border-dashed rounded-xl text-center animate-in fade-in zoom-in duration-500">
                <div className="p-4 bg-red-900/10 rounded-full mb-6">
                    <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse"/>
                </div>
                <h3 className="text-xl font-black text-gray-400 uppercase tracking-[0.2em] mb-3 font-mono">
                    Data Intelijen Hilang
                </h3>
                <p className="text-gray-600 max-w-md text-sm mb-8 leading-relaxed">
                    Tidak ada rekaman jawaban yang ditemukan untuk sesi ini. <br/>
                    Hal ini terjadi karena gangguan sinyal database (Reset) saat operasi berlangsung.
                </p>
                
                <Link 
                    href={`/tryout/${attempt.packageId}`} 
                    className="group relative px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-200 transition-all clip-path-slant flex items-center gap-3"
                >
                    <RotateCcw className="w-4 h-4 transition-transform group-hover:-rotate-180 duration-500" />
                    ULANGI OPERASI (RE-ENGAGE)
                </Link>
            </div>
        );
    }

    const currentAnswerData = attempt.answers[currentReviewIdx];
    const question = currentAnswerData.question;
    
    // Warna badge tipe soal
    const typeColor = question.type === 'TWK' ? 'text-yellow-500 border-yellow-900/30 bg-yellow-900/10' : 
                      question.type === 'TIU' ? 'text-blue-500 border-blue-900/30 bg-blue-900/10' : 'text-purple-500 border-purple-900/30 bg-purple-900/10';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* SIDEBAR: NAVIGASI SOAL */}
            <div className="lg:col-span-4 order-2 lg:order-1">
                <div className="bg-[#0A0A0A] border border-white/10 p-5 sticky top-24">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex justify-between items-center">
                        Navigation_Grid
                        <span className="text-white bg-white/5 px-2 py-1 rounded-sm">{attempt.answers.length} OBJ</span>
                    </h4>
                    
                    <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                        {attempt.answers.map((ans: any, idx: number) => {
                            // Logic Warna Grid (Hijau jika benar/poin max)
                            let btnClass = "border-white/10 text-gray-600 hover:border-white/30"; // Default
                            
                            if (ans.question.type === 'TKP') {
                                if (ans.score === 5) btnClass = "bg-green-900/40 border-green-600 text-green-500";
                                else if (ans.score >= 3) btnClass = "bg-yellow-900/40 border-yellow-600 text-yellow-500";
                                else btnClass = "bg-red-900/40 border-red-600 text-red-500";
                            } else {
                                if (ans.isCorrect) btnClass = "bg-green-900/40 border-green-600 text-green-500";
                                else btnClass = "bg-red-900/40 border-red-600 text-red-500";
                            }

                            if (idx === currentReviewIdx) btnClass += " ring-1 ring-white shadow-[0_0_10px_white]";

                            return (
                                <button 
                                    key={ans.id}
                                    onClick={() => setCurrentReviewIdx(idx)}
                                    className={`h-9 w-full text-[10px] font-bold border transition-all uppercase ${btnClass}`}
                                >
                                    {idx + 1}
                                </button>
                            )
                        })}
                    </div>
                    
                    {/* LEGENDA */}
                    <div className="mt-6 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_green]"></div> Benar / Poin 5
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_5px_yellow]"></div> Poin 3-4 (TKP)
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
                            <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_red]"></div> Salah / Poin Rendah
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT: SOAL & PEMBAHASAN */}
            <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
                
                {/* Header Kontrol */}
                <div className="flex justify-between items-center bg-[#0A0A0A] border border-white/10 p-4">
                    <span className={`px-3 py-1 rounded-sm border text-[10px] font-black tracking-widest uppercase ${typeColor}`}>
                        {question.type} SECTION
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentReviewIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentReviewIdx === 0}
                            className="px-4 py-2 bg-white/5 border border-white/10 text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition uppercase tracking-wider"
                        >Prev</button>
                        <button 
                            onClick={() => setCurrentReviewIdx(prev => Math.min(attempt.answers.length - 1, prev + 1))}
                            disabled={currentReviewIdx === attempt.answers.length - 1}
                            className="px-4 py-2 bg-white text-black border border-white text-xs font-bold hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition uppercase tracking-wider"
                        >Next</button>
                    </div>
                </div>

                {/* Teks Soal */}
                <div className="bg-[#0A0A0A] border-t-2 border-t-[#dc2626] border-x border-b border-white/10 p-8 relative">
                    <h2 className="text-base md:text-lg text-gray-200 leading-loose font-medium mb-8">
                        {question.text}
                    </h2>
                    
                    {question.image && (
                         <div className="mb-8 p-4 bg-white rounded-sm inline-block border border-white/20">
                             <img src={question.image} alt="Visual Data" className="max-h-[300px] object-contain" />
                         </div>
                    )}

                    {/* PILIHAN JAWABAN (DENGAN SKOR) */}
                    <div className="space-y-3">
                        {question.options.map((opt: any) => {
                            const isSelected = currentAnswerData.userAnswer === opt.code;
                            const isMaxScore = opt.score === 5; // Jawaban Terbaik
                            
                            // Styling Logic Tactical
                            let containerClass = "border-white/5 bg-black text-gray-500"; 
                            let badgeClass = "bg-white/10 text-gray-500 border-white/10";
                            let scoreClass = "text-gray-600 border-white/5 bg-white/5";

                            // 1. Jika User Memilih (Biru)
                            if (isSelected) {
                                containerClass = "border-blue-500/50 bg-blue-900/10 text-blue-200";
                                badgeClass = "bg-blue-600 text-white border-blue-500";
                                scoreClass = "text-blue-300 border-blue-500/30 bg-blue-500/10";
                            }
                            
                            // 2. Jika Jawaban Benar (Hijau) - Override atau Tambahan
                            if (isMaxScore) {
                                if (isSelected) {
                                    // User Benar
                                    containerClass = "border-green-500 bg-green-900/20 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                                    badgeClass = "bg-green-600 text-black font-bold border-green-500";
                                    scoreClass = "text-green-400 border-green-500/30 bg-green-500/10 font-bold";
                                } else {
                                    // User Salah, Tunjukkan yg benar
                                    containerClass = "border-green-500/30 bg-green-900/5 text-gray-300 border-dashed";
                                    badgeClass = "bg-green-900/40 text-green-500 border-green-500/30";
                                    scoreClass = "text-green-500 border-green-500/30 bg-green-500/10";
                                }
                            } else if (isSelected && !isMaxScore) {
                                // User Salah (Merah)
                                containerClass = "border-red-500/50 bg-red-900/10 text-red-200";
                                badgeClass = "bg-red-600 text-white border-red-500";
                                scoreClass = "text-red-300 border-red-500/30 bg-red-500/10";
                            }

                            return (
                                <div key={opt.code} className={`flex items-center justify-between p-3 border text-sm transition-all ${containerClass}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs shrink-0 border ${badgeClass}`}>
                                            {opt.code}
                                        </div>
                                        <span className="leading-relaxed">{opt.text}</span>
                                    </div>
                                    
                                    {/* SCORE BADGE (FITUR REQUESTED) */}
                                    <div className={`text-[10px] font-mono font-bold px-2 py-1 border uppercase tracking-wider shrink-0 ml-2 ${scoreClass}`}>
                                        {opt.score} Pts
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* PEMBAHASAN */}
                <div className="bg-[#0A0A0A] border-l-4 border-blue-500 p-6 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 pointer-events-none"></div>
                    <h4 className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4">
                        <FileText className="w-4 h-4"/> Tactical_Intel / Pembahasan
                    </h4>
                    <div className="text-sm text-gray-300 leading-loose font-light whitespace-pre-line font-sans">
                        {question.explanation ? question.explanation : "Data pembahasan tidak tersedia untuk unit soal ini."}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="relative z-10 pb-40">
        {/* TOP NAV */}
        <nav className="border-b border-red-900/30 bg-[#050505]/80 backdrop-blur sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                     <ShieldAlert className="w-6 h-6 text-[#dc2626] animate-pulse"/>
                     <span className="font-black text-white tracking-[0.2em] uppercase text-sm md:text-base">Mission_Debriefing</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="hidden md:flex text-[10px] font-mono text-gray-500 hover:text-white items-center gap-2 uppercase tracking-widest transition">
                        <Home size={12}/> Exit_To_Base
                    </Link>
                </div>
            </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* TAB CONTROLLER */}
            <div className="flex justify-center mb-10">
                <div className="inline-flex bg-[#0A0A0A] p-1 border border-white/10">
                    <button 
                        onClick={() => setActiveTab('stats')}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'stats' ? 'bg-[#dc2626] text-white clip-path-slant' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        STATISTICS
                    </button>
                    <button 
                        onClick={() => setActiveTab('review')}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'review' ? 'bg-white text-black clip-path-slant' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        PEMBAHASAN
                    </button>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[600px]">
                {activeTab === 'stats' ? <StatisticsView /> : <ReviewView />}
            </div>
        </div>
    </div>
  );
}

// --- SUB COMPONENTS HELPERS ---

function ScoreItem({ label, score, target, isLast }: any) {
    const passed = score >= target;
    return (
        <div className={`p-6 border-r ${isLast ? 'border-none' : 'border-red-900/20'} border-b md:border-b-0 border-white/5 relative`}>
             <div className="flex justify-between items-start mb-2">
                 <span className="font-black text-[#dc2626] text-lg font-mono tracking-widest">{label}</span>
                 {passed ? <CheckCircle2 className="w-4 h-4 text-green-500"/> : <XCircle className="w-4 h-4 text-[#dc2626]"/>}
             </div>
             <div className="text-3xl font-black text-white tabular-nums">{score}</div>
             <div className={`text-[9px] font-bold mt-2 uppercase tracking-widest ${passed ? 'text-green-500' : 'text-red-500'}`}>
                 PG: {target}
             </div>
        </div>
    )
}

function ProgressBar({ label, score, target, max, color }: any) {
    const percentage = Math.min((score / max) * 100, 100);
    const targetPercentage = (target / max) * 100;

    return (
        <div>
            <div className="flex justify-between text-[10px] mb-2 uppercase tracking-wider">
                <span className="text-gray-300 font-bold">{label}</span>
                <span className="text-white font-mono">{score} / {max}</span>
            </div>
            <div className="relative h-3 bg-[#050505] border border-white/10 w-full overflow-hidden">
                {/* Bar User */}
                <div 
                    className={`absolute top-0 left-0 h-full ${color} opacity-80 z-10 transition-all duration-1000`} 
                    style={{ width: `${percentage}%` }}
                ></div>
                
                {/* Garis Batas Passing Grade */}
                <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-white z-20 shadow-[0_0_10px_white]" 
                    style={{ left: `${targetPercentage}%` }}
                ></div>
            </div>
            <div className="flex justify-end mt-1">
                <span className="text-[8px] text-gray-600 font-mono uppercase">Target PG: {target}</span>
            </div>
        </div>
    )
}