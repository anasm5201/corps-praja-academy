"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart
} from "recharts";

// --- WIDGET 1: RADAR TRITUNGGAL (REFINED) ---
export function TritunggalRadar({ data }: { data: any }) {
  const chartData = [
    { subject: 'JAR (Otak)', A: data?.jar || 0, fullMark: 100 },
    { subject: 'LAT (Fisik)', A: data?.lat || 0, fullMark: 100 },
    { subject: 'SUH (Mental)', A: data?.suh || 0, fullMark: 100 },
  ];

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Kemampuan"
            dataKey="A"
            stroke="#2563eb"
            strokeWidth={3}
            fill="#3b82f6"
            fillOpacity={0.3}
            // --- UPDATE: ANIMASI TAKTIS ---
            isAnimationActive={true}
            animationBegin={400}      // Muncul sedikit terlambat untuk efek dramatis
            animationDuration={2000}  // Mengembang halus selama 2 detik
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Overlay Angka Tengah dengan Efek Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_#3b82f6]"></div>
      </div>
    </div>
  );
}

// --- WIDGET 2: GRAFIK XP (REFINED) ---
export function XPChart({ data }: { data: any[] }) {
  const chartData = data && data.length > 0 
    ? data.map((attempt, index) => ({
        name: `Misi ${index + 1}`,
        xp: attempt.score,
      }))
    : [
        { name: 'Start', xp: 0 },
        { name: 'Misi 1', xp: 10 },
        { name: 'Misi 2', xp: 5 },
        { name: 'Misi 3', xp: 20 },
      ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          {/* Efek Gradien Hijau Emerald Taktis */}
          <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} opacity={0.5} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 10, fill: '#555' }} 
          axisLine={false} 
          tickLine={false} 
          dy={10}
        />
        <YAxis 
          tick={{ fontSize: 10, fill: '#555' }} 
          axisLine={false} 
          tickLine={false} 
          dx={-10}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#0a0a0a', 
            borderColor: '#333', 
            borderRadius: '12px', 
            fontSize: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
          }}
          itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
          cursor={{ stroke: '#333', strokeWidth: 1 }}
        />
        <Area 
          type="monotone"        // UPDATE: Garis melengkung halus
          dataKey="xp" 
          stroke="#10b981" 
          fillOpacity={1} 
          fill="url(#colorXp)" 
          strokeWidth={3}        // Garis lebih tebal
          // --- UPDATE: ANIMASI MELUNCUR ---
          isAnimationActive={true}
          animationDuration={2500}
          // FIX: Gunakan as any agar TypeScript tidak rewel soal efek bounce kustom
          animationEasing={"cubic-bezier(0.34, 1.56, 0.64, 1)" as any} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}