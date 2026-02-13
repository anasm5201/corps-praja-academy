'use client';

import { Star, Award, Shield } from 'lucide-react';

interface AchievementProps {
  code: string;
  name: string;
  description: string;
  awardedAt: string;
}

export default function MedalCase({ achievements }: { achievements: AchievementProps[] }) {
  return (
    <div className="w-full bg-[#080808] border border-yellow-900/30 p-6 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Award className="w-32 h-32 text-yellow-500" />
      </div>

      <div className="flex items-center gap-3 mb-6 border-b border-gray-900 pb-4">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
          Service_Ribbons_&_Stars
        </h3>
        <span className="text-[10px] text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
          TOTAL: {achievements.length}
        </span>
      </div>

      {achievements.length > 0 ? (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {achievements.map((item, idx) => (
            <div key={idx} className="group/medal relative flex flex-col items-center">
              {/* MEDAL ICON */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-gray-900 to-black border border-yellow-900/40 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.1)] group-hover/medal:border-yellow-500/80 group-hover/medal:shadow-[0_0_25px_rgba(234,179,8,0.3)] transition-all duration-500 cursor-help">
                <Star className="w-8 h-8 text-yellow-600 group-hover/medal:text-yellow-400 transition duration-300" />
              </div>
              
              {/* TOOLTIP DETAIL (HOVER) */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-black/95 border border-yellow-600 p-3 rounded opacity-0 group-hover/medal:opacity-100 transition pointer-events-none z-50 text-center shadow-2xl backdrop-blur-sm">
                <p className="text-[10px] text-yellow-500 font-bold uppercase mb-1 tracking-wider">{item.name}</p>
                <div className="h-px bg-gray-800 w-full mb-2"></div>
                <p className="text-[9px] text-gray-400 leading-relaxed font-mono mb-2">"{item.description}"</p>
                <p className="text-[8px] text-gray-600 uppercase">Awarded: {new Date(item.awardedAt).toLocaleDateString()}</p>
              </div>

              {/* LABEL KECIL */}
              <span className="mt-3 text-[8px] text-gray-500 font-mono uppercase tracking-widest text-center truncate w-full group-hover/medal:text-yellow-500 transition">
                {item.code.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-gray-700 opacity-50">
          <Shield className="w-10 h-10 mb-2" />
          <p className="text-[10px] uppercase tracking-widest">No Honors Awarded Yet</p>
        </div>
      )}
    </div>
  );
}