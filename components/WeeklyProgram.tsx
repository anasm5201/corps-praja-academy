"use client";
import { ClipboardList, CheckCircle2, Flame, Dumbbell } from "lucide-react";

type TrainingPlan = {
  level: string;
  focus: string;
  schedule: { day: string; activity: string; intensity: string }[];
};

export default function WeeklyProgram({ runDistance }: { runDistance: number }) {
  
  // --- ALGORITMA PENENTU PROGRAM (THE BRAIN) ---
  const generatePlan = (): TrainingPlan => {
    // 1. LEVEL ROOKIE (Fisik Kurang / < 2000m) - Fokus Bangun Pondasi
    if (runDistance < 2000) {
      return {
        level: "ROOKIE (FOUNDATION PHASE)",
        focus: "Membangun VO2 Max & Daya Tahan Kaki",
        schedule: [
          { day: "Senin", activity: "Jogging Kontinu 30 Menit (Nafas Hidung)", intensity: "Low" },
          { day: "Selasa", activity: "Circuit Training (Push/Sit/Pull) 3 Set", intensity: "Medium" },
          { day: "Rabu", activity: "Rest / Stretching Aktif", intensity: "-" },
          { day: "Kamis", activity: "Lari Interval (400m x 4 Reps)", intensity: "High" },
          { day: "Jumat", activity: "Renang / Cross Training", intensity: "Low" },
          { day: "Sabtu", activity: "Long Run 3KM (Pace Santai)", intensity: "Medium" },
          { day: "Minggu", activity: "Rest Total", intensity: "-" },
        ]
      };
    } 
    // 2. LEVEL WARRIOR (Fisik Sedang / 2000m - 2800m) - Fokus Speed & Power
    else if (runDistance >= 2000 && runDistance < 2800) {
      return {
        level: "WARRIOR (DEVELOPMENT PHASE)",
        focus: "Meningkatkan Speed & Repetisi Samapta B",
        schedule: [
          { day: "Senin", activity: "Lari 12 Menit (Simulasi Tes)", intensity: "High" },
          { day: "Selasa", activity: "Pyramid Push Up & Pull Up (Max Reps)", intensity: "High" },
          { day: "Rabu", activity: "Recovery Run 3KM", intensity: "Low" },
          { day: "Kamis", activity: "Sprint 100m x 10 Reps", intensity: "Extreme" },
          { day: "Jumat", activity: "Strength Training (Gym/Bodyweight)", intensity: "Medium" },
          { day: "Sabtu", activity: "Fartlek (Lari Variasi Speed) 20 Menit", intensity: "High" },
          { day: "Minggu", activity: "Rest", intensity: "-" },
        ]
      };
    }
    // 3. LEVEL ELITE (Fisik Bagus / > 2800m) - Fokus Maintenance
    else {
      return {
        level: "ELITE (MAINTENANCE PHASE)",
        focus: "Menjaga Performa & Tapping",
        schedule: [
          { day: "Senin", activity: "Maintenance Run 5KM", intensity: "Medium" },
          { day: "Selasa", activity: "Calisthenics Weighted (Rompi Pemberat)", intensity: "High" },
          { day: "Rabu", activity: "Renang 1000m", intensity: "Low" },
          { day: "Kamis", activity: "Speed Play / Agility Drill", intensity: "Medium" },
          { day: "Jumat", activity: "Rest Active (Yoga/Stretching)", intensity: "-" },
          { day: "Sabtu", activity: "Time Trial Samapta Lengkap (A+B)", intensity: "Max" },
          { day: "Minggu", activity: "Rest", intensity: "-" },
        ]
      };
    }
  };

  const plan = generatePlan();

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-xl overflow-hidden mt-8">
      {/* HEADER PROGRAM */}
      <div className="bg-red-900/20 p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest mb-1">
              <Flame size={14} /> JARLATSUH AUTOMATION
           </div>
           <h3 className="text-2xl font-black text-white uppercase italic">
              PROGRAM: {plan.level}
           </h3>
           <p className="text-gray-400 text-sm mt-1">Fokus Minggu Ini: <span className="text-white">{plan.focus}</span></p>
        </div>
        <div className="bg-black/50 border border-white/10 px-4 py-2 rounded text-right">
           <div className="text-[10px] text-gray-500 uppercase">STATUS PROGRAM</div>
           <div className="text-green-500 font-bold text-sm flex items-center gap-2">
              <CheckCircle2 size={16}/> AKTIF
           </div>
        </div>
      </div>

      {/* TABLE JADWAL */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {plan.schedule.map((item, idx) => (
             <div key={idx} className={`p-4 rounded-lg border ${item.activity.includes('Rest') ? 'border-dashed border-gray-700 bg-transparent opacity-50' : 'border-white/10 bg-white/5 hover:bg-white/10'} transition-all group relative overflow-hidden`}>
                <div className="flex justify-between items-center mb-2 relative z-10">
                   <span className="text-xs font-bold text-red-500 uppercase flex items-center gap-2">
                     <Dumbbell size={12} className="opacity-0 group-hover:opacity-100 transition-opacity"/> {item.day}
                   </span>
                   <span className={`text-[10px] px-2 py-0.5 rounded ${
                      item.intensity === 'High' || item.intensity === 'Extreme' ? 'bg-red-600 text-white' :
                      item.intensity === 'Medium' ? 'bg-yellow-600 text-black' : 'bg-gray-700 text-gray-300'
                   } font-bold uppercase`}>
                      {item.intensity}
                   </span>
                </div>
                <h4 className="text-sm font-bold text-white leading-tight relative z-10">{item.activity}</h4>
             </div>
           ))}
        </div>
        
        <div className="mt-6 flex items-center gap-3 text-xs text-gray-500 italic bg-black/30 p-3 rounded">
           <ClipboardList size={16} />
           Catatan: Program ini dibuat otomatis oleh sistem berdasarkan hasil Tes Lari terakhir ({runDistance} meter). Update data fisik untuk evaluasi program baru.
        </div>
      </div>
    </div>
  );
}