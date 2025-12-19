"use client";
import { motion } from "framer-motion";
import Link from "next/link"; // <--- INI KUNCINYA (Sering Lupa)

const missions = [
  {
    id: 1,
    title: "OPERASI SKD ALPHA",
    desc: "Simulasi lengkap TWK, TIU, TKP sesuai standar BKN terbaru.",
    difficulty: "HARD",
    time: "100 Menit",
    xp: "+500 XP",
    status: "OPEN", // Status terbuka
    color: "border-l-4 border-l-laser"
  },
  {
    id: 2,
    title: "DRILL KECERDASAN (TIU)",
    desc: "Fokus pada kemampuan verbal, numerik, dan figural.",
    difficulty: "MEDIUM",
    time: "30 Menit",
    xp: "+250 XP",
    status: "OPEN",
    color: "border-l-4 border-l-orange-500"
  },
  {
    id: 3,
    title: "WAWASAN KEBANGSAAN",
    desc: "Uji pemahaman pilar negara dan sejarah perjuangan.",
    difficulty: "EASY",
    time: "20 Menit",
    xp: "+150 XP",
    status: "COMPLETED",
    color: "border-l-4 border-l-green-500"
  },
  {
    id: 4,
    title: "PREDIKSI AKBAR 2026",
    desc: "Soal prediksi paling akurat untuk seleksi tahun depan.",
    difficulty: "EXTREME",
    time: "110 Menit",
    xp: "+1000 XP",
    status: "LOCKED",
    color: "border-l-4 border-l-gray-700 opacity-50"
  }
];

export default function MissionPage() {
  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-wider font-sans">ACTIVE MISSIONS</h1>
        <p className="text-gray-400 font-mono text-sm mt-1">Pilih operasi simulasi untuk menguji kesiapan tempur.</p>
      </div>

      {/* STATS ROW */}
      <div className="flex justify-end items-center">
         <div className="text-right">
            <div className="text-xs text-gray-500 font-mono">TOTAL XP ANDA</div>
            <div className="text-2xl font-bold text-yellow-500">1,250 XP</div>
         </div>
      </div>

      {/* MISSION LIST */}
      <div className="space-y-4">
        {missions.map((misi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`group relative bg-white/5 border border-white/10 ${misi.status === 'LOCKED' ? 'border-gray-700 opacity-50' : 'hover:border-white/30'} p-6 rounded-xl overflow-hidden transition-all`}
          >
            {/* Background Pattern */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-black/50 to-transparent pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              
              {/* Left: Info */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold font-mono px-2 py-1 rounded bg-black/50 border border-white/10 text-white`}>
                    {misi.difficulty}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">⏱ {misi.time}</span>
                  <span className="text-xs text-yellow-500 font-mono">🏆 {misi.xp}</span>
                </div>
                <h3 className="text-xl font-bold text-white font-sans">{misi.title}</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-xl">{misi.desc}</p>
              </div>

              {/* Right: Action Button */}
              <div>
                {misi.status === 'OPEN' && (
                  <Link href="/dashboard/quiz">
                    <button className="bg-laser hover:bg-red-700 text-white font-bold py-3 px-8 rounded skew-x-[-10deg] shadow-[0_0_20px_rgba(214,0,28,0.4)] transition-transform hover:scale-105">
                      <span className="skew-x-[10deg] block">DEPLOY MISI</span>
                    </button>
                  </Link>
                )}
                {misi.status === 'COMPLETED' && (
                  <button className="border border-green-500 text-green-500 font-bold py-3 px-8 rounded cursor-default">
                    ✔ SELESAI
                  </button>
                )}
                {misi.status === 'LOCKED' && (
                  <button className="bg-gray-800 text-gray-500 font-bold py-3 px-8 rounded cursor-not-allowed flex items-center gap-2">
                    🔒 TERKUNCI
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}