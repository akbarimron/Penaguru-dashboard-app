import { ClassRoom, Subject, TeachingAssignment, Workspace } from '../types';

export function myAssignments(ws: Workspace): TeachingAssignment[] {
  return ws.assignments.filter((a) => a.teacher_id === ws.teacher.id);
}

export function myHomeroomClasses(ws: Workspace): ClassRoom[] {
  return ws.classes.filter((c) => c.homeroom_teacher_id === ws.teacher.id);
}

export function classById(ws: Workspace, id: string): ClassRoom | undefined {
  return ws.classes.find((c) => c.id === id);
}

export function subjectById(ws: Workspace, id: string): Subject | undefined {
  return ws.subjects.find((s) => s.id === id);
}

export function teacherName(ws: Workspace, id: string | null): string {
  if (!id) return 'Belum ada';
  if (id === ws.teacher.id) return 'Anda';
  return ws.colleagues.find((t) => t.id === id)?.nama_lengkap || 'Guru lain';
}

export function assignmentLabel(ws: Workspace, a: TeachingAssignment): { subject: Subject | undefined; cls: ClassRoom | undefined; title: string } {
  const subject = subjectById(ws, a.subject_id);
  const cls = classById(ws, a.class_id);
  return { subject, cls, title: `${subject?.nama || 'Mapel'} · ${cls?.nama_kelas || 'Kelas'}` };
}

export function isHomeroomOf(ws: Workspace, classId: string): boolean {
  return ws.classes.some((c) => c.id === classId && c.homeroom_teacher_id === ws.teacher.id);
}
