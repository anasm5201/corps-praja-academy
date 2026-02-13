'use client';

import { useState } from 'react';
import { ShieldCheck, Sun, Moon, BookOpen, Coffee, ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

const ACTIVITIES = [
  { id: 'subuh', label: 'IBADAH SUBUH / APEL PAGI', icon: Sun },
  { id: 'makan', label: 'TATA CARA MAKAN (PERDASPOL)', icon: Coffee },
  { id: 'belajar', label: 'MANDIRI TERSTRUKTUR (3 JAM)', icon: BookOpen },
  { id: 'malam', label: 'IBADAH MALAM / APEL MALAM', icon: Moon },
];

export default function DailyLogPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleActivity = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Jalur transmisi data ke API
    await fetch('/api/user/daily-log', {
      method: 'POST',
      body: JSON.stringify({ items: selected })
    });
    alert("LAPORAN DITERIMA! RADAR KARAKTER DIPERBARUI.");
    window.location.href = '/tryout';
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 font-mono">
      <div className="max-w-3xl mx-auto">
        <Link href="/tryout" className="flex items-center gap-2 text-red-500 mb-8 hover:text-white transition">
          <ChevronLeft className="w-4 h-4" /> BACK_TO_COMMAND_CENTER
        </Link>

        <div className="border-l-4 border-red-600 pl-6 mb-12">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Daily Log Discipline</h1>
          <p className="text-xs text-red-500 tracking-[0.3em] font-bold uppercase mt-1">Laporan Pengasuhan Kadet</p>
        </div>

        <div className="space-y-4">
          {ACTIVITIES.map((act) => {
            const Icon = act.icon;
            const isSelected = selected.includes(act.id);
            return (
              <button
                key={act.id}
                onClick={() => toggleActivity(act.id)}
                className={`w-full p-6 border transition-all flex items-center justify-between group ${
                  isSelected ? 'bg-red-950/20 border-red-600 text-white' : 'bg-[#0A0A0A] border-gray-900 text-gray-500 hover:border-red-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-red-500' : 'text-gray-700 group-hover:text-red-900'}`} />
                  <span className="font-bold text-sm tracking-widest">{act.label}</span>
                </div>
                {isSelected && <ShieldCheck className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selected.length === 0 || submitting}
          className="w-full mt-12 py-5 bg-red-600 text-white font-black tracking-[0.5em] uppercase hover:bg-red-500 disabled:bg-gray-900 disabled:text-gray-700 transition-all shadow-[0_0_30px_rgba(220,38,38,0.2)] flex items-center justify-center gap-3"
        >
          <Save className="w-5 h-5" /> {submitting ? 'TRANSMITTING...' : 'KIRIM LAPORAN'}
        </button>
        
        <p className="mt-6 text-[10px] text-gray-600 text-center uppercase tracking-widest leading-relaxed">
          Palsu dalam laporan berarti pengkhianatan terhadap kehormatan KORPS.
        </p>
      </div>
    </div>
  );
}