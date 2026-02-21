"use client";
import { Zap, Target, BrainCircuit, AlertTriangle, ShieldCheck, Crosshair, HeartHandshake } from "lucide-react";

interface Stats {
  lat: number;
  jar: number;
  suh: number;
}

export default function ProgressHeader({ stats }: { stats: Stats }) {
  // =====================================================================
  // 1. ALGORITMA KALIBRASI SINERGI (THE MATH ENGINE) - Tetap Dipertahankan
  // =====================================================================
  const rawAverage = (stats.lat + stats.jar + stats.suh) / 3;
  
  const maxStat = Math.max(stats.lat, stats.jar, stats.suh);
  const minStat = Math.min(stats.lat, stats.jar, stats.suh);
  const synergyGap = maxStat - minStat;
  
  const isImbalanced = synergyGap > 25;
  const penalty = isImbalanced ? Math.floor(synergyGap * 0.3) : 0;
  
  const trueReadiness = Math.max(0, Math.round(rawAverage - penalty));

  // =====================================================================
  // 2. AI MENTOR CONSTRUCTIVE FEEDBACK (EMPATI & ARAHAN)
  // =====================================================================
  let statusColor = "text-blue-500";
  let bgGlow = "bg-blue-500/10";
  let statusLabel = "SINKRONISASI OPTIMAL";
  let mentorQuote = "Disiplinmu sangat baik, Kadet. Ketiga matra berjalan seimbang. Mari pertahankan ritme indah ini.";

  if (rawAverage === 0) {
    statusColor = "text-neutral-500";
    bgGlow = "bg-neutral-500/10";
    statusLabel = "STANDBY MODE";
    mentorQuote = "Selamat datang. Perjalanan abdi negara yang besar dimulai dari satu misi kecil hari ini. Mari kita mulai langkah pertamamu, saya ada di sini untuk memandu.";
  } else if (isImbalanced) {
    statusColor = "text-amber-500"; // Mengubah merah menjadi amber (peringatan peduli, bukan kemarahan)
    bgGlow = "bg-amber-500/10";
    statusLabel = "PERLU KALIBRASI KESEIMBANGAN";
    
    // Arahan yang membangun, bukan menjatuhkan
    if (minStat === stats.lat) {
      mentorQuote = `Kadet, pencapaian akademik dan mentalmu sudah luar biasa, namun jasmanimu tertinggal (${stats.lat}%). Mari luangkan waktu untuk fisikmu hari ini agar tubuhmu kuat menopang kecerdasanmu saat tes nanti.`;
    } else if (minStat === stats.jar) {
      mentorQuote = `Fisikmu sangat prima, saya bangga melihatnya. Tapi mari kita seimbangkan dengan Matra Akademik (${stats.jar}%). Jangan biarkan potensimu tertahan. Ayo buka modulmu, asah logikamu perlahan namun pasti.`;
    } else {
      mentorQuote = `Dedikasimu di fisik dan teori sangat mengesankan, namun kesehatan mental dan sikap kerjamu butuh perhatian (${stats.suh}%). Ketenangan batin adalah senjata terkuatmu. Mari kita kalibrasi mentalmu hari ini.`;
    }
  } else if (trueReadiness < 50) {
    statusColor = "text-blue-400";
    bgGlow = "bg-blue-500/10";
    statusLabel = "PROSES PEMBENTUKAN";
    mentorQuote = "Kamu sedang dalam fase adaptasi dan itu sangat wajar. Teruslah konsisten, setiap usahamu hari ini sedang membangun fondasi kelulusanmu esok.";
  } else if (trueRenderiness >= 80) {
    statusColor = "text-emerald-400";
    bgGlow = "bg-emerald-500/10";
    statusLabel = "KONDISI ELIT: SIAP TEMPUR";
    mentorQuote = "Luar biasa! Keseimbangan dan dedikasimu pantas menjadi teladan. Kamu telah membuktikan bahwa kamu layak. Jaga apinya tetap menyala!";
  }

  // =====================================================================
  // 3. RENDER TACTICAL HUD
  // =====================================================================
  return (
    <div className={`relative p-6 bg-neutral-950 border ${isImbalanced ? 'border-amber-500/50' : 'border-neutral-800'} rounded-xl mb-10 overflow-hidden shadow-2xl transition-colors duration-500`}>
      
      {/* Efek Glow Radar */}
      <div className={`absolute -top-20 -right-20 w-64 h-64 ${bgGlow} blur-[80px] rounded-full pointer-events-none`} />

      {/* HEADER: STATUS & SKOR UTAMA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 relative z-10">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            {isImbalanced ? <HeartHandshake className={statusColor} size={24} /> : <Crosshair className={statusColor} size={24} />}
            <h4 className={`text-xs font-black uppercase tracking-[0.3em] ${statusColor}`}>
              {statusLabel}
            </h4>
          </div>
          
          <div className="flex items-baseline gap-4 mt-2">
            <span className="text-6xl font-black text-white tracking-tighter italic">{trueReadiness}%</span>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-[10px] font-mono uppercase tracking-widest">Kesiapan Sinergi</span>
              {penalty > 0 && (
                <span className="text-amber-500 text-xs font-medium flex items-center gap-1">
                  - {penalty}% Penyesuaian Keseimbangan
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KOTAK EVALUASI MENTOR (PEDULI & TERARAH) */}
        <div className={`w-full md:w-1/2 p-4 bg-black/40 border-l-4 ${isImbalanced ? 'border-amber-500' : 'border-blue-500'} rounded-r-lg backdrop-blur-sm`}>
          <p className="text-xs text-neutral-300 font-medium leading-relaxed">
            <span className="text-neutral-500 block mb-1 font-sans text-[9px] uppercase tracking-widest">[PESAN MENTOR]</span>
            "{mentorQuote}"
          </p>
        </div>
      </div>

      {/* THE MASTER BAR (COMPOSITE BAR) */}
      <div className="mb-8">
        <div className="h-4 w-full bg-neutral-900 rounded-full p-1 border border-neutral-800 relative">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isImbalanced ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-blue-700 to-blue-400'}`}
            style={{ width: `${trueReadiness}%` }}
          />
          {penalty > 0 && (
            <div 
              className="absolute top-1 bottom-1 bg-amber-500/20 rounded-full"
              style={{ left: `${trueReadiness}%`, width: `${penalty}%`, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(245,158,11,0.3) 4px, rgba(245,158,11,0.3) 8px)' }}
            />
          )}
        </div>
      </div>

      {/* BREAKDOWN: TRI-MATRA MICRO-BARS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-800/50">
        {[
          { label: 'Jasmani (LAT)', val: stats.lat, color: 'bg-green-500', isWeak: minStat === stats.lat && isImbalanced, icon: <Zap size={14}/> },
          { label: 'Akademik (JAR)', val: stats.jar, color: 'bg-blue-500', isWeak: minStat === stats.jar && isImbalanced, icon: <Target size={14}/> },
          { label: 'Pengasuhan (SUH)', val: stats.suh, color: 'bg-purple-500', isWeak: minStat === stats.suh && isImbalanced, icon: <BrainCircuit size={14}/> }
        ].map((m) => (
          <div key={m.label} className={`p-3 rounded-lg border transition-all ${m.isWeak ? 'bg-amber-500/5 border-amber-500/30' : 'bg-transparent border-transparent'}`}>
            <div className="flex justify-between items-center text-[10px] font-black uppercase mb-2 tracking-widest">
              <span className={`flex items-center gap-1.5 ${m.isWeak ? 'text-amber-400' : 'text-neutral-400'}`}>
                {m.icon} {m.label}
              </span>
              <span className={m.isWeak ? 'text-amber-400 font-bold' : 'text-white'}>{m.val}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${m.isWeak ? 'bg-amber-500' : m.color}`} 
                style={{ width: `${m.val}%` }} 
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}