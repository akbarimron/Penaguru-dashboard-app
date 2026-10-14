import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { isSupabaseConfigured } from '../api/supabase';
import { demoRepository, resetDemoData } from '../data/demoRepository';
import { NewJournal, RegisterInput, ReportInput, Repository, RepoError } from '../data/repository';
import { supabaseRepository } from '../data/supabaseRepository';
import { uid } from '../lib/phone';
import {
  Assessment,
  ChatMessage,
  ClassRoom,
  DailyJournal,
  HomeroomReport,
  SessionUser,
  Student,
  StudyGroup,
  Subject,
  SubjectReport,
  TeachingAssignment,
  Workspace,
} from '../types';

export const repo: Repository = isSupabaseConfigured ? supabaseRepository : demoRepository;

const PENDING_KEY = '@penaguru/pending-journals';

export type AppStatus = 'booting' | 'signedOut' | 'setup' | 'ready';

interface AppState {
  mode: Repository['mode'];
  status: AppStatus;
  bootError: string | null;
  user: SessionUser | null;
  ws: Workspace | null;
  offline: boolean;
  pending: DailyJournal[];
  syncing: boolean;
  chat: ChatMessage[];
  assistantBusy: boolean;

  boot: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<{ needsEmailConfirm: boolean }>;
  requestPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  finishSetup: () => boolean;

  createSchool: (nama: string, npsn: string | null) => Promise<void>;
  joinSchool: (kode: string) => Promise<void>;
  createClass: (input: Pick<ClassRoom, 'nama_kelas' | 'tingkat' | 'tahun_ajaran' | 'semester'>) => Promise<ClassRoom>;
  createSubject: (input: Pick<Subject, 'nama' | 'warna'>) => Promise<Subject>;
  setHomeroom: (classId: string, claim: boolean) => Promise<void>;
  addAssignment: (input: Pick<TeachingAssignment, 'class_id' | 'subject_id' | 'materi_aktif' | 'jadwal'>) => Promise<TeachingAssignment>;
  updateAssignment: (id: string, patch: Partial<Pick<TeachingAssignment, 'materi_aktif' | 'jadwal'>>) => Promise<void>;
  removeAssignment: (id: string) => Promise<void>;

  saveStudent: (input: Omit<Student, 'id'> & { id?: string }) => Promise<Student>;
  deleteStudent: (id: string) => Promise<void>;

  addJournals: (rows: NewJournal[]) => Promise<{ saved: number; queued: boolean }>;
  setOffline: (value: boolean) => void;
  syncPending: () => Promise<number>;

  saveReport: (input: ReportInput) => Promise<SubjectReport>;
  setReportStatus: (id: string, status: 'Draft' | 'Diajukan') => Promise<SubjectReport>;
  reviewReport: (id: string, decision: 'Disetujui' | 'Revisi', note: string | null) => Promise<void>;
  saveHomeroomReport: (input: Omit<HomeroomReport, 'id' | 'updated_at'> & { id?: string }) => Promise<void>;

  addAssessment: (input: Omit<Assessment, 'id' | 'class_id' | 'subject_id'>) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  saveGroups: (assignmentId: string, groups: Pick<StudyGroup, 'nama_kelompok' | 'members'>[]) => Promise<void>;

  askAssistant: (question: string) => Promise<void>;
  clearChat: () => Promise<void>;
  resetDemo: () => Promise<void>;
}

export function needsSetup(ws: Workspace | null): boolean {
  if (!ws) return true;
  if (!ws.school) return true;
  const teaches = ws.assignments.some((a) => a.teacher_id === ws.teacher.id);
  const homeroom = ws.classes.some((c) => c.homeroom_teacher_id === ws.teacher.id);
  return !teaches && !homeroom;
}

async function persistPending(pending: DailyJournal[], offline: boolean) {
  try {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify({ pending, offline }));
  } catch {
    // abaikan: antrean tetap di memori
  }
}

const CHAT_KEY = '@penaguru/chat-history';

async function loadChatHistory(userId?: string): Promise<ChatMessage[]> {
  try {
    const key = userId ? `${CHAT_KEY}:${userId}` : CHAT_KEY;
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load chat history:', e);
  }
  return [welcome()];
}

async function persistChatHistory(chat: ChatMessage[], userId?: string): Promise<void> {
  try {
    const key = userId ? `${CHAT_KEY}:${userId}` : CHAT_KEY;
    await AsyncStorage.setItem(key, JSON.stringify(chat));
  } catch (e) {
    console.warn('Failed to save chat history:', e);
  }
}

const welcome = (): ChatMessage => ({
  id: 'welcome',
  sender: 'assistant',
  source: 'lokal',
  created_at: new Date().toISOString(),
  text: 'Halo! Saya Asisten Guru siap membantu Anda menyusun strategi mengajar, ide pembuka kelas, dan cara menulis catatan rapor. Pilih topik di atas atau ketik pertanyaan.',
});

export function buildWorkspaceSummary(ws: Workspace | null): string {
  if (!ws) return '';

  const teacher = ws.teacher;
  const schoolName = ws.school?.nama || 'Sekolah';
  const homeroomClasses = ws.classes.filter((c) => c.homeroom_teacher_id === teacher.id);
  const myAssignments = ws.assignments.filter((a) => a.teacher_id === teacher.id);

  let text = `[DATA AKADEMIK & KELAS GURU SAAT INI]\n`;
  text += `Nama Guru: ${teacher.nama_lengkap}\n`;
  text += `Sekolah: ${schoolName}\n`;
  if (homeroomClasses.length > 0) {
    text += `Status Wali Kelas: Mengampu kelas perwalian ${homeroomClasses.map((c) => c.nama_kelas).join(', ')}\n`;
  }

  text += `\nDaftar Kelas & Siswa:\n`;
  if (ws.classes.length === 0) {
    text += `(Guru belum mendaftarkan kelas di sistem. Jika guru meminta membagi kelompok, arahkan untuk membuat kelas dan menambahkan siswa terlebih dahulu)\n`;
  } else {
    for (const c of ws.classes) {
      const isHomeroom = c.homeroom_teacher_id === teacher.id;
      const classStudents = ws.students.filter((s) => s.class_id === c.id);
      text += `\n• Kelas: ${c.nama_kelas} (${c.tingkat})${isHomeroom ? ' [KELAS PERWALIAN ANDA]' : ''} - Total ${classStudents.length} Siswa:\n`;
      if (classStudents.length === 0) {
        text += `  - (Belum ada siswa terdaftar di kelas ini)\n`;
      } else {
        classStudents.forEach((s, idx) => {
          const studentJournals = ws.journals.filter((j) => j.student_id === s.id);
          const tags = [...new Set(studentJournals.flatMap((j) => j.tags))].slice(0, 3);
          const tagInfo = tags.length > 0 ? ` [Catatan Jurnal: ${tags.join(', ')}]` : '';
          const waliInfo = s.nama_wali ? ` (Wali: ${s.nama_wali})` : '';
          text += `  ${idx + 1}. ${s.nama_lengkap} (${s.jenis_kelamin})${waliInfo}${tagInfo}\n`;
        });
      }
    }
  }

  if (myAssignments.length > 0) {
    text += `\nMata Pelajaran yang Diampu Guru:\n`;
    for (const a of myAssignments) {
      const subj = ws.subjects.find((s) => s.id === a.subject_id);
      const cls = ws.classes.find((c) => c.id === a.class_id);
      text += `• ${subj?.nama || 'Mapel'} di kelas ${cls?.nama_kelas || '-'}${a.materi_aktif ? ` (Materi aktif: ${a.materi_aktif})` : ''}\n`;
    }
  }

  // Riwayat lengkap seluruh daily journal yang telah dicatat guru
  if (ws.journals.length > 0) {
    text += `\n[SELURUH RIWAYAT CATATAN DAILY JOURNAL & OBSERVASI GURU]:\n`;
    const sortedJournals = [...ws.journals].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
    for (const j of sortedJournals) {
      const student = ws.students.find((s) => s.id === j.student_id);
      const subject = ws.subjects.find((s) => s.id === j.subject_id);
      const cls = student ? ws.classes.find((c) => c.id === student.class_id) : null;
      const tagStr = j.tags && j.tags.length ? ` | Tag: [${j.tags.join(', ')}]` : '';
      const scoreStr = ` | Skor: Kognitif=${j.nilai_kognitif}, Terampil=${j.nilai_keterampilan}, Sikap=${j.skor_sikap}`;
      const noteStr = j.catatan ? ` | Catatan Observasi Guru: "${j.catatan}"` : ' | (Tidak ada catatan khusus)';
      text += `- [Tanggal ${j.tanggal}] Siswa: ${student?.nama_lengkap || 'Siswa'} (${cls?.nama_kelas || '-'}, Mapel ${subject?.nama || 'Mapel'}) | Materi: "${j.materi}"${scoreStr}${tagStr}${noteStr}\n`;
    }
  } else {
    text += `\n[CATATAN DAILY JOURNAL]: Belum ada catatan daily journal di sistem.\n`;
  }

  text += `[AKHIR DATA AKADEMIK]\n`;
  return text;
}

export const useAppStore = create<AppState>((set, get) => {
  const patchWs = (fn: (ws: Workspace) => Partial<Workspace>) => {
    const ws = get().ws;
    if (!ws) return;
    set({ ws: { ...ws, ...fn(ws) } });
  };

  // keepStatus: dipakai saat memuat ulang dari dalam aplikasi agar navigator
  // tidak berpindah stack (setup <-> ready) di tengah alur pengguna.
  const enter = async (user: SessionUser, keepStatus = false) => {
    const ws = await repo.loadWorkspace(user);
    const pending = get().pending.filter((p) => p.teacher_id === user.id);
    const merged = { ...ws, journals: [...pending, ...ws.journals] };
    const status = keepStatus ? get().status : needsSetup(merged) ? 'setup' : 'ready';
    const savedChat = await loadChatHistory(user.id);
    set({ user, ws: merged, status, bootError: null, chat: savedChat });
  };

  return {
    mode: repo.mode,
    status: 'booting',
    bootError: null,
    user: null,
    ws: null,
    offline: false,
    pending: [],
    syncing: false,
    chat: [],
    assistantBusy: false,

    boot: async () => {
      set({ status: 'booting', bootError: null });
      try {
        const raw = await AsyncStorage.getItem(PENDING_KEY).catch(() => null);
        if (raw) {
          const parsed = JSON.parse(raw);
          set({ pending: parsed.pending || [], offline: Boolean(parsed.offline) });
        }
        const user = await repo.getSession();
        if (!user) {
          set({ status: 'signedOut' });
          return;
        }
        await enter(user);
      } catch (e: any) {
        set({ status: 'signedOut', bootError: e?.message || 'Gagal memuat data.' });
      }
    },

    signIn: async (email, password) => {
      const user = await repo.signIn(email, password);
      await enter(user);
    },

    signUp: async (input) => {
      const { user, needsEmailConfirm } = await repo.signUp(input);
      if (user) await enter(user);
      return { needsEmailConfirm };
    },

    requestPasswordReset: (email) => repo.requestPasswordReset(email),

    signOut: async () => {
      await repo.signOut();
      set({ status: 'signedOut', user: null, ws: null, chat: [] });
    },

    refresh: async () => {
      const user = get().user;
      if (!user) return;
      await enter(user, true);
    },

    finishSetup: () => {
      if (needsSetup(get().ws)) return false;
      set({ status: 'ready' });
      return true;
    },

    createSchool: async (nama, npsn) => {
      await repo.createSchool(nama, npsn);
      await get().refresh();
    },

    joinSchool: async (kode) => {
      await repo.joinSchool(kode);
      await get().refresh();
    },

    createClass: async (input) => {
      const row = await repo.createClass(input);
      patchWs((ws) => ({ classes: [...ws.classes, row] }));
      return row;
    },

    createSubject: async (input) => {
      const row = await repo.createSubject(input);
      patchWs((ws) => ({ subjects: ws.subjects.some((s) => s.id === row.id) ? ws.subjects : [...ws.subjects, row] }));
      return row;
    },

    setHomeroom: async (classId, claim) => {
      await repo.setHomeroom(classId, claim);
      await get().refresh();
    },

    addAssignment: async (input) => {
      const row = await repo.addAssignment(input);
      // Muat ulang agar siswa kelas baru ikut terlihat (RLS berubah).
      await get().refresh();
      return row;
    },

    updateAssignment: async (id, patch) => {
      await repo.updateAssignment(id, patch);
      patchWs((ws) => ({ assignments: ws.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
    },

    removeAssignment: async (id) => {
      await repo.removeAssignment(id);
      await get().refresh();
    },

    saveStudent: async (input) => {
      const row = await repo.saveStudent(input);
      patchWs((ws) => ({
        students: ws.students.some((s) => s.id === row.id)
          ? ws.students.map((s) => (s.id === row.id ? row : s))
          : [...ws.students, row],
      }));
      return row;
    },

    deleteStudent: async (id) => {
      await repo.deleteStudent(id);
      patchWs((ws) => ({
        students: ws.students.filter((s) => s.id !== id),
        journals: ws.journals.filter((j) => j.student_id !== id),
        reports: ws.reports.filter((r) => r.student_id !== id),
      }));
    },

    addJournals: async (rows) => {
      const queue = (reason: 'offline' | 'network') => {
        const now = new Date().toISOString();
        const local: DailyJournal[] = rows.map((r) => ({ ...r, id: uid('local'), is_synced: false, created_at: now }));
        const pending = [...local, ...get().pending];
        set({ pending });
        persistPending(pending, get().offline);
        patchWs((ws) => ({ journals: [...local, ...ws.journals] }));
        return { saved: local.length, queued: true, reason };
      };
      if (get().offline) return queue('offline');
      try {
        const saved = await repo.addJournals(rows);
        patchWs((ws) => ({ journals: [...saved, ...ws.journals] }));
        return { saved: saved.length, queued: false };
      } catch (e) {
        if (e instanceof RepoError && e.code === 'network') return queue('network');
        throw e;
      }
    },

    setOffline: (value) => {
      set({ offline: value });
      persistPending(get().pending, value);
    },

    syncPending: async () => {
      const pending = get().pending;
      if (pending.length === 0) return 0;
      set({ syncing: true });
      try {
        const saved = await repo.addJournals(
          pending.map(({ id, is_synced, created_at, ...rest }) => rest)
        );
        const localIds = new Set(pending.map((p) => p.id));
        set({ pending: [], offline: false });
        persistPending([], false);
        patchWs((ws) => ({ journals: [...saved, ...ws.journals.filter((j) => !localIds.has(j.id))] }));
        return saved.length;
      } finally {
        set({ syncing: false });
      }
    },

    saveReport: async (input) => {
      const row = await repo.saveReport(input);
      patchWs((ws) => ({ reports: [...ws.reports.filter((r) => r.id !== row.id), row] }));
      return row;
    },

    setReportStatus: async (id, status) => {
      const row = await repo.setReportStatus(id, status);
      patchWs((ws) => ({ reports: ws.reports.map((r) => (r.id === id ? row : r)) }));
      return row;
    },

    reviewReport: async (id, decision, note) => {
      const row = await repo.reviewReport(id, decision, note);
      patchWs((ws) => ({ reports: ws.reports.map((r) => (r.id === id ? row : r)) }));
    },

    saveHomeroomReport: async (input) => {
      const row = await repo.saveHomeroomReport(input);
      patchWs((ws) => ({ homeroomReports: [...ws.homeroomReports.filter((r) => r.id !== row.id), row] }));
    },

    addAssessment: async (input) => {
      const row = await repo.addAssessment(input);
      patchWs((ws) => ({ assessments: [...ws.assessments, row] }));
    },

    deleteAssessment: async (id) => {
      await repo.deleteAssessment(id);
      patchWs((ws) => ({ assessments: ws.assessments.filter((a) => a.id !== id) }));
    },

    saveGroups: async (assignmentId, groups) => {
      const rows = await repo.saveGroups(assignmentId, groups);
      patchWs((ws) => ({ groups: [...ws.groups.filter((g) => g.assignment_id !== assignmentId), ...rows] }));
    },

    askAssistant: async (question) => {
      const userMsg: ChatMessage = { id: uid('m'), sender: 'user', text: question, created_at: new Date().toISOString() };
      const currentHistory = get().chat;
      const nextChat = [...currentHistory, userMsg];
      set({ chat: nextChat, assistantBusy: true });
      persistChatHistory(nextChat, get().user?.id);
      try {
        const workspaceSummary = buildWorkspaceSummary(get().ws);
        const reply = await repo.askAssistant(question, currentHistory, workspaceSummary);
        const finalChat: ChatMessage[] = [
          ...nextChat,
          { id: uid('m'), sender: 'assistant', text: reply.text, source: reply.source, created_at: new Date().toISOString() },
        ];
        set({ chat: finalChat });
        persistChatHistory(finalChat, get().user?.id);
      } finally {
        set({ assistantBusy: false });
      }
    },

    clearChat: async () => {
      const initial = [welcome()];
      set({ chat: initial });
      await persistChatHistory(initial, get().user?.id);
    },

    resetDemo: async () => {
      await resetDemoData();
      set({ pending: [], offline: false, ws: null, user: null, status: 'signedOut' });
      persistPending([], false);
    },
  };
});
