import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { submitPhysicalLog } from "@/app/actions/physical";
import { Dumbbell, Timer, ArrowLeft, Save, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function PhysicalInputPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="p-2 bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                <ArrowLeft size={20} className="text-neutral-400" />
            </Link>
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Activity className="text-amber-500" /> Laporan Samapta
                </h1>
                <p className="text-neutral-500 text-xs font-mono">Input hasil latihan harian untuk kalkulasi skor & grafik JAR-LAT-SUH.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* KOLOM KIRI: FORM INPUT */}
            <div className="lg:col-span-2">
                <form action={submitPhysicalLog} className="space-y-6">
                    
                    {/* CARD 1: LARI (SAMAPTA A) */}
                    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Timer size={60} /></div>
                        <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">
                            A. LARI 12 MENIT
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-xs text-neutral-400 mb-1.5 ml-1">JARAK TEMPUH (METER)</label>
                                <input 
                                    type="number" 
                                    name="lariMeter" 
                                    placeholder="Contoh: 2400" 
                                    required
                                    className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono text-lg placeholder:text-neutral-700 transition-all"
                                />
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-[10px] text-neutral-500 uppercase font-bold">TARGET NILAI 100</p>
                                <p className="text-xl font-black text-white">3444 <span className="text-xs text-neutral-500 font-medium">Meter</span></p>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: KETANGKASAN (SAMAPTA B) */}
                    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Dumbbell size={60} /></div>
                        <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4 border-b border-neutral-800 pb-2">
                            B. KETANGKASAN (1 MENIT)
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* PUSH UP */}
                            <div>
                                <div className="flex justify-between mb-1.5 ml-1">
                                    <label className="text-xs text-neutral-400">PUSH UP</label>
                                    <span className="text-[10px] text-emerald-500 font-bold">Target: 43</span>
                                </div>
                                <input type="number" name="pushUp" placeholder="0" className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none font-mono"/>
                            </div>

                            {/* SIT UP */}
                            <div>
                                <div className="flex justify-between mb-1.5 ml-1">
                                    <label className="text-xs text-neutral-400">SIT UP</label>
                                    <span className="text-[10px] text-emerald-500 font-bold">Target: 40</span>
                                </div>
                                <input type="number" name="sitUp" placeholder="0" className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none font-mono"/>
                            </div>

                            {/* PULL UP */}
                            <div>
                                <div className="flex justify-between mb-1.5 ml-1">
                                    <label className="text-xs text-neutral-400">PULL UP / CHANNING</label>
                                    <span className="text-[10px] text-emerald-500 font-bold">Target: 17</span>
                                </div>
                                <input type="number" name="pullUp" placeholder="0" className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none font-mono"/>
                            </div>

                            {/* SHUTTLE RUN */}
                            <div>
                                <div className="flex justify-between mb-1.5 ml-1">
                                    <label className="text-xs text-neutral-400">SHUTTLE RUN (DETIK)</label>
                                    <span className="text-[10px] text-emerald-500 font-bold">Target: 16.2s</span>
                                </div>
                                <input type="number" step="0.1" name="shuttleRun" placeholder="18.5" className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none font-mono"/>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 group">
                        <Save size={18} className="group-hover:scale-110 transition-transform" /> SIMPAN LAPORAN KE MARKAS
                    </button>
                    
                    <p className="text-center text-[10px] text-neutral-500 font-mono">
                        *Data akan dianalisa oleh AI untuk menentukan menu latihan besok. Jujurlah pada diri sendiri.
                    </p>
                </form>
            </div>

            {/* KOLOM KANAN: INFO GRAFIK SINKRONISASI */}
            <div className="hidden lg:block space-y-6">
                <div className="bg-gradient-to-br from-indigo-900/20 to-black border border-indigo-500/30 p-6 rounded-xl">
                    <h3 className="text-indigo-400 font-black uppercase text-sm mb-4 flex items-center gap-2">
                        <TrendingUp size={16}/> Sinkronisasi Data
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                        Data yang Anda input akan langsung mempengaruhi <strong>Grafik Segitiga JAR-LAT-SUH</strong> di Dashboard Utama.
                    </p>
                    <ul className="space-y-3 text-xs">
                        <li className="flex gap-3 text-neutral-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></span>
                            <span><strong>LAT (Pelatihan):</strong> Diambil dari skor Lari, Push-up, dll.</span>
                        </li>
                        <li className="flex gap-3 text-neutral-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span>
                            <span><strong>SUH (Pengasuhan):</strong> AI akan memberikan Misi Harian jika skor fisik menurun.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-neutral-900/30 border border-neutral-800 p-6 rounded-xl">
                    <h4 className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-2">CATATAN PELATIH</h4>
                    <p className="text-sm text-white italic">
                        "Jangan memanipulasi data. AI Intelligence dapat mendeteksi anomali jika progress fisik tidak masuk akal dalam waktu singkat."
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}