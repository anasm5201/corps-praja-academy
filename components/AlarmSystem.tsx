"use client";

import { useEffect } from "react";

export default function AlarmSystem() {
  useEffect(() => {
    // 1. Minta Izin Notifikasi saat pertama kali buka
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // 2. Cek Waktu setiap 1 menit
    const interval = setInterval(() => {
      const now = new Date();
      const jam = now.getHours();
      const menit = now.getMinutes();

      // CONTOH JADWAL: 04:30 PAGI
      if (jam === 4 && menit === 30) {
        triggerAlarm("WAKTUNYA BANGUN!", "Segera lapor bangun pagi di Dashboard.");
      }
      
      // CONTOH JADWAL: 19:00 BELAJAR
      if (jam === 19 && menit === 0) {
        triggerAlarm("SIAGA SATU!", "Waktunya belajar mandiri SKD.");
      }

    }, 60000); // Cek tiap 60 detik

    return () => clearInterval(interval);
  }, []);

  const triggerAlarm = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      // Bunyikan Suara (Opsional)
      // const audio = new Audio('/assets/alarm.mp3');
      // audio.play();

      // Tampilkan Notifikasi Sistem (Muncul di HP jika PWA diinstall)
      new Notification(title, {
        body: body,
        icon: "/icons/icon-192x192.png",
        vibrate: [200, 100, 200]
      } as any);
    }
  };

  return null; // Komponen ini tidak merender visual apa-apa
}