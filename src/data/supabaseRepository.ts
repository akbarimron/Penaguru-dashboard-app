import { PostgrestError } from '@supabase/supabase-js';
import { aiFunctionsEnabled, supabase } from '../api/supabase';
import { askGeminiPedagogy, isGeminiConfigured } from '../api/gemini';
import { localAssistantReply } from '../lib/assistant';
import { StudyGroup, Workspace } from '../types';
import { Repository, RepoError } from './repository';

// Implementasi Supabase. Penyaringan data per kelas dan per peran tidak
// dilakukan di sini: query sengaja memakai select('*') dan RLS di database
// yang memutuskan baris mana yang boleh dibaca guru ini.

function sb() {
  if (!supabase) throw new RepoError('Supabase belum dikonfigurasi.', 'unknown');
  return supabase;
}

function fail(error: PostgrestError | { message: string; code?: string; status?: number } | null, fallback = 'Terjadi kesalahan.'): never {
  const msg = error?.message || fallback;
  if (/fetch|network|Failed to fetch/i.test(msg)) throw new RepoError('Tidak dapat terhubung ke server. Periksa koneksi internet.', 'network');
  if ((error as PostgrestError)?.code === '42501' || /row-level security/i.test(msg)) {
    throw new RepoError('Akses ditolak oleh aturan keamanan data.', 'forbidden');
  }
  if ((error as PostgrestError)?.code === '23505') throw new RepoError('Data yang sama sudah ada.', 'conflict');
  if (/Invalid login credentials/i.test(msg)) throw new RepoError('Email atau kata sandi tidak cocok.', 'auth');
  if (/already registered/i.test(msg)) throw new RepoError('Email ini sudah terdaftar. Silakan masuk.', 'conflict');
  throw new RepoError(msg);
}

async function rows<T>(query: PromiseLike<{ data: T[] | null; error: PostgrestError | null }>): Promise<T[]> {
  const { data, error } = await query;
  if (error) fail(error);
  return data || [];
}

async function one<T>(query: PromiseLike<{ data: T | null; error: PostgrestError | null }>): Promise<T> {
  const { data, error } = await query;
  if (error || !data) fail(error, 'Data tidak ditemukan.');
  return data as T;
}

export const supabaseRepository: Repository = {
  mode: 'supabase',

  async getSession() {
    const { data } = await sb().auth.getSession();
    const user = data.session?.user;
    return user ? { id: user.id, email: user.email || '' } : null;
  },

  async signIn(email, password) {
    const { data, error } = await sb().auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) fail(error, 'Gagal masuk.');
    return { id: data.user!.id, email: data.user!.email || email };
  },

  async signUp({ nama_lengkap, email, password, nip }) {
    // Trigger handle_new_user di database membuat baris teachers dari metadata ini.
    const { data, error } = await sb().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nama_lengkap: nama_lengkap.trim(), nip } },
    });
    if (error) fail(error, 'Gagal mendaftar.');
    const user = data.user && data.session ? { id: data.user.id, email: data.user.email || email } : null;
    return { user, needsEmailConfirm: !data.session };
  },

  async requestPasswordReset(email) {
    const { error } = await sb().auth.resetPasswordForEmail(email.trim());
    if (error) fail(error);
  },

  async signOut() {
    await sb().auth.signOut();
  },

  async loadWorkspace(user) {
    const client = sb();
    const teacher = await one(client.from('teachers').select('id, school_id, nama_lengkap, nip, email, role').eq('id', user.id).single());
    const empty: Workspace = {
      teacher,
      school: null,
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
    };
    if (!teacher.school_id) return empty;

    const [school, colleagues, classes, subjects, assignments, students, contacts, journals, reports, homeroomReports, assessments, groups] =
      await Promise.all([
        one(client.from('schools').select('*').eq('id', teacher.school_id).single()),
        rows(client.from('teachers').select('id, school_id, nama_lengkap, nip, email, role')),
        rows(client.from('classes').select('*').order('nama_kelas')),
        rows(client.from('subjects').select('*').order('nama')),
        rows(client.from('teaching_assignments').select('*')),
        rows(client.from('students').select('*').order('nama_lengkap')),
        // RLS hanya mengembalikan kontak siswa di kelas perwalian guru ini.
        rows(client.from('student_contacts').select('*')),
        rows(client.from('daily_journals').select('*').order('created_at', { ascending: false }).limit(2000)),
        rows(client.from('subject_reports').select('*')),
        rows(client.from('homeroom_reports').select('*')),
        rows(client.from('assessments').select('*').order('tanggal')),
        rows(client.from('study_groups').select('id, assignment_id, nama_kelompok, created_at, group_members(student_id, peran)')),
      ]);

    return {
      ...empty,
      school,
      colleagues,
      classes,
      subjects,
      assignments,
      students: (students as any[]).map((st) => {
        const c = (contacts as any[]).find((x) => x.student_id === st.id);
        return { ...st, nama_wali: c?.nama_wali ?? null, no_whatsapp_wali: c?.no_whatsapp_wali ?? null };
      }),
      journals: journals.map((j: any) => ({ ...j, is_synced: true })),
      reports,
      homeroomReports,
      assessments,
      groups: (groups as any[]).map((g) => ({ ...g, members: g.group_members || [] })) as StudyGroup[],
    };
  },

  async createSchool(nama, npsn) {
    return one(sb().rpc('create_school', { p_nama: nama.trim(), p_npsn: npsn }).single());
  },

  async joinSchool(kode) {
    const { data, error } = await sb().rpc('join_school', { p_kode: kode.trim().toUpperCase() }).single();
    if (error) {
      if (/tidak ditemukan/i.test(error.message)) throw new RepoError('Kode sekolah tidak ditemukan. Periksa lagi ke rekan atau operator sekolah.', 'not_found');
      fail(error);
    }
    return data as any;
  },

  async createClass(input) {
    const { data: me } = await sb().auth.getUser();
    const teacher = await one(sb().from('teachers').select('school_id').eq('id', me.user!.id).single());
    return one(sb().from('classes').insert({ ...input, school_id: teacher.school_id }).select().single());
  },

  async createSubject(input) {
    const { data: me } = await sb().auth.getUser();
    const teacher = await one(sb().from('teachers').select('school_id').eq('id', me.user!.id).single());
    return one(
      sb().from('subjects').upsert({ ...input, school_id: teacher.school_id }, { onConflict: 'school_id,nama' }).select().single()
    );
  },

  async setHomeroom(classId, claim) {
    const { error } = await sb().rpc('set_homeroom', { p_class_id: classId, p_claim: claim });
    if (error) fail(error);
  },

  async addAssignment(input) {
    const { data: me } = await sb().auth.getUser();
    return one(sb().from('teaching_assignments').insert({ ...input, teacher_id: me.user!.id }).select().single());
  },

  async updateAssignment(id, patch) {
    const { error } = await sb().from('teaching_assignments').update(patch).eq('id', id);
    if (error) fail(error);
  },

  async removeAssignment(id) {
    const { error } = await sb().from('teaching_assignments').delete().eq('id', id);
    if (error) fail(error);
  },

  async saveStudent(input) {
    const { id, nama_wali, no_whatsapp_wali, ...rest } = input;
    const row: any = id
      ? await one(sb().from('students').update(rest).eq('id', id).select().single())
      : await one(sb().from('students').insert(rest).select().single());
    const { error } = await sb().from('student_contacts').upsert({ student_id: row.id, nama_wali, no_whatsapp_wali });
    if (error) fail(error);
    return { ...row, nama_wali, no_whatsapp_wali };
  },

  async deleteStudent(id) {
    const { error } = await sb().from('students').delete().eq('id', id);
    if (error) fail(error);
  },

  async addJournals(list) {
    const data = await rows(sb().from('daily_journals').insert(list).select());
    return data.map((j: any) => ({ ...j, is_synced: true }));
  },

  async saveReport(input) {
    const { id, ...rest } = input;
    if (id) {
      return one(
        sb()
          .from('subject_reports')
          .update({ keunggulan: rest.keunggulan, rekomendasi: rest.rekomendasi, narasi: rest.narasi, pesan_wali: rest.pesan_wali })
          .eq('id', id)
          .select()
          .single()
      );
    }
    return one(
      sb().from('subject_reports').upsert(rest, { onConflict: 'assignment_id,student_id,periode' }).select().single()
    );
  },

  async setReportStatus(id, status) {
    return one(sb().rpc('set_subject_report_status', { p_report_id: id, p_status: status }).single());
  },

  async reviewReport(id, decision, note) {
    return one(sb().rpc('review_subject_report', { p_report_id: id, p_decision: decision, p_note: note }).single());
  },

  async saveHomeroomReport(input) {
    const { id, ...rest } = input;
    return one(sb().from('homeroom_reports').upsert(rest, { onConflict: 'student_id,periode' }).select().single());
  },

  async addAssessment(input) {
    return one(sb().from('assessments').insert(input).select().single());
  },

  async deleteAssessment(id) {
    const { error } = await sb().from('assessments').delete().eq('id', id);
    if (error) fail(error);
  },

  async saveGroups(assignmentId, groups) {
    const { data, error } = await sb().rpc('replace_study_groups', { p_assignment_id: assignmentId, p_groups: groups });
    if (error) fail(error);
    return ((data as any[]) || []).map((g) => ({ ...g, members: g.members || [] }));
  },

  async askAssistant(question, history, workspaceSummary) {
    // 1. Coba panggil Gemini API langsung bila kunci EXPO_PUBLIC_GEMINI_API_KEY terpasang
    if (isGeminiConfigured) {
      try {
        const text = await askGeminiPedagogy(question, history, { workspaceSummary });
        return { text, source: 'gemini' };
      } catch (err) {
        console.warn('Gemini direct call failed, checking fallback...', err);
      }
    }

    // 2. Coba Supabase Edge Function jika diaktifkan
    if (aiFunctionsEnabled) {
      try {
        const { data, error } = await sb().functions.invoke('pedagogy-assistant', { body: { message: question } });
        if (!error && data?.reply) return { text: String(data.reply), source: 'gemini' };
      } catch (err) {
        console.warn('Edge function failed...', err);
      }
    }

    // 3. Fallback ke bank saran pedagogik lokal
    return { text: localAssistantReply(question), source: 'lokal' };
  },

  async updateSchool(input) {
    return one(sb().from('schools').update(input).select().single());
  },

  async adminSaveTeacher(input) {
    const { id, ...rest } = input;
    if (id) {
      return one(sb().from('teachers').update(rest).eq('id', id).select().single());
    }
    return one(sb().from('teachers').insert(rest).select().single());
  },

  async adminDeleteTeacher(id) {
    const { error } = await sb().from('teachers').delete().eq('id', id);
    if (error) fail(error);
  },

  async adminSaveClass(input) {
    const { id, ...rest } = input;
    if (id) {
      return one(sb().from('classes').update(rest).eq('id', id).select().single());
    }
    const user = (await sb().auth.getUser()).data.user;
    const mySchool = await one(sb().from('teachers').select('school_id').eq('id', user?.id).single());
    return one(sb().from('classes').insert({ ...rest, school_id: mySchool.school_id }).select().single());
  },

  async adminDeleteClass(id) {
    const { error } = await sb().from('classes').delete().eq('id', id);
    if (error) fail(error);
  },

  async adminSaveSubject(input) {
    const { id, ...rest } = input;
    if (id) {
      return one(sb().from('subjects').update(rest).eq('id', id).select().single());
    }
    const user = (await sb().auth.getUser()).data.user;
    const mySchool = await one(sb().from('teachers').select('school_id').eq('id', user?.id).single());
    return one(sb().from('subjects').insert({ ...rest, school_id: mySchool.school_id }).select().single());
  },

  async adminDeleteSubject(id) {
    const { error } = await sb().from('subjects').delete().eq('id', id);
    if (error) fail(error);
  },

  async adminSaveAssignment(input) {
    const { id, ...rest } = input;
    if (id) {
      return one(sb().from('teaching_assignments').update(rest).eq('id', id).select().single());
    }
    return one(sb().from('teaching_assignments').insert(rest).select().single());
  },

  async adminDeleteAssignment(id) {
    const { error } = await sb().from('teaching_assignments').delete().eq('id', id);
    if (error) fail(error);
  },

  async adminSaveJournal(input) {
    const { id, ...rest } = input;
    if (id) {
      return one(sb().from('daily_journals').update(rest).eq('id', id).select().single());
    }
    return one(sb().from('daily_journals').insert(rest).select().single());
  },

  async adminDeleteJournal(id) {
    const { error } = await sb().from('daily_journals').delete().eq('id', id);
    if (error) fail(error);
  },

  async adminSaveReport(input) {
    const { id, ...rest } = input;
    return one(sb().from('subject_reports').update(rest).eq('id', id).select().single());
  },

  async adminDeleteReport(id) {
    const { error } = await sb().from('subject_reports').delete().eq('id', id);
    if (error) fail(error);
  },

  async adminSaveHomeroomReport(input) {
    const { id, ...rest } = input;
    if (id) {
      return one(sb().from('homeroom_reports').update(rest).eq('id', id).select().single());
    }
    return one(sb().from('homeroom_reports').upsert(rest, { onConflict: 'student_id,periode' }).select().single());
  },

  async adminDeleteHomeroomReport(id) {
    const { error } = await sb().from('homeroom_reports').delete().eq('id', id);
    if (error) fail(error);
  },
};
