// Data contoh untuk mode demo. Semua nama sekolah, guru, dan siswa di sini
// fiktif dan UI selalu menampilkan label "Mode demo" saat data ini dipakai.
// Tanggal dihitung relatif terhadap hari ini agar demo tidak basi.
import {
  Assessment,
  ClassRoom,
  DailyJournal,
  HomeroomReport,
  School,
  Student,
  StudyGroup,
  Subject,
  SubjectReport,
  Teacher,
  TeachingAssignment,
} from '../types';
import { addDays, currentAcademicTerm, reportPeriods, toISODate } from '../lib/dates';
import { draftReportFromJournals } from '../lib/reportGenerator';

export interface DemoUser {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
}

export interface DemoDB {
  version: number;
  users: DemoUser[];
  schools: School[];
  teachers: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  assignments: TeachingAssignment[];
  students: Student[];
  journals: DailyJournal[];
  reports: SubjectReport[];
  homeroomReports: HomeroomReport[];
  assessments: Assessment[];
  groups: StudyGroup[];
}

export const DEMO_DB_VERSION = 2;

// Akun demo lokal. Kata sandi ini hanya berlaku di mode demo (tersimpan
// sebagai hash SHA-256 di perangkat) dan tidak dipakai di Supabase.
export const DEMO_PASSWORD = 'penaguru-demo';

export const DEMO_ACCOUNTS = [
  { email: 'hendra@penaguru.test', label: 'Pak Hendra', role: 'Wali kelas X PPLG 1 + guru Informatika di 3 kelas' },
  { email: 'ratih@penaguru.test', label: 'Bu Ratih', role: 'Guru Matematika saja, di 2 kelas' },
  { email: 'sari@penaguru.test', label: 'Bu Sari', role: 'Wali kelas X PPLG 2 + guru Bahasa Indonesia' },
];

// Pseudo-acak deterministik supaya demo selalu sama.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Level = 'kuat' | 'sedang' | 'lemah';

const NOTES: Record<Level, string[]> = {
  kuat: [
    'Menyelesaikan latihan lebih cepat lalu membantu teman sebangku.',
    'Menjelaskan langkah penyelesaian dengan runtut saat diminta ke depan.',
    'Mengerjakan soal tantangan tanpa bantuan.',
  ],
  sedang: [
    'Mengikuti langkah dengan baik, masih bertanya pada bagian akhir.',
    'Tugas selesai, beberapa jawaban perlu diperiksa ulang.',
    'Aktif dalam diskusi kelompok, perlu latihan mandiri tambahan.',
  ],
  lemah: [
    'Belum menyelesaikan latihan inti, perlu contoh tambahan.',
    'Masih keliru pada konsep dasar, sudah diberi lembar latihan ulang.',
    'Sering kehilangan fokus setelah 20 menit, perlu dicek berkala.',
  ],
};

const TAGS: Record<Level, string[][]> = {
  kuat: [['#paham_konsep', '#mandiri'], ['#tuntas_tugas', '#inisiatif'], ['#kolaboratif', '#paham_konsep']],
  sedang: [['#aktif_bertanya'], ['#tuntas_tugas'], ['#kolaboratif', '#perlu_bimbingan']],
  lemah: [['#perlu_bimbingan', '#belum_tuntas'], ['#miskonsepsi'], ['#kurang_fokus', '#pasif_kelompok']],
};

const SCORE: Record<Level, [number, number]> = { kuat: [4, 5], sedang: [3, 4], lemah: [2, 3] };

export function buildSeed(now = new Date()): Omit<DemoDB, 'users'> {
  const { tahun_ajaran, semester } = currentAcademicTerm(now);
  const [pts] = reportPeriods(now);
  const school: School = { id: 'sch-demo', nama: 'Sekolah Demo PenaGuru', npsn: null, kode_gabung: 'DEMO26' };

  const teachers: Teacher[] = [
    { id: 't-hendra', school_id: school.id, nama_lengkap: 'Hendra Setiawan, S.Kom.', nip: null, email: 'hendra@penaguru.test' },
    { id: 't-ratih', school_id: school.id, nama_lengkap: 'Ratih Kusumawardani, S.Pd.', nip: null, email: 'ratih@penaguru.test' },
    { id: 't-sari', school_id: school.id, nama_lengkap: 'Sari Wulandari, S.Pd.', nip: null, email: 'sari@penaguru.test' },
    { id: 't-bayu', school_id: school.id, nama_lengkap: 'Bayu Pratama, S.Pd.', nip: null, email: 'bayu@penaguru.test' },
  ];

  const mkClass = (id: string, nama: string, tingkat: ClassRoom['tingkat'], homeroom: string | null): ClassRoom => ({
    id, school_id: school.id, nama_kelas: nama, tingkat, tahun_ajaran, semester, homeroom_teacher_id: homeroom,
  });
  const classes: ClassRoom[] = [
    mkClass('c-x1', 'X PPLG 1', 'X', 't-hendra'),
    mkClass('c-x2', 'X PPLG 2', 'X', 't-sari'),
    mkClass('c-xi', 'XI RPL 1', 'XI', null),
  ];

  const subjects: Subject[] = [
    { id: 'sub-inf', school_id: school.id, nama: 'Informatika', warna: 'violet' },
    { id: 'sub-mat', school_id: school.id, nama: 'Matematika', warna: 'yellow' },
    { id: 'sub-bin', school_id: school.id, nama: 'Bahasa Indonesia', warna: 'coral' },
    { id: 'sub-big', school_id: school.id, nama: 'Bahasa Inggris', warna: 'green' },
    { id: 'sub-pbo', school_id: school.id, nama: 'Pemrograman Berorientasi Objek', warna: 'blue' },
    { id: 'sub-ipas', school_id: school.id, nama: 'IPAS', warna: 'pink' },
  ];

  const assignments: TeachingAssignment[] = [
    { id: 'a-inf-x1', teacher_id: 't-hendra', class_id: 'c-x1', subject_id: 'sub-inf', materi_aktif: 'Percabangan dan perulangan', jadwal: [{ hari: 2, jam_mulai: '07:00', jam_selesai: '09:15' }, { hari: 4, jam_mulai: '10:00', jam_selesai: '11:30' }] },
    { id: 'a-inf-x2', teacher_id: 't-hendra', class_id: 'c-x2', subject_id: 'sub-inf', materi_aktif: 'Struktur data list', jadwal: [{ hari: 3, jam_mulai: '07:00', jam_selesai: '08:30' }, { hari: 5, jam_mulai: '08:30', jam_selesai: '10:00' }] },
    { id: 'a-pbo-xi', teacher_id: 't-hendra', class_id: 'c-xi', subject_id: 'sub-pbo', materi_aktif: 'Pewarisan dan enkapsulasi', jadwal: [{ hari: 1, jam_mulai: '10:00', jam_selesai: '12:15' }, { hari: 2, jam_mulai: '12:30', jam_selesai: '14:00' }] },
    { id: 'a-mat-x1', teacher_id: 't-ratih', class_id: 'c-x1', subject_id: 'sub-mat', materi_aktif: 'Fungsi linear', jadwal: [{ hari: 1, jam_mulai: '07:00', jam_selesai: '08:30' }, { hari: 2, jam_mulai: '09:30', jam_selesai: '11:00' }] },
    { id: 'a-mat-x2', teacher_id: 't-ratih', class_id: 'c-x2', subject_id: 'sub-mat', materi_aktif: 'Barisan dan deret', jadwal: [{ hari: 2, jam_mulai: '07:00', jam_selesai: '08:30' }, { hari: 4, jam_mulai: '07:00', jam_selesai: '08:30' }] },
    { id: 'a-bin-x1', teacher_id: 't-sari', class_id: 'c-x1', subject_id: 'sub-bin', materi_aktif: 'Teks laporan hasil observasi', jadwal: [{ hari: 3, jam_mulai: '08:30', jam_selesai: '10:00' }, { hari: 5, jam_mulai: '07:00', jam_selesai: '08:30' }] },
    { id: 'a-big-x1', teacher_id: 't-bayu', class_id: 'c-x1', subject_id: 'sub-big', materi_aktif: 'Descriptive text', jadwal: [{ hari: 4, jam_mulai: '07:00', jam_selesai: '08:30' }] },
  ];

  const roster: [string, string, 'L' | 'P', string, Level][] = [
    // [kelas, nama, jk, wali, profil]
    ['c-x1', 'Ahmad Rayhan', 'L', 'Bambang Supriyanto', 'kuat'],
    ['c-x1', 'Siti Nadira Az-Zahra', 'P', 'Rahmawati Utami', 'kuat'],
    ['c-x1', 'Arya Ramadan', 'L', 'Dewi Sartika', 'sedang'],
    ['c-x1', 'Dimas Pratama Putra', 'L', 'Sugeng Widodo', 'lemah'],
    ['c-x1', 'Bella Safitri', 'P', 'Agus Sunardi', 'sedang'],
    ['c-x1', 'Farhan Nur Hakim', 'L', 'Hasan Basri', 'kuat'],
    ['c-x1', 'Gita Amalia Wardani', 'P', 'Nurul Hidayah', 'sedang'],
    ['c-x1', 'M. Rizky Maulana', 'L', 'Iwan Ridwan', 'kuat'],
    ['c-x2', 'Nabila Putri Lestari', 'P', 'Endang Susilawati', 'kuat'],
    ['c-x2', 'Raka Aditya', 'L', 'Yusuf Hidayat', 'sedang'],
    ['c-x2', 'Citra Ayu Pertiwi', 'P', 'Sri Mulyani', 'sedang'],
    ['c-x2', 'Galih Saputra', 'L', 'Asep Sunandar', 'lemah'],
    ['c-x2', 'Intan Permata Sari', 'P', 'Wahyu Nugroho', 'kuat'],
    ['c-x2', 'Yoga Firmansyah', 'L', 'Tatang Suherman', 'sedang'],
    ['c-xi', 'Alya Rahmadani', 'P', 'Hendro Wibowo', 'kuat'],
    ['c-xi', 'Bagas Kurniawan', 'L', 'Rudi Hartono', 'sedang'],
    ['c-xi', 'Dinda Maharani', 'P', 'Lina Marlina', 'sedang'],
    ['c-xi', 'Eko Prasetyo', 'L', 'Joko Susanto', 'lemah'],
    ['c-xi', 'Fitri Handayani', 'P', 'Dedi Kurnia', 'kuat'],
  ];

  const levelOf = new Map<string, Level>();
  const students: Student[] = roster.map(([class_id, nama, jk, wali, level], i) => {
    const id = `s-${String(i + 1).padStart(3, '0')}`;
    levelOf.set(id, level);
    return {
      id,
      class_id,
      nisn: `00${String(82341901 + i)}`,
      nama_lengkap: nama,
      jenis_kelamin: jk,
      nama_wali: wali,
      no_whatsapp_wali: null, // dikosongkan: nomor WA asli diisi wali kelas
    };
  });

  const random = rng(20261013);
  const journals: DailyJournal[] = [];
  assignments.forEach((a) => {
    const classStudents = students.filter((s) => s.class_id === a.class_id);
    const sessions = a.class_id === 'c-x1' ? 3 : 2;
    for (let k = 0; k < sessions; k++) {
      const date = addDays(now, -(2 + k * 5 + Math.floor(random() * 2)));
      classStudents.forEach((s, idx) => {
        // Tidak semua siswa dicatat setiap pertemuan, seperti di kelas nyata.
        if (random() < 0.15 && k > 0) return;
        let level = levelOf.get(s.id)!;
        // Profil siswa sedikit berbeda antar mapel.
        if (a.subject_id === 'sub-bin' && level === 'lemah') level = 'sedang';
        if (a.subject_id === 'sub-mat' && s.id === 's-003') level = 'lemah';
        const [lo, hi] = SCORE[level];
        const pick = () => (random() < 0.5 ? lo : hi);
        const created = new Date(date);
        created.setHours(8, 10 + idx * 3, 0, 0);
        journals.push({
          id: `j-${a.id}-${k}-${s.id}`,
          assignment_id: a.id,
          class_id: a.class_id,
          subject_id: a.subject_id,
          teacher_id: a.teacher_id,
          student_id: s.id,
          tanggal: toISODate(date),
          materi: a.materi_aktif,
          nilai_kognitif: pick(),
          nilai_keterampilan: pick(),
          skor_sikap: Math.min(5, pick() + (random() < 0.4 ? 1 : 0)),
          tags: TAGS[level][(k + idx) % 3],
          catatan: NOTES[level][(k + idx) % 3],
          is_synced: true,
          created_at: created.toISOString(),
        });
      });
    }
  });

  const reports: SubjectReport[] = [];
  const mkReport = (assignmentId: string, studentId: string, status: SubjectReport['status'], note: string | null = null) => {
    const a = assignments.find((x) => x.id === assignmentId)!;
    const student = students.find((s) => s.id === studentId)!;
    const subject = subjects.find((s) => s.id === a.subject_id)!;
    const authorIsHomeroom = classes.find((c) => c.id === a.class_id)?.homeroom_teacher_id === a.teacher_id;
    const draft = draftReportFromJournals(
      authorIsHomeroom ? student : { ...student, nama_wali: null },
      subject,
      journals.filter((j) => j.assignment_id === assignmentId && j.student_id === studentId),
      pts
    );
    if (!draft) return;
    const stamp = addDays(now, -1).toISOString();
    reports.push({
      id: `r-${assignmentId}-${studentId}`,
      assignment_id: assignmentId,
      class_id: a.class_id,
      subject_id: a.subject_id,
      teacher_id: a.teacher_id,
      student_id: studentId,
      periode: pts,
      keunggulan: draft.keunggulan,
      rekomendasi: draft.rekomendasi,
      narasi: draft.narasi,
      pesan_wali: draft.pesan_wali,
      status,
      catatan_wali_kelas: note,
      submitted_at: status === 'Draft' ? null : stamp,
      reviewed_at: status === 'Disetujui' || status === 'Revisi' ? stamp : null,
      updated_at: stamp,
    });
  };
  ['s-001', 's-002', 's-003', 's-004'].forEach((s) => mkReport('a-mat-x1', s, 'Diajukan'));
  mkReport('a-mat-x1', 's-005', 'Disetujui');
  mkReport('a-mat-x1', 's-006', 'Revisi', 'Mohon sebutkan materi fungsi linear yang sudah dikuasai, jangan hanya nilai.');
  mkReport('a-inf-x1', 's-001', 'Draft');
  mkReport('a-inf-x1', 's-004', 'Draft');
  mkReport('a-inf-x1', 's-002', 'Diajukan');
  ['s-003', 's-004', 's-007'].forEach((s) => mkReport('a-bin-x1', s, 'Diajukan'));
  ['s-009', 's-012'].forEach((s) => mkReport('a-mat-x2', s, 'Diajukan'));

  const mkAssessment = (assignmentId: string, judul: string, jenis: Assessment['jenis'], inDays: number): Assessment => {
    const a = assignments.find((x) => x.id === assignmentId)!;
    return { id: `as-${assignmentId}-${inDays}`, assignment_id: assignmentId, class_id: a.class_id, subject_id: a.subject_id, judul, jenis, tanggal: toISODate(addDays(now, inDays)) };
  };
  const assessments: Assessment[] = [
    mkAssessment('a-inf-x1', 'Ulangan harian percabangan', 'Ulangan', 3),
    mkAssessment('a-inf-x2', 'Praktikum operasi list', 'Praktikum', 2),
    mkAssessment('a-mat-x1', 'Kuis fungsi linear', 'Ulangan', 5),
    mkAssessment('a-bin-x1', 'Presentasi teks laporan', 'Tugas', 8),
    mkAssessment('a-pbo-xi', 'Proyek kelas Rekening Bank', 'Proyek', 10),
    mkAssessment('a-inf-x1', 'Penilaian tengah semester', 'PTS', 16),
  ];

  return {
    version: DEMO_DB_VERSION,
    schools: [school],
    teachers,
    classes,
    subjects,
    assignments,
    students,
    journals,
    reports,
    homeroomReports: [],
    assessments,
    groups: [],
  };
}
