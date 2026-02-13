"use client";

import React from 'react';
import { Lock } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  rank: string;
  xp: number;
  isBlacklisted: boolean;
}

export default function RankTable({ users }: { users: UserData[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500">
            <th className="p-4 font-black">Rank</th>
            <th className="p-4 font-black">Kadet</th>
            <th className="p-4 text-right font-black">Perolehan</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr 
              key={user.id} 
              className={`transition-all ${
                user.isBlacklisted 
                ? 'bg-red-950/20 border-l-4 border-red-600' 
                : 'border-b border-gray-900 hover:bg-white/5'
              }`}
            >
              {/* KOLOM RANK */}
              <td className="p-4 font-mono">
                {user.isBlacklisted ? (
                  <span className="text-red-600 animate-pulse font-black text-[10px] tracking-tighter uppercase">
                    [BLACKLISTED]
                  </span>
                ) : (
                  <span className="text-gray-400">#{index + 1}</span>
                )}
              </td>

              {/* KOLOM IDENTITAS */}
              <td className="p-4">
                <div className="flex flex-col">
                  <span className={`font-bold uppercase tracking-tight ${
                    user.isBlacklisted ? 'text-gray-600 line-through' : 'text-white'
                  }`}>
                    {user.name}
                  </span>
                  <span className="text-[8px] text-red-500 font-black tracking-[0.2em] uppercase mt-0.5">
                    {user.rank}
                  </span>
                </div>
              </td>

              {/* KOLOM XP / STATUS */}
              <td className="p-4 text-right">
                {user.isBlacklisted ? (
                  <div className="flex items-center justify-end gap-2 text-red-600">
                    <Lock size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      In_Honor_Court
                    </span>
                  </div>
                ) : (
                  <span className="text-orange-500 font-mono font-bold">
                    {user.xp.toLocaleString()} XP
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}