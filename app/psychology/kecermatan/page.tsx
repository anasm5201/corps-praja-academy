"use client";

import React from 'react';
// Pastikan path import ini sesuai dengan lokasi komponen Anda
import KecermatanEngine from "@/components/psychology/KecermatanEngine"; 

export default function KecermatanPage() {
  
  // 1. KONFIGURASI DUMMY (DATA LATIHAN)
  // Ini diperlukan agar TypeScript tidak marah saat build.
  // Nanti bisa diganti dengan data dari Database (Prisma).
  const demoConfig = {
    mode: "MISSING_SYMBOL", // Mode Hilang Huruf/Angka
    durationPerTable: 60,   // Detik per kolom
    totalTables: 10,        // Jumlah kolom
    symbols: ["A", "B", "C", "D", "E"], // Simbol soal
    distractors: []         // Opsi pengecoh (jika ada)
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* 2. MENYUPLAI PROPS WAJIB 
         Kita berikan 'packageId' sembarang dan 'config' dummy.
      */}
      <KecermatanEngine 
        packageId="pkg-demo-001" 
        config={demoConfig} 
      />
    </main>
  );
}