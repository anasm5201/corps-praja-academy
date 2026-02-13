"use client";

import { useState } from "react";
import { deleteQuestion } from "@/app/actions/questionActions";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteQuestionButton({ id, packageId }: { id: string, packageId: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if(!confirm("Hapus soal ini secara permanen?")) return;
        setLoading(true);
        const res = await deleteQuestion(id, packageId);
        setLoading(false);
        
        if(res.success) toast.success("SOAL DIHAPUS");
        else toast.error("Gagal menghapus soal.");
    };

    return (
        <button 
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-red-500 hover:bg-red-900/20 rounded-lg transition"
            title="Hapus Soal"
        >
            {loading ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18}/>}
        </button>
    );
}