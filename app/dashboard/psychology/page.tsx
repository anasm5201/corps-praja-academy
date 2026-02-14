import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PsychologyList from "@/components/dashboard/PsychologyList";

export const dynamic = "force-dynamic";

export default async function PsychologyPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/auth/login");

  // 1. AMBIL DATA USER (Untuk Cek Akses)
  const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true, createdAt: true }
  });

  // 2. LOGIKA KEPEMILIKAN AKSES (Premium & Trial)
  const isPremium = ["SOLO_FIGHTER", "INTENSIVE_SQUAD"].includes(user?.subscriptionType || "FREE");
  const joinDate = new Date(user?.createdAt || new Date()).getTime();
  const now = new Date().getTime();
  const hoursSinceJoin = (now - joinDate) / (1000 * 60 * 60);
  const isTrialActive = hoursSinceJoin < 2; 

  // 3. TARIK SEMUA PAKET PSIKOLOGI DARI DATABASE
  const packages = await prisma.tryoutPackage.findMany({
    where: {
      isPublished: true,
      OR: [
        { category: "KECERMATAN" },
        { category: "KECERDASAN" },
        { category: "KEPRIBADIAN" },
        { category: "PSIKOLOGI" },
        { title: { contains: "Kecermatan", mode: 'insensitive' } },
        { title: { contains: "Psikologi", mode: 'insensitive' } },
        { title: { contains: "Kepribadian", mode: 'insensitive' } }
      ]
    },
    include: {
      _count: { select: { questions: true } },
      attempts: {
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    // SORTIR: Prioritaskan yang isFree = true di urutan paling atas!
    orderBy: [
        { isFree: 'desc' }, 
        { title: 'asc' }
    ]
  });

  // 4. MAPPING UNTUK UI & INJEKSI STATUS GEMBOK
  const serializedPackages = packages.map(pkg => {
    const lastAttempt = pkg.attempts[0];
    let finalCategory = pkg.category;

    // Normalisasi kategori agar masuk ke Tab yang benar di UI
    const title = pkg.title.toLowerCase();
    if (title.includes("kecermatan")) finalCategory = "KECERMATAN";
    else if (title.includes("kepribadian") || title.includes("suh")) finalCategory = "KEPRIBADIAN";
    else if (title.includes("kecerdasan") || title.includes("jar") || title.includes("psikologi")) finalCategory = "KECERDASAN";

    // KUNCI KEPUTUSAN: Paket digembok JIKA BUKAN Premium, BUKAN Trial, dan BUKAN paket Gratis
    const isLocked = !isPremium && !isTrialActive && !pkg.isFree;

    return {
      id: pkg.id,
      title: pkg.title,
      category: finalCategory, 
      description: pkg.description,
      duration: pkg.duration,
      _count: pkg._count,
      isFinished: lastAttempt?.isFinished || false,
      isLocked: isLocked, // <--- INJEKSI STATUS GEMBOK KE UI
      isFree: pkg.isFree  
    };
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      <PsychologyList initialPackages={serializedPackages} />
    </div>
  );
}