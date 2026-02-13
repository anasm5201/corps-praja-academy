"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function XPChart({ data }: { data: any[] }) {
  
  // Data Dummy jika kosong
  const chartData = data && data.length > 0 ? data.map((d, i) => ({
    name: `Misi ${i + 1}`,
    score: d.score,
    xp: d.score * 10 
  })) : [
    { name: 'Start', score: 0 },
    { name: 'Misi 1', score: 0 },
    { name: 'Misi 2', score: 0 },
    { name: 'Misi 3', score: 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis 
            dataKey="name" 
            stroke="#666" 
            tick={{fontSize: 10}} 
            axisLine={false}
            tickLine={false}
        />
        <YAxis 
            stroke="#666" 
            tick={{fontSize: 10}} 
            axisLine={false}
            tickLine={false}
        />
        <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff', fontSize: '12px' }}
        />
        <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#22c55e" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorXP)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}