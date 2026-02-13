import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; 
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. AMBIL SESI
    const session = await getServerSession(authOptions);
    
    // Bypass Validasi ID (Standard Protocol)
    const userId = (session?.user as any)?.id;

    if (!userId) { 
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. TERIMA DATA
    const { packageId, scores, answers } = await req.json();

    // 3. SIMPAN KE DATABASE
    const attempt = await prisma.tryoutAttempt.create({
      data: {
        userId: userId,
        packageId: packageId,
        
        // ✅ HANYA SIMPAN TOTAL SKOR (Sesuai Schema)
        score: scores.total || 0,
        
        // ❌ HAPUS 'passed' (Penyebab Error)
        // passed: scores.isPassTotal || false, 
        
        finishedAt: new Date(),
        
        // 🔥 PENYELUNDUPAN DATA LENGKAP 🔥
        // Kita simpan status LULUS dan Rincian Nilai di dalam JSON String ini.
        answers: JSON.stringify({
            userAnswers: answers,          // Jawaban A, B, C...
            details: {                     // Rincian Nilai
                twk: scores.twk,
                tiu: scores.tiu,
                tkp: scores.tkp
            },
            passed: scores.isPassTotal || false // <--- Status Lulus Disimpan Disini
        }), 
      }
    });

    // 4. UPDATE STATS USER (Reward)
    // Logika reward tetap jalan
    const isPassed = scores.isPassTotal || false;
    
    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: { increment: isPassed ? 100 : 20 }, 
            walletBalance: { increment: isPassed ? 1000 : 200 }
        }
    });

    return NextResponse.json({ success: true, attemptId: attempt.id });

  } catch (error) {
    console.error("Save Tryout Error:", error);
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}