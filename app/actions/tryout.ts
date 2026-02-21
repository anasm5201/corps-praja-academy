'use server'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- KONFIGURASI PASSING GRADE ---
const PASSING_GRADE = { TWK: 65, TIU: 80, TKP: 166 };

type AnswerInput = {
  questionId: string;
  answerCode: string;
};

// =========================================================
// THE ULTIMATE KEYWORDS DICTIONARY (STANDAR BKN TERBARU)
// =========================================================

const TWK_KEYWORDS = {
  "NASIONALISME": ["nasionalisme", "patriotisme", "cinta tanah air", "identitas nasional", "kepentingan nasional", "chauvinisme", "bangga buatan", "pahlawan", "rela berkorban"],
  "INTEGRITAS": ["integritas", "jujur", "kejujuran", "korupsi", "gratifikasi", "suap", "kpk", "kolusi", "nepotisme", "akuntabilitas", "transparansi", "tanggung jawab", "kode etik"],
  "BELA_NEGARA": ["bela negara", "ancaman", "militer", "radikalisme", "terorisme", "tni", "polri", "ketahanan nasional", "wawasan nusantara", "kedaulatan"],
  "PANCASILA": ["pancasila", "sila ", "ideologi", "dasar negara", "bpupki", "ppki", "garuda", "gotong royong", "musyawarah", "mufakat", "keadilan sosial", "nilai dasar"],
  "UUD_1945": ["uud", "konstitusi", "pasal", "ayat", "amandemen", "dpr", "mpr", "presiden", "mahkamah", "hukum", "hak asasi", "ham", "demokrasi", "undang-undang"],
  "NKRI": ["nkri", "kesatuan", "sejarah indonesia", "proklamasi", "rengasdengklok", "belanda", "jepang", "perjanjian", "sistem pemerintahan", "pahlawan nasional"],
  "BHINNEKA_TUNGGAL_IKA": ["bhinneka", "toleransi", "suku", "agama", "ras", "sara", "diskriminasi", "keberagaman", "pluralisme", "konflik sosial", "integrasi", "hoaks"],
  "BAHASA_INDONESIA": ["bahasa indonesia", "ejaan", "eyd", "puebi", "kata baku", "kalimat efektif", "gagasan pokok", "paragraf", "tanda baca", "antonim", "sinonim"]
};

const TIU_KEYWORDS = {
  "VERBAL_ANALOGI": ["analogi", "padanan kata", "hubungan kata", "sinonim", "antonim", "sepadan", "berkaitan", "persamaan makna", "fungsi"],
  "VERBAL_SILOGISME": ["silogisme", "premis", "kesimpulan", "semua", "beberapa", "sebagian", "jika maka", "maka", "tidak ada", "modus ponens", "modus tollens"],
  "VERBAL_ANALITIS": ["analitis", "urutan duduk", "posisi", "berdampingan", "berseberangan", "syarat", "lebih dari", "kurang dari", "susunan", "meja bundar", "peringkat"],
  "NUMERIK_BERHITUNG": ["pecahan", "desimal", "persen", "akar", "kuadrat", "pangkat", "penjumlahan", "pengurangan", "perkalian", "pembagian", "hasil hitung", "nilai x"],
  "NUMERIK_DERET": ["deret", "pola angka", "barisan", "suku ke", "selisih angka", "huruf selanjutnya", "pola huruf", "fibonacci", "rasio", "angka berikutnya"],
  "NUMERIK_PERBANDINGAN": ["kuantitatif", "x dan y", "x > y", "x < y", "x = y", "hubungan x dan y", "kuantitas a", "kuantitas b", "membandingkan nilai"],
  "NUMERIK_CERITA": ["kecepatan", "jarak", "waktu", "laba", "rugi", "diskon", "harga beli", "harga jual", "pekerja", "hari selesai", "perbandingan senilai", "berbalik nilai", "rata-rata", "umur"],
  "FIGURAL_ANALOGI": ["analogi gambar", "hubungan gambar", "perubahan bentuk", "warna", "elemen gambar", "ukuran membesar", "berubah warna"],
  "FIGURAL_KETIDAKSAMAAN": ["ketidaksamaan", "gambar berbeda", "pola ganjil", "tidak sekelompok", "kecuali", "yang bukan kelompoknya", "cari yang beda"],
  "FIGURAL_SERIAL": ["serial", "melanjutkan pola", "gambar selanjutnya", "rotasi", "diputar", "searah jarum jam", "berlawanan arah", "pencerminan", "sudut", "jaring-jaring", "kubus"]
};

const TKP_KEYWORDS = {
  "PELAYANAN_PUBLIK": ["pelayanan", "publik", "pasien", "klien", "masyarakat", "warga", "antrean", "komplain", "marah", "ramah", "senyum", "membantu", "kepuasan", "prosedur", "sop"],
  "JEJARING_KERJA": ["jejaring", "kerja", "rekan", "kolega", "tim", "atasan", "pimpinan", "bawahan", "kolaborasi", "koordinasi", "tugas kelompok", "konflik", "miskomunikasi", "sinergi"],
  "SOSIAL_BUDAYA": ["sosial", "budaya", "adat", "agama", "suku", "ras", "daerah", "lingkungan baru", "beradaptasi", "toleransi", "menghargai", "minoritas", "mayoritas", "empati"],
  "TIK": ["teknologi", "informasi", "komunikasi", "sistem baru", "aplikasi", "software", "komputer", "internet", "digital", "inovasi", "efisien", "otomatisasi", "gaptek", "database"],
  "PROFESIONALISME": ["profesional", "tanggung jawab", "amanah", "deadline", "tenggat waktu", "lembur", "tugas dadakan", "fokus", "prioritas", "cuti", "sakit", "keluarga", "kepentingan pribadi"],
  "ANTI_RADIKALISME": ["radikal", "teror", "paham menyimpang", "kebencian", "provokasi", "hasutan", "mencurigakan", "melaporkan", "kritis", "kekerasan", "intoleran", "propaganda"]
};

export async function submitExam(attemptId: string, userAnswers: AnswerInput[]) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) return { success: false, message: "Akses ditolak." };

    const attempt = await prisma.tryoutAttempt.findUnique({
      where: { id: attemptId },
      include: { package: { include: { questions: true } } }
    });

    if (!attempt) return { success: false, message: "Data ujian tidak ditemukan." };
    if (attempt.isFinished) return { success: false, message: "Ujian ini sudah diselesaikan." };

    let totalScore = 0;
    let scoreTwk = 0;
    let scoreTiu = 0;
    let scoreTkp = 0;
    
    // Penampung kelemahan dinamis
    let weaknessReport: any = { TWK: {}, TIU: {}, TKP: {} };

    const questionMap = new Map(attempt.package.questions.map(q => [q.id, q]));

    // --- MENGHITUNG & MEMINDAI JAWABAN ---
    userAnswers.forEach((ans) => {
      const question = questionMap.get(ans.questionId);
      
      if (question) {
        let points = 0;
        let isCorrect = false;

        // Hitung Poin
        try {
            if (question.options && question.options.trim().startsWith("[")) {
                const parsedOptions = JSON.parse(question.options);
                const selectedOpt = parsedOptions.find((opt: any) => opt.code === ans.answerCode);
                if (selectedOpt) points = Number(selectedOpt.score) || 0;
                isCorrect = points === 5; 
            } else {
                if (question.correctAnswer === ans.answerCode) {
                    points = question.score || 5;
                    isCorrect = true;
                }
            }
        } catch (e) {
            if (question.correctAnswer === ans.answerCode) { points = 5; isCorrect = true; }
        }

        // Akumulasi Skor
        const type = (question.type || "TWK").toUpperCase();
        if (type.includes('TWK')) scoreTwk += points;
        else if (type.includes('TIU')) scoreTiu += points;
        else if (type.includes('TKP')) scoreTkp += points;
        else totalScore += points; 

        // --- 🧠 OTAK PEMINDAI ANALITIK (THE SCANNER) ---
        const textToScan = ((question.text || "") + " " + (question.explanation || "")).toLowerCase();

        const scanKeywords = (dictionary: any, reportRef: any) => {
            let found = false;
            for (const [category, keywords] of Object.entries(dictionary)) {
                if ((keywords as string[]).some(kw => textToScan.includes(kw))) {
                    reportRef[category] = (reportRef[category] || 0) + 1;
                    found = true; break;
                }
            }
            if (!found) reportRef["LAINNYA"] = (reportRef["LAINNYA"] || 0) + 1;
        };

        // Jika TWK Salah
        if (type.includes('TWK') && !isCorrect) {
            scanKeywords(TWK_KEYWORDS, weaknessReport.TWK);
        }
        // Jika TIU Salah
        else if (type.includes('TIU') && !isCorrect) {
            scanKeywords(TIU_KEYWORDS, weaknessReport.TIU);
        }
        // Jika TKP Poinnya rendah (1, 2, atau 3)
        else if (type.includes('TKP') && points <= 3) {
            scanKeywords(TKP_KEYWORDS, weaknessReport.TKP);
        }
      }
    });

    totalScore = scoreTwk + scoreTiu + scoreTkp;

    // --- MERACIK RAPOR FINAL UNTUK MENTOR AI ---
    const getWorstCategory = (report: any) => {
        let worst = "AMAN"; let max = 0;
        for (const [cat, count] of Object.entries(report)) {
            if ((count as number) > max) { max = count as number; worst = cat; }
        }
        return worst;
    };

    const finalAnalysisObj = {
        worstTwk: getWorstCategory(weaknessReport.TWK),
        worstTiu: getWorstCategory(weaknessReport.TIU),
        worstTkp: getWorstCategory(weaknessReport.TKP)
    };

    // 4. Update Database
    await prisma.$transaction(async (tx) => {
      await tx.tryoutAttempt.update({
        where: { id: attemptId },
        data: {
          isFinished: true,
          finishedAt: new Date(),
          score: totalScore,
          twkScore: scoreTwk,
          tiuScore: scoreTiu,
          tkpScore: scoreTkp,
          answers: JSON.stringify(userAnswers),
          analysis: JSON.stringify(finalAnalysisObj) // Rapor 3 Pilar Tersimpan!
        }
      });

      const xpGained = Math.floor(totalScore / 10) + 50;
      await tx.user.update({
        where: { id: userId },
        data: { xp: { increment: xpGained } }
      });
    });

    revalidatePath("/dashboard"); 
    revalidatePath("/dashboard/history");
    revalidatePath(`/dashboard/result/${attempt.packageId}/${attemptId}`);

    return { success: true, message: "Ujian berhasil disubmit." };

  } catch (error) {
    console.error("[SUBMIT EXAM ERROR]", error);
    return { success: false, message: "Gagal menyimpan data ujian." };
  }
}

export const submitTryout = submitExam;