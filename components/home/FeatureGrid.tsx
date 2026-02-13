import { BrainCircuit, Dumbbell, Target, Zap, Trophy, BarChart3 } from "lucide-react";

export default function FeatureGrid() {
  return (
    <section id="metode" className="py-24 bg-[#050505] relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-blue-500 font-black tracking-[0.2em] text-sm uppercase mb-4">Metode Pelatihan Terintegrasi</h2>
                <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                    Sistem <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Trinity</span>
                </h3>
                <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                    Kami tidak hanya mengajarkan soal. Kami membentuk karakter, fisik, dan mental calon perwira masa depan.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                
                {/* JAR - AKADEMIK (LARGE) */}
                <div className="md:col-span-2 bg-zinc-900/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-blue-500/50 transition-all group overflow-hidden relative">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
                    <div>
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6">
                            <BrainCircuit size={28}/>
                        </div>
                        <h4 className="text-2xl font-black text-white uppercase mb-2">JAR (Pengajaran)</h4>
                        <p className="text-gray-400 leading-relaxed">Sistem CAT SKD presisi tinggi dengan Bank Soal HOTS dan Analisa Adaptif yang mendeteksi kelemahan akademik Anda secara real-time.</p>
                    </div>
                    <div className="flex gap-2 mt-6">
                        <span className="px-3 py-1 rounded bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-500/30">TWK</span>
                        <span className="px-3 py-1 rounded bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-500/30">TIU</span>
                        <span className="px-3 py-1 rounded bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-500/30">TKP</span>
                    </div>
                </div>

                {/* LAT - FISIK */}
                <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-yellow-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-40 h-40 bg-yellow-600/10 rounded-full blur-2xl group-hover:bg-yellow-600/20 transition-all"></div>
                    <div className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center text-white mb-4">
                        <Dumbbell size={28}/>
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-white uppercase mb-2">LAT (Pelatihan)</h4>
                        <p className="text-sm text-gray-400">Monitoring fisik harian (Lari, Push-up, Shuttle Run) dengan grafik progres visual.</p>
                    </div>
                </div>

                {/* SUH - PENGASUHAN */}
                <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-green-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute left-0 bottom-0 w-40 h-40 bg-green-600/10 rounded-full blur-2xl group-hover:bg-green-600/20 transition-all"></div>
                    <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white mb-4">
                        <Target size={28}/>
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-white uppercase mb-2">SUH (Pengasuhan)</h4>
                        <p className="text-sm text-gray-400">Sistem Misi Harian (Daily Quests) untuk membangun kedisiplinan dan mental juara.</p>
                    </div>
                </div>

                {/* STATS */}
                <div className="md:col-span-2 bg-gradient-to-r from-zinc-900 to-black border border-white/10 rounded-3xl p-8 flex items-center justify-between relative overflow-hidden">
                     <div className="relative z-10">
                        <h4 className="text-2xl font-black text-white uppercase mb-1">Analisa 360°</h4>
                        <p className="text-gray-400 text-sm">Radar Chart untuk memetakan keseimbangan kemampuan Anda.</p>
                     </div>
                     <BarChart3 className="text-zinc-800 w-32 h-32 absolute -right-4 -bottom-4 rotate-12"/>
                     <div className="relative z-10">
                        <button className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition">
                            Lihat Demo
                        </button>
                     </div>
                </div>

            </div>
        </div>
    </section>
  );
}