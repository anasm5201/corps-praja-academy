"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area 
} from 'recharts';
import { TrendingUp, Activity } from "lucide-react";

export default function DashboardCharts({ skdHistory, physicalHistory }: any) {
  
  // Format Tooltip Custom agar terlihat canggih
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-neutral-700 p-3 rounded-lg shadow-xl text-xs font-mono">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* --- GRAFIK 1: REKAM JEJAK SKD (JAR) --- */}
      <div className="bg-black border border-neutral-800 rounded-xl p-6 relative overflow-hidden group">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-500" /> REKAM JEJAK AKADEMIK
                </h3>
                <p className="text-[10px] text-neutral-500 font-mono mt-1">Progres Tryout TWK, TIU, & TKP</p>
            </div>
        </div>

        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={skdHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#fff', strokeWidth: 0.5, strokeDasharray: '5 5' }} />
                    
                    {/* GARIS PASSING GRADE (TARGET) */}
                    <ReferenceLine y={65} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'TWK', fill: '#ef4444', fontSize: 8 }} />
                    <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'right', value: 'TIU', fill: '#3b82f6', fontSize: 8 }} />
                    <ReferenceLine y={166} stroke="#22c55e" strokeDasharray="3 3" label={{ position: 'right', value: 'TKP', fill: '#22c55e', fontSize: 8 }} />

                    {/* GARIS DATA KADET */}
                    <Line type="monotone" dataKey="twk" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} name="TWK (Nasionalisme)" activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="tiu" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="TIU (Logika)" activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="tkp" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} name="TKP (Kepribadian)" activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* --- GRAFIK 2: REKAM JEJAK SAMAPTA (LAT) --- */}
      <div className="bg-black border border-neutral-800 rounded-xl p-6 relative overflow-hidden group">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity size={16} className="text-amber-500" /> REKAM JEJAK FISIK
                </h3>
                <p className="text-[10px] text-neutral-500 font-mono mt-1">Kurva Kebugaran vs Target Sempurna</p>
            </div>
            <div className="px-2 py-1 bg-amber-900/20 border border-amber-900/50 rounded text-[9px] text-amber-500 font-bold">
                TARGET: 100 PTS
            </div>
        </div>

        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={physicalHistory}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* GARIS TARGET SEMPURNA */}
                    <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.5} />

                    <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Nilai Samapta" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}