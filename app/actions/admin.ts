'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 🛡️ GATEKEEPER: Cek apakah yang akses benar-benar ADMIN?
async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "ADMIN") throw new Error("AKSES DITOLAK: HANYA KOMANDAN.");
  
  return user;
}

// ✅ FUNGSI ACC (APPROVE)
export async function approveTransaction(transactionId: string) {
  await ensureAdmin();

  // 1. Ambil data transaksi (PAKAI MODEL BARU: TRANSACTION)
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true }
  });

  if (!transaction) throw new Error("Transaksi tidak ditemukan.");
  if (transaction.status === "SUCCESS") return; // Sudah sukses duluan

  // 2. Tentukan Durasi Paket (3 Bulan)
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 3); 

  // 3. DATABASE TRANSACTION (Atomik)
  await prisma.$transaction([
    // A. Update Status Transaksi jadi SUCCESS
    prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "SUCCESS" }
    }),

    // B. PENTING: AKTIFKAN STATUS PREMIUM USER
    prisma.user.update({
      where: { id: transaction.userId },
      data: {
        subscriptionStatus: "ACTIVE",
        subscriptionPlan: transaction.planType, // "SOLO" atau "INTENSIVE"
        subscriptionExpires: expiryDate
      }
    })
  ]);

  // 4. Refresh Halaman Admin
  revalidatePath("/admin/approvals");
}

// ❌ FUNGSI TOLAK (REJECT/DELETE)
export async function rejectTransaction(transactionId: string) {
  await ensureAdmin();

  await prisma.transaction.delete({
    where: { id: transactionId }
  });

  revalidatePath("/admin/approvals");
}