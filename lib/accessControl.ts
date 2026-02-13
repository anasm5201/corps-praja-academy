import { prisma } from "@/lib/prisma";

// DAFTAR ID LISENSI (Sesuai seed.ts)
export const LICENSES = {
    TACTICAL: 'PKG-TACTICAL-001',
    VIP: 'PKG-VIP-001'
};

// FUNGSI CEK AKSES
export async function checkUserAccess(userId: string) {
    // FIX: Gunakan (prisma as any) untuk membypass pengecekan TypeScript 
    // pada tabel 'purchase' yang belum terdaftar di tipe lokal.
    try {
        const purchases = await (prisma as any).purchase.findMany({
            where: {
                userId: userId,
                status: "SUCCESS"
            },
            select: { packageId: true }
        });

        // Amankan jika hasilnya kosong/error
        const ownedIds = purchases ? purchases.map((p: any) => p.packageId) : [];

        // LOGIKA PENENTUAN HAK AKSES
        const isVip = ownedIds.includes(LICENSES.VIP);
        const isTactical = ownedIds.includes(LICENSES.TACTICAL);

        return {
            // Fitur apa saja yang terbuka?
            canAccessSpeedDrill: isVip || isTactical, // VIP & Taktis boleh
            canAccessDeepAnalysis: isVip || isTactical,
            canAccessMentoring: isVip, // HANYA VIP
            canAccessAllTryouts: isVip, // HANYA VIP
            
            // Status Member
            isVip,
            isTactical,
            isFreeUser: !isVip && !isTactical
        };
    } catch (error) {
        console.warn("⚠️ Peringatan: Gagal mengecek tabel purchase. Mengembalikan status Free User.");
        return {
            canAccessSpeedDrill: false,
            canAccessDeepAnalysis: false,
            canAccessMentoring: false,
            canAccessAllTryouts: false,
            isVip: false,
            isTactical: false,
            isFreeUser: true
        };
    }
}