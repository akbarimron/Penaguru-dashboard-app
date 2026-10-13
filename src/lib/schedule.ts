import { ScheduleSlot, Student, TeachingAssignment, Workspace } from '../types';
import { sessionState, SessionState } from './dates';

export interface SessionItem {
  assignment: TeachingAssignment;
  slot: ScheduleSlot;
  state: SessionState;
  dayOffset: number; // 0 = hari ini
}

export function todaySessions(assignments: TeachingAssignment[], now = new Date()): SessionItem[] {
  const day = now.getDay();
  return assignments
    .flatMap((a) => a.jadwal.filter((s) => s.hari === day).map((slot) => ({ assignment: a, slot, state: sessionState(slot, now), dayOffset: 0 })))
    .sort((a, b) => a.slot.jam_mulai.localeCompare(b.slot.jam_mulai));
}

// Sesi yang paling relevan sekarang: yang sedang berlangsung, atau yang
// berikutnya hari ini, atau yang terdekat di hari-hari berikutnya.
export function focusSession(assignments: TeachingAssignment[], now = new Date()): SessionItem | null {
  const today = todaySessions(assignments, now);
  const live = today.find((s) => s.state === 'berlangsung');
  if (live) return live;
  const next = today.find((s) => s.state === 'berikutnya');
  if (next) return next;
  for (let offset = 1; offset <= 7; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const day = d.getDay();
    const slots = assignments
      .flatMap((a) => a.jadwal.filter((s) => s.hari === day).map((slot) => ({ assignment: a, slot })))
      .sort((a, b) => a.slot.jam_mulai.localeCompare(b.slot.jam_mulai));
    if (slots.length) return { ...slots[0], state: 'berikutnya', dayOffset: offset };
  }
  return null;
}

// Menentukan konteks saat membuka detail siswa dari pencarian/daftar umum.
export function studentContext(ws: Workspace, student: Student): { studentId: string; assignmentId?: string } {
  const homeroom = ws.classes.some((c) => c.id === student.class_id && c.homeroom_teacher_id === ws.teacher.id);
  if (homeroom) return { studentId: student.id };
  const a = ws.assignments.find((x) => x.teacher_id === ws.teacher.id && x.class_id === student.class_id);
  return { studentId: student.id, assignmentId: a?.id };
}
