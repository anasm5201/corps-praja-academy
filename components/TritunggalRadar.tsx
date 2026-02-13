"use client";

import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { ShieldCheck, BrainCircuit, Activity, Heart } from 'lucide-react';

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

  // --- ANALISIS KECERDASAN AI (LOGIKA DIPERTAHANKAN & DIPERBAIKI) ---
  const average = Math.round((jar + lat + suh) / 3);
  
  let status = "SEIMBANG";
  let color = "#22c55e"; // Green (Aman)
  let textColor = "text-green-500";
  let borderColor = "border-green-500/30";
  let bgColor = "bg-green-500/10";
  let glowColor = "shadow-[0_0_20px_rgba(34,197,94,0.2)]";

  // Logika 1: Rata-rata Rendah (Critical)
  if (average < 50) { 
      status = "KRITIS"; 
      color = "#ef4444"; // Red (Bahaya)
      textColor = "text-red-500";
      borderColor = "border-red-500/50";
      bgColor = "bg-red-500/10";
      glowColor = "shadow-[0_0_20px_rgba(239,68,68,0.2)]";
  } 
  else if (average < 75) { 
      status = "BERKEMBANG"; 
      color = "#eab308"; // Yellow (Sedang)
      textColor = "text-yellow-500";
      borderColor = "border-yellow-500/50";
      bgColor = "bg-yellow-500/10";
      glowColor = "shadow-[0_0_20px_rgba(234,179,8,0.2)]";
  }
  
  // Logika 2: Ketimpangan (Imbalance Check)
  // Jika selisih antar aspek terlalu jauh (> 30 poin)
  if (Math.abs(lat - jar) > 30 || Math.abs(lat - suh) > 30 || Math.abs(jar - suh) > 30) {
    status = "TIMPANG";
    color = "#f97316"; // Orange
    textColor = "text-orange-500";
    borderColor = "border-orange-500/50";
    bgColor = "bg-orange-500/10";
    glowColor = "shadow-[0_0_20px_rgba(249,115,22,0.2)]";
  }

  // Jika semua 0 (User Baru)
  if (average === 0) {
      status = "NO DATA";
      color = "#6b7280"; // Gray
      textColor = "text-gray-500";
      borderColor = "border-gray-500/30";
      bgColor = "bg-gray-500/10";
      glowColor = "";
  }

  return (
    <div className={`w-full h-full flex flex-col justify-between relative bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 ${glowColor}`}>
      
      {/* HEADER: STATUS & LABEL */}
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
           <h3 className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2">
             <ShieldCheck size={14} className={textColor} /> TRITUNGGAL
           </h3>
           <p className="text-[9px] text-gray-500 font-mono mt-0.5">Analisa Keseimbangan Praja</p>
        </div>
        <div className={`px-2 py-1 rounded border ${borderColor} ${bgColor} animate-pulse`}>
           <span className={`text-[9px] font-black uppercase tracking-wider ${textColor}`}>
             {status}
           </span>
        </div>
      </div>

      {/* CHART AREA */}
      <div className="flex-grow relative min-h-[220px]">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-transparent to-transparent opacity-50 pointer-events-none"></div>
        
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#333" strokeDasharray="3 3"/>
            <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            
            <Radar
              name="Kapabilitas"
              dataKey="A"
              stroke={color}
              strokeWidth={3}
              fill={color}
              fillOpacity={0.4}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', fontSize: '10px', textTransform: 'uppercase', borderRadius: '8px' }}
              itemStyle={{ color: color }}
            />
          </RadarChart>
        </ResponsiveContainer>
        
        {/* Center Score Overlay (Skor Rata-Rata di Tengah) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-3">
            <div className={`text-2xl font-black ${textColor} opacity-90 drop-shadow-lg`}>
              {average}
            </div>
        </div>
      </div>

      {/* FOOTER: STATS DETAIL */}
      <div className="grid grid-cols-3 gap-2 text-center border-t border-white/5 pt-4 mt-2">
        <div className="group hover:bg-white/5 rounded-lg p-2 transition-colors border border-transparent hover:border-white/5">
          <div className="flex justify-center mb-1"><BrainCircuit size={14} className="text-blue-500"/></div>
          <p className="text-[9px] text-gray-500 uppercase font-bold">JAR</p>
          <p className="text-sm font-black text-white font-mono">{jar}</p>
        </div>
        <div className="group hover:bg-white/5 rounded-lg p-2 transition-colors border border-transparent hover:border-white/5">
          <div className="flex justify-center mb-1"><Activity size={14} className="text-red-500"/></div>
          <p className="text-[9px] text-gray-500 uppercase font-bold">LAT</p>
          <p className="text-sm font-black text-white font-mono">{lat}</p>
        </div>
        <div className="group hover:bg-white/5 rounded-lg p-2 transition-colors border border-transparent hover:border-white/5">
          <div className="flex justify-center mb-1"><Heart size={14} className="text-yellow-500"/></div>
          <p className="text-[9px] text-gray-500 uppercase font-bold">SUH</p>
          <p className="text-sm font-black text-white font-mono">{suh}</p>
        </div>
      </div>

    </div>
  );
}