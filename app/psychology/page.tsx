import { Eye, Brain, User, Lock, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PsychologyLobby() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#202020_1px,transparent_1px),linear-gradient(to_bottom,#202020_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 -z-10"></div>

      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 border-b border-gray-800 pb-6">
          <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-white mb-4 transition-colors text-sm font-mono">
             <ChevronLeft size={16} className="mr-1"/> KEMBALI KE MARKAS
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-red-600 mb-2 uppercase">
            Psychology Operations
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Pusat pelatihan ketahanan mental (Mental Endurance). Fokus pada kecepatan, ketelitian, dan stabilitas emosi di bawah tekanan.
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MODUL 1: KECERMATAN (ACTIVE) */}
          <Link href="/psychology/kecermatan" className="group">
            <div className="h-full border border-gray-800 bg-gradient-to-b from-gray-900 to-black hover:border-orange-500 p-8 rounded-2xl transition-all cursor-pointer relative overflow-hidden shadow-2xl group-hover:shadow-orange-900/20">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 blur-xl" />
              
              <div className="w-16 h-16 bg-orange-900/20 rounded-xl flex items-center justify-center border border-orange-500/30 mb-8 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Eye size={36} />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-3 group-hover:text-orange-500 transition-colors uppercase tracking-tight">
                Kecermatan
              </h3>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium">
                Simulasi Tes Koran/Simbol Hilang. Latih refleks mata dan konsentrasi dengan mekanisme "Rapid Fire".
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-black font-mono text-orange-500 bg-orange-950/30 px-2 py-1 rounded border border-orange-500/20">
                    STATUS: ONLINE
                  </span>
                  <span className="text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                    MULAI MISI &rarr;
                  </span>
              </div>
            </div>
          </Link>

          {/* MODUL 2: KECERDASAN (LOCKED) */}
          <div className="group relative opacity-50 grayscale hover:opacity-75 transition-all cursor-not-allowed">
            <div className="h-full border border-gray-800 bg-gray-950 p-8 rounded-2xl relative overflow-hidden">
               <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 rounded-full border border-gray-700 text-xs font-bold text-gray-400 backdrop-blur-sm shadow-xl">
                    <Lock size={12} /> CLASSIFIED / LOCKED
                  </div>
               </div>

              <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mb-8 text-gray-700 border border-gray-800">
                <Brain size={36} />
              </div>
              <h3 className="text-2xl font-black text-gray-600 mb-3 uppercase tracking-tight">Kecerdasan</h3>
              <p className="text-sm text-gray-700 mb-8 font-medium">
                Analogi, Silogisme, dan Deret. Logika taktis untuk penyelesaian masalah.
              </p>
            </div>
          </div>

          {/* MODUL 3: KEPRIBADIAN (LOCKED) */}
          <div className="group relative opacity-50 grayscale hover:opacity-75 transition-all cursor-not-allowed">
             <div className="h-full border border-gray-800 bg-gray-950 p-8 rounded-2xl relative overflow-hidden">
               <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 rounded-full border border-gray-700 text-xs font-bold text-gray-400 backdrop-blur-sm shadow-xl">
                    <Lock size={12} /> CLASSIFIED / LOCKED
                  </div>
               </div>

              <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mb-8 text-gray-700 border border-gray-800">
                <User size={36} />
              </div>
              <h3 className="text-2xl font-black text-gray-600 mb-3 uppercase tracking-tight">Kepribadian</h3>
              <p className="text-sm text-gray-700 mb-8 font-medium">
                Profiling karakter (PAPI/EPPS). Mental ideologi dan konsistensi sikap.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}