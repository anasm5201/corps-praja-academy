"use client";

import { useState } from "react";
import { submitDailyReport } from "@/lib/actions";
import XPSuccessModal from "@/components/XPSuccessModal"; // Import Modal Baru

interface Props {
  initialData: any;
}

export default function DailyQuestForm({ initialData }: Props) {
  const [loading, setLoading] = useState(false);
  
  // State untuk menyimpan XP yang didapat agar bisa ditampilkan di Modal
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const [form, setForm] = useState({
    wokeUpOnTime: initialData?.wokeUpOnTime || false,
    worshipDone: initialData?.worshipDone || false,
    bedMade: initialData?.bedMade || false,
    workoutDone: initialData?.workoutDone || false,
    studyDone: initialData?.studyDone || false,
  });

  const toggle = (key: string) => {
    setForm({ ...form, [key]: !form[key as keyof typeof form] });
  };

  const handleSubmit = async () => {
    // 1. INTEGRITY CHECK (SUMPAH)
    const confirmMsg = 
      "⚠️ PERHATIAN KADET CORPS PRAJA ACADEMY!\n\n" +
      "Apakah Anda bersungguh-sungguh menyatakan bahwa laporan ini BENAR dan telah dilaksanakan dengan penuh tanggung jawab?\n\n" +
      "Integritas adalah harga mati.";

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      // --- FIX: BUNGKUS AMUNISI KE DALAM FORMDATA ---
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
         // FormData hanya menerima string, jadi nilai boolean (true/false) diubah jadi string
         formData.append(key, String(value)); 
      });

      // 2. Kirim paket FormData ke Server
      const result = await submitDailyReport(formData);

      if (result.success) {
        // JIKA SUKSES & DAPAT XP > 0, TAMPILKAN ANIMASI
        // @ts-ignore
        if (result.xpGained > 0) {
            // @ts-ignore
            setXpEarned(result.xpGained);
        } else {
            // Jika XP 0 atau minus, pakai alert biasa saja
            alert("ℹ️ Laporan Disimpan. Data tidak berubah atau XP dikurangi.");
            window.location.reload();
        }
      } else {
        // @ts-ignore
        alert("Gagal: " + result.error);
      }
    } catch (e) {
      alert("Kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // RENDER MODAL JIKA ADA XP
  if (xpEarned !== null) {
    return <XPSuccessModal xp={xpEarned} onClose={() => { setXpEarned(null); window.location.reload(); }} />;
  }

  return (
    <div className="space-y-4">
      {/* DAFTAR QUEST */}
      <QuestItem label="Lapor Bangun Pagi (04:30)" desc="Wajib upload foto/geo-tag." checked={form.wokeUpOnTime} onClick={() => toggle('wokeUpOnTime')} />
      <QuestItem label="Spiritual & Ibadah" desc="Menjaga integritas moral." checked={form.worshipDone} onClick={() => toggle('worshipDone')} />
      <QuestItem label="Kebersihan Barak" desc="Disiplin dimulai dari hal kecil." checked={form.bedMade} onClick={() => toggle('bedMade')} />
      <QuestItem label="Latihan Fisik (LAT)" desc="Target Lari & Push-up." checked={form.workoutDone} onClick={() => toggle('workoutDone')} />
      <QuestItem label="Belajar Mandiri (JAR)" desc="Minimal 1 Paket Soal." checked={form.studyDone} onClick={() => toggle('studyDone')} />

      {/* TOMBOL SUBMIT */}
      <div className="pt-6 border-t border-white/10">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-black py-5 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? "MENGHUBUNGKAN KE MARKAS..." : "👮 LAPOR PELAKSANAAN TUGAS"}
        </button>
        <p className="text-center text-[10px] text-gray-500 mt-3 italic">
          "Kejujuran adalah mata uang yang berlaku di mana saja."
        </p>
      </div>
    </div>
  );
}

function QuestItem({ label, desc, checked, onClick }: any) {
  return (
    <div onClick={onClick} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${checked ? "bg-blue-900/20 border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.2)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 ${checked ? "bg-blue-600 border-blue-600 text-white" : "border-gray-600 bg-black/40"}`}>{checked && "✓"}</div>
      <div><h4 className={`font-bold ${checked ? "text-white" : "text-gray-400"}`}>{label}</h4><p className="text-xs text-gray-500">{desc}</p></div>
    </div>
  );
}