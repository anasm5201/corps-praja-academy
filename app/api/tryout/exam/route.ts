import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. IMPORT LOGISTIK INTELIJEN
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const packageId = searchParams.get('packageId');

  if (!packageId) {
    return NextResponse.json({ error: 'Package ID Wajib Ada!' }, { status: 400 });
  }

  try {
    // 🔥 JALUR KHUSUS: FORCE JSON PRIORITY (LOGISTIK STATIS) 🔥
    if (packageId === 'tryout-skd-free-01' || packageId === 'SKD_FREE_01') {
      
      console.log(`🚀 FORCE MODE: Mengabaikan Database, memuat Logistik JSON Segar...`);

      // Gabungkan Logistik
      const rawQuestions = [
        ...twkBatch1, ...twkBatch2, ...twkBatch3,       // TWK
        ...tiuVerbal, ...tiuNumerik, ...tiuCerita, ...tiuFigural, // TIU
        ...tkpBatch1, ...tkpBatch2, ...tkpBatch3        // TKP
      ];

      // Format Data agar seragam dengan Frontend
      const formattedJsonQuestions = rawQuestions.map((q: any, index) => {
        const normalizedOptions = q.options.map((opt: any, optIdx: number) => ({
             id: `opt-${index}-${optIdx}`,
             code: opt.key || opt.code || 'A', 
             text: opt.text,
             score: opt.score ?? (opt.key === q.answer ? 5 : 0)
        }));

        return {
            id: q.id || `manual-q-${index}`,
            packageId: packageId,
            category: q.category || q.type || 'TIU',
            questionText: q.text || q.question, 
            text: q.text || q.question,         
            image: q.image || null,
            discussion: q.explanation || "Pembahasan belum tersedia",
            options: normalizedOptions, 
            correctAnswer: q.answer, 
        };
      });

      console.log(`✅ SUKSES: ${formattedJsonQuestions.length} soal siap tempur (JSON).`);
      return NextResponse.json(formattedJsonQuestions);
    }

    // --- 🛡️ JALUR DATABASE (FALLBACK UNTUK PAKET LAIN) 🛡️ ---
    
    const rawQuestions = await prisma.tryoutQuestion.findMany({
      where: { packageId: packageId },
      orderBy: { createdAt: 'asc' }, 
    });

    // Parsing Options (String JSON -> Array Object)
    const dbQuestions = rawQuestions.map((q) => ({
        id: q.id,
        packageId: q.packageId,
        category: q.type, 
        questionText: q.text, 
        text: q.text,
        image: q.image || null, // Database punya kolom image, kita pakai
        
        // ✅ FIX: Ganti 'q.discussion' menjadi 'q.explanation' (Sesuai Schema)
        discussion: q.explanation || "Pembahasan belum tersedia", 
        
        // Parsing JSON String ke Object
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctAnswer: q.correctAnswer,
        score: q.score
    }));

    return NextResponse.json(dbQuestions);

  } catch (error) {
    console.error('CRITICAL_ERROR:', error);
    return NextResponse.json({ error: 'Gagal memuat soal ujian' }, { status: 500 });
  }
}