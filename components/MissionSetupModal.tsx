'use client';

import { useState } from 'react';
import { Target, Calendar, Clock, Save, Shield } from 'lucide-react';

interface MissionSetupModalProps {
  onSave: (data: any) => void;
}

export default function MissionSetupModal({ onSave }: MissionSetupModalProps) {
  const [target, setTarget] = useState('IPDN');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return alert("TENTUKAN TANGGAL TEMPUR!");
    
    // Simpan data (bisa ke localStorage atau Database nanti)
    const missionData = { target, date, hours };
    localStorage.setItem('mission_config', JSON.stringify(missionData));
    onSave(missionData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0A0A0A] border-2 border-red-900/50 relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]">
        
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-600"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-600"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-600"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-600"></div>

        <div className="p-8">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-red-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-black text-white tracking-[0.2em] font-mono uppercase">
              INITIALIZE MISSION
            </h2>
            <p className="text-red-500 text-xs tracking-widest mt-2 uppercase">
              Tentukan Target Operasi Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* INPUT TARGET */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-mono uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3 h-3 text-red-500" /> Target Instansi
              </label>
              <select 
                value={target} 
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-[#111] border border-red-900/30 text-white p-3 font-mono focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 uppercase"
              >
                <option value="IPDN">IPDN (KEMENDAGRI)</option>
                <option value="STIN">STIN (BIN)</option>
                <option value="POLTEKIP">POLTEKIP/POLTEKIM (KEMENKUMHAM)</option>
                <option value="STAN">PKN STAN (KEMENKEU)</option>
                <option value="STIS">STIS (BPS)</option>
              </select>
            </div>

            {/* INPUT TANGGAL */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-mono uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3 h-3 text-red-500" /> Estimasi Tanggal Tes
              </label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#111] border border-red-900/30 text-white p-3 font-mono focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 uppercase [color-scheme:dark]"
              />
            </div>

            {/* INPUT JAM BELAJAR */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-mono uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3 h-3 text-red-500" /> Komitmen Latihan (Jam/Hari)
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" max="8" 
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="w-full accent-red-600 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xl font-bold text-red-500 font-mono w-12 text-center">{hours}H</span>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold tracking-[0.2em] uppercase transition shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500 mt-4 group relative overflow-hidden">
               <span className="relative z-10 flex items-center justify-center gap-2">
                 <Save className="w-4 h-4" /> CONFIRM PARAMETERS
               </span>
               <div className="absolute inset-0 h-full w-0 bg-white/20 transition-all duration-300 group-hover:w-full z-0"></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}