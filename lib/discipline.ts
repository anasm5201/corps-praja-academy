import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail-service'; 

// 1. FUNGSI PENERBITAN E-SP OTOMATIS [cite: 2026-01-05 081950]
export async function issueElectronicSP(userId: string, level: number, sector: string) {
  const spType = `SP-${level}`;
  const subject = `[OFFICIAL] SURAT PERINGATAN ${level} - CORPS PRAJA ACADEMY`;
  
  const content = `
    KADET YANG TERHORMAT,
    
    Berdasarkan audit Intelligence Radar, sektor ${sector} Anda berada di zona CRITICAL (< 50%) selama lebih dari 48 jam [cite: 2026-01-05 081950].
    Anda telah mengabaikan peringatan RED ALERT berulang kali.
    
    Dengan ini, sistem menerbitkan SURAT PERINGATAN (e-SP) ${level} [cite: 2026-01-05 081950].
    
    TINDAKAN SEGERA:
    1. Laksanakan Drilling Sektor ${sector} sekarang.
    2. Laporkan Bukti Foto kegiatan pada menu Daily Log [cite: 2026-01-05 081950].
    
    PENTING: Kegagalan merespons akan berdampak pada penurunan Rank IPDN Anda [cite: 2026-01-05 081950].
    Jika mencapai SP-3 (Wasana), Anda akan dihadapkan pada SIDANG KEHORMATAN VIRTUAL [cite: 2026-01-05 082717].
    
    DISIPLIN ADALAH NAFASKU.
  `;

  await prisma.disciplinaryRecord.create({
    data: {
      userId,
      type: spType,
      reason: `Insubordinasi Taktis Sektor ${sector} > 48 jam`,
      isResolved: false
    }
  });

  await sendEmail(userId, subject, content);
}

// 2. GATEKEEPER SIDANG KEHORMATAN [cite: 2026-01-05 082717]
export async function checkHonorCourtStatus(userId: string) {
  const activeSP3 = await prisma.disciplinaryRecord.findFirst({
    where: { userId, type: "SP-3", isResolved: false }
  });

  if (activeSP3) {
    return {
      isLocked: true,
      reason: "SIDANG KEHORMATAN VIRTUAL",
      requirement: "Lulus Simulasi Wasana (Skor > 450) atau menunggu Keputusan Amnesti Komandan [cite: 2026-01-05 082717, 2026-01-05 083827]"
    };
  }
  return { isLocked: false };
}

// 3. RECOVERY LOGIC: SIMULASI WASANA [cite: 2026-01-05 082717]
export async function resolveHonorCourt(userId: string, examScore: number) {
  if (examScore >= 450) {
    await prisma.disciplinaryRecord.updateMany({
      where: { userId, isResolved: false },
      data: { isResolved: true }
    });
    
    await prisma.user.update({
      where: { id: userId },
      data: { suhStats: 75 } // Pulihkan Sektor SUH ke level dasar aman [cite: 2026-01-05 082717]
    });
    
    return { success: true, message: "STATUS OPERATIF DIPULIHKAN MELALUI PRESTASI AKADEMIK." };
  }
  return { success: false, message: "SKOR TIDAK MENCUKUPI. TETAP DALAM STATUS SUSPENDED." };
}

// 4. EXECUTIVE OVERRIDE: AMNESTI KOMANDAN [cite: 2026-01-05 083827]
export async function grantCommanderAmnesty(userId: string, reason: string) {
  // Pulihkan semua catatan disiplin aktif
  await prisma.disciplinaryRecord.updateMany({
    where: { userId, isResolved: false },
    data: { 
      isResolved: true,
      reason: { append: ` [AMNESTI_KOMANDAN: ${reason}]` } 
    }
  });

  // Pulihkan Radar SUH ke level optimal (Asih)
  await prisma.user.update({
    where: { id: userId },
    data: { suhStats: 85 } 
  });

  return { 
    success: true, 
    message: "HAK AMNESTI DITEGAKKAN. Status operatif Kadet telah dipulihkan sepenuhnya [cite: 2026-01-05 083827]." 
  };
}