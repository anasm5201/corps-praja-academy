"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PhysicalTrendChart({ data }: { data: any[] }) {
  // Membalik data agar tanggal lama di kiri, baru di kanan
  const chartData = [...data].reverse().map(item => ({
    date: new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    lari: item.runDistance,
    nilaiTotal: (item.runDistance / 30) // Simulasi konversi nilai kasar
  }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="colorLari" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
            itemStyle={{ color: '#ef4444' }}
          />
          <Line 
            type="monotone" 
            dataKey="lari" 
            stroke="#ef4444" 
            strokeWidth={3} 
            dot={{ fill: '#ef4444', r: 4 }} 
            activeDot={{ r: 6, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}