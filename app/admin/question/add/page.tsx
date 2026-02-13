import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export default function AddQuestionPage({
  searchParams,
}: {
  searchParams: { packageId: string };
}) {
  // Tangkap ID Paket dari URL
  const { packageId } = searchParams;

  // JIKA TIDAK ADA ID PAKET (ERROR STATE)
  if (!packageId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6 text-center">
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6 border border-red-900/50">
          <AlertTriangle className="text-red-500" size={32} />
        </div>

        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">
          MISSING COORDINATES
        </h1>

        <p className="text-gray-500 max-w-md mb-8 leading-relaxed font-mono text-sm">
          Anda mencoba mengakses halaman input soal tanpa membawa ID Paket Logistik.
          <br /><br />
          {/* ✅ FIX: Gunakan &rarr; untuk panah kanan agar tidak error JSX */}
          Silakan kembali ke <span className="text-white font-bold">"Gudang Logistik"</span> &rarr; Pilih Paket &rarr; Klik <span className="text-blue-400 font-bold">"Isi Amunisi"</span>.
        </p>

        <Link
          href="/admin/materials"
          className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Kembali ke Gudang
        </Link>
      </div>
    );
  }

  // JIKA ADA ID, LANGSUNG ARAHKAN KE HALAMAN EDIT PAKET
  // (Karena logika input soal kita satukan di halaman edit/manajemen soal)
  redirect(`/admin/question/edit/${packageId}`);
}