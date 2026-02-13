"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// HELPER: Cari Paket di kedua tabel (Tryout & Psikologi)
async function findPackage(packageId: string) {
  // Cek di Tryout Package
  const tryoutPkg = await prisma.tryoutPackage.findUnique({ where: { id: packageId } });
  if (tryoutPkg) return { ...tryoutPkg, category: "TRYOUT" };

  // Cek di Psychology Package
  // Pastikan model PsychologyPackage ada field 'price'. Jika tidak, anggap default/gratis logic.
  const psychPkg = await prisma.psychologyPackage.findUnique({ where: { id: packageId } });
  
  // Note: Jika PsychologyPackage belum ada kolom price di schema, Anda perlu menambahkannya.
  // Di sini kita asumsikan object psychPkg punya properti price (atau kita set manual jika error).
  if (psychPkg) return { ...psychPkg, price: 0, category: "PSYCHOLOGY" }; 

  return null;
}

// -----------------------------------------------------------
// 1. METODE MANUAL (VIA WHATSAPP / TRANSFER BANK)
// -----------------------------------------------------------
export async function createPurchaseRequest(packageId: string) {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Bypass Validasi ID
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
      return { success: false, error: "Unauthorized" };
  }

  try {
      // 1. Cek Paket Valid?
      const pkg = await findPackage(packageId);
      if (!pkg) return { success: false, error: "Paket tidak ditemukan." };

      // Harga Paket (Pastikan tidak undefined)
      const basePrice = (pkg as any).price || 0; 

      // 2. Cek Transaksi Pending (Cegah Spam)
      // Kita cek di tabel TRANSACTION
      const existingPending = await prisma.transaction.findFirst({
          where: {
              userId: userId,
              planType: pkg.id, // Kita simpan ID Paket di kolom planType
              status: "PENDING"
          }
      });

      if (existingPending) {
          return { success: true, orderId: existingPending.id, packageName: pkg.title, price: existingPending.amount };
      }

      // 3. Generate Kode Unik
      const uniqueCode = Math.floor(Math.random() * 900) + 100;
      const finalAmount = basePrice + uniqueCode;
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // 4. Buat Transaksi Baru
      const transaction = await prisma.transaction.create({
          data: {
              userId: userId,
              planType: pkg.id, // Mapping: PackageID -> PlanType
              amount: finalAmount,
              uniqueCode: uniqueCode,
              paymentMethod: "MANUAL_TRANSFER",
              status: "PENDING",
              expiresAt: expiresAt
          }
      });

      revalidatePath("/admin/finance");
      
      return { success: true, orderId: transaction.id, packageName: pkg.title, price: finalAmount };

  } catch (error) {
      console.error("Manual Transaction Error:", error);
      return { success: false, error: "Gagal membuat pesanan." };
  }
}

// -----------------------------------------------------------
// 2. METODE OTOMATIS (BAYAR PAKAI SALDO / LOYALTY POINTS)
// -----------------------------------------------------------
export async function payWithWallet(packageId: string) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        // 1. Ambil Data User (Cek Saldo) & Paket (Cek Harga)
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const pkg = await findPackage(packageId);

        if (!user || !pkg) return { success: false, error: "Data tidak valid." };

        const price = (pkg as any).price || 0;

        // 2. Validasi Saldo
        // Pastikan User model punya field 'walletBalance'
        if ((user as any).walletBalance < price) {
            return { success: false, error: "Saldo Logistik tidak mencukupi." };
        }

        // 3. EKSEKUSI TRANSAKSI ATOMIC
        await prisma.$transaction([
            
            // A. Potong Saldo User
            prisma.user.update({
                where: { id: user.id },
                data: { walletBalance: { decrement: price } }
            }),

            // B. Catat Log Keluar (Pastikan model WalletLog ada)
            // Jika model WalletLog belum ada, hapus blok ini agar tidak error
            prisma.walletLog.create({
                data: {
                    userId: user.id,
                    amount: -price,
                    type: "PURCHASE",
                    description: `Membeli paket: ${pkg.title}`
                }
            }),

            // C. Buat Transaction Record (LANGSUNG SUCCESS)
            prisma.transaction.create({
                data: {
                    userId: user.id,
                    planType: pkg.id,
                    amount: price,
                    uniqueCode: 0, // Tidak butuh kode unik kalau wallet
                    status: "SUCCESS", // Langsung aktif
                    paymentMethod: "WALLET"
                }
            })
        ]);

        // 4. Refresh Halaman Terkait
        revalidatePath("/dashboard/materials");   
        revalidatePath("/dashboard/recruitment");
        revalidatePath("/admin/finance");        

        return { success: true };

    } catch (error) {
        console.error("Wallet Transaction Error:", error);
        return { success: false, error: "Gagal memproses pembayaran saldo." };
    }
}