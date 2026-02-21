"use client";
import { Zap, Activity, Target, ShieldAlert } from "lucide-react";

interface ProgressStats {
  lat: number;
  jar: number;
  suh: number;
}

export default function ProgressHeader({ stats }: { stats: ProgressStats }) {
  const totalReadiness = Math.round((stats.lat + stats.jar + stats.suh) / 3);
  
  // Penentuan Status Berdasarkan Persentase
  const getStatus = (val: number) => {
    if (val < 40) return { label: "INADEQUATE", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/50" };
    if (val < 75) return { label: "DEVELOPING", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/50" };
    return { label: "COMBAT READY", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/50" };
  };

  const status = getStatus(totalReadiness);

  return (
    <div className="relative mb-12 group">
      {/* Glow Effect Background */}
      <div className={`absolute -inset-1 ${status.bg} blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      
      <div className={`relative bg-black/60 border ${status.border} p-6 rounded-sm backdrop-blur-xl`}>
        <div className="flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
          
          {/* SISI KIRI: INDIKATOR UTAMA */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${status.color} animate-pulse`}></div>
              <h4 className="text-[10px] font-black tracking-[0.4em] text-neutral-500 uppercase">System Readiness Index</h4>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-black text-white italic tracking-tighter">{totalReadiness}%</span>
              <div className="flex flex-col">
                <span className={`text-sm font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                <span className="text-[10px] font-mono text-neutral-600 uppercase">Operational Status</span>
              </div>
            </div>
          </div>

          {/* TENGAH: TRI-AXIS VISUALIZER */}
          <div className="flex-1 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Jasmani (LAT)', val: stats.lat, color: 'from-amber-600 to-amber-400', icon: <Zap size={14}/> },
              { label: 'Akademik (JAR)', val: stats.jar, color: 'from-blue-600 to-blue-400', icon: <Target size={14}/> },
              { label: 'Pengasuhan (SUH)', val: stats.suh, color: 'from-purple-600 to-purple-400', icon: <Activity size={14}/> }
            ].map((matra) => (
              <div key={matra.label} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-neutral-400 flex items-center gap-2">{matra.icon} {matra.label}</span>
                  <span className="text-white">{matra.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full bg-gradient-to-r ${matra.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${matra.val}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER HUD: DYNAMIC COMMANDS */}
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-4 text-neutral-500">
           <ShieldAlert size={14} className={status.color}/>
           <p className="text-[10px] font-mono uppercase tracking-widest italic">
             {totalReadiness < 50 
               ? "Warning: Disiplin terdeteksi menurun. Segera eksekusi misi yang tertunda!" 
               : "Elite Status Maintained: Lanjutkan konsistensi hingga akhir siklus."}
           </p>
        </div>
      </div>
    </div>
  );
}