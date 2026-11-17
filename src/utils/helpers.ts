import type {
  ComplaintCategory,
  ComplaintItem,
  CounterCode,
  ServiceApplication,
  UrgencyLevel,
} from '../types';

export interface WibStatusInfo {
  isOpen: boolean;
  badgeText: string;
  subText: string;
  timeWib: string;
  dayLabel: string;
  scheduleLabel: string;
}

const DAYS_ID: Record<number, string> = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

export function getWibCounterStatus(date: Date = new Date()): WibStatusInfo {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  const weekdayShort = getPart('weekday');
  const hour = parseInt(getPart('hour'), 10);
  const minute = parseInt(getPart('minute'), 10);
  const second = getPart('second');

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dayIndex = weekdayMap[weekdayShort] ?? 1;
  const dayLabel = DAYS_ID[dayIndex] || 'Senin';
  const totalMinutes = hour * 60 + minute;
  const timeWib = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${second} WIB`;

  let isOpen = false;
  let scheduleLabel = 'Senin–Kamis 08.00–15.00 WIB · Jumat 08.00–14.00 WIB';

  if (dayIndex >= 1 && dayIndex <= 4) {
    // Senin-Kamis: 08.00 - 15.00 WIB
    isOpen = totalMinutes >= 8 * 60 && totalMinutes < 15 * 60;
    scheduleLabel = 'Senin–Kamis · 08.00 - 15.00 WIB';
  } else if (dayIndex === 5) {
    // Jumat: 08.00 - 14.00 WIB
    isOpen = totalMinutes >= 8 * 60 && totalMinutes < 14 * 60;
    scheduleLabel = 'Jumat · 08.00 - 14.00 WIB';
  } else {
    isOpen = false;
    scheduleLabel = 'Sabtu–Minggu (Loket Libur)';
  }

  return {
    isOpen,
    badgeText: isOpen
      ? 'LOKET BUKA'
      : 'LOKET TUTUP - Pendaftaran Online Tetap Buka 24 Jam',
    subText: isOpen
      ? `Pelayanan Tatap Muka Aktif (${scheduleLabel})`
      : 'Permohonan online diproses pada hari kerja berikutnya',
    timeWib,
    dayLabel,
    scheduleLabel,
  };
}

export function maskNik(nik: string): string {
  const clean = nik.replace(/\D/g, '');
  if (clean.length < 6) return '****************';
  return `${clean.slice(0, 6)}${'*'.repeat(Math.max(10, clean.length - 6))}`;
}

export function maskWhatsapp(wa: string): string {
  const clean = wa.replace(/\D/g, '');
  if (clean.length < 7) return '08******';
  return `${clean.slice(0, 4)}****${clean.slice(-3)}`;
}

export function formatDateTimeWib(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return (
    new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date) + ' WIB'
  );
}

export function formatShortDateWib(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function generateRegistrationCode(existing: ServiceApplication[]): string {
  const used = new Set(existing.map((a) => a.registrationCode));
  for (let i = 0; i < 50; i++) {
    const num = Math.floor(1100 + Math.random() * 8800);
    const code = `BLB-2026-${num}`;
    if (!used.has(code)) return code;
  }
  return `BLB-2026-${Date.now().toString().slice(-4)}`;
}

export function generateQueueNumber(
  counterCode: CounterCode,
  existing: ServiceApplication[]
): string {
  const matching = existing.filter((a) => a.queueNumber.startsWith(`${counterCode}-`));
  let maxNum = 0;
  for (const item of matching) {
    const numPart = parseInt(item.queueNumber.split('-')[1] || '0', 10);
    if (!Number.isNaN(numPart) && numPart > maxNum) maxNum = numPart;
  }
  const next = maxNum + 1;
  return `${counterCode}-${String(next).padStart(3, '0')}`;
}

export function generateComplaintCode(existing: ComplaintItem[]): string {
  let maxNum = 215;
  for (const item of existing) {
    const parts = item.ticketCode.split('-');
    const num = parseInt(parts[2] || '0', 10);
    if (!Number.isNaN(num) && num > maxNum) maxNum = num;
  }
  return `LPR-2026-${String(maxNum + 1).padStart(3, '0')}`;
}

export function detectUrgency(
  category: ComplaintCategory,
  title: string,
  chronology: string
): UrgencyLevel {
  const text = `${title} ${chronology}`.toLowerCase();
  if (
    category === 'Penerangan Jalan Umum (PJU)' ||
    category === 'Saluran Air / Lingkungan'
  ) {
    const keywords = ['padam', 'mati', 'gelap', 'tersumbat', 'banjir', 'meluap', 'mampet', 'rusak parah', 'rawan'];
    if (keywords.some((k) => text.includes(k))) {
      return 'Prioritas Tinggi';
    }
    return 'Prioritas Tinggi';
  }
  const urgentWords = ['darurat', 'ambruk', 'bahaya', 'banjir', 'kebakaran', 'kecelakaan', 'terputus'];
  return urgentWords.some((w) => text.includes(w)) ? 'Prioritas Tinggi' : 'Normal';
}

export function isApplicationOverdue(app: ServiceApplication, now: Date = new Date()): boolean {
  if (app.stage === 4) return false;
  const deadline = new Date(app.slaDeadlineAt).getTime();
  return now.getTime() > deadline;
}

export function getOverdueHours(app: ServiceApplication, now: Date = new Date()): number {
  const diff = now.getTime() - new Date(app.slaDeadlineAt).getTime();
  return Math.max(0, Math.round(diff / (60 * 60 * 1000)));
}
