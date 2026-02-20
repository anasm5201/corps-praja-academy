"use server";

import { prisma } from "@/lib/prisma"; 
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

    // 🔥 KODE SANDI KONVERSI (AGAR GEMBOK DASHBOARD TERBUKA)
    let finalPlanType = "FREE";
    if (transaction.planType === "SOLO") finalPlanType = "SOLO_FIGHTER";
    if (transaction.planType === "INTENSIVE") finalPlanType = "INTENSIVE_SQUAD";

    // C. DATABASE TRANSACTION (ATOMIC)
    await prisma.$transaction([
        // 1. Update Status Transaksi -> SUCCESS
        prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "SUCCESS" }
        }),

        // 2. Update Status User -> ACTIVE & BUKA GEMBOK
        prisma.user.update({
            where: { id: transaction.userId },
            data: {
                subscriptionStatus: "ACTIVE",
                subscriptionType: finalPlanType, // ✅ INI YANG MEMBUKA GEMBOK
                subscriptionPlan: transaction.planType, // (Tetap disimpan sebagai riwayat)
                subscriptionExpires: expiryDate,
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