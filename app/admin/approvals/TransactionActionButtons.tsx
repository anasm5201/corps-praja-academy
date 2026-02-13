"use client";

import { useState } from "react";
import { approveTransaction, rejectTransaction } from "@/app/actions/adminActions";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function TransactionActionButtons({ transactionId }: { transactionId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleApprove = async () => {
        if(!confirm("Yakin data transfer sudah sesuai? Akses akan langsung dibuka.")) return;
        setIsLoading(true);
        await approveTransaction(transactionId);
        setIsLoading(false);
    };

    const handleReject = async () => {
        if(!confirm("Tolak transaksi ini?")) return;
        setIsLoading(true);
        await rejectTransaction(transactionId);
        setIsLoading(false);
    };

    if (isLoading) {
        return <div className="text-amber-500 animate-spin"><Loader2 size={24} /></div>;
    }

    return (
        <div className="flex gap-2">
            <button 
                onClick={handleReject}
                className="px-4 py-2 bg-red-950/30 border border-red-900/50 text-red-500 hover:bg-red-900/50 hover:text-white rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2">
                <XCircle size={16} /> Tolak
            </button>
            <button 
                onClick={handleApprove}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)] rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2">
                <CheckCircle2 size={16} /> Verifikasi
            </button>
        </div>
    );
}