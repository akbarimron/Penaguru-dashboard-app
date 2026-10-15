// Data contoh untuk mode demo. Semua nama sekolah, guru, dan siswa di sini
// fiktif dan UI selalu menampilkan label "Mode demo" saat data ini dipakai.
// Tanggal dihitung relatif terhadap hari ini agar demo tidak basi.
import {
  Assessment,
  ClassRoom,
  DailyJournal,
  GradeItem,
  GradeSubmission,
  HomeroomReport,
  School,
  Student,
  StudentGrade,
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
  gradeItems: GradeItem[];
  studentGrades: StudentGrade[];
  gradeSubmissions: GradeSubmission[];
}

export const DEMO_DB_VERSION = 5;

// Akun demo lokal. Kata sandi ini hanya berlaku di mode demo (tersimpan
// sebagai hash SHA-256 di perangkat) dan tidak dipakai di Supabase.
export const DEMO_PASSWORD = 'penaguru-demo';

export const DEMO_ACCOUNTS = [
  { email: 'admin@penaguru.sch.id', label: 'Admin Sekolah', role: 'Administrator Utama (Akses Penuh Dashboard Admin)' },
  { email: 'budi.santoso@penaguru.sch.id', label: 'Pak Budi', role: 'Wali kelas X PPLG 1 & Guru Informatika' },
  { email: 'siti.aminah@penaguru.sch.id', label: 'Bu Siti', role: 'Wali kelas X PPLG 2 & Guru Pemrograman Web' },
  { email: 'dewi.lestari@penaguru.sch.id', label: 'Bu Dewi', role: 'Guru Basis Data & Matematika Terapan' },
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
    'Menyelesaikan latihan lebih cepat lalu membimbing rekan yang kesulitan.',
    'Menjelaskan algoritma dan langkah penyelesaian dengan runtut di depan kelas.',
    'Mampu mengerjakan studi kasus tantangan dan eksplorasi mandiri tanpa kendala.',
    'Analisis logika sangat tajam dan struktur kode tersusun rapi sesuai konvensi.',
  ],
  sedang: [
    'Mengikuti instruksi langkah kerja dengan baik, sesekali berkonsultasi bagian akhir.',
    'Tugas praktikum tuntas tepat waktu, ketelitian sintaks terus meningkat.',
    'Aktif dalam sesi diskusi kelompok dan kooperatif saat praktikum berpasangan.',
    'Pemahaman konsep cukup baik, perlu sedikit latihan mandiri tambahan di rumah.',
  ],
  lemah: [
    'Masih membutuhkan panduan bertahap untuk menyelesaikan latihan inti praktikum.',
    'Terdapat miskonsepsi sintaks dasar, sudah diberikan lembar asistensi tambahan.',
    'Sempat kehilangan fokus di tengah sesi, namun kembali membaik setelah didampingi.',
    'Perlu penguatan konsep dasar sebelum melanjutkan ke materi praktikum lanjutan.',
  ],
};

const TAGS: Record<Level, string[][]> = {
  kuat: [
    ['#paham_konsep', '#mandiri'],
    ['#tuntas_tugas', '#inisiatif'],
    ['#kolaboratif', '#logika_kuat'],
    ['#problem_solving', '#tuntas_tugas'],
  ],
  sedang: [
    ['#aktif_bertanya'],
    ['#tuntas_tugas', '#kolaboratif'],
    ['#teliti', '#perlu_bimbingan'],
    ['#kooperatif', '#tuntas_tugas'],
  ],
  lemah: [
    ['#perlu_bimbingan', '#belum_tuntas'],
    ['#miskonsepsi'],
    ['#kurang_fokus', '#perlu_asistensi'],
    ['#butuh_latihan'],
  ],
};

const SCORE: Record<Level, [number, number]> = {
  kuat: [4, 5],
  sedang: [3, 4],
  lemah: [2, 3],
};

export function buildSeed(now = new Date()): Omit<DemoDB, 'users'> {
  const { tahun_ajaran, semester } = currentAcademicTerm(now);
  const [pts] = reportPeriods(now);
  const school: School = {
    id: 'sch-smk1',
    nama: 'SMK Negeri 1 Bandung',
    npsn: '20219876',
    kode_gabung: 'SMKBDG1',
  };

  const teachers: Teacher[] = [
    {
      id: 't-admin',
      school_id: school.id,
      nama_lengkap: 'Drs. H. Mulyadi, M.Pd.',
      nip: '197204121998021001',
      email: 'admin@penaguru.sch.id',
      role: 'admin',
    },
    {
      id: 't-budi',
      school_id: school.id,
      nama_lengkap: 'Budi Santoso, S.Kom.',
      nip: '198503152010011012',
      email: 'budi.santoso@penaguru.sch.id',
      role: 'guru',
    },
    {
      id: 't-siti',
      school_id: school.id,
      nama_lengkap: 'Siti Aminah, S.Pd.',
      nip: '198907222014022005',
      email: 'siti.aminah@penaguru.sch.id',
      role: 'guru',
    },
    {
      id: 't-dewi',
      school_id: school.id,
      nama_lengkap: 'Dewi Lestari, M.Kom.',
      nip: '199211052019032018',
      email: 'dewi.lestari@penaguru.sch.id',
      role: 'guru',
    },
  ];

  const mkClass = (id: string, nama: string, tingkat: ClassRoom['tingkat'], homeroom: string | null): ClassRoom => ({
    id,
    school_id: school.id,
    nama_kelas: nama,
    tingkat,
    tahun_ajaran,
    semester,
    homeroom_teacher_id: homeroom,
  });

  const classes: ClassRoom[] = [
    mkClass('c-x1', 'X PPLG 1', 'X', 't-budi'),
    mkClass('c-x2', 'X PPLG 2', 'X', 't-siti'),
  ];

  const subjects: Subject[] = [
    { id: 'sub-inf', school_id: school.id, nama: 'Informatika', warna: 'violet' },
    { id: 'sub-web', school_id: school.id, nama: 'Pemrograman Web', warna: 'blue' },
    { id: 'sub-db', school_id: school.id, nama: 'Basis Data', warna: 'green' },
    { id: 'sub-mat', school_id: school.id, nama: 'Matematika Terapan', warna: 'yellow' },
  ];

  const assignments: TeachingAssignment[] = [
    {
      id: 'a-inf-x1',
      teacher_id: 't-budi',
      class_id: 'c-x1',
      subject_id: 'sub-inf',
      materi_aktif: 'Struktur Percabangan dan Perulangan Algoritma',
      jadwal: [
        { hari: 2, jam_mulai: '07:00', jam_selesai: '09:15' },
        { hari: 4, jam_mulai: '09:30', jam_selesai: '11:00' },
      ],
    },
    {
      id: 'a-inf-x2',
      teacher_id: 't-budi',
      class_id: 'c-x2',
      subject_id: 'sub-inf',
      materi_aktif: 'Algoritma Pencarian Linear & Binary Search',
      jadwal: [
        { hari: 3, jam_mulai: '07:00', jam_selesai: '08:30' },
        { hari: 5, jam_mulai: '08:30', jam_selesai: '10:00' },
      ],
    },
    {
      id: 'a-web-x1',
      teacher_id: 't-siti',
      class_id: 'c-x1',
      subject_id: 'sub-web',
      materi_aktif: 'Modern CSS Layout (Flexbox, Grid) & DOM Logic',
      jadwal: [
        { hari: 1, jam_mulai: '07:00', jam_selesai: '09:15' },
        { hari: 5, jam_mulai: '07:00', jam_selesai: '08:30' },
      ],
    },
    {
      id: 'a-web-x2',
      teacher_id: 't-siti',
      class_id: 'c-x2',
      subject_id: 'sub-web',
      materi_aktif: 'Desain Web Responsif & JavaScript Form Events',
      jadwal: [
        { hari: 2, jam_mulai: '09:30', jam_selesai: '11:45' },
        { hari: 4, jam_mulai: '07:00', jam_selesai: '08:30' },
      ],
    },
    {
      id: 'a-db-x1',
      teacher_id: 't-dewi',
      class_id: 'c-x1',
      subject_id: 'sub-db',
      materi_aktif: 'Perancangan ERD, Normalisasi, & Relasi SQL',
      jadwal: [{ hari: 3, jam_mulai: '09:30', jam_selesai: '11:45' }],
    },
    {
      id: 'a-db-x2',
      teacher_id: 't-dewi',
      class_id: 'c-x2',
      subject_id: 'sub-db',
      materi_aktif: 'Query SELECT JOIN, GROUP BY, & Agregasi SQL',
      jadwal: [{ hari: 1, jam_mulai: '09:30', jam_selesai: '11:45' }],
    },
    {
      id: 'a-mat-x1',
      teacher_id: 't-dewi',
      class_id: 'c-x1',
      subject_id: 'sub-mat',
      materi_aktif: 'Aljabar Boolean, Logika Proposisi, & Gerbang Logika',
      jadwal: [{ hari: 4, jam_mulai: '11:00', jam_selesai: '12:30' }],
    },
  ];

  // 24 Siswa: 12 di X PPLG 1, 12 di X PPLG 2
  const roster: [string, string, 'L' | 'P', string, string, Level][] = [
    // [kelas, nama, jk, wali, no_wa, profil]
    // X PPLG 1
    ['c-x1', 'Ahmad Rizki Pratama', 'L', 'Bambang Pratama', '081234567890', 'kuat'],
    ['c-x1', 'Budi Santoso Putra', 'L', 'Suryo Santoso', '081234567891', 'kuat'],
    ['c-x1', 'Citra Dewi Lestari', 'P', 'Dewi Sartika', '081234567892', 'sedang'],
    ['c-x1', 'Dika Arya Saputra', 'L', 'Arya Saputra', '081234567893', 'lemah'],
    ['c-x1', 'Eka Rahmawati', 'P', 'Rahmawati Utami', '081234567894', 'sedang'],
    ['c-x1', 'Farhan Hidayat', 'L', 'Hidayatullah', '081234567895', 'kuat'],
    ['c-x1', 'Gita Amalia Wardani', 'P', 'Nurul Hidayah', '081234567896', 'sedang'],
    ['c-x1', 'Hafiz Nur Rahman', 'L', 'Rahman Hakim', '081234567897', 'kuat'],
    ['c-x1', 'Indah Permatasari', 'P', 'Joko Wahyudi', '081234567898', 'sedang'],
    ['c-x1', 'Jovan Kevin Ardiansyah', 'L', 'Ardiansyah', '081234567899', 'kuat'],
    ['c-x1', 'Kurnia Mega Sasmita', 'P', 'Sasmita Hadi', '081234567800', 'sedang'],
    ['c-x1', 'Lukman Hakim', 'L', 'Hasan Basri', '081234567801', 'lemah'],
    // X PPLG 2
    ['c-x2', 'Muhammad Alif Fikri', 'L', 'Fikri Ramadhan', '081234567802', 'kuat'],
    ['c-x2', 'Nabila Putri Lestari', 'P', 'Endang Susilawati', '081234567803', 'kuat'],
    ['c-x2', 'Oki Setiawan', 'L', 'Setiawan Budi', '081234567804', 'sedang'],
    ['c-x2', 'Putri Maharani', 'P', 'Hendra Gunawan', '081234567805', 'sedang'],
    ['c-x2', 'Raka Aditya Pratama', 'L', 'Yusuf Hidayat', '081234567806', 'lemah'],
    ['c-x2', 'Siti Zahra Maulida', 'P', 'Ahmad Fauzi', '081234567807', 'kuat'],
    ['c-x2', 'Taufik Hidayatullah', 'L', 'Mansyur Hidayat', '081234567808', 'sedang'],
    ['c-x2', 'Ulya Nafisah', 'P', 'Zainal Abidin', '081234567809', 'kuat'],
    ['c-x2', 'Vino Bastian Akbar', 'L', 'Bastian Gunawan', '081234567810', 'sedang'],
    ['c-x2', 'Wulan Dari Saputri', 'P', 'Agus Saputra', '081234567811', 'sedang'],
    ['c-x2', 'Yusuf Habibie', 'L', 'Ilham Habibie', '081234567812', 'kuat'],
    ['c-x2', 'Zahra Nadira', 'P', 'Irfan Nadira', '081234567813', 'lemah'],
  ];

  const levelOf = new Map<string, Level>();
  const students: Student[] = roster.map(([class_id, nama, jk, wali, no_wa, level], i) => {
    const id = `s-${String(i + 1).padStart(3, '0')}`;
    levelOf.set(id, level);
    return {
      id,
      class_id,
      nisn: `0081234${String(i + 1).padStart(3, '0')}`,
      nama_lengkap: nama,
      jenis_kelamin: jk,
      nama_wali: wali,
      no_whatsapp_wali: no_wa,
    };
  });

  const random = rng(20261014);
  const journals: DailyJournal[] = [];

  // GENERATOR 1 BULAN LENGKAP (30 Hari ke Belakang)
  for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
    const date = addDays(now, -dayOffset);
    const dayOfWeek = date.getDay(); // 0 = Minggu, 1 = Senin, ..., 5 = Jumat, 6 = Sabtu

    // Hanya pada hari sekolah (Senin s/d Jumat)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Cari penugasan yang aktif pada hari ini berdasarkan jadwal
      const activeAssignments = assignments.filter((a) =>
        a.jadwal.some((slot) => slot.hari === dayOfWeek)
      );

      activeAssignments.forEach((a) => {
        const classStudents = students.filter((s) => s.class_id === a.class_id);
        const slot = a.jadwal.find((s) => s.hari === dayOfWeek);

        classStudents.forEach((s, idx) => {
          // Simulasi kehadiran wajar (95% kehadiran)
          if (random() < 0.05) return;

          let level = levelOf.get(s.id)!;
          // Sedikit variasi antar mapel
          if (a.subject_id === 'sub-mat' && level === 'kuat' && random() < 0.2) level = 'sedang';
          if (a.subject_id === 'sub-web' && level === 'sedang' && random() < 0.3) level = 'kuat';

          const [lo, hi] = SCORE[level];
          const pickScore = () => (random() < 0.4 ? lo : hi);

          const created = new Date(date);
          const [startHour, startMin] = (slot?.jam_mulai || '08:00').split(':').map(Number);
          created.setHours(startHour, startMin + idx * 2, 0, 0);

          const tagOptions = TAGS[level];
          const noteOptions = NOTES[level];
          const seedIdx = (dayOffset + idx) % noteOptions.length;

          journals.push({
            id: `j-${a.id}-${dayOffset}-${s.id}`,
            assignment_id: a.id,
            class_id: a.class_id,
            subject_id: a.subject_id,
            teacher_id: a.teacher_id,
            student_id: s.id,
            tanggal: toISODate(date),
            materi: a.materi_aktif,
            nilai_kognitif: pickScore(),
            nilai_keterampilan: pickScore(),
            skor_sikap: Math.min(5, pickScore() + (random() < 0.5 ? 1 : 0)),
            tags: tagOptions[seedIdx % tagOptions.length],
            catatan: noteOptions[seedIdx],
            is_synced: true,
            created_at: created.toISOString(),
          });
        });
      });
    }
  }

  // Buat Rapor Mapel Contoh
  const reports: SubjectReport[] = [];
  const mkReport = (
    assignmentId: string,
    studentId: string,
    status: SubjectReport['status'],
    note: string | null = null
  ) => {
    const a = assignments.find((x) => x.id === assignmentId)!;
    const student = students.find((s) => s.id === studentId)!;
    const subject = subjects.find((s) => s.id === a.subject_id)!;
    const studentJournals = journals.filter(
      (j) => j.assignment_id === assignmentId && j.student_id === studentId
    );
    const draft = draftReportFromJournals(student, subject, studentJournals, pts);
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

  ['s-001', 's-002', 's-003', 's-004'].forEach((s) => mkReport('a-inf-x1', s, 'Diajukan'));
  mkReport('a-inf-x1', 's-005', 'Disetujui');
  mkReport('a-inf-x1', 's-006', 'Revisi', 'Mohon lengkapi catatan proyek mandiri siswa.');
  mkReport('a-inf-x1', 's-007', 'Draft');
  mkReport('a-inf-x1', 's-008', 'Draft');

  ['s-013', 's-014', 's-015'].forEach((s) => mkReport('a-web-x2', s, 'Diajukan'));
  mkReport('a-web-x2', 's-016', 'Disetujui');

  // Catatan Rapor Wali Kelas (Homeroom Reports)
  const homeroomReports: HomeroomReport[] = [
    {
      id: 'hr-001',
      class_id: 'c-x1',
      student_id: 's-001',
      periode: pts,
      catatan: 'Menunjukkan kepemimpinan positif di kelas dan konsistensi belajar yang tinggi di semua mapel kejuruan.',
      status: 'Final',
      updated_at: addDays(now, -1).toISOString(),
    },
    {
      id: 'hr-002',
      class_id: 'c-x1',
      student_id: 's-002',
      periode: pts,
      catatan: 'Selalu aktif membantu teman sebangku dan memiliki rasa ingin tahu yang sangat baik.',
      status: 'Final',
      updated_at: addDays(now, -1).toISOString(),
    },
    {
      id: 'hr-003',
      class_id: 'c-x1',
      student_id: 's-004',
      periode: pts,
      catatan: 'Perlu terus didukung motivasi belajarnya, komunikasi dengan orang tua secara berkala sangat disarankan.',
      status: 'Draft',
      updated_at: addDays(now, -2).toISOString(),
    },
  ];

  const mkAssessment = (
    assignmentId: string,
    judul: string,
    jenis: Assessment['jenis'],
    inDays: number
  ): Assessment => {
    const a = assignments.find((x) => x.id === assignmentId)!;
    return {
      id: `as-${assignmentId}-${inDays}`,
      assignment_id: assignmentId,
      class_id: a.class_id,
      subject_id: a.subject_id,
      judul,
      jenis,
      tanggal: toISODate(addDays(now, inDays)),
    };
  };

  const assessments: Assessment[] = [
    mkAssessment('a-inf-x1', 'Ulangan Percabangan & Perulangan', 'Ulangan', 3),
    mkAssessment('a-web-x1', 'Praktikum Flexbox & Grid Layout', 'Praktikum', 2),
    mkAssessment('a-db-x1', 'Kuis Perancangan ERD & Relasi', 'Ulangan', 5),
    mkAssessment('a-inf-x2', 'Praktikum Linear & Binary Search', 'Praktikum', 4),
    mkAssessment('a-web-x2', 'Proyek Form Responsif & Interaktif', 'Proyek', 8),
    mkAssessment('a-inf-x1', 'Penilaian Tengah Semester (PTS)', 'PTS', 15),
  ];

  const gradeItems: GradeItem[] = [
    {
      id: 'gi-inf-1',
      assignment_id: 'a-inf-x1',
      periode: pts,
      judul: 'Ulangan 1',
      kategori: 'Ulangan Harian',
      deskripsi: 'Algoritma Percabangan & Logika Boolean',
      bobot: 1,
      tanggal: toISODate(addDays(now, -20)),
    },
    {
      id: 'gi-inf-2',
      assignment_id: 'a-inf-x1',
      periode: pts,
      judul: 'Tugas Individu 1',
      kategori: 'Tugas Individu',
      deskripsi: 'Implementasi Flowchart dan Pseudocode Pencarian',
      bobot: 1,
      tanggal: toISODate(addDays(now, -14)),
    },
    {
      id: 'gi-inf-3',
      assignment_id: 'a-inf-x1',
      periode: pts,
      judul: 'Tugas Kelompok',
      kategori: 'Tugas Kelompok',
      deskripsi: 'Studi Kasus Efisiensi Pencarian Data E-Commerce',
      bobot: 1,
      tanggal: toISODate(addDays(now, -8)),
    },
    {
      id: 'gi-inf-4',
      assignment_id: 'a-inf-x1',
      periode: pts,
      judul: 'Ulangan 2',
      kategori: 'Ulangan Harian',
      deskripsi: 'Perulangan For, While, dan Nested Loop',
      bobot: 1,
      tanggal: toISODate(addDays(now, -2)),
    },
    // Kelas X PPLG 2
    {
      id: 'gi-inf2-1',
      assignment_id: 'a-inf-x2',
      periode: pts,
      judul: 'Ulangan 1',
      kategori: 'Ulangan Harian',
      deskripsi: 'Algoritma Pencarian Linear & Binary Search',
      bobot: 1,
      tanggal: toISODate(addDays(now, -18)),
    },
    {
      id: 'gi-inf2-2',
      assignment_id: 'a-inf-x2',
      periode: pts,
      judul: 'Tugas Kelompok',
      kategori: 'Tugas Kelompok',
      deskripsi: 'Eksperimen Perbandingan Kompleksitas Waktu Running',
      bobot: 1,
      tanggal: toISODate(addDays(now, -10)),
    },
    {
      id: 'gi-inf2-3',
      assignment_id: 'a-inf-x2',
      periode: pts,
      judul: 'Tugas Individu 1',
      kategori: 'Tugas Individu',
      deskripsi: 'Penulisan Kode Python Pencarian Biner',
      bobot: 1,
      tanggal: toISODate(addDays(now, -4)),
    },
    // Web X PPLG 1
    {
      id: 'gi-web-1',
      assignment_id: 'a-web-x1',
      periode: pts,
      judul: 'Ulangan 1',
      kategori: 'Ulangan Harian',
      deskripsi: 'Dasar HTML5 Semantik & Form Input',
      bobot: 1,
      tanggal: toISODate(addDays(now, -16)),
    },
    {
      id: 'gi-web-2',
      assignment_id: 'a-web-x1',
      periode: pts,
      judul: 'Tugas Kelompok',
      kategori: 'Tugas Kelompok',
      deskripsi: 'Layout Web Responsif Flexbox & Grid',
      bobot: 1,
      tanggal: toISODate(addDays(now, -6)),
    },
    // Basis Data X PPLG 1
    {
      id: 'gi-db-1',
      assignment_id: 'a-db-x1',
      periode: pts,
      judul: 'Ulangan 1',
      kategori: 'Ulangan Harian',
      deskripsi: 'Normalisasi Basis Data 1NF sampai 3NF',
      bobot: 1,
      tanggal: toISODate(addDays(now, -12)),
    },
  ];

  // Seed nilai siswa
  const studentGrades: StudentGrade[] = [];
  const randScore = (base: number, sIndex: number, gIndex: number) => {
    const val = base + ((sIndex * 7 + gIndex * 13) % 18) - 4;
    return Math.max(68, Math.min(98, Math.round(val)));
  };

  const x1Students = students.filter((s) => s.class_id === 'c-x-pplg-1');
  const x2Students = students.filter((s) => s.class_id === 'c-x-pplg-2');

  gradeItems.forEach((gi, gIdx) => {
    const targetStudents = gi.assignment_id === 'a-inf-x2' ? x2Students : x1Students;
    targetStudents.forEach((st, sIdx) => {
      studentGrades.push({
        id: `sg-${gi.id}-${st.id}`,
        grade_item_id: gi.id,
        student_id: st.id,
        nilai: randScore(82, sIdx, gIdx),
      });
    });
  });

  const gradeSubmissions: GradeSubmission[] = [
    {
      id: 'gsub-inf-x1',
      assignment_id: 'a-inf-x1',
      periode: pts,
      status: 'Diajukan',
      submitted_at: addDays(now, -3).toISOString(),
      reviewed_at: null,
      catatan: 'Rekap nilai Ulangan 1, Ulangan 2, Tugas Individu, dan Tugas Kelompok lengkap.',
    },
    {
      id: 'gsub-web-x1',
      assignment_id: 'a-web-x1',
      periode: pts,
      status: 'Diajukan',
      submitted_at: addDays(now, -2).toISOString(),
      reviewed_at: null,
      catatan: 'Nilai praktikum web dan tugas kelompok siap ditinjau wali kelas.',
    },
    {
      id: 'gsub-db-x1',
      assignment_id: 'a-db-x1',
      periode: pts,
      status: 'Diajukan',
      submitted_at: addDays(now, -1).toISOString(),
      reviewed_at: null,
      catatan: 'Nilai ulangan normalisasi database telah diisi seluruh siswa.',
    },
    {
      id: 'gsub-inf-x2',
      assignment_id: 'a-inf-x2',
      periode: pts,
      status: 'Draft',
      submitted_at: null,
      reviewed_at: null,
      catatan: '',
    },
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
    homeroomReports,
    assessments,
    groups: [],
    gradeItems,
    studentGrades,
    gradeSubmissions,
  };
}
