"use server";

import { prisma } from "@/lib/prisma"; // ✅ KOREKSI: Gunakan prisma, bukan db
import { revalidatePath } from "next/cache";

// ✅ 1. ACC PEMBAYARAN (AKTIFKAN AKSES KADET)
export async function approveTransaction(transactionId: string) {
  try {
    // A. Ambil Data Transaksi
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) throw new Error("Transaksi tidak ditemukan");

    // B. Hitung Durasi Paket
    const now = new Date();
    let durationDays = 30; // Default Monthly
    if (transaction.planType === "SOLO") durationDays = 90; // 3 Bulan
    if (transaction.planType === "INTENSIVE") durationDays = 180; // 6 Bulan

    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + durationDays);

    // C. DATABASE TRANSACTION (ATOMIC)
    await prisma.$transaction([
        // 1. Update Status Transaksi -> SUCCESS
        prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "SUCCESS" }
        }),

        // 2. Update Status User -> ACTIVE
        prisma.user.update({
            where: { id: transaction.userId },
            data: {
                subscriptionStatus: "ACTIVE",
                subscriptionPlan: transaction.planType,
                subscriptionExpires: expiryDate,
                // walletBalance: { increment: 0 } // Opsional
            }
        })
    ]);

    revalidatePath("/admin/approvals");
    revalidatePath("/admin");
    return { success: true };

  } catch (error) {
    console.error("Approval Error:", error);
    return { success: false, error: "Gagal memproses persetujuan." };
  }
}

// ❌ 2. TOLAK PEMBAYARAN
export async function rejectTransaction(transactionId: string) {
    try {
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "FAILED" }
        });

        revalidatePath("/admin/approvals");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal menolak transaksi." };
    }
}