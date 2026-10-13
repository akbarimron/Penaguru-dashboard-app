import { Semester, ScheduleSlot, Weekday } from '../types';

export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const HARI_SINGKAT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
export const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, days: number): Date {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

export function formatLongDate(iso: string): string {
  const d = fromISODate(iso);
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(iso: string): string {
  const d = fromISODate(iso);
  return `${d.getDate()} ${BULAN_SINGKAT[d.getMonth()]}`;
}

export function relativeDay(iso: string, today = new Date()): string {
  const diff = Math.round((fromISODate(iso).getTime() - fromISODate(toISODate(today)).getTime()) / 86400000);
  if (diff === 0) return 'Hari ini';
  if (diff === -1) return 'Kemarin';
  if (diff === 1) return 'Besok';
  if (diff < 0 && diff > -7) return `${-diff} hari lalu`;
  if (diff > 0 && diff < 7) return `${diff} hari lagi`;
  return formatShortDate(iso);
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

// Tahun ajaran Indonesia: Juli - Juni. Ganjil Juli-Desember.
export function currentAcademicTerm(now = new Date()): { tahun_ajaran: string; semester: Semester } {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (m >= 7) return { tahun_ajaran: `${y}/${y + 1}`, semester: 'Ganjil' };
  return { tahun_ajaran: `${y - 1}/${y}`, semester: 'Genap' };
}

export function reportPeriods(now = new Date()): string[] {
  const { tahun_ajaran, semester } = currentAcademicTerm(now);
  return [`PTS ${semester} ${tahun_ajaran}`, `PAS ${semester} ${tahun_ajaran}`];
}

function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export type SessionState = 'berlangsung' | 'berikutnya' | 'selesai';

export function todayWeekday(now = new Date()): Weekday | null {
  const d = now.getDay();
  return d === 0 ? null : (d as Weekday);
}

export function sessionState(slot: ScheduleSlot, now = new Date()): SessionState {
  const t = now.getHours() * 60 + now.getMinutes();
  if (t < minutes(slot.jam_mulai)) return 'berikutnya';
  if (t <= minutes(slot.jam_selesai)) return 'berlangsung';
  return 'selesai';
}

export function slotSortKey(slot: ScheduleSlot): number {
  return slot.hari * 10000 + minutes(slot.jam_mulai);
}

export function monthMatrix(year: number, month: number): (Date | null)[] {
  // Minggu dimulai Senin, sesuai kebiasaan kalender sekolah.
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
