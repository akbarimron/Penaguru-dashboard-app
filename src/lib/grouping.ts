import { DailyJournal, MemberRole, Student } from '../types';
import { statsFor } from './analytics';

export interface GroupDraft {
  nama_kelompok: string;
  members: { student_id: string; peran: MemberRole; skor: number | null }[];
  average: number | null;
}

// Pembagian ular (serpentine): siswa diurutkan dari skor tertinggi lalu dibagikan
// bolak-balik ke tiap kelompok, sehingga kelompok tidak menumpuk siswa kuat.
// Siswa tanpa data jurnal ditaruh di akhir dan disebar rata.
export function balancedGroups(students: Student[], journals: DailyJournal[], assignmentId: string, groupCount: number): GroupDraft[] {
  const count = Math.max(2, Math.min(groupCount, students.length || 2));
  const scored = students
    .map((s) => ({
      student: s,
      score: statsFor(journals.filter((j) => j.assignment_id === assignmentId && j.student_id === s.id)).composite,
    }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  const groups: GroupDraft[] = Array.from({ length: count }, (_, i) => ({
    nama_kelompok: `Kelompok ${i + 1}`,
    members: [],
    average: null,
  }));

  scored.forEach((item, index) => {
    const cycle = Math.floor(index / count);
    const pos = index % count;
    const target = cycle % 2 === 0 ? pos : count - 1 - pos;
    const isFirst = groups[target].members.length === 0;
    const peran: MemberRole = isFirst ? 'Ketua' : item.score !== null && item.score >= 80 ? 'Mentor Sebaya' : 'Anggota';
    groups[target].members.push({ student_id: item.student.id, peran, skor: item.score });
  });

  groups.forEach((g) => {
    const known = g.members.map((m) => m.skor).filter((x): x is number => x !== null);
    g.average = known.length ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : null;
  });
  return groups;
}
