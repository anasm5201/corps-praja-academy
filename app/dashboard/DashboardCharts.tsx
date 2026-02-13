"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function DashboardCharts({ data }: { data: any[] }) {
    // Format data untuk grafik (Reverse agar dari lama ke baru)
    const chartData = [...data].reverse().map((d, i) => ({
        name: `TO ${i+1}`,
        score: d.score,
        date: new Date(d.createdAt).toLocaleDateString()
    }));

    if (chartData.length === 0) {
        return <div className="h-full flex items-center justify-center text-gray-600 text-xs">Belum ada data tempur.</div>;
    }

    return (
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#666'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fill: '#666'}} axisLine={false} tickLine={false} domain={[0, 550]} />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px'}}
                        itemStyle={{color: '#fff'}}
                    />
                    <Area type="monotone" dataKey="score" stroke="#EAB308" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}