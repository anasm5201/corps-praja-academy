"use client";

import { useState } from "react";
import { updatePhysicalProfile } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function PhysicalInputForm({ initialData }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State Data
  const [height, setHeight] = useState(initialData?.height || 170);
  const [weight, setWeight] = useState(initialData?.weight || 60);
  
  // State Input Samapta
  const [runDistance, setRunDistance] = useState(initialData?.runDistance || 0);
  const [pushUp, setPushUp] = useState(initialData?.pushUpRecord || 0);
  const [sitUp, setSitUp] = useState(initialData?.sitUpRecord || 0);
  const [pullUp, setPullUp] = useState(initialData?.pullUpRecord || 0);
  const [shuttle, setShuttle] = useState(initialData?.shuttleRun || 0);

  // Hitung BMI Realtime
  const heightM = height / 100;
  const bmi = heightM > 0 ? parseFloat((weight / (heightM * heightM)).toFixed(1)) : 0;
  
  // Tentukan Status BMI
  let bmiStatus = "NORMAL";
  let bmiColor = "text-green-500";
  let bmiBorder = "border-green-500";
  
  if (bmi < 18.5) { bmiStatus = "UNDERWEIGHT"; bmiColor = "text-yellow-500"; bmiBorder = "border-yellow-500"; }
  else if (bmi >= 25) { bmiStatus = "OVERWEIGHT"; bmiColor = "text-red-500"; bmiBorder = "border-red-500"; }

  // Fungsi Simpan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("height", height.toString());
    formData.append("weight", weight.toString());
    formData.append("runDistance", runDistance.toString());
    formData.append("pushUpReps", pushUp.toString());
    formData.append("sitUpReps", sitUp.toString());
    formData.append("pullUpReps", pullUp.toString());
    formData.append("shuttleRunSec", shuttle.toString());

    // Gunakan 'as any' untuk menghindari error tipe return void
    const result = (await updatePhysicalProfile(formData)) as any;
    
    // FIX: Hapus duplikasi blok if, hanya pakai satu
    if (result?.success) { 
      alert("DATA BIO-METRIK DIPERBARUI. KEEP TRAINING, KADET!");
      router.refresh();
    } else {
      alert("Gagal update data. Silakan coba lagi.");
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* KOLOM KIRI: BODY STATS (BMI) */}
      <div className="lg:col-span-1 space-y-6">
        <div className={`bg-black border-2 ${bmiBorder} p-8 rounded-3xl relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500`}>
           
           <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">KONDISI TUBUH (BMI)</h3>
           
           <div className="flex items-end gap-2 mb-2">
             <span className={`text-7xl font-black ${bmiColor} tracking-tighter`}>{bmi}</span>
             <span className="text-lg font-bold text-gray-500 mb-2">kg/m²</span>
           </div>
           
           <div className={`inline-block px-3 py-1 rounded bg-black border ${bmiBorder} ${bmiColor} text-xs font-black uppercase tracking-widest`}>
             STATUS: {bmiStatus}
           </div>

           {/* Visual Bar BMI */}
           <div className="w-full h-2 bg-gray-800 rounded-full mt-6 overflow-hidden relative">
             {/* Marker posisi BMI user */}
             <div 
               className={`absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white] transition-all duration-1000 z-10`} 
               style={{ left: `${Math.min(((bmi - 15) / 20) * 100, 100)}%` }}
             ></div>
             
             {/* Zones */}
             <div className="absolute inset-0 flex">
                 <div className="w-[20%] bg-yellow-900/50"></div> {/* Under */}
                 <div className="w-[30%] bg-green-900/50"></div>  {/* Normal */}
                 <div className="w-[50%] bg-red-900/50"></div>    {/* Over */}
             </div>
           </div>
           <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-1">
             <span>15</span>
             <span>18.5</span>
             <span>25</span>
             <span>35+</span>
           </div>
        </div>

        {/* INPUT TINGGI & BERAT */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
           <InputGroup label="TINGGI BADAN (CM)" value={height} onChange={setHeight} icon="📏" />
           <InputGroup label="BERAT BADAN (KG)" value={weight} onChange={setWeight} icon="⚖️" />
        </div>
      </div>

      {/* KOLOM KANAN: SAMAPTA PERFORMANCE */}
      <div className="lg:col-span-2 space-y-6">
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformanceCard 
               title="LARI 12 MENIT" 
               icon="🏃" 
               value={runDistance} 
               onChange={setRunDistance} 
               unit="Meter" 
               target={3000} 
               desc="Target IPDN/STAN: > 2800m"
            />
            <PerformanceCard 
               title="PUSH UP (1 MENIT)" 
               icon="💪" 
               value={pushUp} 
               onChange={setPushUp} 
               unit="Reps" 
               target={40} 
               desc="Target Maksimal: 43x"
            />
            <PerformanceCard 
               title="SIT UP (1 MENIT)" 
               icon="🔄" 
               value={sitUp} 
               onChange={setSitUp} 
               unit="Reps" 
               target={40} 
               desc="Target Maksimal: 40x"
            />
            <PerformanceCard 
               title="PULL UP (1 MENIT)" 
               icon="🏋️" 
               value={pullUp} 
               onChange={setPullUp} 
               unit="Reps" 
               target={10} 
               desc="Target Maksimal: 17x (Pria)"
            />
            <div className="md:col-span-2">
               <PerformanceCard 
                  title="SHUTTLE RUN (ANGKA 8)" 
                  icon="⏱️" 
                  value={shuttle} 
                  onChange={setShuttle} 
                  unit="Detik" 
                  target={16.2} 
                  desc="Semakin kecil semakin baik (Target < 16.2s)"
                  isReverse // Logic terbalik: makin kecil makin bagus
               />
            </div>
         </div>

         {/* SUBMIT BUTTON */}
         <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-5 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "MENGANALISIS DATA..." : "UPDATE DATA FISIK ➔"}
            </button>
            <p className="text-center text-[10px] text-gray-500 mt-3 font-mono">
              *Data ini akan mempengaruhi grafik Radar Tritunggal di Dashboard.
            </p>
         </div>

      </div>

    </form>
  );
}

// --- SUB COMPONENTS ---

function InputGroup({ label, value, onChange, icon }: any) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg grayscale group-focus-within:grayscale-0 transition-all">{icon}</div>
        <input 
          type="number" 
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-black border border-white/20 text-white pl-12 pr-4 py-3 rounded-xl focus:border-yellow-500 outline-none font-mono font-bold transition-all text-lg"
        />
      </div>
    </div>
  )
}

function PerformanceCard({ title, icon, value, onChange, unit, target, desc, isReverse = false }: any) {
  // Hitung Progress Bar
  // Jika Reverse (Shuttle Run): Target/Value * 100 (biar makin kecil value, makin penuh barnya, max 100)
  // Jika Normal: Value/Target * 100
  let progress = 0;
  if (isReverse) {
      // Logic kasar untuk shuttle run: Asumsi range 25s (0%) sampai 15s (100%)
      progress = value > 0 ? Math.max(0, Math.min(100, (25 - value) * 10)) : 0; 
  } else {
      progress = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  }

  // Warna Progress
  let progressColor = "bg-red-600";
  if (progress > 50) progressColor = "bg-yellow-500";
  if (progress >= 100) progressColor = "bg-green-500";

  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-yellow-500/30 transition-all group h-full flex flex-col justify-between">
       <div>
         <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded bg-black border border-white/20 flex items-center justify-center text-lg">{icon}</div>
               <div>
                  <h4 className="text-xs font-bold text-white uppercase">{title}</h4>
                  <p className="text-[9px] text-gray-500">{desc}</p>
               </div>
            </div>
            <div className="text-right">
               <span className="text-xs font-mono text-gray-500">TARGET</span>
               <div className="text-xs font-bold text-yellow-500">{target} {unit}</div>
            </div>
         </div>

         <div className="relative">
            <input 
              type="number" 
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white font-mono font-bold focus:border-yellow-500 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-bold uppercase">{unit}</span>
         </div>
       </div>

       {/* Progress Bar Kecil di Bawah */}
       <div className="w-full h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
          <div className={`h-full ${progressColor} transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
       </div>
    </div>
  )
}