"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

// DATABASE SOAL SIMULASI
const questions = [
  {
    id: 1,
    category: "TWK",
    question: "Lambang negara Indonesia adalah Garuda Pancasila dengan semboyan Bhinneka Tunggal Ika. Lambang negara ini dirancang oleh...",
    options: ["Soekarno", "Sultan Hamid II", "Mohammad Yamin", "Ki Hajar Dewantara", "Soepomo"],
    answer: 1 
  },
  {
    id: 2,
    category: "TIU",
    question: "Jika X = 1/16 dan Y = 16%, maka...",
    options: ["X > Y", "X < Y", "X = Y", "X dan Y tak bisa ditentukan", "X = 2Y"],
    answer: 1 
  },
  {
    id: 3,
    category: "TKP",
    question: "Atasan anda meminta anda melemburkan pekerjaan rekan yang sedang sakit, padahal anda sendiri sedang banyak tugas. Sikap anda?",
    options: ["Menolak halus", "Menerima dengan syarat", "Menerima dan kerjakan semampunya", "Kerjakan tugas sendiri dulu baru bantu", "Limpahkan ke orang lain"],
    answer: 3 
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); 
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // EFEK PENYIMPANAN DATA (AUTO SAVE)
  useEffect(() => {
    if (showResult) {
      // 1. Ambil XP lama (atau 0 jika belum ada)
      const currentXP = parseInt(localStorage.getItem('cadetXP') || '0');
      // 2. Tambah XP baru (Skor * 10)
      const newXP = currentXP + (score * 10);
      
      // 3. Simpan ke Memori Browser
      localStorage.setItem('cadetXP', newXP.toString());
      localStorage.setItem('lastScore', score.toString());
      
      // 4. Update Status Misi
      localStorage.setItem('missionAlpha', 'DONE');
    }
  }, [showResult, score]);

  // LOGIKA TIMER
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleNext(); 
    }
  }, [timeLeft, showResult]);

  const handleAnswer = (index: number) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    // Cek Jawaban
    if (selectedOption === questions[currentQ].answer) {
      setScore(s => s + 5); // +5 Poin jika benar
    }

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
      setTimeLeft(60);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-void border border-white/10 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(214,0,28,0.2)]"
        >
          <div className="w-20 h-20 bg-laser/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-4xl">💾</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">DATA TERSIMPAN!</h2>
          <p className="text-gray-400 mb-6 font-mono text-sm">Skor anda telah diunggah ke Markas Pusat.</p>
          
          <div className="bg-black/50 p-6 rounded-xl border border-white/5 mb-8 grid grid-cols-2 gap-4">
            <div>
                <div className="text-xs text-gray-500 font-mono mb-1">SKOR AKHIR</div>
                <div className="text-4xl font-bold text-white">{score}</div>
            </div>
            <div>
                <div className="text-xs text-gray-500 font-mono mb-1">XP DIPEROLEH</div>
                <div className="text-4xl font-bold text-laser">+{score * 10}</div>
            </div>
          </div>

          <Link href="/dashboard">
            <button className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition-colors">
              KEMBALI KE MARKAS
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 h-full flex flex-col justify-center min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-white text-sm font-mono">← BATALKAN MISI</button>
            <div className="px-3 py-1 rounded bg-laser/10 border border-laser text-laser text-xs font-bold tracking-wider">
                SOAL {currentQ + 1} / {questions.length}
            </div>
        </div>
        <div className={`font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="space-y-8"
        >
            <div className="text-sm text-holo font-bold font-mono tracking-widest">// KATEGORI: {questions[currentQ].category}</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">{questions[currentQ].question}</h2>
            <div className="grid gap-4">
                {questions[currentQ].options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedOption(i)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 group ${selectedOption === i ? 'bg-laser text-white border-laser' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${selectedOption === i ? 'bg-white text-laser border-white' : 'border-gray-600'}`}>{String.fromCharCode(65 + i)}</div>
                        <span className="text-lg">{opt}</span>
                    </button>
                ))}
            </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex justify-end">
        <button 
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`px-8 py-4 rounded font-bold tracking-widest transition-all ${selectedOption !== null ? 'bg-white text-black hover:scale-105' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
        >
            {currentQ === questions.length - 1 ? 'SELESAIKAN MISI' : 'LANJUT →'}
        </button>
      </div>
    </div>
  );
}