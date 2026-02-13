import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, referralCode } = body;
    let { name } = body; 

    // 1. Cek Kelengkapan Data
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Data tidak lengkap!" }, { status: 400 });
    }

    // --- LOGIC "DOKTRIN KADET" (AUTO FORMAT NAME) ---
    // Ubah ke Huruf Kapital (Biar Gagah & Tegas)
    name = name.toUpperCase().trim();

    // Tambahkan Pangkat "KADET" jika belum ada
    if (!name.startsWith("KADET") && !name.startsWith("CALON")) {
        name = `KADET ${name}`;
    }
    // ------------------------------------------------

    // 2. Cek Apakah Email Sudah Terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar dalam sistem!" }, { status: 400 });
    }

    // 3. Logika Referral (Cari Upline)
    let uplineId = null; // String ID dari upline
    let initialXp = 0;   // XP Awal buat user baru

    if (referralCode) {
        const upline = await prisma.user.findUnique({
            where: { referralCode: referralCode }
        });
        
        if (upline) {
            uplineId = upline.referralCode; // Atau upline.id, tergantung schema. Kita simpan kodenya saja sbg string
            initialXp = 200; // Bonus XP untuk Rekrutan Baru
            
            // Beri Bonus ke Senior (Upline)
            // Pastikan field 'walletBalance' ada di schema User
            await prisma.user.update({
                where: { id: upline.id },
                data: {
                    walletBalance: { increment: 10000 }, // Bonus Rp 10.000
                    xp: { increment: 500 }
                }
            });
        }
    }

    // 4. Enkripsi Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Buat User Baru (Simpan ke Database)
    const newUser = await prisma.user.create({
      data: {
        name, 
        email,
        password: hashedPassword,
        xp: initialXp, 
        referredBy: uplineId,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        role: "CADET", // Default Role
        
        // Default Stats (Sesuai Schema Baru)
        walletBalance: 0,
        suhStats: 100, // Kesehatan default
        
        // Data Fisik Awal (Opsional, biarkan null nanti diisi saat tes fisik)
        // initialRunDistance: 0,
      },
    });

    // ❌ [HAPUS] Bagian PhysicalProfile karena tabelnya sudah tidak ada.
    // Data fisik sekarang tersimpan langsung di User atau lewat Log Harian.

    return NextResponse.json({ message: "Inisiasi Kadet Berhasil!", user: newUser }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem markas." }, { status: 500 });
  }
}