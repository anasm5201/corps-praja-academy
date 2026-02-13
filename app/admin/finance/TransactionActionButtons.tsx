"use client";

import { useState } from "react";
import { approveTransaction, rejectTransaction } from "@/app/actions/adminActions";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TransactionActionButtons({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Yakin ingin ${action} transaksi ini?`)) return;

    setIsLoading(true);
    const toastId = toast.loading("Memproses...");

    try {
        const fn = action === 'APPROVE' ? approveTransaction : rejectTransaction;
        const result = await fn(id);

        if (result.success) {
            toast.success(`Transaksi Berhasil: ${action}`, { id: toastId });
            router.refresh(); // Refresh halaman agar tabel update
        } else {
            toast.error("Gagal: " + result.error, { id: toastId });
        }
    } catch (e) {
        toast.error("Terjadi kesalahan sistem.", { id: toastId });
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) {
      return <Loader2 size={16} className="animate-spin text-gray-500 mx-auto" />;
  }

  return (
    <div className="flex items-center justify-center gap-2">
        {/* TOMBOL TOLAK (X) */}
        <button 
            onClick={() => handleAction('REJECT')}
            className="p-2 rounded-lg bg-red-900/20 text-red-500 border border-red-500/20 hover:bg-red-900/40 transition tooltip"
            title="Tolak Transaksi"
        >
            <X size={16} />
        </button>

        {/* TOMBOL TERIMA (CHECK) */}
        <button 
            onClick={() => handleAction('APPROVE')}
            className="p-2 rounded-lg bg-green-900/20 text-green-500 border border-green-500/20 hover:bg-green-900/40 transition tooltip"
            title="Setujui Transaksi"
        >
            <Check size={16} />
        </button>
    </div>
  );
}