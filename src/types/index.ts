// Tipe domain PenaGuru. Nama kolom sengaja sama persis dengan tabel di
// supabase-schema.sql supaya baris dari database bisa dipakai tanpa pemetaan.

export type SubjectColor = 'violet' | 'coral' | 'yellow' | 'green' | 'blue' | 'pink';
export type Semester = 'Ganjil' | 'Genap';
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6; // 1 = Senin

export type StudentStatus = 'Aman' | 'Perhatian' | 'Kritis' | 'Belum ada data';
export type ReportStatus = 'Draft' | 'Diajukan' | 'Revisi' | 'Disetujui';
export type HomeroomReportStatus = 'Draft' | 'Final';
export type AssessmentKind = 'Ulangan' | 'Praktikum' | 'Tugas' | 'PTS' | 'PAS' | 'Proyek';
export type MemberRole = 'Ketua' | 'Anggota' | 'Mentor Sebaya';

export interface School {
  id: string;
  nama: string;
  npsn: string | null;
  kode_gabung: string;
}

export interface Teacher {
  id: string;
  school_id: string | null;
  nama_lengkap: string;
  nip: string | null;
  email: string;
  role?: 'admin' | 'guru';
}

export interface ClassRoom {
  id: string;
  school_id: string;
  nama_kelas: string;
  tingkat: 'X' | 'XI' | 'XII';
  tahun_ajaran: string;
  semester: Semester;
  homeroom_teacher_id: string | null;
}

export interface Subject {
  id: string;
  school_id: string;
  nama: string;
  warna: SubjectColor;
}

export interface ScheduleSlot {
  hari: Weekday;
  jam_mulai: string; // "07:00"
  jam_selesai: string; // "08:30"
}

// Satu baris = satu guru mengajar satu mapel di satu kelas.
// Inilah yang membuat setiap guru punya dashboard terpisah per mapel x kelas.
export interface TeachingAssignment {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  materi_aktif: string;
  jadwal: ScheduleSlot[];
}

export interface Student {
  id: string;
  class_id: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  nama_wali: string | null;
  no_whatsapp_wali: string | null;
}

export interface DailyJournal {
  id: string;
  assignment_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  student_id: string;
  tanggal: string; // YYYY-MM-DD
  materi: string;
  nilai_kognitif: number; // 1-5
  nilai_keterampilan: number; // 1-5
  skor_sikap: number; // 1-5
  tags: string[];
  catatan: string;
  is_synced: boolean;
  created_at: string;
}

// Rapor per mapel: ditulis guru mapel, ditinjau wali kelas.
export interface SubjectReport {
  id: string;
  assignment_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  student_id: string;
  periode: string;
  keunggulan: string;
  rekomendasi: string;
  narasi: string;
  pesan_wali: string;
  status: ReportStatus;
  catatan_wali_kelas: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  updated_at: string;
}

// Catatan wali kelas per siswa per periode (bagian akhir rapor).
export interface HomeroomReport {
  id: string;
  class_id: string;
  student_id: string;
  periode: string;
  catatan: string;
  status: HomeroomReportStatus;
  updated_at: string;
}

export interface Assessment {
  id: string;
  assignment_id: string;
  class_id: string;
  subject_id: string;
  judul: string;
  jenis: AssessmentKind;
  tanggal: string; // YYYY-MM-DD
}

export interface StudyGroup {
  id: string;
  assignment_id: string;
  nama_kelompok: string;
  members: { student_id: string; peran: MemberRole }[];
  created_at: string;
}

export type GradeCategory = 'Ulangan Harian' | 'Tugas Individu' | 'Tugas Kelompok' | 'Praktikum' | 'Proyek' | 'Lainnya';

// Kriteria penilaian kustom yang dibuat guru per mapel x kelas per semester
export interface GradeItem {
  id: string;
  assignment_id: string;
  periode: string; // e.g. "PTS Ganjil 2026/2027", "PAS Ganjil 2026/2027"
  judul: string; // e.g. "Ulangan 1", "Tugas kelompok", "Tugas individu 1"
  kategori: GradeCategory; // e.g. "Ulangan Harian", "Tugas Individu", "Tugas Kelompok", "Praktikum", "Proyek"
  deskripsi: string; // e.g. "Materi Algoritma Pencarian Linear & Binary Search"
  bobot: number; // e.g. 1
  tanggal: string; // YYYY-MM-DD
}

// Nilai siswa per kriteria penilaian
export interface StudentGrade {
  id: string;
  grade_item_id: string;
  student_id: string;
  nilai: number; // 0-100
}

// Pengajuan rekap nilai semester dari guru mapel ke wali kelas
export interface GradeSubmission {
  id: string;
  assignment_id: string;
  periode: string;
  status: 'Draft' | 'Diajukan' | 'Disetujui';
  submitted_at: string | null;
  reviewed_at: string | null;
  catatan?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  created_at: string;
  source?: 'lokal' | 'gemini';
}

export interface PresetTag {
  label: string;
  kind: 'positif' | 'perhatian';
}

// Semua data yang boleh dilihat guru yang sedang masuk. Isinya sudah
// tersaring oleh RLS (Supabase) atau oleh visibility.ts (mode demo).
export interface Workspace {
  teacher: Teacher;
  school: School | null;
  colleagues: Teacher[];
  classes: ClassRoom[];
  subjects: Subject[];
  assignments: TeachingAssignment[]; // semua penugasan di sekolah (untuk tahu mapel mana yang sudah diampu)
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

export interface SessionUser {
  id: string;
  email: string;
}
