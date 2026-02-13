import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// IMPORT LOGISTIK LENGKAP
import twkBatch1 from '@/data/TO_FREE_01/twk_batch1.json';
import twkBatch2 from '@/data/TO_FREE_01/twk_batch2.json';
import twkBatch3 from '@/data/TO_FREE_01/twk_batch3.json';
import tiuVerbal from '@/data/TO_FREE_01/tiu_verbal.json';
import tiuNumerik from '@/data/TO_FREE_01/tiu_numerik.json';
import tiuCerita from '@/data/TO_FREE_01/tiu_cerita.json';
import tiuFigural from '@/data/TO_FREE_01/tiu_figural.json';
import tkpBatch1 from '@/data/TO_FREE_01/tkp_batch1.json';
import tkpBatch2 from '@/data/TO_FREE_01/tkp_batch2.json';
import tkpBatch3 from '@/data/TO_FREE_01/tkp_batch3.json';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ FIX 1: Bypass Validasi ID (Standard Protocol)
    const userId = (session?.user as any)?.id;

    // VALIDASI USER (CRITICAL CHECK)
    if (!userId) {
      console.error("🔴 LOG: User Session Hilang!");
      return NextResponse.json({ error: 'Sesi berakhir, silakan login ulang' }, { status: 401 });
    }

    const { packageId, answers, timeLeft } = await req.json();
    const targetPackageId = packageId || "tryout-skd-free-01";

    console.log(`🔍 ANALISA: Memulai commit untuk User: ${userId} pada Paket: ${targetPackageId}`);

    // A. AUTO-REGISTER PAKET (Surgical Bypass)
    // Kita gunakan try-catch agar jika field seperti 'category' tidak ada, tidak error fatal
    try {
        await prisma.tryoutPackage.upsert({
          where: { id: targetPackageId },
          update: {}, // Tidak usah update apa-apa jika sudah ada
          create: {
            id: targetPackageId,
            title: "Tryout SKD Free 01 - Corps Praja Academy",
            description: "Paket Latihan SKD Gratis",
            price: 0,
            // Hapus field yang berpotensi error di schema minimalis (category, duration, isPublished)
          },
        });
    } catch (e) {
        console.log("⚠️ Paket sudah ada atau schema berbeda, lanjut scoring...");
    }

    // B. SCORING ENGINE (LOGIKA ANDA SUDAH BAGUS)
    const allQuestionsSource = [
      ...twkBatch1, ...twkBatch2, ...twkBatch3,
      ...tiuVerbal, ...tiuNumerik, ...tiuCerita, ...tiuFigural,
      ...tkpBatch1, ...tkpBatch2, ...tkpBatch3
    ];

    let scoreTWK = 0, scoreTIU = 0, scoreTKP = 0;
    
    // Kita map jawaban user ke kunci jawaban
    const processedAnswers = allQuestionsSource.map((qSource: any, index: number) => {
      const qId = qSource.id || `q-${index + 1}`; // ID manual dari JSON
      const userKey = answers[qId]; // Jawaban user (misal "A")
      
      // Cari opsi yang dipilih user di JSON sumber
      const selectedOption = qSource.options.find((opt: any) => (opt.key || opt.code) === userKey);
      
      // Ambil poinnya
      const points = selectedOption?.score || 0;
      
      // Tentukan kategori
      const category = qSource.category || qSource.type || "TIU";

      if (category === 'TWK') scoreTWK += points;
      else if (category === 'TIU') scoreTIU += points;
      else if (category === 'TKP') scoreTKP += points;

      return {
        questionId: qId,
        category,
        userAnswer: userKey || null,
        score: points,
        // text: qSource.text, // Opsional: matikan jika bikin database penuh
        // explanation: qSource.explanation
      };
    });

    const totalScore = scoreTWK + scoreTIU + scoreTKP;
    const isPassed = scoreTWK >= 65 && scoreTIU >= 80 && scoreTKP >= 166;
    const calculatedDuration = (100 * 60) - (timeLeft || 0);

    // C. COMMIT DATA KE DATABASE (DENGAN TRY-CATCH INTERNAL)
    try {
      // ✅ FIX 2: Gunakan Schema Minimalis (Total Score & JSON Answers)
      const attempt = await prisma.tryoutAttempt.create({
        data: {
          userId: userId,
          packageId: targetPackageId,
          
          // HANYA ADA KOLOM INI DI DB
          score: totalScore, 
          finishedAt: new Date(),
          
          // 🔥 PENYELUNDUPAN DATA:
          // Simpan rincian skor, status lulus, dan durasi ke dalam JSON answers
          answers: JSON.stringify({
              log: processedAnswers, // Detail per soal
              details: {
                  twk: scoreTWK,
                  tiu: scoreTIU,
                  tkp: scoreTKP
              },
              passed: isPassed,      // Status lulus diselundupkan disini
              duration: calculatedDuration
          }),
        }
      });

      // D. UPDATE XP & STATS (GAMIFIKASI)
      await prisma.user.update({
        where: { id: userId },
        data: {
          // jarStats: ... (Hapus, kemungkinan tidak ada)
          // suhStats: { increment: 1 }, // Opsional jika ada
          xp: { increment: Math.floor(totalScore * 0.5) },
          walletBalance: { increment: isPassed ? 500 : 100 }
        }
      });

      console.log(`✅ BERHASIL: Misi disimpan dengan ID ${attempt.id}`);
      return NextResponse.json({ success: true, attemptId: attempt.id });

    } catch (dbError: any) {
      console.error("🔴 DATABASE_COMMIT_FAILED:", dbError.message);
      return NextResponse.json({ error: `Gagal menulis ke DB: ${dbError.message}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error('🔴 API_CRITICAL_FAIL:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}