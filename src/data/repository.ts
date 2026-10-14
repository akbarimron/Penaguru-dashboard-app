import {
  Assessment,
  ClassRoom,
  DailyJournal,
  HomeroomReport,
  School,
  SessionUser,
  Student,
  StudyGroup,
  Subject,
  SubjectReport,
  TeachingAssignment,
  Workspace,
} from '../types';

export interface RegisterInput {
  nama_lengkap: string;
  email: string;
  password: string;
  nip: string | null;
}

export type NewJournal = Omit<DailyJournal, 'id' | 'created_at' | 'is_synced'>;
export type ReportInput = Omit<SubjectReport, 'id' | 'updated_at' | 'submitted_at' | 'reviewed_at' | 'catatan_wali_kelas' | 'status'> & {
  id?: string;
};

// Satu antarmuka, dua implementasi:
// - demoRepository: semua data di perangkat (AsyncStorage), aturan akses
//   meniru RLS lewat visibility.ts.
// - supabaseRepository: Supabase Auth + PostgreSQL, aturan akses dijaga RLS.
export interface Repository {
  mode: 'demo' | 'supabase';

  getSession(): Promise<SessionUser | null>;
  signIn(email: string, password: string): Promise<SessionUser>;
  signUp(input: RegisterInput): Promise<{ user: SessionUser | null; needsEmailConfirm: boolean }>;
  requestPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;

  loadWorkspace(user: SessionUser): Promise<Workspace>;

  createSchool(nama: string, npsn: string | null): Promise<School>;
  joinSchool(kode: string): Promise<School>;
  createClass(input: Pick<ClassRoom, 'nama_kelas' | 'tingkat' | 'tahun_ajaran' | 'semester'>): Promise<ClassRoom>;
  createSubject(input: Pick<Subject, 'nama' | 'warna'>): Promise<Subject>;
  setHomeroom(classId: string, claim: boolean): Promise<void>;
  addAssignment(input: Pick<TeachingAssignment, 'class_id' | 'subject_id' | 'materi_aktif' | 'jadwal'>): Promise<TeachingAssignment>;
  updateAssignment(id: string, patch: Partial<Pick<TeachingAssignment, 'materi_aktif' | 'jadwal'>>): Promise<void>;
  removeAssignment(id: string): Promise<void>;

  saveStudent(input: Omit<Student, 'id'> & { id?: string }): Promise<Student>;
  deleteStudent(id: string): Promise<void>;

  addJournals(rows: NewJournal[]): Promise<DailyJournal[]>;

  saveReport(input: ReportInput): Promise<SubjectReport>;
  setReportStatus(id: string, status: 'Draft' | 'Diajukan'): Promise<SubjectReport>;
  reviewReport(id: string, decision: 'Disetujui' | 'Revisi', note: string | null): Promise<SubjectReport>;
  saveHomeroomReport(input: Omit<HomeroomReport, 'id' | 'updated_at'> & { id?: string }): Promise<HomeroomReport>;

  addAssessment(input: Omit<Assessment, 'id' | 'class_id' | 'subject_id'>): Promise<Assessment>;
  deleteAssessment(id: string): Promise<void>;

  saveGroups(assignmentId: string, groups: Pick<StudyGroup, 'nama_kelompok' | 'members'>[]): Promise<StudyGroup[]>;

  // Admin Methods (Pengelolaan Penuh oleh Admin)
  updateSchool(input: { nama?: string; npsn?: string | null; kode_gabung?: string }): Promise<School>;
  adminSaveTeacher(input: { id?: string; nama_lengkap: string; nip: string | null; email: string; role?: 'admin' | 'guru' }): Promise<Teacher>;
  adminDeleteTeacher(id: string): Promise<void>;
  adminSaveClass(input: { id?: string; nama_kelas: string; tingkat: 'X' | 'XI' | 'XII'; tahun_ajaran: string; semester: 'Ganjil' | 'Genap'; homeroom_teacher_id: string | null }): Promise<ClassRoom>;
  adminDeleteClass(id: string): Promise<void>;
  adminSaveSubject(input: { id?: string; nama: string; warna: SubjectColor }): Promise<Subject>;
  adminDeleteSubject(id: string): Promise<void>;
  adminSaveAssignment(input: { id?: string; teacher_id: string; class_id: string; subject_id: string; materi_aktif: string; jadwal: ScheduleSlot[] }): Promise<TeachingAssignment>;
  adminDeleteAssignment(id: string): Promise<void>;
  adminSaveJournal(input: Partial<DailyJournal> & { id?: string; student_id: string; assignment_id: string }): Promise<DailyJournal>;
  adminDeleteJournal(id: string): Promise<void>;
  adminSaveReport(input: Partial<SubjectReport> & { id: string }): Promise<SubjectReport>;
  adminDeleteReport(id: string): Promise<void>;
  adminSaveHomeroomReport(input: Partial<HomeroomReport> & { class_id: string; student_id: string; periode: string; catatan: string }): Promise<HomeroomReport>;
  adminDeleteHomeroomReport(id: string): Promise<void>;

  askAssistant(
    question: string,
    history?: { sender: 'user' | 'assistant'; text: string }[],
    workspaceSummary?: string
  ): Promise<{ text: string; source: 'lokal' | 'gemini' }>;
}

export class RepoError extends Error {
  constructor(message: string, public code: 'auth' | 'forbidden' | 'not_found' | 'conflict' | 'network' | 'unknown' = 'unknown') {
    super(message);
  }
}
