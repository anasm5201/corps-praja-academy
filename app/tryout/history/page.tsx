'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, History, Zap, ChevronRight, 
  Target, Activity, TrendingDown, Clock
} from 'lucide-react';
// Library visualisasi untuk memantau peningkatan refleks
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid 
} from 'recharts';

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/user/history');
        const data = await res.json();
        setAttempts(data);
      } catch (err) {
        console.error("CRITICAL ERROR: Jalur logistik arsip terputus");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // --- LOGIKA TRANSFORMASI DATA (VISUALISASI TREN) ---
  const chartData = attempts.map(item => ({
    date: new Date(item.finishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    avgTime: 45 + Math.floor(Math.random() * 25), // Simulasi data durasi per soal (detik)
    score: item.totalScore
  })).reverse();

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono text-red-600">
      <div className="animate-pulse tracking-[0.5em] uppercase">Accessing_Archives...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans p-8 relative">
      {/* SCANLINE & GRID BACKGROUND EFFECT */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:50px_50px] opacity-20 pointer-events-none fixed"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER: MISSION ARCHIVES COMMAND */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-red-900/30 pb-8 gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-red-900/20 p-4 border border-red-900/50 rounded shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <History className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white font-mono uppercase">Mission Archives</h1>
              <p className="text-xs text-red-500 tracking-[0.5em] font-bold uppercase mt-1">Intelligence Deployment Records</p>
            </div>
          </div>
          <Link href="/tryout" className="bg-white text-black px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all font-mono shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Return to Command Center
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR: SUMMARY STATS */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0A0A0A] border border-gray-800 p-6 relative overflow-hidden group">
              <Activity className="absolute right-[-10px] bottom-[-10px] w-20 h-20 text-gray-800 opacity-20 group-hover:text-red-600 transition duration-700" />
              <span className="text-[10px] text-gray-500 font-mono block mb-2 uppercase tracking-[0.2em]">Total Deployments</span>
              <div className="text-5xl font-black text-white font-mono">{attempts.length}</div>
            </div>

            <div className="bg-[#0A0A0A] border border-gray-800 p-6 relative overflow-hidden group">
              <Target className="absolute right-[-10px] bottom-[-10px] w-20 h-20 text-gray-800 opacity-20 group-hover:text-green-600 transition duration-700" />
              <span className="text-[10px] text-green-500 font-mono block mb-2 uppercase tracking-[0.2em]">Success Rate (MS)</span>
              <div className="text-5xl font-black text-green-500 font-mono">
                {attempts.length > 0 ? Math.round((attempts.filter(a => a.isPassed).length / attempts.length) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* MAIN SECTION: ANALYTICS & HISTORY TABLE */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* --- REFLEX SPEED TREND CHART --- */}
            <div className="bg-[#0A0A0A] border border-orange-900/30 p-8 shadow-[0_0_30px_rgba(249,115,22,0.05)]">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-900 pb-4">
                <Zap className="w-5 h-5 text-orange-500 animate-bounce" />
                <h2 className="text-sm font-black font-mono uppercase tracking-[0.3em] text-orange-500">
                  Combat Reflex Analysis // Response Trend
                </h2>
              </div>
              
              <div className="h-[250px] w-full font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                    <XAxis dataKey="date" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#444" fontSize={10} tickLine={false} axisLine={false} unit="s" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#050505', border: '1px solid #f97316', fontSize: '12px' }}
                      itemStyle={{ color: '#f97316' }}
                      cursor={{ stroke: '#f97316', strokeWidth: 1 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgTime" 
                      stroke="#f97316" 
                      strokeWidth={4} 
                      dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#000' }} 
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BATTLE LOG TABLE */}
            <div className="bg-[#0A0A0A] border border-red-900/20 overflow-x-auto shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-red-950/10 border-b border-red-900/30 font-mono text-[10px] tracking-widest text-red-500">
                  <tr>
                    <th className="p-6 uppercase">Mission Objectives</th>
                    <th className="p-6 uppercase">Engagement Date</th>
                    <th className="p-6 uppercase text-center">Final Score</th>
                    <th className="p-6 uppercase text-center">Status</th>
                    <th className="p-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900 font-mono">
                  {attempts.map((item) => (
                    <tr key={item.id} className="hover:bg-red-950/5 transition-all group">
                      <td className="p-6">
                        <div className="font-bold text-white uppercase text-sm mb-1 group-hover:text-red-500 transition">{item.package.title}</div>
                        <div className="text-[10px] text-gray-600 tracking-tighter uppercase font-black">Code: {item.package.category}</div>
                      </td>
                      <td className="p-6 text-xs text-gray-500">
                        {new Date(item.finishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="p-6 text-center">
                        <div className="text-2xl font-black text-white">{item.totalScore}</div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-1.5 text-[9px] font-black border-2 transition-all ${
                          item.isPassed 
                          ? 'border-green-900 text-green-500 bg-green-950/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                          : 'border-red-900 text-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]'
                        }`}>
                          {item.isPassed ? 'SUCCESS (MS)' : 'FAILED (TMS)'}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button className="p-3 border border-gray-800 hover:border-red-600 hover:bg-red-600/10 transition-all rounded shadow-inner">
                          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {attempts.length === 0 && (
                <div className="p-24 text-center">
                  <TrendingDown className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-600 font-mono text-sm uppercase tracking-[0.3em] italic">No tactical data found in archives.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}