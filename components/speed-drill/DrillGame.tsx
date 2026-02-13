"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trophy, Zap, Flame, RotateCcw, Volume2, VolumeX } from "lucide-react";
import confetti from "canvas-confetti";

interface DrillGameProps {
  unit: {
    id: string;
    unitNumber: number;
    title: string;
    questions: any[];
  };
}

export default function DrillGame({ unit }: DrillGameProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [status, setStatus] = useState<"IDLE" | "SELECTED" | "ANSWERED">("IDLE");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // --- LOGIKA DATA (Fix Kosong) ---
  const currentQ = unit.questions[currentIndex];
  // Parsing Opsi: Kita paksa agar selalu terbaca terlepas dari format JSON-nya
  const rawOptions = currentQ?.options ? (typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options) : [];
  
  const options = rawOptions.map((opt: any, i: number) => ({
    key: opt.key || String.fromCharCode(65 + i),
    text: opt.text || opt.content || (typeof opt === 'string' ? opt : ""),
    score: opt.score || 0
  }));

  // --- AUDIO SYSTEM (Duolingo Style) ---
  const playSound = (type: string) => {
    if (isMuted) return;
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.play().catch(() => console.log("Audio file missing"));
  };

  const handleAnswer = () => {
    if (status !== "SELECTED") return;
    
    const selectedOpt = options.find((o: any) => o.key === selectedKey);
    const isCorrect = selectedKey === currentQ.correctAnswer || selectedOpt?.score === 5;

    setStatus("ANSWERED");
    if (isCorrect) {
      playSound("correct");
      setScore(s => s + 5);
      setStreak(st => st + 1);
      if (streak + 1 >= 3) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      playSound("wrong");
      setStreak(0);
      setHearts(h => h - 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex >= unit.questions.length - 1) {
      router.push("/dashboard/speed-drill/result");
    } else {
      setCurrentIndex(c => c + 1);
      setStatus("IDLE");
      setSelectedKey(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white font-sans">
      {/* HEADER: PROGRESS & LIVES */}
      <div className="flex items-center gap-6 mb-12">
        <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${(currentIndex / unit.questions.length) * 100}%` }}
          />
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-500 hover:text-white">
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <div className="flex items-center gap-2">
          <Heart className="text-red-500 fill-red-500" size={24} />
          <span className="font-black text-xl">{hearts}</span>
        </div>
      </div>

      {/* QUESTION AREA */}
      <div className="mb-12 min-h-[150px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-block px-3 py-1 bg-red-600 text-[10px] font-black rounded mb-4 uppercase tracking-tighter">
          {currentQ?.type || "TWK"}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight drop-shadow-sm">
          {currentQ?.text || currentQ?.question}
        </h2>
      </div>

      {/* OPTIONS GRID */}
      <div className="grid grid-cols-1 gap-4 mb-32">
        {options.map((opt: any) => (
          <button
            key={opt.key}
            onClick={() => { if(status === "IDLE" || status === "SELECTED") { setSelectedKey(opt.key); setStatus("SELECTED"); playSound("tap"); }}}
            className={`
              w-full p-5 rounded-2xl border-b-4 text-left transition-all relative
              ${selectedKey === opt.key && status !== "ANSWERED" ? "bg-blue-500/10 border-blue-500 translate-y-[-2px]" : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"}
              ${status === "ANSWERED" && (opt.key === currentQ.correctAnswer || opt.score === 5) ? "bg-green-500/20 border-green-500" : ""}
              ${status === "ANSWERED" && selectedKey === opt.key && !(opt.key === currentQ.correctAnswer || opt.score === 5) ? "bg-red-500/20 border-red-500" : ""}
            `}
          >
            <div className="flex items-center gap-4">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black border-2 ${selectedKey === opt.key ? "border-blue-500 text-blue-400" : "border-zinc-700 text-zinc-500"}`}>
                {opt.key}
              </span>
              <span className="font-bold text-lg">{opt.text}</span>
            </div>
          </button>
        ))}
      </div>

      {/* BOTTOM ACTION BAR (DUOLINGO STYLE) */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 border-t-2 border-zinc-900 bg-black/80 backdrop-blur-xl transition-all duration-300 ${status === "ANSWERED" ? (streak >= 3 ? "bg-orange-950/90" : "bg-zinc-900") : ""}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {status === "ANSWERED" ? (
            <div className="animate-in slide-in-from-bottom-4">
              <h3 className={`text-2xl font-black mb-1 ${streak >= 3 ? "text-orange-400" : "text-white"}`}>
                {streak >= 3 ? `${streak}X COMBO ON FIRE! 🔥` : "BAGUS SEKALI!"}
              </h3>
              <p className="text-zinc-400 text-sm font-medium">{currentQ?.explanation || "Pembahasan siap dipelajari."}</p>
            </div>
          ) : <div className="hidden md:block text-zinc-600 font-bold uppercase tracking-widest text-xs">Pilih Jawaban yang Tepat</div>}

          <button
            onClick={status === "ANSWERED" ? nextQuestion : handleAnswer}
            disabled={status === "IDLE"}
            className={`
              px-12 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all
              ${status === "IDLE" ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-green-500 text-black border-b-4 border-green-700 active:border-b-0 translate-y-[-4px] active:translate-y-0"}
            `}
          >
            {status === "ANSWERED" ? "LANJUTKAN" : "PERIKSA"}
          </button>
        </div>
      </div>
    </div>
  );
}