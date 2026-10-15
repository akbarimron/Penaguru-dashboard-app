import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { JournalItem, StudentRow } from '../components/Rows';
import { subjectIcon } from '../components/SubjectCard';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  EmptyState,
  EnterView,
  Grid,
  IconButton,
  PressableScale,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  Segmented,
  StatusPill,
  TextField,
} from '../components/ui';
import { assignmentSummary, journalsOf, sortByUrgency } from '../lib/analytics';
import { formatShortDate, HARI, reportPeriods } from '../lib/dates';
import { balancedGroups, GroupDraft } from '../lib/grouping';
import { useLayout } from '../lib/layout';
import { draftReportFromJournals } from '../lib/reportGenerator';
import { SubjectTab } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { confirmDialog, toast } from '../store/useUiStore';
import { color, radius, space, SubjectPalette, subjectPalette } from '../theme/tokens';
import { GradeCategory, GradeItem, GradeSubmission, ReportStatus, Student, StudentGrade, StudentStatus, TeachingAssignment } from '../types';

export function SubjectClassScreen({ route, navigation }: any) {
  const ws = useAppStore((s) => s.ws)!;
  const [tab, setTab] = useState<SubjectTab>(route.params?.tab || 'ringkasan');
  const [editOpen, setEditOpen] = useState(false);
  const a = ws.assignments.find((x) => x.id === route.params?.assignmentId && x.teacher_id === ws.teacher.id);

  if (!a) {
    return (
      <Screen header={<ScreenHeader title="Dashboard mapel" />}>
        <EmptyState icon="lock-closed-outline" title="Dashboard tidak tersedia" message="Penugasan ini tidak ditemukan atau bukan milik Anda." action={{ label: 'Kembali ke beranda', onPress: () => navigation.navigate('Main') }} />
      </Screen>
    );
  }
  const subject = ws.subjects.find((s) => s.id === a.subject_id)!;
  const cls = ws.classes.find((c) => c.id === a.class_id)!;
  const p = subjectPalette[subject.warna];
  const summary = assignmentSummary(a, ws.students, ws.journals);
  const attention = summary.counts.Perhatian + summary.counts.Kritis;

  return (
    <Screen header={<ScreenHeader title={subject.nama} subtitle={`${cls.nama_kelas} · ${summary.rows.length} siswa`} tone={{ bg: p.bg, fg: p.fg }} />}>
      <EnterView>
        <View style={[styles.band, { backgroundColor: p.soft }]}>
          <View style={[styles.bandIcon, { backgroundColor: p.bg }]}>
            <Ionicons name={subjectIcon(subject.nama)} size={22} color={p.fg} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <AppText variant="caption" weight="bold" tone={p.ink}>
              Materi yang sedang diajarkan
            </AppText>
            <AppText variant="body" weight="bold" tone={color.ink}>
              {a.materi_aktif || 'Belum diisi'}
            </AppText>
            <AppText variant="caption" tone={color.inkSoft}>
              {a.jadwal.length ? a.jadwal.map((j) => `${HARI[j.hari]} ${j.jam_mulai}`).join(' · ') : 'Jadwal belum diisi'}
            </AppText>
          </View>
          <Button label="Ubah" size="sm" variant="ghost" fg={p.ink} onPress={() => setEditOpen(true)} />
        </View>
      </EnterView>
      <View style={styles.actions}>
        <Button label="Catat jurnal" icon="create-outline" onPress={() => navigation.navigate('Main', { screen: 'Journal', params: { assignmentId: a.id } })} />
        {attention ? (
          <View style={styles.attention}>
            <Ionicons name="alert-circle" size={16} color={color.accentInk} />
            <AppText variant="small" weight="bold" tone={color.accentInk}>
              {attention} siswa perlu perhatian
            </AppText>
          </View>
        ) : null}
      </View>
      <Segmented
        accessibilityLabel="Bagian dashboard mapel"
        value={tab}
        onChange={setTab}
        options={[
          { key: 'ringkasan', label: 'Ringkasan' },
          { key: 'siswa', label: 'Siswa' },
          { key: 'nilai', label: 'Nilai' },
          { key: 'rapor', label: 'Rapor' },
          { key: 'kelompok', label: 'Kelompok' },
        ]}
      />
      {tab === 'ringkasan' ? <SummaryTab a={a} palette={p} navigation={navigation} /> : null}
      {tab === 'siswa' ? <StudentsTab a={a} navigation={navigation} /> : null}
      {tab === 'nilai' ? <GradesTab a={a} palette={p} /> : null}
      {tab === 'rapor' ? <ReportsTab a={a} navigation={navigation} /> : null}
      {tab === 'kelompok' ? <GroupsTab a={a} palette={p} /> : null}
      <EditMateriDialog visible={editOpen} onClose={() => setEditOpen(false)} a={a} />
    </Screen>
  );
}

function SummaryTab({ a, palette, navigation }: { a: TeachingAssignment; palette: SubjectPalette; navigation: any }) {
  const ws = useAppStore((s) => s.ws)!;
  const layout = useLayout();
  const summary = assignmentSummary(a, ws.students, ws.journals);
  const flagged = sortByUrgency(summary.rows.filter((r) => r.stats.status === 'Kritis' || r.stats.status === 'Perhatian'));
  const recent = journalsOf(ws.journals, { assignmentId: a.id }).sort((x, y) => (x.created_at < y.created_at ? 1 : -1)).slice(0, 5);
  const cls = ws.classes.find((c) => c.id === a.class_id);

  const averages = (
    <EnterView>
      <Card style={{ gap: 14 }}>
        <View>
          <AppText variant="heading">Rata-rata capaian kelas</AppText>
          <AppText variant="caption" tone={color.mutedOnWhite}>
            {summary.journalCount ? `Dari ${summary.journalCount} catatan untuk ${summary.observedStudents} dari ${summary.rows.length} siswa · skala 0-100` : 'Belum ada catatan jurnal'}
          </AppText>
        </View>
        {summary.averages ? (
          (
            [
              ['Pengetahuan', summary.averages.kognitif],
              ['Keterampilan', summary.averages.keterampilan],
              ['Sikap', summary.averages.sikap],
            ] as [string, number][]
          ).map(([label, v]) => (
            <View key={label} style={{ gap: 6 }}>
              <View style={styles.between}>
                <AppText variant="small" weight="semibold" tone={color.inkSoft}>
                  {label}
                </AppText>
                <AppText variant="small" weight="extrabold">
                  {v}
                </AppText>
              </View>
              <ProgressBar value={v} tint={palette.bg === subjectPalette.yellow.bg ? '#B45309' : palette.bg} label={`${label} rata-rata ${v}`} />
            </View>
          ))
        ) : (
          <EmptyState
            icon="analytics-outline"
            title="Grafik muncul setelah ada catatan"
            message="Catat pengamatan pertama untuk kelas ini. Rata-rata dan status siswa dihitung dari catatan tersebut."
            action={{ label: 'Catat jurnal', icon: 'create-outline', onPress: () => navigation.navigate('Main', { screen: 'Journal', params: { assignmentId: a.id } }) }}
          />
        )}
        <View style={styles.counts}>
          {(['Aman', 'Perhatian', 'Kritis', 'Belum ada data'] as StudentStatus[]).map((s) => (
            <View key={s} style={styles.countItem}>
              <AppText variant="title">{summary.counts[s]}</AppText>
              <StatusPill status={s} compact />
            </View>
          ))}
        </View>
      </Card>
    </EnterView>
  );

  const flaggedList = (
    <EnterView index={1}>
      <View style={{ gap: space.sm }}>
        <SectionHeader title="Perlu perhatian" subtitle="Diurutkan dari yang paling mendesak" />
        {flagged.length === 0 ? (
          <Card style={styles.okRow}>
            <Ionicons name="checkmark-circle" size={20} color={color.success} />
            <AppText variant="small" weight="semibold" tone={color.success} style={{ flex: 1 }}>
              {summary.journalCount ? 'Tidak ada siswa berstatus Perhatian atau Kritis.' : 'Status siswa muncul setelah ada catatan jurnal.'}
            </AppText>
          </Card>
        ) : (
          flagged.map((r) => <StudentRow key={r.student.id} student={r.student} stats={r.stats} onPress={() => navigation.navigate('Student', { studentId: r.student.id, assignmentId: a.id })} />)
        )}
      </View>
    </EnterView>
  );

  const recentList = (
    <EnterView index={2}>
      <View style={{ gap: space.sm }}>
        <SectionHeader title="Jurnal terbaru" subtitle={`${cls?.nama_kelas}`} />
        {recent.length === 0 ? (
          <AppText variant="small" tone={color.muted}>
            Belum ada catatan.
          </AppText>
        ) : (
          recent.map((j) => (
            <JournalItem key={j.id} journal={j} student={ws.students.find((s) => s.id === j.student_id)} onPress={() => navigation.navigate('Student', { studentId: j.student_id, assignmentId: a.id })} />
          ))
        )}
      </View>
    </EnterView>
  );

  if (layout.twoPane) {
    return (
      <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: space.lg }}>
          {averages}
          {flaggedList}
        </View>
        <View style={{ flex: 1, gap: space.lg }}>{recentList}</View>
      </View>
    );
  }
  return (
    <>
      {averages}
      {flaggedList}
      {recentList}
    </>
  );
}

function StudentsTab({ a, navigation }: { a: TeachingAssignment; navigation: any }) {
  const ws = useAppStore((s) => s.ws)!;
  const layout = useLayout();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'Semua' | StudentStatus>('Semua');
  const rows = assignmentSummary(a, ws.students, ws.journals).rows.sort((x, y) => x.student.nama_lengkap.localeCompare(y.student.nama_lengkap));
  const shown = rows.filter(
    (r) =>
      (filter === 'Semua' || r.stats.status === filter) &&
      (!q.trim() || r.student.nama_lengkap.toLowerCase().includes(q.trim().toLowerCase()) || r.student.nisn.includes(q.trim()))
  );
  return (
    <View style={{ gap: space.md }}>
      <TextField label="Cari siswa" value={q} onChangeText={setQ} leftIcon="search" placeholder="Nama atau NISN" />
      <View style={styles.wrap}>
        {(['Semua', 'Aman', 'Perhatian', 'Kritis', 'Belum ada data'] as const).map((f) => (
          <Chip key={f} label={f === 'Semua' ? `Semua (${rows.length})` : f} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>
      {rows.length === 0 ? (
        <EmptyState icon="people-outline" title="Belum ada siswa" message="Daftar siswa diisi oleh wali kelas. Hubungi wali kelas bila ada siswa yang belum masuk." />
      ) : shown.length === 0 ? (
        <EmptyState icon="filter-outline" title="Tidak ada yang cocok" message="Ubah kata kunci atau pilih filter Semua." action={{ label: 'Tampilkan semua', onPress: () => { setFilter('Semua'); setQ(''); } }} />
      ) : (
        <Grid columns={layout.isExpanded ? 2 : 1} gap={10}>
          {shown.map((r) => (
            <StudentRow key={r.student.id} student={r.student} stats={r.stats} onPress={() => navigation.navigate('Student', { studentId: r.student.id, assignmentId: a.id })} />
          ))}
        </Grid>
      )}
    </View>
  );
}

function ReportsTab({ a, navigation }: { a: TeachingAssignment; navigation: any }) {
  const ws = useAppStore((s) => s.ws)!;
  const saveReport = useAppStore((s) => s.saveReport);
  const setReportStatus = useAppStore((s) => s.setReportStatus);
  const periods = reportPeriods();
  const [periode, setPeriode] = useState(periods[0]);
  const [busy, setBusy] = useState<'draft' | 'submit' | null>(null);
  const subject = ws.subjects.find((s) => s.id === a.subject_id)!;
  const students = ws.students.filter((s) => s.class_id === a.class_id).sort((x, y) => x.nama_lengkap.localeCompare(y.nama_lengkap));
  const reports = ws.reports.filter((r) => r.assignment_id === a.id && r.periode === periode);
  const byStudent = new Map(reports.map((r) => [r.student_id, r]));
  const count = (s: ReportStatus) => reports.filter((r) => r.status === s).length;
  const drafts = reports.filter((r) => r.status === 'Draft' || r.status === 'Revisi');
  const missingWithJournals = students.filter((s) => !byStudent.has(s.id) && ws.journals.some((j) => j.assignment_id === a.id && j.student_id === s.id));

  const draftAll = async () => {
    setBusy('draft');
    let made = 0;
    try {
      for (const st of missingWithJournals) {
        const d = draftReportFromJournals(st, subject, journalsOf(ws.journals, { assignmentId: a.id, studentId: st.id }), periode);
        if (!d) continue;
        await saveReport({ assignment_id: a.id, class_id: a.class_id, subject_id: a.subject_id, teacher_id: ws.teacher.id, student_id: st.id, periode, keunggulan: d.keunggulan, rekomendasi: d.rekomendasi, narasi: d.narasi, pesan_wali: d.pesan_wali });
        made++;
      }
      toast(`${made} draf rapor disusun dari jurnal. Periksa sebelum diajukan.`);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyusun draf.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const submitAll = async () => {
    const ok = await confirmDialog({
      title: `Ajukan ${drafts.length} rapor ke wali kelas?`,
      message: 'Setelah diajukan, rapor terkunci sampai wali kelas menyetujui atau mengembalikannya. Pastikan Anda sudah membaca setiap draf.',
      confirmLabel: 'Ajukan semua',
    });
    if (!ok) return;
    setBusy('submit');
    try {
      for (const r of drafts) await setReportStatus(r.id, 'Diajukan');
      toast(`${drafts.length} rapor diajukan ke wali kelas.`);
    } catch (e: any) {
      toast(e?.message || 'Gagal mengajukan.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.wrap}>
        {periods.map((pr) => (
          <Chip key={pr} label={pr} selected={periode === pr} onPress={() => setPeriode(pr)} />
        ))}
      </View>
      <Card style={{ gap: 12 }}>
        <View style={styles.between}>
          <AppText variant="heading">Progres rapor</AppText>
          <AppText variant="small" weight="bold">
            {count('Disetujui')}/{students.length} disetujui
          </AppText>
        </View>
        <ProgressBar value={students.length ? (count('Disetujui') / students.length) * 100 : 0} label="Rapor disetujui wali kelas" />
        <View style={styles.wrap}>
          {(['Draft', 'Diajukan', 'Revisi', 'Disetujui'] as ReportStatus[]).map((s) => (
            <View key={s} style={styles.countInline}>
              <StatusPill status={s} compact />
              <AppText variant="small" weight="bold">
                {count(s)}
              </AppText>
            </View>
          ))}
        </View>
        <View style={styles.wrap}>
          {missingWithJournals.length ? (
            <Button label={`Susun ${missingWithJournals.length} draf dari jurnal`} icon="document-text-outline" variant="subtle" size="sm" loading={busy === 'draft'} onPress={draftAll} />
          ) : null}
          {drafts.length ? <Button label={`Ajukan ${drafts.length} ke wali kelas`} icon="send-outline" size="sm" loading={busy === 'submit'} onPress={submitAll} /> : null}
        </View>
      </Card>
      {students.map((st, i) => {
        const r = byStudent.get(st.id);
        return (
          <EnterView key={st.id} index={i}>
            <StudentRow
              student={st}
              right={<StatusPill status={r ? r.status : 'Belum dibuat'} compact />}
              actionLabel={`Rapor ${r ? r.status : 'belum dibuat'}. Buka rapor`}
              onPress={() => navigation.navigate('Report', { assignmentId: a.id, studentId: st.id, periode })}
            />
          </EnterView>
        );
      })}
    </View>
  );
}

function GroupsTab({ a, palette }: { a: TeachingAssignment; palette: SubjectPalette }) {
  const ws = useAppStore((s) => s.ws)!;
  const saveGroups = useAppStore((s) => s.saveGroups);
  const layout = useLayout();
  const saved = ws.groups.filter((g) => g.assignment_id === a.id);
  const students = ws.students.filter((s) => s.class_id === a.class_id);
  const [count, setCount] = useState(Math.min(4, Math.max(2, Math.floor(students.length / 4) || 2)));
  const [draft, setDraft] = useState<GroupDraft[] | null>(null);
  const [picked, setPicked] = useState<{ g: number; m: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const name = (id: string) => ws.students.find((s) => s.id === id)?.nama_lengkap || 'Siswa';

  const generate = () => {
    setDraft(balancedGroups(students, ws.journals, a.id, count));
    setPicked(null);
  };

  // Ketuk satu anggota lalu anggota di kelompok lain untuk menukar posisi.
  const tapMember = (g: number, m: number) => {
    if (!draft) return;
    if (!picked) return setPicked({ g, m });
    if (picked.g === g) return setPicked(picked.m === m ? null : { g, m });
    const next = draft.map((x) => ({ ...x, members: [...x.members] }));
    const A = next[picked.g].members[picked.m];
    const B = next[g].members[m];
    next[picked.g].members[picked.m] = { ...B, peran: A.peran };
    next[g].members[m] = { ...A, peran: B.peran };
    next.forEach((x) => {
      const known = x.members.map((k) => k.skor).filter((v): v is number => v !== null);
      x.average = known.length ? Math.round(known.reduce((s, v) => s + v, 0) / known.length) : null;
    });
    setDraft(next);
    setPicked(null);
    toast(`${name(A.student_id).split(' ')[0]} ditukar dengan ${name(B.student_id).split(' ')[0]}.`, 'info');
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await saveGroups(a.id, draft.map((g) => ({ nama_kelompok: g.nama_kelompok, members: g.members.map(({ student_id, peran }) => ({ student_id, peran })) })));
      setDraft(null);
      toast('Kelompok disimpan.');
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan kelompok.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const groupsToShow: { title: string; average: number | null; members: { student_id: string; peran: string; skor?: number | null }[] }[] = draft
    ? draft.map((g) => ({ title: g.nama_kelompok, average: g.average, members: g.members }))
    : saved.map((g) => ({ title: g.nama_kelompok, average: null, members: g.members }));

  return (
    <View style={{ gap: space.md }}>
      <Card style={{ gap: 12 }}>
        <AppText variant="heading">Bagi kelompok seimbang</AppText>
        <AppText variant="small" tone={color.mutedOnWhite}>
          Siswa diurutkan dari skor gabungan jurnal mapel ini, lalu dibagikan bolak-balik ke tiap kelompok. Hasilnya, siswa yang kuat tidak menumpuk di satu kelompok. Siswa tanpa catatan dibagi rata.
        </AppText>
        <AppText variant="small" weight="semibold" tone={color.inkSoft}>
          Jumlah kelompok
        </AppText>
        <View style={styles.wrap}>
          {[2, 3, 4, 5, 6].filter((n) => n <= Math.max(2, students.length)).map((n) => (
            <Chip key={n} label={`${n} kelompok`} selected={count === n} onPress={() => setCount(n)} />
          ))}
        </View>
        <View style={styles.wrap}>
          <Button label={draft || saved.length ? 'Bagi ulang' : 'Bagi kelompok'} icon="git-branch-outline" variant={draft ? 'secondary' : 'primary'} onPress={generate} disabled={students.length < 2} />
          {draft ? <Button label="Simpan kelompok" icon="checkmark" onPress={save} loading={saving} /> : null}
        </View>
        {draft ? (
          <View style={styles.hint}>
            <Ionicons name="swap-horizontal" size={16} color={color.info} />
            <AppText variant="caption" tone={color.info} style={{ flex: 1 }}>
              Pratinjau belum disimpan. Ketuk satu siswa lalu siswa di kelompok lain untuk menukar.
            </AppText>
          </View>
        ) : null}
      </Card>
      {groupsToShow.length === 0 ? (
        <EmptyState icon="people-circle-outline" title="Belum ada kelompok" message="Pilih jumlah kelompok lalu tekan Bagi kelompok untuk melihat pratinjau." />
      ) : (
        <Grid columns={layout.isCompact ? 1 : 2} gap={12}>
          {groupsToShow.map((g, gi) => (
            <EnterView key={g.title} index={gi}>
              <Card style={{ gap: 8 }}>
                <View style={styles.between}>
                  <AppText variant="heading">{g.title}</AppText>
                  {g.average !== null ? (
                    <View style={[styles.avg, { backgroundColor: palette.soft }]}>
                      <AppText variant="caption" weight="bold" tone={palette.ink}>
                        rata-rata {g.average}
                      </AppText>
                    </View>
                  ) : null}
                </View>
                {g.members.map((m, mi) => {
                  const isPicked = picked?.g === gi && picked?.m === mi;
                  const row = (
                    <>
                      <AppText variant="small" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
                        {name(m.student_id)}
                      </AppText>
                      {m.peran !== 'Anggota' ? (
                        <View style={styles.role}>
                          <Ionicons name={m.peran === 'Ketua' ? 'flag-outline' : 'school-outline'} size={12} color={color.brandDeep} />
                          <AppText variant="caption" weight="bold" tone={color.brandDeep}>
                            {m.peran}
                          </AppText>
                        </View>
                      ) : null}
                      {draft ? (
                        <AppText variant="caption" tone={color.mutedOnWhite} style={{ width: 36, textAlign: 'right' }}>
                          {m.skor ?? '-'}
                        </AppText>
                      ) : null}
                    </>
                  );
                  return draft ? (
                    <PressableScale
                      key={m.student_id}
                      onPress={() => tapMember(gi, mi)}
                      scaleTo={0.98}
                      accessibilityLabel={`${name(m.student_id)}, ${m.peran}${isPicked ? ', terpilih untuk ditukar' : ''}`}
                      style={[styles.member, isPicked && { backgroundColor: color.brandSoft, borderColor: color.brand }]}
                    >
                      {row}
                    </PressableScale>
                  ) : (
                    <View key={m.student_id} style={styles.member}>
                      {row}
                    </View>
                  );
                })}
              </Card>
            </EnterView>
          ))}
        </Grid>
      )}
    </View>
  );
}

function GradesTab({ a, palette }: { a: TeachingAssignment; palette: SubjectPalette }) {
  const ws = useAppStore((s) => s.ws)!;
  const saveGradeItem = useAppStore((s) => s.saveGradeItem);
  const deleteGradeItem = useAppStore((s) => s.deleteGradeItem);
  const submitGrades = useAppStore((s) => s.submitGrades);
  const layout = useLayout();

  const periods = reportPeriods();
  const [periode, setPeriode] = useState(periods[0]);
  const [activeCriterionId, setActiveCriterionId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Dialog states
  const [criterionDialogOpen, setCriterionDialogOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<GradeItem | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [editScoreStudent, setEditScoreStudent] = useState<Student | null>(null);
  const [creatingDefaults, setCreatingDefaults] = useState(false);

  const students = ws.students.filter((s) => s.class_id === a.class_id);
  const criteria = (ws.gradeItems || []).filter((g) => g.assignment_id === a.id && g.periode === periode);
  const submission = (ws.gradeSubmissions || []).find((s) => s.assignment_id === a.id && s.periode === periode);

  // Active criterion fallback
  const activeCriterion = criteria.find((c) => c.id === activeCriterionId) || criteria[0] || null;

  // Grade map for active criterion: student_id -> number
  const activeGradesMap = React.useMemo(() => {
    const map = new Map<string, number>();
    if (!activeCriterion) return map;
    (ws.studentGrades || [])
      .filter((sg) => sg.grade_item_id === activeCriterion.id)
      .forEach((sg) => map.set(sg.student_id, sg.nilai));
    return map;
  }, [ws.studentGrades, activeCriterion]);

  // Overall student weighted average
  const studentWeightedStats = React.useMemo(() => {
    const map = new Map<string, { finalGrade: number | null; count: number; totalWeight: number }>();
    if (criteria.length === 0) return map;

    for (const st of students) {
      let weightedSum = 0;
      let totalWeight = 0;
      let count = 0;
      for (const crit of criteria) {
        const sg = (ws.studentGrades || []).find((g) => g.grade_item_id === crit.id && g.student_id === st.id);
        if (sg && typeof sg.nilai === 'number') {
          weightedSum += sg.nilai * (crit.bobot || 1);
          totalWeight += crit.bobot || 1;
          count++;
        }
      }
      map.set(st.id, {
        finalGrade: totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null,
        count,
        totalWeight,
      });
    }
    return map;
  }, [students, criteria, ws.studentGrades]);

  // Statistics for active criterion
  const activeStats = React.useMemo(() => {
    let total = 0;
    let graded = 0;
    let tuntas = 0;
    students.forEach((st) => {
      const val = activeGradesMap.get(st.id);
      if (val !== undefined) {
        total += val;
        graded++;
        if (val >= 75) tuntas++;
      }
    });
    return {
      graded,
      totalStudents: students.length,
      average: graded > 0 ? Math.round(total / graded) : 0,
      tuntas,
      belumTuntas: graded - tuntas,
    };
  }, [students, activeGradesMap]);

  const createDefaultCriteria = async () => {
    setCreatingDefaults(true);
    try {
      const defaults: Array<{ judul: string; kategori: GradeCategory; bobot: number; deskripsi: string }> = [
        { judul: 'Ulangan 1', kategori: 'Ulangan Harian', bobot: 2, deskripsi: 'Penilaian harian capaian pembelajaran pertama' },
        { judul: 'Tugas Individu 1', kategori: 'Tugas Individu', bobot: 1, deskripsi: 'Latihan mandiri pemahaman konsep' },
        { judul: 'Tugas Kelompok', kategori: 'Tugas Kelompok', bobot: 2, deskripsi: 'Proyek studi kasus kolaboratif' },
        { judul: 'Ulangan 2', kategori: 'Ulangan Harian', bobot: 2, deskripsi: 'Penilaian harian capaian pembelajaran kedua' },
      ];
      for (const d of defaults) {
        await saveGradeItem({
          assignment_id: a.id,
          periode,
          judul: d.judul,
          kategori: d.kategori,
          bobot: d.bobot,
          deskripsi: d.deskripsi,
          tanggal: new Date().toISOString().slice(0, 10),
        });
      }
      toast('4 kriteria penilaian default berhasil dibuat.');
    } finally {
      setCreatingDefaults(false);
    }
  };

  const handleDeleteCriterion = async (crit: GradeItem) => {
    const ok = await confirmDialog({
      title: `Hapus kriteria "${crit.judul}"?`,
      message: 'Semua nilai siswa yang tersimpan untuk kriteria ini akan ikut terhapus.',
      confirmLabel: 'Hapus Kriteria',
      destructive: true,
    });
    if (!ok) return;
    await deleteGradeItem(crit.id);
    if (activeCriterionId === crit.id) setActiveCriterionId(null);
    toast(`Kriteria ${crit.judul} dihapus.`);
  };

  const filteredStudents = React.useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) => s.nama_lengkap.toLowerCase().includes(q) || s.nisn.toLowerCase().includes(q)
    );
  }, [students, search]);

  const submissionStatus = submission ? submission.status : 'Draft';

  return (
    <View style={{ gap: space.md }}>
      {/* Semester Chips */}
      <View style={styles.wrap}>
        {periods.map((pr) => (
          <Chip key={pr} label={pr} selected={periode === pr} onPress={() => setPeriode(pr)} />
        ))}
      </View>

      {/* Submission Status & Action Banner */}
      <Card style={{ gap: 12 }}>
        <View style={styles.between}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <AppText variant="heading">Status Pengajuan Semester</AppText>
            <StatusPill status={submissionStatus} compact />
          </View>
          <Button
            label={submissionStatus === 'Diajukan' ? 'Perbarui Pengajuan' : submissionStatus === 'Disetujui' ? 'Sudah Disetujui' : 'Ajukan ke Wali Kelas'}
            icon="send-outline"
            size="sm"
            variant={submissionStatus === 'Disetujui' ? 'ghost' : 'primary'}
            disabled={submissionStatus === 'Disetujui'}
            onPress={() => setSubmitDialogOpen(true)}
          />
        </View>

        {submission?.submitted_at ? (
          <View style={[styles.hint, { backgroundColor: submissionStatus === 'Disetujui' ? color.successSoft : color.infoSoft }]}>
            <Ionicons
              name={submissionStatus === 'Disetujui' ? 'checkmark-circle' : 'time-outline'}
              size={18}
              color={submissionStatus === 'Disetujui' ? color.success : color.info}
            />
            <View style={{ flex: 1 }}>
              <AppText variant="caption" weight="semibold" tone={submissionStatus === 'Disetujui' ? color.success : color.info}>
                {submissionStatus === 'Disetujui'
                  ? `Nilai semester telah diverifikasi dan disetujui oleh wali kelas (${formatShortDate(submission.reviewed_at || submission.submitted_at)}).`
                  : `Diajukan ke wali kelas pada ${formatShortDate(submission.submitted_at)}. Menunggu verifikasi.`}
              </AppText>
              {submission.catatan ? (
                <AppText variant="caption" tone={color.inkSoft} style={{ marginTop: 2 }}>
                  Catatan pengantar: {submission.catatan}
                </AppText>
              ) : null}
            </View>
          </View>
        ) : (
          <AppText variant="caption" tone={color.muted}>
            Input nilai harian dan tugas siswa, lalu ajukan ke wali kelas untuk dirangkum ke buku rapor semester.
          </AppText>
        )}
      </Card>

      {/* Criteria Selection Header & Management */}
      <Card style={{ gap: 14 }}>
        <View style={styles.between}>
          <View>
            <AppText variant="heading">Kriteria Penilaian ({criteria.length})</AppText>
            <AppText variant="caption" tone={color.muted}>
              Kustomisasi komponen nilai untuk kelas ini
            </AppText>
          </View>
          <Button
            label="Tambah Kriteria"
            icon="add-outline"
            size="sm"
            variant="subtle"
            onPress={() => {
              setEditingCriterion(null);
              setCriterionDialogOpen(true);
            }}
          />
        </View>

        {criteria.length === 0 ? (
          <View style={{ paddingVertical: 18, alignItems: 'center', gap: 10 }}>
            <Ionicons name="clipboard-outline" size={38} color={color.muted} />
            <AppText variant="body" weight="semibold" style={{ textAlign: 'center' }}>
              Belum ada kriteria penilaian untuk semester ini
            </AppText>
            <AppText variant="caption" tone={color.muted} style={{ textAlign: 'center', maxWidth: 360 }}>
              Anda dapat membuat kriteria sendiri (misal: Ulangan 1, Ulangan 2, Tugas Kelompok, dll.) atau gunakan kriteria default di bawah:
            </AppText>
            <Button
              label="Buat 4 Kriteria Cepat"
              icon="sparkles-outline"
              size="sm"
              loading={creatingDefaults}
              onPress={createDefaultCriteria}
            />
          </View>
        ) : (
          <>
            {/* Criteria Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
              {criteria.map((crit) => {
                const isSelected = activeCriterion?.id === crit.id;
                return (
                  <Chip
                    key={crit.id}
                    label={`${crit.judul} (B: ${crit.bobot}x)`}
                    selected={isSelected}
                    onPress={() => setActiveCriterionId(crit.id)}
                  />
                );
              })}
            </ScrollView>

            {/* Active Criterion Detail Box */}
            {activeCriterion ? (
              <View style={[styles.criterionBox, { borderLeftColor: palette.fg }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <AppText variant="title" weight="bold">
                      {activeCriterion.judul}
                    </AppText>
                    <View style={styles.catPill}>
                      <AppText variant="caption" weight="bold" tone={color.brandDeep}>
                        {activeCriterion.kategori}
                      </AppText>
                    </View>
                    <View style={styles.weightPill}>
                      <AppText variant="caption" weight="bold" tone={color.ink}>
                        Bobot: {activeCriterion.bobot}x
                      </AppText>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Button
                      label="Tempel Excel"
                      icon="clipboard-outline"
                      size="sm"
                      variant="ghost"
                      onPress={() => setBulkDialogOpen(true)}
                    />
                    <Button
                      label="Ubah"
                      icon="create-outline"
                      size="sm"
                      variant="ghost"
                      onPress={() => {
                        setEditingCriterion(activeCriterion);
                        setCriterionDialogOpen(true);
                      }}
                    />
                    <IconButton
                      icon="trash-outline"
                      label="Hapus kriteria"
                      iconColor={color.danger}
                      variant="ghost"
                      onPress={() => handleDeleteCriterion(activeCriterion)}
                    />
                  </View>
                </View>

                {activeCriterion.deskripsi ? (
                  <View style={styles.descRow}>
                    <Ionicons name="information-circle-outline" size={16} color={color.muted} />
                    <AppText variant="caption" tone={color.inkSoft} style={{ flex: 1 }}>
                      {activeCriterion.deskripsi}
                    </AppText>
                  </View>
                ) : null}

                {/* Metric Summary for this criterion */}
                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <AppText variant="caption" tone={color.muted}>RATA-RATA KELAS</AppText>
                    <AppText variant="title" weight="bold" tone={activeStats.average >= 75 ? color.success : color.accentInk}>
                      {activeStats.average || '-'}
                    </AppText>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <AppText variant="caption" tone={color.muted}>TERISI</AppText>
                    <AppText variant="title" weight="bold">
                      {activeStats.graded}/{activeStats.totalStudents}
                    </AppText>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <AppText variant="caption" tone={color.muted}>TUNTAS (≥75)</AppText>
                    <AppText variant="title" weight="bold" tone={color.success}>
                      {activeStats.tuntas} siswa
                    </AppText>
                  </View>
                </View>
              </View>
            ) : null}
          </>
        )}
      </Card>

      {/* Student Grades Roster */}
      {activeCriterion ? (
        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Cari Siswa"
                placeholder="Cari nama atau NISN siswa..."
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <Button
              label="Tempel Nilai"
              icon="clipboard-outline"
              size="sm"
              variant="subtle"
              onPress={() => setBulkDialogOpen(true)}
            />
          </View>

          <Grid columns={layout.isExpanded ? 2 : 1}>
            {filteredStudents.map((st, i) => {
              const score = activeGradesMap.get(st.id);
              const hasScore = score !== undefined;
              const isTuntas = hasScore && score >= 75;
              const weighted = studentWeightedStats.get(st.id);

              return (
                <EnterView key={st.id} index={i}>
                  <PressableScale
                    onPress={() => setEditScoreStudent(st)}
                    scaleTo={0.99}
                    accessibilityLabel={`Ubah nilai ${st.nama_lengkap}. Nilai sekarang: ${hasScore ? score : 'Belum diisi'}`}
                  >
                    <Card style={[styles.studentCard, !hasScore && { borderStyle: 'dashed' }]}>
                      <Avatar name={st.nama_lengkap} size={38} />
                      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                        <AppText variant="body" weight="bold" numberOfLines={1}>
                          {st.nama_lengkap}
                        </AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <AppText variant="caption" tone={color.muted}>
                            NISN {st.nisn}
                          </AppText>
                          {weighted?.finalGrade !== null && (
                            <AppText variant="caption" weight="semibold" tone={color.brandDeep}>
                              · Rata-rata akhir: {weighted?.finalGrade}
                            </AppText>
                          )}
                        </View>
                      </View>

                      {/* Interactive Score Pill */}
                      <View style={[styles.scoreBadge, hasScore ? (isTuntas ? styles.scoreTuntas : styles.scoreBelum) : styles.scoreEmpty]}>
                        <AppText
                          variant="title"
                          weight="bold"
                          tone={hasScore ? (isTuntas ? color.success : color.accentInk) : color.muted}
                        >
                          {hasScore ? score : '-'}
                        </AppText>
                        <AppText variant="caption" tone={hasScore ? (isTuntas ? color.success : color.accentInk) : color.muted}>
                          {hasScore ? (isTuntas ? 'Tuntas' : 'Perlu') : 'Isi'}
                        </AppText>
                      </View>
                    </Card>
                  </PressableScale>
                </EnterView>
              );
            })}
          </Grid>
        </View>
      ) : null}

      {/* Dialogs */}
      <CriterionDialog
        visible={criterionDialogOpen}
        onClose={() => {
          setCriterionDialogOpen(false);
          setEditingCriterion(null);
        }}
        initialData={editingCriterion}
        periode={periode}
        assignmentId={a.id}
        onSaved={(item) => {
          setActiveCriterionId(item.id);
        }}
      />

      {activeCriterion ? (
        <BulkPasteDialog
          visible={bulkDialogOpen}
          onClose={() => setBulkDialogOpen(false)}
          criterion={activeCriterion}
          students={students}
        />
      ) : null}

      {editScoreStudent && activeCriterion ? (
        <SingleGradeDialog
          visible={!!editScoreStudent}
          onClose={() => setEditScoreStudent(null)}
          student={editScoreStudent}
          criterion={activeCriterion}
          initialValue={activeGradesMap.get(editScoreStudent.id)}
        />
      ) : null}

      <SubmitGradesDialog
        visible={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        assignment={a}
        periode={periode}
        existingCatatan={submission?.catatan || ''}
        criteriaCount={criteria.length}
        studentsCount={students.length}
      />
    </View>
  );
}

function CriterionDialog({
  visible,
  onClose,
  initialData,
  periode,
  assignmentId,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  initialData: GradeItem | null;
  periode: string;
  assignmentId: string;
  onSaved: (item: GradeItem) => void;
}) {
  const saveGradeItem = useAppStore((s) => s.saveGradeItem);
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<GradeCategory>('Ulangan Harian');
  const [bobot, setBobot] = useState('1');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);

  const categories: GradeCategory[] = [
    'Ulangan Harian',
    'Tugas Individu',
    'Tugas Kelompok',
    'Praktikum',
    'Proyek',
    'Lainnya',
  ];

  const quickSuggestions = [
    'Ulangan 1',
    'Ulangan 2',
    'Ulangan 3',
    'Tugas Individu 1',
    'Tugas Individu 2',
    'Tugas Kelompok',
    'Praktikum',
    'Proyek',
  ];

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setJudul(initialData.judul);
        setKategori(initialData.kategori);
        setBobot(String(initialData.bobot || 1));
        setDeskripsi(initialData.deskripsi || '');
      } else {
        setJudul('');
        setKategori('Ulangan Harian');
        setBobot('1');
        setDeskripsi('');
      }
    }
  }, [visible, initialData]);

  const handlePickSuggestion = (sug: string) => {
    setJudul(sug);
    if (sug.startsWith('Ulangan')) setKategori('Ulangan Harian');
    else if (sug.includes('Kelompok')) setKategori('Tugas Kelompok');
    else if (sug.includes('Praktikum')) setKategori('Praktikum');
    else if (sug.includes('Proyek')) setKategori('Proyek');
    else setKategori('Tugas Individu');
  };

  const save = async () => {
    if (!judul.trim()) {
      toast('Judul kriteria harus diisi.', 'error');
      return;
    }
    const b = parseInt(bobot, 10);
    if (isNaN(b) || b < 1 || b > 20) {
      toast('Bobot harus berupa angka 1 - 20.', 'error');
      return;
    }
    setLoading(true);
    try {
      const saved = await saveGradeItem({
        id: initialData?.id,
        assignment_id: assignmentId,
        periode,
        judul: judul.trim(),
        kategori,
        bobot: b,
        deskripsi: deskripsi.trim(),
        tanggal: initialData?.tanggal || new Date().toISOString().slice(0, 10),
      });
      toast(`Kriteria ${saved.judul} disimpan.`);
      onSaved(saved);
      onClose();
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan kriteria.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={initialData ? 'Ubah Kriteria Penilaian' : 'Tambah Kriteria Penilaian'}
      description="Tentukan nama tugas/ulangan, kategori, bobot perhitungan, dan deskripsi materi yang dinilai."
      footer={
        <>
          <Button label="Batal" variant="ghost" onPress={onClose} />
          <Button label="Simpan Kriteria" icon="checkmark" onPress={save} loading={loading} />
        </>
      }
    >
      <View style={{ gap: space.sm }}>
        <TextField
          label="Judul Kriteria"
          placeholder="Contoh: Ulangan 1, Tugas Individu 1, Tugas Kelompok"
          value={judul}
          onChangeText={setJudul}
          autoFocus
        />

        {/* Quick Suggestion Chips */}
        <View style={{ gap: 4 }}>
          <AppText variant="caption" tone={color.muted}>
            Saran Cepat:
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {quickSuggestions.map((sug) => (
              <Chip
                key={sug}
                label={sug}
                selected={judul === sug}
                onPress={() => handlePickSuggestion(sug)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Category Chips */}
        <View style={{ gap: 6 }}>
          <AppText variant="caption" weight="bold">
            Kategori
          </AppText>
          <View style={styles.wrap}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                selected={kategori === cat}
                onPress={() => setKategori(cat)}
              />
            ))}
          </View>
        </View>

        <TextField
          label="Bobot Nilai"
          placeholder="1 (default) atau 2 untuk ulangan berbobot ganda"
          value={bobot}
          onChangeText={setBobot}
          keyboardType="numeric"
        />

        <TextField
          label="Deskripsi Penilaian / Topik Materi"
          placeholder="Contoh: Materi Logika Gerbang & Aljabar Boolean. Meliputi studi kasus penyederhanaan gerbang."
          value={deskripsi}
          onChangeText={setDeskripsi}
          multiline
          numberOfLines={3}
        />
      </View>
    </Dialog>
  );
}

function BulkPasteDialog({
  visible,
  onClose,
  criterion,
  students,
}: {
  visible: boolean;
  onClose: () => void;
  criterion: GradeItem;
  students: Student[];
}) {
  const saveStudentGrades = useAppStore((s) => s.saveStudentGrades);
  const [rawText, setRawText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setRawText('');
  }, [visible]);

  // Parse lines: matches each line with student
  const parsedRows = React.useMemo(() => {
    if (!rawText.trim()) return [];
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    return lines.map((line, idx) => {
      const match = line.match(/\b(100|[1-9]?[0-9])\b/);
      const student = students[idx] || null;
      const score = match ? parseInt(match[0], 10) : null;
      return {
        line,
        student,
        score,
        isValid: score !== null && student !== null,
      };
    });
  }, [rawText, students]);

  const validCount = parsedRows.filter((r) => r.isValid).length;

  const handleApply = async () => {
    const validGrades = parsedRows
      .filter((r) => r.isValid && r.student && r.score !== null)
      .map((r) => ({ student_id: r.student!.id, nilai: r.score! }));

    if (validGrades.length === 0) {
      toast('Tidak ada nilai yang valid untuk diterapkan.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveStudentGrades(criterion.id, validGrades);
      toast(`${validGrades.length} nilai berhasil diterapkan ke ${criterion.judul}.`);
      onClose();
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan nilai.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="Tempel Nilai dari Excel / Spreadsheet"
      description={`Salin 1 kolom nilai dari Excel/Sheets sesuai urutan siswa (${students.length} siswa) lalu tempel di bawah.`}
      footer={
        <>
          <Button label="Batal" variant="ghost" onPress={onClose} />
          <Button
            label={`Terapkan ${validCount} Nilai`}
            icon="checkmark"
            disabled={validCount === 0}
            loading={saving}
            onPress={handleApply}
          />
        </>
      }
    >
      <View style={{ gap: space.sm }}>
        <TextField
          label="Teks Salinan dari Spreadsheet"
          placeholder={"Contoh:\n85\n90\n78\n92\n88"}
          value={rawText}
          onChangeText={setRawText}
          multiline
          numberOfLines={6}
        />

        {parsedRows.length > 0 ? (
          <View style={{ gap: 6 }}>
            <AppText variant="caption" weight="bold">
              Pratinjau Hasil Pasangan ({validCount} cocok dari {students.length} siswa):
            </AppText>
            <View style={[styles.previewBox, { maxHeight: 180 }]}>
              <ScrollView nestedScrollEnabled>
                {parsedRows.slice(0, students.length).map((row, idx) => (
                  <View key={idx} style={styles.previewRow}>
                    <AppText variant="caption" weight="bold" tone={color.muted} style={{ width: 22 }}>
                      {idx + 1}.
                    </AppText>
                    <AppText variant="caption" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
                      {row.student ? row.student.nama_lengkap : '(Siswa berlebih)'}
                    </AppText>
                    {row.score !== null ? (
                      <View style={[styles.miniScore, { backgroundColor: row.score >= 75 ? color.successSoft : color.accentSoft }]}>
                        <AppText variant="caption" weight="bold" tone={row.score >= 75 ? color.success : color.accentInk}>
                          {row.score}
                        </AppText>
                      </View>
                    ) : (
                      <AppText variant="caption" tone={color.danger}>
                        Format salah
                      </AppText>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        ) : null}
      </View>
    </Dialog>
  );
}

function SingleGradeDialog({
  visible,
  onClose,
  student,
  criterion,
  initialValue,
}: {
  visible: boolean;
  onClose: () => void;
  student: Student;
  criterion: GradeItem;
  initialValue?: number;
}) {
  const saveStudentGrades = useAppStore((s) => s.saveStudentGrades);
  const [val, setVal] = useState(initialValue !== undefined ? String(initialValue) : '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setVal(initialValue !== undefined ? String(initialValue) : '');
    }
  }, [visible, initialValue]);

  const presets = [100, 95, 90, 85, 80, 75, 70, 60, 0];

  const handleSave = async () => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0 || num > 100) {
      toast('Nilai harus berupa angka antara 0 dan 100.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveStudentGrades(criterion.id, [{ student_id: student.id, nilai: num }]);
      toast(`Nilai ${student.nama_lengkap.split(' ')[0]} disimpan: ${num}.`);
      onClose();
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan nilai.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={`Input Nilai: ${criterion.judul}`}
      description={`Siswa: ${student.nama_lengkap} (NISN: ${student.nisn})`}
      footer={
        <>
          <Button label="Batal" variant="ghost" onPress={onClose} />
          <Button label="Simpan Nilai" icon="checkmark" onPress={handleSave} loading={saving} />
        </>
      }
    >
      <View style={{ gap: space.md }}>
        <TextField
          label="Nilai Siswa (0 - 100)"
          value={val}
          onChangeText={setVal}
          keyboardType="numeric"
          autoFocus
          onSubmitEditing={handleSave}
        />

        <View style={{ gap: 6 }}>
          <AppText variant="caption" tone={color.muted}>
            Pilihan Nilai Cepat:
          </AppText>
          <View style={styles.wrap}>
            {presets.map((p) => (
              <Chip
                key={p}
                label={String(p)}
                selected={val === String(p)}
                onPress={() => setVal(String(p))}
              />
            ))}
          </View>
        </View>
      </View>
    </Dialog>
  );
}

function SubmitGradesDialog({
  visible,
  onClose,
  assignment,
  periode,
  existingCatatan,
  criteriaCount,
  studentsCount,
}: {
  visible: boolean;
  onClose: () => void;
  assignment: TeachingAssignment;
  periode: string;
  existingCatatan: string;
  criteriaCount: number;
  studentsCount: number;
}) {
  const submitGrades = useAppStore((s) => s.submitGrades);
  const [catatan, setCatatan] = useState(existingCatatan);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) setCatatan(existingCatatan);
  }, [visible, existingCatatan]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitGrades(assignment.id, periode, catatan.trim());
      toast('Nilai semester berhasil diajukan ke wali kelas.');
      onClose();
    } catch (e: any) {
      toast(e?.message || 'Gagal mengajukan nilai.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="Ajukan Nilai ke Wali Kelas"
      description={`Pengajuan nilai ${periode} untuk ${studentsCount} siswa dan ${criteriaCount} kriteria penilaian.`}
      footer={
        <>
          <Button label="Batal" variant="ghost" onPress={onClose} />
          <Button
            label="Kirim Pengajuan"
            icon="send"
            onPress={handleSubmit}
            loading={submitting}
          />
        </>
      }
    >
      <View style={{ gap: space.sm }}>
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={18} color={color.info} />
          <AppText variant="caption" tone={color.info} style={{ flex: 1 }}>
            Wali kelas akan dapat melihat rincian seluruh kriteria nilai, deskripsi tugas, dan rata-rata siswa sebelum mengesahkan rapor.
          </AppText>
        </View>

        <TextField
          label="Catatan Pengantar untuk Wali Kelas (Opsional)"
          placeholder="Contoh: Nilai ulangan harian dan tugas kelompok telah lengkap. Ada 2 siswa mengikuti remedial ulangan 1."
          value={catatan}
          onChangeText={setCatatan}
          multiline
          numberOfLines={3}
        />
      </View>
    </Dialog>
  );
}

function EditMateriDialog({ visible, onClose, a }: { visible: boolean; onClose: () => void; a: TeachingAssignment }) {
  const updateAssignment = useAppStore((s) => s.updateAssignment);
  const [materi, setMateri] = useState(a.materi_aktif);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (visible) setMateri(a.materi_aktif);
  }, [visible, a.materi_aktif]);
  const save = async () => {
    setLoading(true);
    try {
      await updateAssignment(a.id, { materi_aktif: materi.trim() });
      toast('Materi diperbarui.');
      onClose();
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan.', 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="Ubah materi"
      description="Materi ini dipakai sebagai isian awal setiap jurnal baru."
      footer={
        <>
          <Button label="Batal" variant="ghost" onPress={onClose} />
          <Button label="Simpan" icon="checkmark" onPress={save} loading={loading} />
        </>
      }
    >
      <TextField label="Materi yang sedang diajarkan" value={materi} onChangeText={setMateri} autoFocus returnKeyType="done" onSubmitEditing={save} />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  band: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg },
  bandIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  attention: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.md, backgroundColor: color.accentSoft },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  counts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, borderTopColor: color.line, paddingTop: 12 },
  countItem: { flexGrow: 1, minWidth: 70, gap: 4 },
  countInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: radius.md, backgroundColor: color.infoSoft },
  avg: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  member: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: 'transparent', backgroundColor: color.surfaceMuted },
  role: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: color.brandSoft },
  criterionBox: { padding: 14, borderRadius: radius.md, backgroundColor: color.surfaceMuted, borderLeftWidth: 4, gap: 10 },
  catPill: { backgroundColor: color.brandSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  weightPill: { backgroundColor: color.line, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  descRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 },
  metricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: color.surface, padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: color.line },
  metricItem: { alignItems: 'center', gap: 2 },
  metricDivider: { width: 1, height: 26, backgroundColor: color.line },
  studentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  scoreBadge: { alignItems: 'center', justifyContent: 'center', minWidth: 54, height: 46, borderRadius: radius.md, paddingHorizontal: 8 },
  scoreTuntas: { backgroundColor: color.successSoft },
  scoreBelum: { backgroundColor: color.accentSoft },
  scoreEmpty: { backgroundColor: color.surfaceMuted, borderWidth: 1, borderColor: color.lineStrong },
  previewBox: { borderWidth: 1, borderColor: color.line, borderRadius: radius.md, padding: 8, backgroundColor: color.surfaceMuted },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: color.line },
  miniScore: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
});
