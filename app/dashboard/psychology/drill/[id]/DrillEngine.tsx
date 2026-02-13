"use client";

import { useState, useEffect, useCallback } from "react";
import { Timer, XCircle, CheckCircle2, RotateCcw, Home, Zap, Trophy, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { submitDrillScore } from "@/app/actions/drillActions";
import Link from "next/link";

// ASSETS (SIMBOL UNTUK DRILL)
const SYMBOLS = ["☀", "☁", "☂", "☃", "☄", "★", "☆", "⚡", "♠", "♣", "♥", "♦", "♪", "♫"];
const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"];

// Tipe Data Soal
type QuestionState = {
    keyMap: string[]; // [A, B, C, D, E] (Isi simbolnya)
    missingIndex: number; // Index mana yang hilang (0-4) -> Jawaban Benar
    displaySet: string[]; // Simbol yang ditampilkan (4 biji)
};

export default function DrillEngine({ drillType, user }: { drillType: string, user: any }) {
    // GAME STATE
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [wrong, setWrong] = useState(0);
    const [combo, setCombo] = useState(0);
    
    // QUESTION STATE
    const [question, setQuestion] = useState<QuestionState | null>(null);
    const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);

    // --- LOGIC GENERATOR SOAL ---
    const generateQuestion = useCallback(() => {
        let sourceSet = SYMBOLS;
        if (drillType === 'angka-hilang') sourceSet = NUMBERS;
        if (drillType === 'huruf-hilang') sourceSet = LETTERS;

        // 1. Ambil 5 Simbol Acak untuk jadi KEY (Kunci A-E)
        const shuffled = [...sourceSet].sort(() => 0.5 - Math.random());
        const keyMap = shuffled.slice(0, 5); // [☀, ☁, ☂, ☃, ☄]

        // 2. Tentukan mana yang hilang (Jawaban Benar)
        const missingIndex = Math.floor(Math.random() * 5); // Misal 2 (☂)
        
        // 3. Buat Display Set (Hapus simbol yang hilang & acak posisinya)
        // Note: Di tes asli, urutan di soal biasanya diacak juga, tapi user harus tau simbol mana yang gak ada.
        const missingSymbol = keyMap[missingIndex];
        const displaySet = keyMap.filter((_, i) => i !== missingIndex).sort(() => 0.5 - Math.random());

        setQuestion({ keyMap, missingIndex, displaySet });
    }, [drillType]);

    // --- GAME LOOP (TIMER) ---
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState === 'PLAYING' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameState === 'PLAYING') {
            finishGame();
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    // --- START GAME ---
    const startGame = () => {
        setScore(0);
        setWrong(0);
        setCombo(0);
        setTimeLeft(60);
        setGameState('PLAYING');
        generateQuestion();
    };

    // --- FINISH GAME ---
    const finishGame = async () => {
        setGameState('GAMEOVER');
        // Submit ke Server
        const total = score + wrong;
        const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
        
        try {
            await submitDrillScore(drillType, score, accuracy);
            toast.success("DATA TERSIMPAN", { description: `XP +${Math.round(score/2)}` });
        } catch (e) {
            toast.error("Gagal menyimpan skor.");
        }
    };

    // --- HANDLE INPUT ---
    const handleAnswer = (index: number) => {
        if (!question) return;

        if (index === question.missingIndex) {
            // BENAR
            setScore(prev => prev + 1);
            setCombo(prev => prev + 1);
            setFeedback('CORRECT');
            // Sound effect bisa ditaruh sini
        } else {
            // SALAH
            setWrong(prev => prev + 1);
            setCombo(0);
            setFeedback('WRONG');
            // Hukuman waktu (opsional)
        }

        // Reset Feedback visual singkat
        setTimeout(() => setFeedback(null), 150);
        
        // Next Question
        generateQuestion();
    };

    // UI RENDER HELPERS
    const labels = ["A", "B", "C", "D", "E"];
    const accuracy = (score + wrong) > 0 ? Math.round((score / (score + wrong)) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            
            {/* BACKGROUND PULSE */}
            {feedback === 'CORRECT' && <div className="absolute inset-0 bg-green-500/10 pointer-events-none transition-opacity duration-75"></div>}
            {feedback === 'WRONG' && <div className="absolute inset-0 bg-red-500/10 pointer-events-none transition-opacity duration-75"></div>}

            {/* --- LAYAR: IDLE (MENU UTAMA) --- */}
            {gameState === 'IDLE' && (
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-md"
                >
                    <div className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Zap size={40} />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">NEURAL DRILL</h1>
                    <p className="text-gray-400 font-mono text-sm mb-8">
                        Mode: {drillType.replace('-', ' ').toUpperCase()} <br/>
                        Target: Temukan 1 simbol yang hilang dari baris soal.
                    </p>

                    <div className="space-y-3">
                        <button 
                            onClick={startGame}
                            className="w-full py-4 bg-white text-black hover:bg-yellow-400 font-black text-lg uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
                        >
                            MULAI (60 DETIK)
                        </button>
                        <Link href="/dashboard/psychology">
                            <button className="w-full py-4 text-gray-500 font-bold uppercase tracking-widest hover:text-white transition">
                                KEMBALI KE LOBBY
                            </button>
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* --- LAYAR: PLAYING (GAME ENGINE) --- */}
            {gameState === 'PLAYING' && question && (
                <div className="max-w-xl w-full flex flex-col h-full max-h-[800px]">
                    
                    {/* HUD ATAS */}
                    <div className="flex justify-between items-center mb-8 px-2">
                        <div className="text-left">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">SCORE</p>
                            <p className="text-3xl font-black text-blue-500">{score}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`text-4xl font-black font-mono tracking-wider ${timeLeft < 10 ? 'text-red-500 animate-ping' : 'text-white'}`}>
                                {timeLeft}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">COMBO</p>
                            <p className={`text-3xl font-black ${combo > 5 ? 'text-yellow-500' : 'text-gray-600'}`}>x{combo}</p>
                        </div>
                    </div>

                    {/* AREA KUNCI (REFERENCE) */}
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 mb-6 relative">
                        <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#050505] px-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            KUNCI JAWABAN
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                            {question.keyMap.map((symbol, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                    <div className="w-full aspect-square bg-black border border-white/20 rounded-lg flex items-center justify-center text-3xl font-bold">
                                        {symbol}
                                    </div>
                                    <span className="text-xs font-bold text-gray-500">{labels[idx]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AREA SOAL (STIMULUS) */}
                    <div className="flex-1 flex flex-col justify-center items-center mb-8">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">MANA YANG HILANG?</p>
                        <div className="flex gap-4 p-6 bg-zinc-800/50 rounded-2xl border border-dashed border-white/20">
                            {question.displaySet.map((symbol, idx) => (
                                <div key={idx} className="text-5xl md:text-6xl font-black animate-in fade-in zoom-in duration-300">
                                    {symbol}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AREA INPUT (CONTROLLER) */}
                    <div className="grid grid-cols-5 gap-3">
                        {labels.map((label, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className="aspect-[4/5] bg-zinc-800 hover:bg-zinc-700 active:bg-blue-600 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group"
                            >
                                <span className="text-3xl font-black text-white group-active:text-white">{label}</span>
                                <span className="text-[10px] text-gray-500 group-active:text-blue-200">TEKAN</span>
                            </button>
                        ))}
                    </div>

                </div>
            )}

            {/* --- LAYAR: GAMEOVER (RESULT) --- */}
            {gameState === 'GAMEOVER' && (
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-3xl p-8 text-center"
                >
                    <Trophy className="mx-auto text-yellow-500 mb-4" size={60} />
                    <h2 className="text-2xl font-black uppercase text-white mb-1">DRILL COMPLETE</h2>
                    <p className="text-xs text-gray-500 font-mono mb-8">DATA TELAH DISINKRONISASI</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-black/40 p-4 rounded-xl">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Total Benar</p>
                            <p className="text-4xl font-black text-blue-500">{score}</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Akurasi</p>
                            <p className={`text-4xl font-black ${accuracy > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                                {accuracy}%
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={startGame}
                            className="w-full py-3 bg-white text-black font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                        >
                            <RotateCcw size={18}/> ULANGI LAGI
                        </button>
                        <Link href="/dashboard/psychology">
                            <button className="w-full py-3 bg-zinc-800 text-white font-bold uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition">
                                <Home size={18}/> KEMBALI KE MARKAS
                            </button>
                        </Link>
                    </div>
                </motion.div>
            )}

        </div>
    );
}