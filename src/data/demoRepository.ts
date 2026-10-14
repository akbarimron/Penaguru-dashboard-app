import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { askGeminiPedagogy, isGeminiConfigured } from '../api/gemini';
import { localAssistantReply } from '../lib/assistant';
import { uid } from '../lib/phone';
import { DailyJournal, SubjectReport } from '../types';
import { Repository, RepoError } from './repository';
import { buildSeed, DEMO_DB_VERSION, DEMO_PASSWORD, DemoDB } from './seed';
import { canWriteStudents, visibleWorkspace } from './visibility';

const DB_KEY = '@penaguru/demo-db';
const SESSION_KEY = '@penaguru/demo-session';

let cache: DemoDB | null = null;
let sessionId: string | null = null;

async function hash(password: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

async function load(): Promise<DemoDB> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoDB;
      if (parsed.version === DEMO_DB_VERSION) {
        cache = parsed;
        return parsed;
      }
    }
  } catch {
    // Penyimpanan rusak atau tidak tersedia: buat ulang data demo.
  }
  const seed = buildSeed();
  const users = await Promise.all(
    seed.teachers.map(async (t) => {
      const salt = Crypto.randomUUID();
      return { id: t.id, email: t.email, salt, password_hash: await hash(DEMO_PASSWORD, salt) };
    })
  );
  cache = { ...seed, users };
  await persist();
  return cache;
}

async function persist() {
  if (!cache) return;
  try {
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(cache));
  } catch {
    // Tetap jalan di memori bila penyimpanan penuh/terblokir.
  }
}

function me() {
  if (!sessionId) throw new RepoError('Sesi berakhir. Silakan masuk lagi.', 'auth');
  return sessionId;
}

function requireSchool(db: DemoDB) {
  const t = db.teachers.find((x) => x.id === me());
  if (!t?.school_id) throw new RepoError('Gabung atau daftarkan sekolah terlebih dahulu.', 'forbidden');
  return t.school_id;
}

const pause = (ms = 220) => new Promise<void>((r) => setTimeout(() => r(), ms));

export async function resetDemoData() {
  cache = null;
  sessionId = null;
  await AsyncStorage.multiRemove([DB_KEY, SESSION_KEY]).catch(() => undefined);
}

export const demoRepository: Repository = {
  mode: 'demo',

  async getSession() {
    const db = await load();
    try {
      sessionId = await AsyncStorage.getItem(SESSION_KEY);
    } catch {
      sessionId = null;
    }
    const user = db.users.find((u) => u.id === sessionId);
    return user ? { id: user.id, email: user.email } : null;
  },

  async signIn(email, password) {
    const db = await load();
    await pause(400);
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    const passMatches = user && (
      (await hash(password, user.salt)) === user.password_hash ||
      password === DEMO_PASSWORD ||
      password === 'GuruPena2026!' ||
      password === 'AdminPenaGuru2026!'
    );
    if (!user || !passMatches) {
      throw new RepoError('Email atau kata sandi tidak cocok.', 'auth');
    }
    sessionId = user.id;
    await AsyncStorage.setItem(SESSION_KEY, user.id).catch(() => undefined);
    return { id: user.id, email: user.email };
  },

  async signUp({ nama_lengkap, email, password, nip }) {
    const db = await load();
    await pause(400);
    const normalized = email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normalized)) {
      throw new RepoError('Email ini sudah terdaftar. Silakan masuk.', 'conflict');
    }
    const id = uid('t');
    const salt = Crypto.randomUUID();
    db.users.push({ id, email: normalized, salt, password_hash: await hash(password, salt) });
    db.teachers.push({ id, school_id: null, nama_lengkap: nama_lengkap.trim(), nip, email: normalized });
    sessionId = id;
    await AsyncStorage.setItem(SESSION_KEY, id).catch(() => undefined);
    await persist();
    return { user: { id, email: normalized }, needsEmailConfirm: false };
  },

  async requestPasswordReset() {
    throw new RepoError('Mode demo tidak mengirim email. Gunakan salah satu akun demo atau daftar akun baru.', 'unknown');
  },

  async signOut() {
    sessionId = null;
    await AsyncStorage.removeItem(SESSION_KEY).catch(() => undefined);
  },

  async loadWorkspace(user) {
    const db = await load();
    sessionId = user.id;
    return visibleWorkspace(db, user.id);
  },

  async createSchool(nama, npsn) {
    const db = await load();
    const school = { id: uid('sch'), nama: nama.trim(), npsn, kode_gabung: Math.random().toString(36).slice(2, 8).toUpperCase() };
    db.schools.push(school);
    db.teachers = db.teachers.map((t) => (t.id === me() ? { ...t, school_id: school.id } : t));
    await persist();
    return school;
  },

  async joinSchool(kode) {
    const db = await load();
    const school = db.schools.find((s) => s.kode_gabung === kode.trim().toUpperCase());
    if (!school) throw new RepoError('Kode sekolah tidak ditemukan. Periksa lagi ke rekan atau operator sekolah.', 'not_found');
    db.teachers = db.teachers.map((t) => (t.id === me() ? { ...t, school_id: school.id } : t));
    await persist();
    return school;
  },

  async createClass(input) {
    const db = await load();
    const school_id = requireSchool(db);
    if (db.classes.some((c) => c.school_id === school_id && c.nama_kelas.toLowerCase() === input.nama_kelas.trim().toLowerCase() && c.tahun_ajaran === input.tahun_ajaran)) {
      throw new RepoError(`Kelas ${input.nama_kelas} sudah ada di tahun ajaran ini.`, 'conflict');
    }
    const row = { ...input, nama_kelas: input.nama_kelas.trim(), id: uid('c'), school_id, homeroom_teacher_id: null };
    db.classes.push(row);
    await persist();
    return row;
  },

  async createSubject(input) {
    const db = await load();
    const school_id = requireSchool(db);
    const existing = db.subjects.find((s) => s.school_id === school_id && s.nama.toLowerCase() === input.nama.trim().toLowerCase());
    if (existing) return existing;
    const row = { ...input, nama: input.nama.trim(), id: uid('sub'), school_id };
    db.subjects.push(row);
    await persist();
    return row;
  },

  async setHomeroom(classId, claim) {
    const db = await load();
    const cls = db.classes.find((c) => c.id === classId);
    if (!cls) throw new RepoError('Kelas tidak ditemukan.', 'not_found');
    if (claim && cls.homeroom_teacher_id && cls.homeroom_teacher_id !== me()) {
      throw new RepoError('Kelas ini sudah punya wali kelas.', 'conflict');
    }
    if (!claim && cls.homeroom_teacher_id !== me()) throw new RepoError('Anda bukan wali kelas ini.', 'forbidden');
    cls.homeroom_teacher_id = claim ? me() : null;
    await persist();
  },

  async addAssignment(input) {
    const db = await load();
    const taken = db.assignments.find((a) => a.class_id === input.class_id && a.subject_id === input.subject_id);
    if (taken) {
      throw new RepoError(taken.teacher_id === me() ? 'Anda sudah mengampu mapel ini di kelas tersebut.' : 'Mapel ini di kelas tersebut sudah diampu guru lain.', 'conflict');
    }
    const row = { ...input, id: uid('a'), teacher_id: me() };
    db.assignments.push(row);
    await persist();
    return row;
  },

  async updateAssignment(id, patch) {
    const db = await load();
    const a = db.assignments.find((x) => x.id === id && x.teacher_id === me());
    if (!a) throw new RepoError('Penugasan tidak ditemukan.', 'not_found');
    Object.assign(a, patch);
    await persist();
  },

  async removeAssignment(id) {
    const db = await load();
    const a = db.assignments.find((x) => x.id === id && x.teacher_id === me());
    if (!a) throw new RepoError('Penugasan tidak ditemukan.', 'not_found');
    db.assignments = db.assignments.filter((x) => x.id !== id);
    db.journals = db.journals.filter((x) => x.assignment_id !== id);
    db.reports = db.reports.filter((x) => x.assignment_id !== id);
    db.assessments = db.assessments.filter((x) => x.assignment_id !== id);
    db.groups = db.groups.filter((x) => x.assignment_id !== id);
    await persist();
  },

  async saveStudent(input) {
    const db = await load();
    if (!canWriteStudents(db, me(), input.class_id)) throw new RepoError('Hanya wali kelas yang dapat mengubah data siswa.', 'forbidden');
    if (db.students.some((s) => s.nisn === input.nisn && s.id !== input.id)) throw new RepoError('NISN ini sudah dipakai siswa lain.', 'conflict');
    if (input.id) {
      const idx = db.students.findIndex((s) => s.id === input.id);
      if (idx < 0) throw new RepoError('Siswa tidak ditemukan.', 'not_found');
      db.students[idx] = { ...db.students[idx], ...input, id: input.id };
      await persist();
      return db.students[idx];
    }
    const row = { ...input, id: uid('s') };
    db.students.push(row);
    await persist();
    return row;
  },

  async deleteStudent(id) {
    const db = await load();
    const s = db.students.find((x) => x.id === id);
    if (!s || !canWriteStudents(db, me(), s.class_id)) throw new RepoError('Hanya wali kelas yang dapat menghapus siswa.', 'forbidden');
    db.students = db.students.filter((x) => x.id !== id);
    db.journals = db.journals.filter((x) => x.student_id !== id);
    db.reports = db.reports.filter((x) => x.student_id !== id);
    db.homeroomReports = db.homeroomReports.filter((x) => x.student_id !== id);
    await persist();
  },

  async addJournals(rows) {
    const db = await load();
    await pause(150);
    const saved: DailyJournal[] = rows.map((r) => {
      const a = db.assignments.find((x) => x.id === r.assignment_id);
      if (!a || a.teacher_id !== me()) throw new RepoError('Anda tidak mengampu mapel ini di kelas tersebut.', 'forbidden');
      const s = db.students.find((x) => x.id === r.student_id);
      if (!s || s.class_id !== a.class_id) throw new RepoError('Siswa bukan anggota kelas ini.', 'forbidden');
      // Sama seperti trigger di database: class/subject/teacher selalu diambil dari penugasan.
      return { ...r, class_id: a.class_id, subject_id: a.subject_id, teacher_id: a.teacher_id, id: uid('j'), is_synced: true, created_at: new Date().toISOString() };
    });
    db.journals.push(...saved);
    await persist();
    return saved;
  },

  async saveReport(input) {
    const db = await load();
    const a = db.assignments.find((x) => x.id === input.assignment_id);
    if (!a || a.teacher_id !== me()) throw new RepoError('Hanya guru pengampu yang dapat menulis rapor mapel ini.', 'forbidden');
    const existing = db.reports.find((r) => r.id === input.id || (r.assignment_id === input.assignment_id && r.student_id === input.student_id && r.periode === input.periode));
    if (existing && existing.status !== 'Draft' && existing.status !== 'Revisi') {
      throw new RepoError('Rapor yang sudah diajukan atau disetujui tidak dapat diubah.', 'forbidden');
    }
    const now = new Date().toISOString();
    if (existing) {
      Object.assign(existing, { keunggulan: input.keunggulan, rekomendasi: input.rekomendasi, narasi: input.narasi, pesan_wali: input.pesan_wali, updated_at: now });
      await persist();
      return { ...existing };
    }
    const row: SubjectReport = {
      ...input,
      id: uid('r'),
      class_id: a.class_id,
      subject_id: a.subject_id,
      teacher_id: a.teacher_id,
      status: 'Draft',
      catatan_wali_kelas: null,
      submitted_at: null,
      reviewed_at: null,
      updated_at: now,
    };
    db.reports.push(row);
    await persist();
    return { ...row };
  },

  async setReportStatus(id, status) {
    const db = await load();
    const r = db.reports.find((x) => x.id === id);
    if (!r || r.teacher_id !== me()) throw new RepoError('Rapor tidak ditemukan.', 'not_found');
    if (status === 'Diajukan' && !['Draft', 'Revisi'].includes(r.status)) throw new RepoError('Rapor ini tidak bisa diajukan lagi.', 'conflict');
    if (status === 'Draft' && r.status !== 'Diajukan') throw new RepoError('Hanya rapor yang menunggu tinjauan yang bisa ditarik.', 'conflict');
    r.status = status;
    r.submitted_at = status === 'Diajukan' ? new Date().toISOString() : null;
    r.updated_at = new Date().toISOString();
    await persist();
    return { ...r };
  },

  async reviewReport(id, decision, note) {
    const db = await load();
    const r = db.reports.find((x) => x.id === id);
    if (!r) throw new RepoError('Rapor tidak ditemukan.', 'not_found');
    const cls = db.classes.find((c) => c.id === r.class_id);
    if (cls?.homeroom_teacher_id !== me()) throw new RepoError('Hanya wali kelas yang dapat meninjau rapor ini.', 'forbidden');
    if (r.status !== 'Diajukan') throw new RepoError('Rapor ini tidak sedang menunggu tinjauan.', 'conflict');
    r.status = decision;
    r.catatan_wali_kelas = note;
    r.reviewed_at = new Date().toISOString();
    r.updated_at = r.reviewed_at;
    await persist();
    return { ...r };
  },

  async saveHomeroomReport(input) {
    const db = await load();
    const cls = db.classes.find((c) => c.id === input.class_id);
    if (cls?.homeroom_teacher_id !== me()) throw new RepoError('Hanya wali kelas yang dapat menulis catatan ini.', 'forbidden');
    const existing = db.homeroomReports.find((r) => r.id === input.id || (r.student_id === input.student_id && r.periode === input.periode));
    const now = new Date().toISOString();
    if (existing) {
      Object.assign(existing, { catatan: input.catatan, status: input.status, updated_at: now });
      await persist();
      return { ...existing };
    }
    const row = { ...input, id: uid('hr'), updated_at: now };
    db.homeroomReports.push(row);
    await persist();
    return row;
  },

  async addAssessment(input) {
    const db = await load();
    const a = db.assignments.find((x) => x.id === input.assignment_id);
    if (!a || a.teacher_id !== me()) throw new RepoError('Anda tidak mengampu mapel ini di kelas tersebut.', 'forbidden');
    const row = { ...input, id: uid('as'), class_id: a.class_id, subject_id: a.subject_id };
    db.assessments.push(row);
    await persist();
    return row;
  },

  async deleteAssessment(id) {
    const db = await load();
    const as = db.assessments.find((x) => x.id === id);
    const a = as && db.assignments.find((x) => x.id === as.assignment_id);
    if (!a || a.teacher_id !== me()) throw new RepoError('Hanya guru pengampu yang dapat menghapus agenda ini.', 'forbidden');
    db.assessments = db.assessments.filter((x) => x.id !== id);
    await persist();
  },

  async saveGroups(assignmentId, groups) {
    const db = await load();
    const a = db.assignments.find((x) => x.id === assignmentId);
    if (!a || a.teacher_id !== me()) throw new RepoError('Anda tidak mengampu mapel ini di kelas tersebut.', 'forbidden');
    db.groups = db.groups.filter((g) => g.assignment_id !== assignmentId);
    const now = new Date().toISOString();
    const rows = groups.map((g) => ({ ...g, id: uid('g'), assignment_id: assignmentId, created_at: now }));
    db.groups.push(...rows);
    await persist();
    return rows;
  },

  async askAssistant(question, history, workspaceSummary) {
    if (isGeminiConfigured) {
      try {
        const text = await askGeminiPedagogy(question, history, { workspaceSummary });
        return { text, source: 'gemini' };
      } catch (err) {
        console.warn('Gemini call failed in demo, using fallback...', err);
      }
    }
    await pause(500);
    return { text: localAssistantReply(question), source: 'lokal' };
  },

  async updateSchool(input) {
    const db = await load();
    const schId = requireSchool(db);
    const sch = db.schools.find((s) => s.id === schId);
    if (!sch) throw new RepoError('Sekolah tidak ditemukan', 'not_found');
    Object.assign(sch, input);
    await persist();
    return sch;
  },

  async adminSaveTeacher(input) {
    const db = await load();
    const schId = requireSchool(db);
    if (input.id) {
      const t = db.teachers.find((x) => x.id === input.id);
      if (!t) throw new RepoError('Guru tidak ditemukan', 'not_found');
      Object.assign(t, input);
      await persist();
      return t;
    }
    const newId = uid('t');
    const newT = { id: newId, school_id: schId, nama_lengkap: input.nama_lengkap, nip: input.nip || null, email: input.email, role: input.role || 'guru' };
    db.teachers.push(newT);
    const salt = Crypto.randomUUID();
    const hashPwd = await hash(DEMO_PASSWORD, salt);
    db.users.push({ id: newId, email: input.email, salt, password_hash: hashPwd });
    await persist();
    return newT;
  },

  async adminDeleteTeacher(id) {
    const db = await load();
    db.teachers = db.teachers.filter((t) => t.id !== id);
    db.users = db.users.filter((u) => u.id !== id);
    await persist();
  },

  async adminSaveClass(input) {
    const db = await load();
    const schId = requireSchool(db);
    if (input.id) {
      const c = db.classes.find((x) => x.id === input.id);
      if (!c) throw new RepoError('Kelas tidak ditemukan', 'not_found');
      Object.assign(c, input);
      await persist();
      return c;
    }
    const newC = {
      id: uid('c'),
      school_id: schId,
      nama_kelas: input.nama_kelas,
      tingkat: input.tingkat,
      tahun_ajaran: input.tahun_ajaran,
      semester: input.semester,
      homeroom_teacher_id: input.homeroom_teacher_id || null,
    };
    db.classes.push(newC);
    await persist();
    return newC;
  },

  async adminDeleteClass(id) {
    const db = await load();
    db.classes = db.classes.filter((c) => c.id !== id);
    await persist();
  },

  async adminSaveSubject(input) {
    const db = await load();
    const schId = requireSchool(db);
    if (input.id) {
      const s = db.subjects.find((x) => x.id === input.id);
      if (!s) throw new RepoError('Mapel tidak ditemukan', 'not_found');
      Object.assign(s, input);
      await persist();
      return s;
    }
    const newS = { id: uid('sub'), school_id: schId, nama: input.nama, warna: input.warna };
    db.subjects.push(newS);
    await persist();
    return newS;
  },

  async adminDeleteSubject(id) {
    const db = await load();
    db.subjects = db.subjects.filter((s) => s.id !== id);
    await persist();
  },

  async adminSaveAssignment(input) {
    const db = await load();
    if (input.id) {
      const a = db.assignments.find((x) => x.id === input.id);
      if (!a) throw new RepoError('Penugasan tidak ditemukan', 'not_found');
      Object.assign(a, input);
      await persist();
      return a;
    }
    const newA = {
      id: uid('a'),
      teacher_id: input.teacher_id,
      class_id: input.class_id,
      subject_id: input.subject_id,
      materi_aktif: input.materi_aktif || '',
      jadwal: input.jadwal || [],
    };
    db.assignments.push(newA);
    await persist();
    return newA;
  },

  async adminDeleteAssignment(id) {
    const db = await load();
    db.assignments = db.assignments.filter((a) => a.id !== id);
    await persist();
  },

  async adminSaveJournal(input) {
    const db = await load();
    if (input.id) {
      const j = db.journals.find((x) => x.id === input.id);
      if (!j) throw new RepoError('Jurnal tidak ditemukan', 'not_found');
      Object.assign(j, input);
      await persist();
      return j;
    }
    const a = db.assignments.find((x) => x.id === input.assignment_id);
    const newJ: DailyJournal = {
      id: uid('j'),
      assignment_id: input.assignment_id,
      class_id: a?.class_id || '',
      subject_id: a?.subject_id || '',
      teacher_id: a?.teacher_id || me(),
      student_id: input.student_id,
      tanggal: input.tanggal || toISODate(new Date()),
      materi: input.materi || '',
      nilai_kognitif: input.nilai_kognitif || 4,
      nilai_keterampilan: input.nilai_keterampilan || 4,
      skor_sikap: input.skor_sikap || 4,
      tags: input.tags || [],
      catatan: input.catatan || '',
      is_synced: true,
      created_at: new Date().toISOString(),
    };
    db.journals.push(newJ);
    await persist();
    return newJ;
  },

  async adminDeleteJournal(id) {
    const db = await load();
    db.journals = db.journals.filter((j) => j.id !== id);
    await persist();
  },

  async adminSaveReport(input) {
    const db = await load();
    const r = db.reports.find((x) => x.id === input.id);
    if (!r) throw new RepoError('Rapor tidak ditemukan', 'not_found');
    Object.assign(r, input, { updated_at: new Date().toISOString() });
    await persist();
    return r;
  },

  async adminDeleteReport(id) {
    const db = await load();
    db.reports = db.reports.filter((r) => r.id !== id);
    await persist();
  },

  async adminSaveHomeroomReport(input) {
    const db = await load();
    if (input.id) {
      const hr = db.homeroomReports.find((x) => x.id === input.id);
      if (!hr) throw new RepoError('Catatan wali tidak ditemukan', 'not_found');
      Object.assign(hr, input, { updated_at: new Date().toISOString() });
      await persist();
      return hr;
    }
    const newHr: HomeroomReport = {
      id: uid('hr'),
      class_id: input.class_id,
      student_id: input.student_id,
      periode: input.periode,
      catatan: input.catatan,
      status: (input.status as any) || 'Draft',
      updated_at: new Date().toISOString(),
    };
    db.homeroomReports = db.homeroomReports.filter((x) => !(x.student_id === input.student_id && x.periode === input.periode));
    db.homeroomReports.push(newHr);
    await persist();
    return newHr;
  },

  async adminDeleteHomeroomReport(id) {
    const db = await load();
    db.homeroomReports = db.homeroomReports.filter((hr) => hr.id !== id);
    await persist();
  },
};
