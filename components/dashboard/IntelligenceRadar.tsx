"use client";

import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react';

interface RadarProps {
  data: { subject: string; A: number; fullMark: number }[];
}

export default function IntelligenceRadar({ data }: RadarProps) {
  // Hitung Rata-rata Total untuk Analisis Singkat
  const totalScore = data.reduce((acc, curr) => acc + curr.A, 0);
  const avgTotal = Math.round(totalScore / data.length);

  let analysis = "DATA BELUM CUKUP";
  let color = "text-gray-500";

  if (avgTotal > 80) { analysis = "SANGAT POTENSIAL (ELITE)"; color = "text-green-500"; }
  else if (avgTotal > 60) { analysis = "KOMPETEN (PERLU DRILL)"; color = "text-blue-500"; }
  else if (avgTotal > 0) { analysis = "KRITIS (BUTUH PERHATIAN)"; color = "text-red-500"; }

  return (
    <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all duration-500">
      
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
           <h3 className="text-white font-black uppercase tracking-tighter flex items-center gap-2">
             <BrainCircuit className="text-blue-500" size={20}/> PETA KECERDASAN
           </h3>
           <p className="text-[10px] text-gray-500 font-mono mt-1">REAL-TIME JAR ANALYSIS</p>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-bold">RATA-RATA</p>
            <p className={`text-2xl font-black ${color}`}>{avgTotal}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] w-full relative z-10">
        {avgTotal === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
              <AlertTriangle size={32} className="opacity-50"/>
              <span className="text-xs font-mono">BELUM ADA DATA TES</span>
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Radar
                name="Skor Anda"
                dataKey="A"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="#3b82f6"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer / Analisis Cepat */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <TrendingUp size={14} className={color}/>
            <span className={`text-xs font-bold ${color} uppercase`}>{analysis}</span>
         </div>
         <span className="text-[10px] text-gray-600 font-mono">UPDATED NOW</span>
      </div>
    </div>
  );
}