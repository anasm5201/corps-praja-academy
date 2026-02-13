'use server'

import { prisma } from "@/lib/prisma";
import { getLevelFromXP, getRankFromLevel } from "@/lib/rank-system";
import { revalidatePath } from "next/cache";

// FUNGSI SAKTI: TAMBAH XP & CEK NAIK PANGKAT
export async function addExperience(userId: string, amount: number) {
  try {
    // 1. Ambil Data User Lama
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { xp: true, level: true, rank: true }
    });

    if (!user) return { success: false, error: "User tidak ditemukan" };

    // 2. Hitung XP Baru
    const newXp = (user.xp || 0) + amount;
    
    // 3. Hitung Level Baru
    const newLevel = getLevelFromXP(newXp);
    
    // 4. Hitung Pangkat Baru (Return berupa STRING)
    // ✅ FIX: getRankFromLevel mengembalikan string nama pangkat langsung
    const newRankName = getRankFromLevel(newLevel);

    // 5. Update Database (XP, Level, Rank)
    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: newXp,
            level: newLevel,
            rank: newRankName // ✅ Langsung string (Hapus .name)
        }
    });

    const isLevelUp = newLevel > (user.level || 1);

    // 6. JIKA NAIK LEVEL: BERI BONUS SALDO (LOYALTY REWARD)
    if (isLevelUp) {
        const bonusAmount = 5000; // Rp 5.000 per kenaikan pangkat

        // Update Saldo & Catat Log (Atomic Transaction)
        await prisma.$transaction([
            // Tambah Saldo
            prisma.user.update({
                where: { id: userId },
                data: { walletBalance: { increment: bonusAmount } }
            }),
            // Catat Log Wallet
            prisma.walletLog.create({
                data: {
                    userId: userId,
                    amount: bonusAmount,
                    type: "REWARD", // Tipe khusus Reward
                    description: `Bonus Kenaikan Pangkat: ${newRankName}`
                }
            })
        ]);
    }

    revalidatePath("/dashboard");
    return { success: true, levelUp: isLevelUp, newLevel, newRank: newRankName };

  } catch (error) {
    console.error("Gagal menambah XP:", error);
    return { success: false, error: "Gagal memproses XP." };
  }
}