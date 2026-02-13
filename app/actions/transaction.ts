"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// ✅ FUNGSI 1: BUAT ORDER BARU
export async function createTransaction(planType: "SOLO" | "INTENSIVE") {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Bypass Validasi ID (Gunakan 'as any')
  const userId = (session?.user as any)?.id;

  if (!userId) {
    // Redirect ke login jika session habis/tidak ada
    redirect("/auth/login"); 
  }

  // 1. TENTUKAN HARGA
  let basePrice = 0;
  if (planType === "SOLO") basePrice = 299000; 
  if (planType === "INTENSIVE") basePrice = 999000;

  // 2. BUAT KODE UNIK (3 DIGIT)
  const uniqueCode = Math.floor(Math.random() * 900) + 100; 
  const finalAmount = basePrice + uniqueCode;

  // 3. SET EXPIRATION (24 JAM)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  let transactionId = "";

  try {
      // 4. SIMPAN TRANSAKSI
      const transaction = await prisma.transaction.create({
        data: {
          userId: userId, 
          planType: planType, 
          amount: finalAmount,   // ✅ Hanya simpan Total Bayar
          uniqueCode: uniqueCode, // ✅ Simpan Kode Unik
          status: "PENDING",
          expiresAt: expiresAt
          // ❌ basePrice DIBUANG (Penyebab Error)
        }
      });
      
      transactionId = transaction.id;

  } catch (error) {
      console.error("Gagal Buat Transaksi:", error);
      throw new Error("Gagal memproses pesanan.");
  }

  // 5. ARAHKAN KE KASIR
  redirect(`/dashboard/payment/${transactionId}`);
}

// 🚨 FUNGSI 2: PEMBATALAN
export async function cancelTransaction(transactionId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  });

  if (!transaction) throw new Error("Transaksi tidak ditemukan");
  if (transaction.userId !== userId) throw new Error("Akses Ditolak");

  if (transaction.status !== "PENDING") {
      throw new Error("Tidak bisa membatalkan transaksi yang sudah diproses");
  }

  await prisma.transaction.delete({
    where: { id: transactionId }
  });

  redirect("/dashboard/subscription");
}