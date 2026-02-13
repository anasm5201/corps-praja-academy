"use client";

import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell
} from 'recharts';
import { BrainCircuit, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AnalyticsProps {
  radarData: any[]; // Data SKD (TWK/TIU/TKP)
  trendData: any[]; // Data Trend SKD
  trinityData: any[]; // Data JAR-LAT-SUH [NEW]
  lastScore: number;
}

export default function AnalyticsCharts({ radarData, trendData, trinityData, lastScore }: AnalyticsProps) {
  
  // Analisa Taktis JAR-LAT-SUH
  const analyzeTrinity = () => {
    const jar = trinityData.find(d => d.subject === 'JAR')?.A || 0;
    const lat = trinityData.find(d => d.subject === 'LAT')?.A || 0;
    const suh = trinityData.find(d => d.subject === 'SUH')?.A || 0;

    if (jar > 80 && lat > 80 && suh > 80) return "STATUS: ELITE (SIAP TEMPUR)";
    if (jar < 50) return "PERINGATAN: Aspek Intelektual (JAR) Kritis!";
    if (lat < 50) return "PERINGATAN: Fisik/Skill (LAT) perlu digenjot!";
    if (suh < 50) return "PERINGATAN: Disiplin (SUH) rendah. Perbaiki sikap!";
    return "STATUS: STABIL (Pertahankan Konsistensi)";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 1. TRINITY RADAR (CORE IDENTITY) */}
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-[#dc2626]/30 transition-all">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#dc2626]"/> STATUS KADET
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">Keseimbangan JAR - LAT - SUH</p>
            </div>
            <div className="text-right">
                <span className="text-[9px] font-mono text-blue-400 block">{analyzeTrinity()}</span>
            </div>
        </div>
        
        <div className="h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={trinityData}>
                    <PolarGrid stroke="#333" strokeDasharray="3 3"/>
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#fff', fontSize: 11, fontWeight: '900' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    
                    {/* Radar JAR-LAT-SUH berwarna Merah/Oranye Taktis */}
                    <Radar
                        name="Trinity"
                        dataKey="A"
                        stroke="#dc2626"
                        strokeWidth={3}
                        fill="#dc2626"
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-600/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
      </div>

      {/* 2. SKD TREND CHART (PROGRESS REPORT) */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 relative">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-500"/> Progres Intelektual
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">Grafik Performa Tryout SKD</p>
            </div>
            <div className="text-right">
                <span className="block text-2xl font-black text-white">{lastScore}</span>
                <span className="text-[9px] text-gray-500 uppercase">Skor Terakhir</span>
            </div>
        </div>

        <div className="h-[250px] w-full">
             {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="name" tick={{fill: '#444', fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis hide domain={[0, 550]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 border border-dashed border-white/10 rounded-xl">
                    <AlertTriangle size={24} className="mb-2"/>
                    <p className="text-[10px] font-mono">BELUM ADA DATA OPERASI</p>
                </div>
             )}
        </div>
      </div>

    </div>
  );
}