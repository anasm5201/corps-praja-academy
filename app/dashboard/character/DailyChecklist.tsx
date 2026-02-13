"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Check, Loader2, BedDouble } from "lucide-react";

interface DailyChecklistProps {
    initialData?: {
        wokeUpOnTime: boolean;
        worshipDone: boolean;
        bedMade: boolean;
    } | null;
}

export default function DailyChecklist({ initialData }: DailyChecklistProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // State lokal untuk checkbox
    const [form, setForm] = useState({
        wokeUpOnTime: initialData?.wokeUpOnTime || false,
        worshipDone: initialData?.worshipDone || false,
        bedMade: initialData?.bedMade || false,
    });

    const handleToggle = (key: keyof typeof form) => {
        setForm(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLapor = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/character/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                router.refresh(); // Refresh agar data sinkron
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Helper Component untuk Item Checklist
    const CheckItem = ({ 
        label, 
        desc, 
        active, 
        onClick, 
        icon: Icon 
    }: { label: string, desc: string, active: boolean, onClick: () => void, icon: any }) => (
        <div 
            onClick={onClick}
            className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center gap-4 group ${
                active 
                ? "bg-yellow-900/20 border-yellow-500/50" 
                : "bg-black/40 border-white/5 hover:border-white/20"
            }`}
        >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                active ? "bg-yellow-500 text-black" : "bg-zinc-800 text-gray-500"
            }`}>
                <Icon size={24} />
            </div>
            <div className="flex-1">
                <h4 className={`font-bold uppercase text-sm ${active ? "text-yellow-500" : "text-gray-400"}`}>
                    {label}
                </h4>
                <p className="text-[10px] text-gray-500">{desc}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                active ? "border-yellow-500 bg-yellow-500" : "border-gray-600"
            }`}>
                {active && <Check size={14} className="text-black stroke-[4]" />}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CheckItem 
                    label="Apel Pagi / Bangun"
                    desc="Bangun sebelum 04:30 & Siap Apel"
                    active={form.wokeUpOnTime}
                    onClick={() => handleToggle("wokeUpOnTime")}
                    icon={Sun}
                />
                <CheckItem 
                    label="Ibadah Wajib"
                    desc="Sholat Subuh / Doa Pagi"
                    active={form.worshipDone}
                    onClick={() => handleToggle("worshipDone")}
                    icon={Moon}
                />
                <CheckItem 
                    label="Kebersihan Barak"
                    desc="Merapikan Tempat Tidur (Sprei Kencang)"
                    active={form.bedMade}
                    onClick={() => handleToggle("bedMade")}
                    icon={BedDouble}
                />
            </div>

            <button 
                onClick={handleLapor}
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-yellow-900/20 transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
                LAPOR GIAT HARIAN
            </button>
        </div>
    );
}