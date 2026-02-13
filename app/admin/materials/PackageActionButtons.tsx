"use client";

import { useState } from "react";
import { deletePackage, togglePackageStatus } from "@/app/actions/logisticsActions";
import { Eye, EyeOff, Trash2, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link"; // Untuk tombol edit nanti

export default function PackageActionButtons({ id, isPublished }: { id: string, isPublished: boolean }) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        const res = await togglePackageStatus(id, isPublished);
        setLoading(false);
        if(res.success) toast.success("STATUS DIPERBARUI");
        else toast.error("Gagal update status.");
    };

    const handleDelete = async () => {
        if(!confirm("PERINGATAN: Menghapus paket ini akan menghilangkan akses bagi user yang sudah membelinya. Lanjutkan?")) return;
        
        setLoading(true);
        const res = await deletePackage(id);
        setLoading(false);
        
        if(res.success) toast.success("PAKET DIHAPUS DARI GUDANG");
        else toast.error(res.error);
    };

    if (loading) return <Loader2 size={16} className="animate-spin text-gray-500 ml-auto"/>;

    return (
        <div className="flex items-center justify-end gap-2">
            {/* TOGGLE PUBLISH */}
            <button 
                onClick={handleToggle}
                className={`p-2 rounded transition hover:scale-110 ${isPublished ? 'text-gray-500 hover:text-yellow-500' : 'text-gray-600 hover:text-green-500'}`}
                title={isPublished ? "Sembunyikan (Unpublish)" : "Tampilkan (Publish)"}
            >
                {isPublished ? <Eye size={16}/> : <EyeOff size={16}/>}
            </button>

            {/* EDIT (Placeholder Link) */}
            <Link href={`/admin/question/add?packageId=${id}`} className="p-2 text-blue-500 hover:text-blue-400 transition hover:scale-110" title="Isi Soal">
                <Edit size={16}/>
            </Link>

            {/* DELETE */}
            <button 
                onClick={handleDelete}
                className="p-2 text-red-500 hover:text-red-400 transition hover:scale-110"
                title="Hapus Permanen"
            >
                <Trash2 size={16}/>
            </button>
        </div>
    );
}