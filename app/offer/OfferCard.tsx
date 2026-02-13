import React from 'react';
import { Check, ArrowRight } from "lucide-react";

// 1. Definisikan Theme Object
const theme = {
    basic: "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700",
    pro:   "border-blue-500/50 bg-gradient-to-b from-blue-900/20 to-black hover:shadow-2xl hover:shadow-blue-900/20",
    elite: "border-yellow-500/50 bg-gradient-to-b from-yellow-900/20 to-black hover:shadow-2xl hover:shadow-yellow-900/20"
};

// 2. Definisikan Tipe Props secara Ketat
interface OfferCardProps {
    title: string;
    price: string;
    period: string;
    features: string[];
    // ✅ FIX: Batasi variant agar hanya boleh 'basic' | 'pro' | 'elite'
    variant?: keyof typeof theme; 
    isPopular?: boolean;
    ctaLabel?: string;
    ctaLink?: string;
}

export default function OfferCard({
    title,
    price,
    period,
    features,
    variant = "basic", // Default value
    isPopular = false,
    ctaLabel = "PILIH PAKET",
    ctaLink = "#"
}: OfferCardProps) {

    return (
        // ✅ FIX: TypeScript sekarang tau bahwa 'variant' aman digunakan sebagai key
        <div className={`rounded-3xl border p-8 relative flex flex-col h-full transition-all duration-300 group ${theme[variant]}`}>
            
            {isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-1 rounded-b-xl tracking-widest shadow-lg shadow-blue-900/50">
                    POPULAR CHOICE
                </div>
            )}

            <div className="mb-6">
                <h3 className={`text-lg font-black uppercase tracking-widest mb-2
                    ${variant === 'elite' ? 'text-yellow-500' : variant === 'pro' ? 'text-blue-500' : 'text-gray-400'}
                `}>
                    {title}
                </h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{price}</span>
                    <span className="text-xs text-gray-500 font-mono uppercase">{period}</span>
                </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check size={16} className={`shrink-0 mt-0.5 
                            ${variant === 'elite' ? 'text-yellow-500' : variant === 'pro' ? 'text-blue-500' : 'text-gray-500'}
                        `} />
                        <span className="leading-snug">{feat}</span>
                    </li>
                ))}
            </ul>

            <a href={ctaLink} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all
                ${variant === 'elite' 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]' 
                    : variant === 'pro'
                        ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                        : 'bg-zinc-800 text-gray-400 border border-white/5 hover:bg-white hover:text-black'
                }
            `}>
                {ctaLabel} <ArrowRight size={14} />
            </a>

        </div>
    );
}