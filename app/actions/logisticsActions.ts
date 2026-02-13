"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. CREATE PACKAGE (DEPLOY LOGISTIK BARU)
export async function createPackage(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  // ✅ FIX: Gunakan '(session?.user as any)?.id' untuk bypass type checking
  const userId = (session?.user as any)?.id;

  if (!userId) {
      return { error: "Akses Ditolak. Silakan login." };
  }

  // Security Check: Hanya Admin
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user || user.role !== "ADMIN") {
      return { error: "Akses Ditolak. Hubungi Komandan." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string);
  const category = formData.get("category") as string; // 'SKD' | 'PSIKOLOGI' | 'MATERI'
  const duration = parseInt(formData.get("duration") as string) || 100;

  try {
      await prisma.tryoutPackage.create({
          data: {
              title,
              description,
              price,
              category, 
              duration,
              isPublished: true, // Default langsung tayang
          }
      });

      revalidatePath("/dashboard/materials");
      revalidatePath("/admin/materials");
      return { success: true };

  } catch (error) {
      console.error("Gagal Input Logistik:", error);
      return { error: "Gagal menyimpan data ke database." };
  }
}

// 2. DELETE PACKAGE (HANCURKAN LOGISTIK)
export async function deletePackage(id: string) {
    const session = await getServerSession(authOptions);
    
    // ✅ FIX: Validasi ID User dengan Casting
    const userId = (session?.user as any)?.id;
    if (!userId) return { error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        await prisma.tryoutPackage.delete({ where: { id } });
        
        revalidatePath("/admin/materials");
        revalidatePath("/dashboard/materials");
        return { success: true };
    } catch (e) {
        // Biasanya gagal karena ada Foreign Key (Sudah pernah dibeli user)
        return { error: "Gagal menghapus. Paket ini mungkin sudah memiliki riwayat pembelian." };
    }
}

// 3. TOGGLE STATUS (SEMBUNYIKAN / TAMPILKAN)
export async function togglePackageStatus(id: string, currentStatus: boolean) {
    const session = await getServerSession(authOptions);
    
    // ✅ FIX: Validasi ID User dengan Casting
    const userId = (session?.user as any)?.id;
    if (!userId) return { error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        await prisma.tryoutPackage.update({
            where: { id },
            data: { isPublished: !currentStatus }
        });
        
        revalidatePath("/admin/materials");
        revalidatePath("/dashboard/materials"); // Update tampilan user real-time
        return { success: true };
    } catch (e) {
        return { error: "Gagal update status." };
    }
}