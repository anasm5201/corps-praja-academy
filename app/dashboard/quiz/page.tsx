"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// DATABASE SOAL (Nanti ini kita ambil dari Server, sekarang kita hardcode dulu)
const questions = [
  {
    id: 1,
    category: "TWK",
    question: "Lambang negara Indonesia adalah Garuda Pancasila dengan semboyan Bhinneka Tunggal Ika. Lambang negara ini dirancang oleh...",
    options: ["Soekarno", "Sultan Hamid II", "Mohammad Yamin", "Ki Hajar Dewantara", "Soepomo"],
    answer: 1 // Index jawaban benar (Sultan Hamid II)
  },
  {
    id: 2,
    category: "TIU",
    question: "Jika X = 1/16 dan Y = 16%, maka...",
    options: ["X > Y", "X < Y", "X = Y", "X dan Y tak bisa ditentukan", "X = 2Y"],
    answer: 1 // X=0.0625, Y=0.16. Jadi X < Y
  },
  {
    id: 3,
    category: "TKP",
    question: "Atasan anda meminta anda melemburkan pekerjaan rekan yang sedang sakit, padahal anda sendiri sedang banyak tugas. Sikap anda?",
    options: [
      "Menolak halus karena tugas sendiri belum selesai",
      "Menerima dengan syarat ada upah lembur",
      "Menerima dan mengerjakan semampunya",
      "Mengatur ulang prioritas, mengerjakan tugas sendiri lalu membantu rekan",
      "Meminta rekan lain membantu"
    ],
    answer: 3 // Skala prioritas & kerjasama
  },
];

export default function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 detik per soal (Simulasi Cepat)
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // LOGIKA TIMER
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleNext(); // Waktu habis otomatis lanjut
    }
  }, [timeLeft, showResult]);

  // LOGIKA JAWAB
  const handleAnswer = (index: number) => {
    setSelectedOption(index);
    // Jika benar +5 poin (Aturan SKD CPNS)
    if (index === questions[currentQ].answer) {
      setScore(score + 5);
    }
  };

  // LOGIKA LANJUT SOAL
  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
      setTimeLeft(60); // Reset timer
    } else {
      setShowResult(true);
    }
  };

  // TAMPILAN HASIL (REPORT)
  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-laser/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏆</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">MISI SELESAI!</h2>
          <p className="text-gray-400 mb-6">Laporan hasil simulasi taktis anda:</p>
          
          <div className="bg-black/50 p-6 rounded-xl border border-white/5 mb-8">
            <div className="text-sm text-gray-500 font-mono mb-1">TOTAL SKOR</div>
            <div className="text-5xl font-bold text-laser">{score} <span className="text-lg text-gray-500">/ {questions.length * 5}</span></div>
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

  // TAMPILAN SOAL (UI UTAMA)
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 h-full flex flex-col justify-center">
      
      {/* HEADER: PROGRESS & TIMER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-white">← KELUAR</Link>
            <div className="px-3 py-1 rounded bg-laser/10 border border-laser text-laser text-xs font-bold tracking-wider">
                SOAL {currentQ + 1} / {questions.length}
            </div>
        </div>
        <div className={`font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </div>
      </div>

      {/* QUESTION CARD */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="space-y-8"
        >
            {/* Kategori Soal */}
            <div className="text-sm text-holo font-bold font-mono tracking-widest">
                // KATEGORI: {questions[currentQ].category}
            </div>

            {/* Teks Soal */}
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                {questions[currentQ].question}
            </h2>

            {/* Pilihan Jawaban */}
            <div className="grid gap-4">
                {questions[currentQ].options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedOption(i)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 group
                            ${selectedOption === i 
                                ? 'bg-laser text-white border-laser shadow-[0_0_20px_rgba(214,0,28,0.4)]' 
                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/50 hover:bg-white/10'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border
                            ${selectedOption === i ? 'bg-white text-laser border-white' : 'border-gray-600 text-gray-500 group-hover:border-white group-hover:text-white'}`}>
                            {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-lg">{opt}</span>
                    </button>
                ))}
            </div>
        </motion.div>
      </AnimatePresence>

      {/* FOOTER ACTION */}
      <div className="mt-10 flex justify-end">
        <button 
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`px-8 py-4 rounded font-bold tracking-widest transition-all
                ${selectedOption !== null 
                    ? 'bg-white text-black hover:scale-105' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
        >
            {currentQ === questions.length - 1 ? 'SELESAIKAN MISI' : 'LANJUT →'}
        </button>
      </div>

    </div>
  );
}