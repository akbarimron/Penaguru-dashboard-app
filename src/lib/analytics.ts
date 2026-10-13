import { DailyJournal, PresetTag, Student, StudentStatus, Subject, TeachingAssignment } from '../types';

export const PRESET_TAGS: PresetTag[] = [
  { label: '#paham_konsep', kind: 'positif' },
  { label: '#aktif_bertanya', kind: 'positif' },
  { label: '#tuntas_tugas', kind: 'positif' },
  { label: '#kolaboratif', kind: 'positif' },
  { label: '#mandiri', kind: 'positif' },
  { label: '#inisiatif', kind: 'positif' },
  { label: '#perlu_bimbingan', kind: 'perhatian' },
  { label: '#belum_tuntas', kind: 'perhatian' },
  { label: '#miskonsepsi', kind: 'perhatian' },
  { label: '#kurang_fokus', kind: 'perhatian' },
  { label: '#pasif_kelompok', kind: 'perhatian' },
  { label: '#terlambat', kind: 'perhatian' },
];

const ATTENTION = new Set(PRESET_TAGS.filter((t) => t.kind === 'perhatian').map((t) => t.label));

export function isAttentionTag(tag: string) {
  return ATTENTION.has(tag);
}

export const RATING_LABELS = ['Belum muncul', 'Mulai berkembang', 'Cukup', 'Baik', 'Sangat baik'];

export interface DomainScores {
  kognitif: number;
  keterampilan: number;
  sikap: number;
}

export interface StudentStats {
  count: number;
  scores: DomainScores | null; // skala 0-100
  composite: number | null;
  status: StudentStatus;
  reason: string | null;
  lastDate: string | null;
  trend: 'naik' | 'turun' | 'stabil' | null;
  topTags: { tag: string; count: number }[];
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function composite(j: Pick<DailyJournal, 'nilai_kognitif' | 'nilai_keterampilan' | 'skor_sikap'>) {
  return (j.nilai_kognitif * 0.4 + j.nilai_keterampilan * 0.4 + j.skor_sikap * 0.2) * 20;
}

// Ambang status mengikuti proposal (FR-08): kognitif < 60 atau keterampilan < 55
// = Kritis, < 75 / < 70 = Perhatian. Ditambah peringatan dini dari tag:
// 2 dari 3 catatan terakhir bertanda "perlu perhatian".
export function statsFor(journals: DailyJournal[]): StudentStats {
  if (journals.length === 0) {
    return { count: 0, scores: null, composite: null, status: 'Belum ada data', reason: null, lastDate: null, trend: null, topTags: [] };
  }
  const sorted = [...journals].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const scores: DomainScores = {
    kognitif: Math.round(avg(sorted.map((j) => j.nilai_kognitif)) * 20),
    keterampilan: Math.round(avg(sorted.map((j) => j.nilai_keterampilan)) * 20),
    sikap: Math.round(avg(sorted.map((j) => j.skor_sikap)) * 20),
  };
  const comp = Math.round(avg(sorted.map(composite)));

  let status: StudentStatus = 'Aman';
  let reason: string | null = null;
  if (scores.kognitif < 60 || scores.keterampilan < 55) {
    status = 'Kritis';
    reason = scores.kognitif < 60 ? `Pengetahuan rata-rata ${scores.kognitif}` : `Keterampilan rata-rata ${scores.keterampilan}`;
  } else if (scores.kognitif < 75 || scores.keterampilan < 70) {
    status = 'Perhatian';
    reason = scores.kognitif < 75 ? `Pengetahuan rata-rata ${scores.kognitif}` : `Keterampilan rata-rata ${scores.keterampilan}`;
  }
  const recent = sorted.slice(0, 3);
  const flaggedRecent = recent.filter((j) => j.tags.some(isAttentionTag)).length;
  if (recent.length >= 2 && flaggedRecent >= 2 && status === 'Aman') {
    status = 'Perhatian';
    reason = `${flaggedRecent} dari ${recent.length} catatan terakhir bertanda perlu perhatian`;
  }

  let trend: StudentStats['trend'] = null;
  if (sorted.length >= 4) {
    const latest = avg(sorted.slice(0, 2).map(composite));
    const before = avg(sorted.slice(2, 4).map(composite));
    trend = latest - before > 4 ? 'naik' : before - latest > 4 ? 'turun' : 'stabil';
  }

  const tagCount = new Map<string, number>();
  sorted.forEach((j) => j.tags.forEach((t) => tagCount.set(t, (tagCount.get(t) || 0) + 1)));
  const topTags = [...tagCount.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return { count: sorted.length, scores, composite: comp, status, reason, lastDate: sorted[0].tanggal, trend, topTags };
}

export function journalsOf(journals: DailyJournal[], filter: { assignmentId?: string; studentId?: string; classId?: string }) {
  return journals.filter(
    (j) =>
      (!filter.assignmentId || j.assignment_id === filter.assignmentId) &&
      (!filter.studentId || j.student_id === filter.studentId) &&
      (!filter.classId || j.class_id === filter.classId)
  );
}

const STATUS_RANK: Record<StudentStatus, number> = { Kritis: 3, Perhatian: 2, Aman: 1, 'Belum ada data': 0 };

export function worstStatus(list: StudentStatus[]): StudentStatus {
  return list.reduce<StudentStatus>((w, s) => (STATUS_RANK[s] > STATUS_RANK[w] ? s : w), 'Belum ada data');
}

export function sortByUrgency<T extends { stats: StudentStats }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => STATUS_RANK[b.stats.status] - STATUS_RANK[a.stats.status]);
}

export interface AssignmentSummary {
  journalCount: number;
  observedStudents: number;
  averages: DomainScores | null;
  counts: Record<StudentStatus, number>;
  rows: { student: Student; stats: StudentStats }[];
}

export function assignmentSummary(assignment: TeachingAssignment, students: Student[], journals: DailyJournal[]): AssignmentSummary {
  const classStudents = students.filter((s) => s.class_id === assignment.class_id);
  const own = journals.filter((j) => j.assignment_id === assignment.id);
  const rows = classStudents.map((student) => ({ student, stats: statsFor(own.filter((j) => j.student_id === student.id)) }));
  const observed = rows.filter((r) => r.stats.scores);
  const counts: Record<StudentStatus, number> = { Aman: 0, Perhatian: 0, Kritis: 0, 'Belum ada data': 0 };
  rows.forEach((r) => (counts[r.stats.status] += 1));
  const averages = observed.length
    ? {
        kognitif: Math.round(avg(observed.map((r) => r.stats.scores!.kognitif))),
        keterampilan: Math.round(avg(observed.map((r) => r.stats.scores!.keterampilan))),
        sikap: Math.round(avg(observed.map((r) => r.stats.scores!.sikap))),
      }
    : null;
  return { journalCount: own.length, observedStudents: observed.length, averages, counts, rows };
}

export interface SubjectStat {
  assignment: TeachingAssignment;
  subject: Subject;
  stats: StudentStats;
}

// Ringkasan lintas mapel untuk satu siswa, dipakai wali kelas.
export function crossSubjectStats(
  student: Student,
  assignments: TeachingAssignment[],
  subjects: Subject[],
  journals: DailyJournal[]
): { perSubject: SubjectStat[]; overall: StudentStatus } {
  const perSubject = assignments
    .filter((a) => a.class_id === student.class_id)
    .map((assignment) => ({
      assignment,
      subject: subjects.find((s) => s.id === assignment.subject_id)!,
      stats: statsFor(journals.filter((j) => j.assignment_id === assignment.id && j.student_id === student.id)),
    }))
    .filter((r) => r.subject);
  return { perSubject, overall: worstStatus(perSubject.map((p) => p.stats.status)) };
}
