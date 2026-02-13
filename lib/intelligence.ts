export interface IndicatorPerformance {
    label: string;
    score: number;
  }
  
  export interface ExtraMission {
    indicator: string;
    score: number;
    recommendation: string;
    packageId: string;
  }
  
  export interface RadarAuditResult {
    isCritical: boolean;
    sector: string;
    directive: string;
    color: string;
  }
  
  // 1. ALGORITMA ASUH PROAKTIF (ADAPTASI AYOCPNS KE TACTICAL STYLE)
  export const analyzePerformance = (analyticsData: IndicatorPerformance[]): ExtraMission | null => {
    const weakPoints = analyticsData
      .filter(item => item.score < 70)
      .sort((a, b) => a.score - b.score);
  
    if (weakPoints.length === 0) return null;
  
    const primaryWeakness = weakPoints[0];
  
    const packageMap: Record<string, string> = {
      'NASIONALISME': 'drill-twk-nasionalisme',
      'TIU NUMERIK': 'drill-tiu-numerik',
      'JEJARING KERJA': 'drill-tkp-jejaring',
      'BELA NEGARA': 'drill-twk-bela-negara',
      'PILAR NEGARA': 'drill-twk-pilar',
      'TIU FIGURAL': 'drill-tiu-figural',
      'ANTI RADIKALISME': 'drill-tkp-radikalisme'
    };
  
    return {
      indicator: primaryWeakness.label,
      score: primaryWeakness.score,
      recommendation: `Intel Alert: Sektor ${primaryWeakness.label} terdeteksi kritis (${primaryWeakness.score}%). Segera laksanakan drilling intensif untuk menambal kebocoran poin!`,
      packageId: packageMap[primaryWeakness.label] || 'drill-general-recovery'
    };
  };
  
  // 2. LOGIKA RADAR FEEDBACK LOOP (NEW: TRITUNGGAL AUDIT)
  export const auditRadarStats = (stats: { jar: number, lat: number, suh: number }): RadarAuditResult => {
    const sectors = [
      { id: 'JAR', name: 'AKADEMIK (JAR)', score: stats.jar, directive: 'Sektor akademik melemah. Segera laksanakan drilling TIU/TWK 30 menit.' },
      { id: 'LAT', name: 'JASMANI (LAT)', score: stats.lat, directive: 'Refleks fisik menurun. Laksanakan push-up 50x dan lari 15 menit.' },
      { id: 'SUH', name: 'KARAKTER (SUH)', score: stats.suh, directive: 'Kedisiplinan bocor. Lengkapi Daily Log dan unggah foto bukti segera!' }
    ];
  
    // Prioritaskan sektor yang paling kritis (< 50%)
    const weakSector = [...sectors].sort((a, b) => a.score - b.score)[0];
  
    if (weakSector.score < 50) {
      return {
        isCritical: true,
        sector: weakSector.name,
        directive: weakSector.directive,
        color: '#dc2626' // Merah Merdeka
      };
    }
  
    return {
      isCritical: false,
      sector: 'NORMAL',
      directive: 'Semua sektor dalam kondisi prima. Pertahankan ritme pengasuhan.',
      color: '#f97316' // Oranye Refleks
    };
  };
  
  // 3. LOGIKA TIME LEAK (5 SOAL TERLAMA - REFERENSI AYOCPNS)
  export const getTimeLeaks = (userAnswers: any[]) => {
    return userAnswers
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(ans => ({
        sequence: ans.sequence,
        duration: ans.duration,
        status: ans.isCorrect ? 'SECURED' : 'COMPROMISED'
      }));
  };