import { Workspace } from '../types';
import type { DemoDB } from './seed';

// Cermin aturan RLS di supabase-schema.sql untuk mode demo.
// Ringkasnya:
// - Data dipisah per kelas: setiap baris siswa, jurnal, rapor, dan agenda
//   membawa class_id.
// - Guru mapel hanya melihat kelas tempat ia punya penugasan, dan hanya
//   jurnal/rapor yang ia tulis sendiri.
// - Wali kelas melihat semua siswa, jurnal, rapor mapel, dan agenda di kelas
//   perwaliannya, dari guru mapel mana pun.
export function visibleWorkspace(db: DemoDB, teacherId: string): Workspace {
  const teacher = db.teachers.find((t) => t.id === teacherId);
  if (!teacher) throw new Error('Profil guru tidak ditemukan');
  const school = teacher.school_id ? db.schools.find((s) => s.id === teacher.school_id) || null : null;
  const empty: Workspace = {
    teacher,
    school,
    colleagues: [],
    classes: [],
    subjects: [],
    assignments: [],
    students: [],
    journals: [],
    reports: [],
    homeroomReports: [],
    assessments: [],
    groups: [],
    gradeItems: [],
    studentGrades: [],
    gradeSubmissions: [],
  };
  if (!school) return empty;

  const classes = db.classes.filter((c) => c.school_id === school.id);
  const classIds = new Set(classes.map((c) => c.id));
  const assignments = db.assignments.filter((a) => classIds.has(a.class_id));

  const homeroom = new Set(classes.filter((c) => c.homeroom_teacher_id === teacherId).map((c) => c.id));
  const myAssignments = new Set(assignments.filter((a) => a.teacher_id === teacherId).map((a) => a.id));
  const taught = new Set(assignments.filter((a) => a.teacher_id === teacherId).map((a) => a.class_id));
  const canViewClass = (classId: string) => homeroom.has(classId) || taught.has(classId);

  return {
    ...empty,
    colleagues: db.teachers.filter((t) => t.school_id === school.id),
    classes,
    subjects: db.subjects.filter((s) => s.school_id === school.id),
    assignments,
    // Kontak orang tua hanya untuk wali kelas (sama seperti tabel student_contacts).
    students: db.students
      .filter((s) => canViewClass(s.class_id))
      .map((s) => (homeroom.has(s.class_id) ? s : { ...s, nama_wali: null, no_whatsapp_wali: null })),
    journals: db.journals.filter((j) => j.teacher_id === teacherId || homeroom.has(j.class_id)),
    reports: db.reports.filter((r) => r.teacher_id === teacherId || homeroom.has(r.class_id)),
    homeroomReports: db.homeroomReports.filter((r) => homeroom.has(r.class_id)),
    assessments: db.assessments.filter((a) => myAssignments.has(a.assignment_id) || canViewClass(a.class_id)),
    groups: db.groups.filter((g) => {
      const a = assignments.find((x) => x.id === g.assignment_id);
      return myAssignments.has(g.assignment_id) || (a ? homeroom.has(a.class_id) : false);
    }),
    gradeItems: (db.gradeItems || []).filter((g) => {
      const a = assignments.find((x) => x.id === g.assignment_id);
      return myAssignments.has(g.assignment_id) || (a ? homeroom.has(a.class_id) : false);
    }),
    studentGrades: db.studentGrades || [],
    gradeSubmissions: (db.gradeSubmissions || []).filter((s) => {
      const a = assignments.find((x) => x.id === s.assignment_id);
      return myAssignments.has(s.assignment_id) || (a ? homeroom.has(a.class_id) : false);
    }),
  };
}

export function canWriteStudents(db: DemoDB, teacherId: string, classId: string) {
  return db.classes.some((c) => c.id === classId && c.homeroom_teacher_id === teacherId);
}
