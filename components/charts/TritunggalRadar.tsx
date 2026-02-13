"use client";

import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { ShieldCheck, BrainCircuit, Activity, Heart, MessageSquare } from 'lucide-react';

interface TritunggalProps {
  jar: number; // Pengajaran (Otak/Akademik)
  lat: number; // Pelatihan (Otot/Fisik)
  suh: number; // Pengasuhan (Watak/Karakter)
}

export default function TritunggalRadar({ jar = 0, lat = 0, suh = 0 }: TritunggalProps) {
  
  const data = [
    { subject: 'JAR (Otak)', A: jar, fullMark: 100 },
    { subject: 'LAT (Otot)', A: lat, fullMark: 100 },
    { subject: 'SUH (Watak)', A: suh, fullMark: 100 },
  ];

  // --- LOGIKA STATUS (KONSEP ASLI) ---
  const average = Math.round((jar + lat + suh) / 3);
  let status = "SEIMBANG";
  let color = "#22c55e"; 
  let textColor = "text-green-500";
  let borderColor = "border-green-500/30";
  let bgColor = "bg-green-500/10";

  if (average < 50) { 
      status = "KRITIS"; color = "#ef4444"; textColor = "text-red-500"; borderColor = "border-red-500/50"; bgColor = "bg-red-500/10";
  } else if (average < 75) { 
      status = "BERKEMBANG"; color = "#eab308"; textColor = "text-yellow-500"; borderColor = "border-yellow-500/50"; bgColor = "bg-yellow-500/10";
  }
  
  if (Math.abs(lat - jar) > 30 || Math.abs(lat - suh) > 30 || Math.abs(jar - suh) > 30) {
    status = "TIMPANG"; color = "#f97316"; textColor = "text-orange-500"; borderColor = "border-orange-500/50"; bgColor = "bg-orange-500/10";
  }

  // --- AI ADVICE GENERATOR (MODUL TAMBAHAN PASIF) ---
  const getAdvice = () => {
    if (status === "KRITIS") return "Segera lakukan remidial total di semua aspek. Fokus pada pemahaman dasar.";
    if (status === "TIMPANG") {
        if (lat < jar && lat < suh) return "Fisik (LAT) tertinggal jauh. Tambah porsi latihan jasmani harian.";
        if (jar < lat && jar < suh) return "Akademik (JAR) melemah. Perbanyak simulasi soal CAT.";
        if (suh < jar && suh < lat) return "Karakter (SUH) perlu diperkuat melalui pembiasaan disiplin.";
    }
    if (status === "BERKEMBANG") return "Teruskan ritme latihan. Sedikit lagi Anda mencapai ambang batas ideal.";
    if (status === "SEIMBANG" && average >= 75) return "Luar biasa! Pertahankan konsistensi Tritunggal Anda hingga hari-H.";
    return "Data belum mencukupi untuk analisa mendalam.";
  };

  return (
    <div className={`w-full flex flex-col bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
           <h3 className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
             <ShieldCheck size={14} className={textColor} /> TRITUNGGAL
           </h3>
           <p className="text-[9px] text-gray-500 font-mono mt-0.5">Analisa Keseimbangan Praja</p>
        </div>
        <div className={`px-2 py-1 rounded border ${borderColor} ${bgColor}`}>
           <span className={`text-[9px] font-black uppercase tracking-wider ${textColor}`}>
             {status}
           </span>
        </div>
      </div>

      {/* CHART AREA */}
      <div className="h-[200px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 9 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="A" stroke={color} fill={color} fillOpacity={0.4} strokeWidth={2} />
            <Tooltip contentStyle={{ backgroundColor: '#000', borderRadius: '8px', fontSize: '10px' }} />
          </RadarChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-2">
            <div className={`text-xl font-black ${textColor}`}>{average}</div>
        </div>
      </div>

      

      {/* ADVICE BOX (FITUR BARU) */}
      <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 flex gap-3 items-start">
        <MessageSquare size={16} className={`${textColor} shrink-0 mt-0.5`} />
        <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Saran Komandan:</p>
            <p className="text-[10px] text-gray-300 italic leading-relaxed">"{getAdvice()}"</p>
        </div>
      </div>

      {/* FOOTER STATS */}
      <div className="grid grid-cols-3 gap-2 text-center border-t border-white/5 pt-4 mt-4">
        <div>
          <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">JAR</p>
          <p className="text-sm font-black text-white">{jar}</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">LAT</p>
          <p className="text-sm font-black text-white">{lat}</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">SUH</p>
          <p className="text-sm font-black text-white">{suh}</p>
        </div>
      </div>
    </div>
  );
}