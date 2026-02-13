import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import KecermatanEngine from "@/components/exam/KecermatanEngine"; 

interface PageProps {
  params: {
    packageId: string;
  };
}

export default async function KecermatanGamePage({ params }: PageProps) {
  // 1. Ambil data paket spesifik dari DB berdasarkan URL
  const pkg = await prisma.psychologyPackage.findUnique({
    where: { id: params.packageId }
  });

  // Jika paket tidak ditemukan, tampilkan 404
  // FIX: Hapus pengecekan !pkg.config karena kolom tersebut tidak ada
  if (!pkg) {
    return notFound();
  }

  // 2. Susun Config (Agar bisa dibaca engine)
  // FIX: Kita tidak lagi mem-parse JSON yang tidak ada, melainkan langsung menyusun object
  // menggunakan data 'duration' bawaan dari database (default 60 detik per kolom jika kosong).
  const config = {
    duration: pkg.duration || 60, 
    columns: 10,                                  // Default jumlah kolom tes kecermatan
    symbols: ['A', 'B', 'C', 'D', 'E']            // Default simbol yang digunakan
  };

  // 3. Render Engine dengan Config Spesifik Paket Tersebut
  return (
    <KecermatanEngine 
      packageId={pkg.id}
      config={config} 
    />
  );
}