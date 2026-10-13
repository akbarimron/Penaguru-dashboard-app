import { DailyJournal, Student, Subject } from '../types';
import { isAttentionTag, statsFor } from './analytics';

// Penyusun draf rapor lokal. Semua kalimat diturunkan dari jurnal yang benar-benar
// dicatat guru (tag, skor, materi). Tidak ada isi yang dikarang: kalau jurnal
// kosong, draf juga kosong dan guru diminta mencatat dulu.

const POSITIVE_PHRASE: Record<string, string> = {
  '#paham_konsep': 'memahami konsep yang dipelajari dengan baik',
  '#aktif_bertanya': 'aktif bertanya dan menanggapi selama pembelajaran',
  '#tuntas_tugas': 'menuntaskan tugas sesuai target',
  '#kolaboratif': 'bekerja sama dengan baik bersama teman',
  '#mandiri': 'mampu menyelesaikan masalah secara mandiri',
  '#inisiatif': 'menunjukkan inisiatif tinggi',
};

const ATTENTION_PHRASE: Record<string, string> = {
  '#perlu_bimbingan': 'membutuhkan pendampingan tambahan pada langkah-langkah awal',
  '#belum_tuntas': 'perlu menuntaskan tugas yang tertinggal',
  '#miskonsepsi': 'perlu meluruskan beberapa konsep yang masih keliru',
  '#kurang_fokus': 'perlu menjaga fokus selama kegiatan inti',
  '#pasif_kelompok': 'perlu lebih berperan aktif dalam kerja kelompok',
  '#terlambat': 'perlu meningkatkan ketepatan waktu',
};

function level(score: number) {
  if (score >= 85) return 'sangat baik';
  if (score >= 75) return 'baik';
  if (score >= 60) return 'cukup';
  return 'perlu ditingkatkan';
}

function joinList(items: string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} serta ${items[items.length - 1]}`;
}

export interface DraftReport {
  keunggulan: string;
  rekomendasi: string;
  narasi: string;
  pesan_wali: string;
  basedOn: number;
}

export function draftReportFromJournals(student: Student, subject: Subject, journals: DailyJournal[], periode: string): DraftReport | null {
  const stats = statsFor(journals);
  if (!stats.scores) return null;

  const name = student.nama_lengkap.split(' ')[0];
  const tagCount = new Map<string, number>();
  journals.forEach((j) => j.tags.forEach((t) => tagCount.set(t, (tagCount.get(t) || 0) + 1)));
  const ranked = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  const positives = ranked.filter((t) => !isAttentionTag(t) && POSITIVE_PHRASE[t]).slice(0, 2);
  const attention = ranked.filter((t) => isAttentionTag(t) && ATTENTION_PHRASE[t]).slice(0, 2);
  const materi = [...new Set(journals.map((j) => j.materi))].slice(0, 2);

  const { kognitif, keterampilan, sikap } = stats.scores;
  const strongest = [
    ['pengetahuan', kognitif],
    ['keterampilan', keterampilan],
    ['sikap', sikap],
  ].sort((a, b) => (b[1] as number) - (a[1] as number))[0][0] as string;

  const keunggulan = positives.length
    ? `${name} ${joinList(positives.map((t) => POSITIVE_PHRASE[t]))}. Capaian paling menonjol ada pada ranah ${strongest}.`
    : `Capaian paling menonjol ${name} ada pada ranah ${strongest}.`;

  const rekomendasi = attention.length
    ? `${name} ${joinList(attention.map((t) => ATTENTION_PHRASE[t]))}.`
    : keterampilan < kognitif
    ? `${name} disarankan memperbanyak latihan praktik agar keterampilan setara dengan pemahamannya.`
    : `${name} disarankan mempertahankan kebiasaan belajarnya dan mencoba tantangan yang lebih tinggi.`;

  const narasi =
    `Pada ${periode}, ${student.nama_lengkap} mengikuti pembelajaran ${subject.nama}` +
    (materi.length ? ` dengan materi ${joinList(materi)}` : '') +
    `. Capaian pengetahuan ${level(kognitif)}, keterampilan ${level(keterampilan)}, dan sikap ${level(sikap)}. ` +
    `${keunggulan} ${rekomendasi}`;

  const pesan_wali =
    `Yth. ${student.nama_wali ? `Bapak/Ibu ${student.nama_wali}` : 'Orang tua/wali'}, berikut perkembangan ${name} di mapel ${subject.nama}. ` +
    `${keunggulan} ${rekomendasi} Terima kasih atas dukungan Bapak/Ibu di rumah.`;

  return { keunggulan, rekomendasi, narasi, pesan_wali, basedOn: journals.length };
}
