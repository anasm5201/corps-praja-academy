import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Crown, Medal, Shield, Star, Trophy, ChevronUp, ChevronDown, Minus } from "lucide-react";

// --- HELPER: HITUNG PANGKAT ---
const getRankName = (xp: number) => {
  if (xp > 20000) return { name: "PURNA PRAJA", stars: 4, color: "text-yellow-500", bg: "bg-yellow-500/20", border: "border-yellow-500" };
  if (xp > 10000) return { name: "PRAJA UTAMA", stars: 3, color: "text-red-500", bg: "bg-red-500/20", border: "border-red-500" };
  if (xp > 5000)  return { name: "PRAJA MADYA", stars: 2, color: "text-red-500", bg: "bg-red-500/20", border: "border-red-500" };
  if (xp > 1000)  return { name: "PRAJA MUDA",  stars: 1, color: "text-red-500", bg: "bg-red-500/20", border: "border-red-500" };
  return { name: "CAPRA", stars: 0, color: "text-neutral-500", bg: "bg-neutral-800", border: "border-neutral-700" };
};

// --- KOMPONEN PODIUM (DIPERBAIKI) ---
const PodiumStep = ({ cadet, rank, isUser }: { cadet: any, rank: number, isUser: boolean }) => {
    // Hitung pangkat untuk ditampilkan di Podium
    const rankInfo = getRankName(cadet.xp || 0);

    const rankStyle = rank === 1 
        ? "h-48 w-32 md:w-40 bg-gradient-to-t from-yellow-900/40 to-yellow-600/10 border-yellow-500/50 z-20 scale-110" 
        : rank === 2 
        ? "h-36 w-28 md:w-36 bg-gradient-to-t from-neutral-800 to-neutral-700/30 border-neutral-600 z-10" 
        : "h-28 w-28 md:w-36 bg-gradient-to-t from-amber-900/40 to-amber-700/10 border-amber-700 z-0";

    const avatarColor = rank === 1 ? "bg-yellow-500 text-black shadow-yellow-500/50" : rank === 2 ? "bg-gray-300 text-black shadow-white/20" : "bg-amber-700 text-white shadow-amber-700/50";
    const Icon = rank === 1 ? Crown : Medal;

    return (
        <div className="flex flex-col items-center justify-end group">
            {/* AVATAR & NAME */}
            <div className={`mb-3 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 delay-${rank * 100}`}>
                
                {/* 1. Avatar Besar */}
                <div className="relative mb-2">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg ${avatarColor} transition-transform group-hover:scale-105`}>
                        {cadet.name ? cadet.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    {rank === 1 && <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-bounce" size={36} fill="currentColor"/>}
                </div>

                {/* 2. Nama Lengkap */}
                <div className={`text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1 text-center max-w-[120px] md:max-w-[150px] truncate border ${isUser ? "bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)]" : "bg-black/80 border-white/10 text-white"}`}>
                    {cadet.name} 
                </div>

                {/* 3. Pangkat & XP */}
                <div className="flex flex-col items-center">
                    <span className={`text-[9px] font-bold uppercase ${rankInfo.color} mb-0.5`}>
                        {rankInfo.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                        {cadet.xp.toLocaleString()} XP
                    </span>
                </div>
            </div>

            {/* THE BLOCK */}
            <div className={`rounded-t-2xl border-x border-t flex items-start justify-center pt-4 relative backdrop-blur-md shadow-2xl ${rankStyle}`}>
                <span className="text-6xl font-black text-white/5 absolute bottom-0 select-none">{rank}</span>
                <div className="bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                    {rank === 1 ? <Icon size={16} className="text-yellow-400 fill-current"/> : <Icon size={16} className="text-white"/>}
                    <span className="text-xs font-bold text-white">#{rank}</span>
                </div>
            </div>
        </div>
    );
};

export default async function LeaderboardPage() {
  // 1. AMBIL SESI
  const session = await getServerSession(authOptions);

  // ✅ FIX: Amankan User ID (Bypass Type Check)
  const userId = (session?.user as any)?.id;

  // 2. CEK LOGIN (Redirect jika tidak ada ID)
  if (!userId) {
    redirect("/auth/login");
  }

  // 3. FETCH DATA (Sort by XP)
  const topCadets = await prisma.user.findMany({
    take: 50,
    orderBy: { xp: 'desc' },
    select: { id: true, name: true, xp: true },
  });

  // Urutan Podium: 2 - 1 - 3 (Kiri - Tengah - Kanan)
  // topCadets[0] adalah Rank 1, topCadets[1] adalah Rank 2, dst.
  const podiumCadets = [topCadets[1], topCadets[0], topCadets[2]].filter(Boolean); 
  
  // Sisanya masuk list (Rank 4 ke bawah)
  const listCadets = topCadets.slice(3); 

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
        <div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                <Trophy className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" size={48} />
                <div>
                    HALL OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">FAME</span>
                </div>
            </h1>
            <p className="text-neutral-400 text-sm font-mono mt-2 ml-1">
                ELITE RANKING SYSTEM // CORPS PRAJA ACADEMY
            </p>
        </div>
        <div className="flex items-center gap-3 bg-neutral-900 border border-yellow-500/20 px-5 py-2.5 rounded-xl shadow-lg">
             <Shield size={16} className="text-yellow-500"/>
             <span className="text-xs text-yellow-500 font-bold tracking-[0.2em] uppercase">TERITORIAL 1</span>
        </div>
      </div>

      {/* --- BAGIAN 1: THE PODIUM (TOP 3) --- */}
      {topCadets.length > 0 ? (
          <div className="flex justify-center items-end gap-4 md:gap-8 pt-4 pb-8 min-h-[350px]">
              {/* RANK 2 */}
              {topCadets[1] && (
                <PodiumStep 
                    cadet={topCadets[1]} 
                    rank={2} 
                    isUser={userId === topCadets[1].id} // ✅ Gunakan userId yang aman
                />
              )}
              {/* RANK 1 */}
              {topCadets[0] && (
                <PodiumStep 
                    cadet={topCadets[0]} 
                    rank={1} 
                    isUser={userId === topCadets[0].id} // ✅ Gunakan userId yang aman
                />
              )}
              {/* RANK 3 */}
              {topCadets[2] && (
                <PodiumStep 
                    cadet={topCadets[2]} 
                    rank={3} 
                    isUser={userId === topCadets[2].id} // ✅ Gunakan userId yang aman
                />
              )}
          </div>
      ) : (
          <div className="h-64 flex items-center justify-center text-neutral-600 font-mono">
              DATA BELUM TERSEDIA
          </div>
      )}

      {/* --- BAGIAN 2: THE LIST (RANK 4-50) --- */}
      {listCadets.length > 0 && (
      <div className="bg-neutral-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                 <thead>
                     <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                         <th className="p-5 w-20 text-center">RANK</th>
                         <th className="p-5">IDENTITAS PRAJA</th>
                         <th className="p-5 hidden md:table-cell">PANGKAT & STARS</th>
                         <th className="p-5 text-right">PERFORMA (XP)</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                     {listCadets.map((cadet, idx) => {
                         const realRank = idx + 4;
                         const rankInfo = getRankName(cadet.xp || 0);
                         // ✅ Validasi User dengan userId aman
                         const isUser = userId === cadet.id;
                         
                         return (
                             <tr key={cadet.id} className={`group transition-all hover:bg-white/5 ${isUser ? "bg-red-900/20 border-l-4 border-l-red-600" : "border-l-4 border-l-transparent"}`}>
                                 
                                 {/* RANK NUMBER */}
                                 <td className="p-5 text-center">
                                     <div className="flex flex-col items-center justify-center w-8 h-8 rounded bg-neutral-800 mx-auto border border-white/10 group-hover:border-white/30 transition-colors">
                                         <span className="text-neutral-300 font-mono font-bold text-sm">#{realRank}</span>
                                     </div>
                                 </td>

                                 {/* PROFILE */}
                                 <td className="p-5">
                                     <div className="flex items-center gap-4">
                                         <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center text-sm font-black text-neutral-400 shadow-md group-hover:scale-105 transition-transform`}>
                                             {cadet.name ? cadet.name.charAt(0).toUpperCase() : "?"}
                                         </div>
                                         <div>
                                             <div className={`font-bold uppercase tracking-wide text-sm flex items-center gap-2 ${isUser ? "text-white" : "text-neutral-300 group-hover:text-white"}`}>
                                                 {cadet.name}
                                                 {isUser && <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black tracking-wider">ANDA</span>}
                                             </div>
                                             <div className="md:hidden text-[9px] text-neutral-500 mt-0.5 uppercase font-bold flex items-center gap-1">
                                                 <span className={rankInfo.color}>{rankInfo.name}</span>
                                             </div>
                                         </div>
                                     </div>
                                 </td>

                                 {/* PANGKAT (DESKTOP) */}
                                 <td className="p-5 hidden md:table-cell">
                                     <div className="flex items-center gap-3">
                                         <span className={`text-[9px] px-2 py-1 rounded border font-black uppercase tracking-wider ${rankInfo.color} ${rankInfo.bg} ${rankInfo.border}`}>
                                             {rankInfo.name}
                                         </span>
                                         <div className="flex gap-0.5">
                                             {Array.from({ length: Math.max(1, rankInfo.stars) }).map((_, i) => (
                                                 rankInfo.stars > 0 
                                                 ? <Star key={i} size={10} className={`${rankInfo.color} fill-current`} /> 
                                                 : <Shield key={i} size={10} className="text-neutral-800" />
                                             ))}
                                         </div>
                                     </div>
                                 </td>

                                 {/* XP */}
                                 <td className="p-5 text-right">
                                     <div className="flex flex-col items-end">
                                        <span className="font-mono font-bold text-white text-lg group-hover:text-yellow-400 transition-colors">
                                            {(cadet.xp || 0).toLocaleString()}
                                        </span>
                                        <span className="text-[9px] text-neutral-500 font-bold tracking-widest">TOTAL XP</span>
                                     </div>
                                 </td>
                             </tr>
                         )
                     })}
                 </tbody>
             </table>
         </div>
      </div>
      )}
    </div>
  );
}