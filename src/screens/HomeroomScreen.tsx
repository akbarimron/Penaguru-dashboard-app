import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
  PressableScale,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  Segmented,
  StatusPill,
  TextField,
} from '../components/ui';
import { crossSubjectStats, journalsOf, sortByUrgency, statsFor } from '../lib/analytics';
import { formatShortDate, relativeDay, reportPeriods } from '../lib/dates';
import { useLayout } from '../lib/layout';
import { HomeroomTab } from '../navigation/types';
import { teacherName } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { confirmDialog, toast } from '../store/useUiStore';
import { color, radius, space, subjectPalette } from '../theme/tokens';
import { ClassRoom, ReportStatus, TeachingAssignment } from '../types';

export function HomeroomScreen({ route, navigation }: any) {
  const ws = useAppStore((s) => s.ws)!;
  const [tab, setTab] = useState<HomeroomTab>(route.params?.tab || 'ringkasan');
  const periods = reportPeriods();
  const [periode, setPeriode] = useState(periods[0]);
  const cls = ws.classes.find((c) => c.id === route.params?.classId && c.homeroom_teacher_id === ws.teacher.id);

  if (!cls) {
    return (
      <Screen header={<ScreenHeader title="Dashboard wali kelas" />}>
        <EmptyState icon="lock-closed-outline" title="Bukan kelas perwalian Anda" message="Dashboard ini hanya untuk wali kelas yang bersangkutan." action={{ label: 'Kembali ke beranda', onPress: () => navigation.navigate('Main') }} />
      </Screen>
    );
  }

  const students = ws.students.filter((s) => s.class_id === cls.id);
  const waiting = ws.reports.filter((r) => r.class_id === cls.id && r.status === 'Diajukan' && r.periode === periode).length;

  return (
    <Screen header={<ScreenHeader title={`Wali kelas ${cls.nama_kelas}`} subtitle={`${cls.tahun_ajaran} · semester ${cls.semester}`} tone={{ bg: color.brand, fg: '#FFFFFF' }} />}>
      <View style={styles.periodRow}>
        <AppText variant="small" weight="semibold" tone={color.muted}>
          Periode rapor
        </AppText>
        {periods.map((p) => (
          <Chip key={p} label={p} selected={periode === p} onPress={() => setPeriode(p)} />
        ))}
      </View>
      <Segmented
        accessibilityLabel="Bagian dashboard wali kelas"
        value={tab}
        onChange={setTab}
        options={[
          { key: 'ringkasan', label: 'Ringkasan' },
          { key: 'tinjauan', label: 'Tinjauan', badge: waiting || undefined },
          { key: 'siswa', label: 'Siswa' },
          { key: 'mapel', label: 'Mapel' },
        ]}
      />
      {tab === 'ringkasan' ? <OverviewTab cls={cls} periode={periode} navigation={navigation} goReview={() => setTab('tinjauan')} /> : null}
      {tab === 'tinjauan' ? <ReviewTab cls={cls} periode={periode} navigation={navigation} /> : null}
      {tab === 'siswa' ? <RosterTab cls={cls} navigation={navigation} /> : null}
      {tab === 'mapel' ? <SubjectsTab cls={cls} navigation={navigation} /> : null}
    </Screen>
  );
}

function OverviewTab({ cls, periode, navigation, goReview }: { cls: ClassRoom; periode: string; navigation: any; goReview: () => void }) {
  const ws = useAppStore((s) => s.ws)!;
  const layout = useLayout();
  const students = ws.students.filter((s) => s.class_id === cls.id);
  const assignments = ws.assignments.filter((a) => a.class_id === cls.id);
  const reports = ws.reports.filter((r) => r.class_id === cls.id && r.periode === periode);
  const waiting = reports.filter((r) => r.status === 'Diajukan').length;
  const notes = ws.homeroomReports.filter((r) => r.class_id === cls.id && r.periode === periode && r.status === 'Final').length;

  const flagged = sortByUrgency(
    students
      .map((s) => {
        const c = crossSubjectStats(s, ws.assignments, ws.subjects, ws.journals);
        return { student: s, perSubject: c.perSubject, stats: { ...statsFor([]), status: c.overall } };
      })
      .filter((r) => r.stats.status === 'Kritis' || r.stats.status === 'Perhatian')
  );

  const progress = (
    <EnterView>
      <Card style={{ gap: 14 }}>
        <View>
          <AppText variant="heading">Rapor mapel per guru</AppText>
          <AppText variant="caption" tone={color.mutedOnWhite}>
            {periode} · target {students.length} rapor per mapel
          </AppText>
        </View>
        {waiting ? (
          <PressableScale onPress={goReview} style={styles.waitingBox} accessibilityLabel={`${waiting} rapor menunggu tinjauan. Buka tab Tinjauan`}>
            <Ionicons name="time-outline" size={20} color={color.info} />
            <AppText variant="small" weight="bold" tone={color.info} style={{ flex: 1 }}>
              {waiting} rapor menunggu tinjauan Anda
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={color.info} />
          </PressableScale>
        ) : null}
        {assignments.length === 0 ? (
          <AppText variant="small" tone={color.mutedOnWhite}>
            Belum ada guru mapel yang terdaftar mengajar di kelas ini.
          </AppText>
        ) : (
          assignments.map((a) => {
            const sub = ws.subjects.find((s) => s.id === a.subject_id)!;
            const rs = reports.filter((r) => r.assignment_id === a.id);
            const n = (s: ReportStatus) => rs.filter((r) => r.status === s).length;
            const p = subjectPalette[sub.warna];
            return (
              <View key={a.id} style={{ gap: 6 }}>
                <View style={styles.between}>
                  <View style={styles.subjectLine}>
                    <View style={[styles.dot, { backgroundColor: p.bg }]} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <AppText variant="small" weight="bold" numberOfLines={1}>
                        {sub.nama}
                      </AppText>
                      <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={1}>
                        {teacherName(ws, a.teacher_id)}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="small" weight="bold">
                    {n('Disetujui')}/{students.length}
                  </AppText>
                </View>
                <ProgressBar value={students.length ? (n('Disetujui') / students.length) * 100 : 0} label={`${sub.nama}: ${n('Disetujui')} dari ${students.length} disetujui`} />
                <AppText variant="caption" tone={color.mutedOnWhite}>
                  {n('Diajukan')} menunggu · {n('Revisi')} revisi · {n('Draft')} draf · {students.length - rs.length} belum dibuat
                </AppText>
              </View>
            );
          })
        )}
        <View style={[styles.between, { borderTopWidth: 1, borderTopColor: color.line, paddingTop: 12 }]}>
          <AppText variant="small" weight="semibold" tone={color.inkSoft}>
            Catatan wali kelas final
          </AppText>
          <AppText variant="small" weight="bold">
            {notes}/{students.length}
          </AppText>
        </View>
      </Card>
    </EnterView>
  );

  const flaggedList = (
    <EnterView index={1}>
      <View style={{ gap: space.sm }}>
        <SectionHeader title="Perlu perhatian lintas mapel" subtitle="Status terburuk dari semua mapel" />
        {flagged.length === 0 ? (
          <Card style={styles.okRow}>
            <Ionicons name="checkmark-circle" size={20} color={color.success} />
            <AppText variant="small" weight="semibold" tone={color.success} style={{ flex: 1 }}>
              Tidak ada siswa berstatus Perhatian atau Kritis di mapel mana pun.
            </AppText>
          </Card>
        ) : (
          flagged.map((r) => {
            const bad = r.perSubject.filter((p) => p.stats.status === 'Kritis' || p.stats.status === 'Perhatian');
            return (
              <PressableScale
                key={r.student.id}
                onPress={() => navigation.navigate('Student', { studentId: r.student.id })}
                scaleTo={0.985}
                style={styles.flagRow}
                accessibilityLabel={`${r.student.nama_lengkap}, ${r.stats.status} di ${bad.map((b) => b.subject.nama).join(', ')}`}
              >
                <Avatar name={r.student.nama_lengkap} size={40} />
                <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
                  <AppText variant="body" weight="bold" numberOfLines={1}>
                    {r.student.nama_lengkap}
                  </AppText>
                  <View style={styles.wrap}>
                    {bad.map((b) => (
                      <View key={b.assignment.id} style={[styles.subjectTag, { backgroundColor: subjectPalette[b.subject.warna].soft }]}>
                        <Ionicons name={b.stats.status === 'Kritis' ? 'warning' : 'alert-circle'} size={12} color={subjectPalette[b.subject.warna].ink} />
                        <AppText variant="caption" weight="bold" tone={subjectPalette[b.subject.warna].ink}>
                          {b.subject.nama}: {b.stats.status}
                        </AppText>
                      </View>
                    ))}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={color.mutedOnWhite} />
              </PressableScale>
            );
          })
        )}
      </View>
    </EnterView>
  );

  if (layout.twoPane) {
    return (
      <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>{progress}</View>
        <View style={{ flex: 1 }}>{flaggedList}</View>
      </View>
    );
  }
  return (
    <>
      {progress}
      {flaggedList}
    </>
  );
}

function ReviewTab({ cls, periode, navigation }: { cls: ClassRoom; periode: string; navigation: any }) {
  const ws = useAppStore((s) => s.ws)!;
  const reviewReport = useAppStore((s) => s.reviewReport);
  const [busy, setBusy] = useState<string | null>(null);
  const reports = ws.reports.filter((r) => r.class_id === cls.id && r.periode === periode);
  const waiting = reports.filter((r) => r.status === 'Diajukan');
  const returned = reports.filter((r) => r.status === 'Revisi');
  const bySubject = useMemo(() => {
    const m = new Map<string, typeof waiting>();
    waiting.forEach((r) => m.set(r.subject_id, [...(m.get(r.subject_id) || []), r]));
    return [...m.entries()];
  }, [waiting]);
  const studentName = (id: string) => ws.students.find((s) => s.id === id)?.nama_lengkap || 'Siswa';

  const approveAll = async (subjectId: string, list: typeof waiting) => {
    const sub = ws.subjects.find((s) => s.id === subjectId);
    const ok = await confirmDialog({
      title: `Setujui ${list.length} rapor ${sub?.nama}?`,
      message: 'Gunakan ini hanya bila Anda sudah membaca setiap rapor. Rapor yang disetujui terkunci dan tidak bisa diubah guru mapel.',
      confirmLabel: 'Setujui semua',
    });
    if (!ok) return;
    setBusy(subjectId);
    try {
      for (const r of list) await reviewReport(r.id, 'Disetujui', null);
      toast(`${list.length} rapor ${sub?.nama} disetujui.`);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyetujui.', 'error');
    } finally {
      setBusy(null);
    }
  };

  if (waiting.length === 0 && returned.length === 0) {
    return <EmptyState icon="checkmark-done-outline" title="Tidak ada yang menunggu" message={`Belum ada rapor mapel yang diajukan untuk ${periode}. Rapor muncul di sini setelah guru mapel menekan Ajukan.`} />;
  }

  return (
    <View style={{ gap: space.lg }}>
      {bySubject.map(([subjectId, list], gi) => {
        const sub = ws.subjects.find((s) => s.id === subjectId)!;
        const p = subjectPalette[sub.warna];
        const a = ws.assignments.find((x) => x.class_id === cls.id && x.subject_id === subjectId);
        return (
          <EnterView key={subjectId} index={gi}>
            <View style={{ gap: space.sm }}>
              <View style={styles.between}>
                <View style={styles.subjectLine}>
                  <View style={[styles.iconSm, { backgroundColor: p.bg }]}>
                    <Ionicons name={subjectIcon(sub.nama)} size={16} color={p.fg} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText variant="heading" numberOfLines={1}>
                      {sub.nama}
                    </AppText>
                    <AppText variant="caption" tone={color.muted}>
                      {list.length} menunggu · {teacherName(ws, a?.teacher_id || null)}
                    </AppText>
                  </View>
                </View>
                {list.length > 1 ? <Button label="Setujui semua" size="sm" variant="subtle" loading={busy === subjectId} onPress={() => approveAll(subjectId, list)} /> : null}
              </View>
              {list.map((r) => (
                <PressableScale
                  key={r.id}
                  onPress={() => navigation.navigate('Report', { assignmentId: r.assignment_id, studentId: r.student_id, periode: r.periode })}
                  scaleTo={0.985}
                  style={styles.reviewRow}
                  accessibilityLabel={`Tinjau rapor ${sub.nama} untuk ${studentName(r.student_id)}`}
                >
                  <Avatar name={studentName(r.student_id)} size={40} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText variant="body" weight="bold" numberOfLines={1}>
                      {studentName(r.student_id)}
                    </AppText>
                    <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={2}>
                      {r.narasi}
                    </AppText>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <StatusPill status="Diajukan" compact />
                    <AppText variant="caption" tone={color.mutedOnWhite}>
                      {r.submitted_at ? relativeDay(r.submitted_at.slice(0, 10)) : ''}
                    </AppText>
                  </View>
                </PressableScale>
              ))}
            </View>
          </EnterView>
        );
      })}
      {returned.length ? (
        <View style={{ gap: space.sm }}>
          <SectionHeader title="Dikembalikan untuk revisi" subtitle="Menunggu guru mapel memperbaiki" />
          {returned.map((r) => {
            const sub = ws.subjects.find((s) => s.id === r.subject_id);
            return (
              <Card key={r.id} style={{ gap: 4 }}>
                <View style={styles.between}>
                  <AppText variant="small" weight="bold" style={{ flex: 1 }} numberOfLines={1}>
                    {studentName(r.student_id)} · {sub?.nama}
                  </AppText>
                  <StatusPill status="Revisi" compact />
                </View>
                <AppText variant="caption" tone={color.inkSoft}>
                  Catatan Anda: {r.catatan_wali_kelas}
                </AppText>
              </Card>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function RosterTab({ cls, navigation }: { cls: ClassRoom; navigation: any }) {
  const ws = useAppStore((s) => s.ws)!;
  const layout = useLayout();
  const [q, setQ] = useState('');
  const rows = ws.students
    .filter((s) => s.class_id === cls.id)
    .sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap))
    .map((s) => ({ student: s, overall: crossSubjectStats(s, ws.assignments, ws.subjects, ws.journals).overall }));
  const shown = rows.filter((r) => !q.trim() || r.student.nama_lengkap.toLowerCase().includes(q.trim().toLowerCase()) || r.student.nisn.includes(q.trim()));
  return (
    <View style={{ gap: space.md }}>
      <View style={styles.rosterTop}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <TextField label="Cari siswa" value={q} onChangeText={setQ} leftIcon="search" placeholder="Nama atau NISN" />
        </View>
        <Button label="Tambah siswa" icon="person-add-outline" onPress={() => navigation.navigate('StudentForm', { classId: cls.id })} style={{ alignSelf: 'flex-end' }} />
      </View>
      <AppText variant="caption" tone={color.muted}>
        Sebagai wali kelas, hanya Anda yang dapat menambah, mengubah, atau menghapus siswa di kelas ini. Guru mapel otomatis melihat daftar ini.
      </AppText>
      {rows.length === 0 ? (
        <EmptyState icon="people-outline" title="Kelas masih kosong" message="Tambahkan siswa pertama. Guru mapel di kelas ini langsung bisa mencatat jurnal untuk mereka." action={{ label: 'Tambah siswa', icon: 'person-add-outline', onPress: () => navigation.navigate('StudentForm', { classId: cls.id }) }} />
      ) : shown.length === 0 ? (
        <AppText variant="small" tone={color.muted}>
          Tidak ada siswa yang cocok dengan "{q.trim()}".
        </AppText>
      ) : (
        <Grid columns={layout.isExpanded ? 2 : 1} gap={10}>
          {shown.map((r) => (
            <StudentRow key={r.student.id} student={r.student} right={<StatusPill status={r.overall} compact />} onPress={() => navigation.navigate('Student', { studentId: r.student.id })} />
          ))}
        </Grid>
      )}
    </View>
  );
}

function SubjectsTab({ cls, navigation }: { cls: ClassRoom; navigation: any }) {
  const ws = useAppStore((s) => s.ws)!;
  const layout = useLayout();
  const [viewing, setViewing] = useState<TeachingAssignment | null>(null);
  const assignments = ws.assignments.filter((a) => a.class_id === cls.id);
  return (
    <View style={{ gap: space.md }}>
      <AppText variant="small" tone={color.muted}>
        Mapel muncul di sini setelah gurunya menambahkan penugasan untuk {cls.nama_kelas}.
      </AppText>
      {assignments.length === 0 ? (
        <EmptyState icon="book-outline" title="Belum ada mapel" message="Minta guru mapel menambahkan kelas ini lewat menu Kelola peran mengajar." />
      ) : (
        <Grid columns={layout.isCompact ? 1 : 2} gap={12}>
          {assignments.map((a, i) => {
            const sub = ws.subjects.find((s) => s.id === a.subject_id)!;
            const p = subjectPalette[sub.warna];
            const js = journalsOf(ws.journals, { assignmentId: a.id });
            const last = js.reduce<string | null>((m, j) => (!m || j.tanggal > m ? j.tanggal : m), null);
            const mineToo = a.teacher_id === ws.teacher.id;
            return (
              <EnterView key={a.id} index={i}>
                <Card style={{ gap: 12 }}>
                  <View style={styles.subjectLine}>
                    <View style={[styles.iconMd, { backgroundColor: p.bg }]}>
                      <Ionicons name={subjectIcon(sub.nama)} size={20} color={p.fg} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <AppText variant="body" weight="bold" numberOfLines={1}>
                        {sub.nama}
                      </AppText>
                      <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={1}>
                        {teacherName(ws, a.teacher_id)}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="small" tone={color.inkSoft}>
                    {js.length} catatan jurnal{last ? ` · terakhir ${formatShortDate(last)}` : ''}
                    {a.materi_aktif ? `\nMateri: ${a.materi_aktif}` : ''}
                  </AppText>
                  <View style={styles.wrap}>
                    <Button label="Lihat jurnal" size="sm" variant="subtle" icon="list-outline" onPress={() => setViewing(a)} disabled={js.length === 0} />
                    {mineToo ? <Button label="Dashboard mapel saya" size="sm" variant="ghost" onPress={() => navigation.navigate('SubjectClass', { assignmentId: a.id })} /> : null}
                  </View>
                </Card>
              </EnterView>
            );
          })}
        </Grid>
      )}
      <Dialog
        visible={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing ? `Jurnal ${ws.subjects.find((s) => s.id === viewing.subject_id)?.nama}` : ''}
        description={viewing ? `Ditulis oleh ${teacherName(ws, viewing.teacher_id)}. Hanya baca.` : undefined}
      >
        {viewing
          ? journalsOf(ws.journals, { assignmentId: viewing.id })
              .sort((x, y) => (x.created_at < y.created_at ? 1 : -1))
              .slice(0, 30)
              .map((j) => <JournalItem key={j.id} journal={j} student={ws.students.find((s) => s.id === j.student_id)} />)
          : null}
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  subjectLine: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  dot: { width: 12, height: 12, borderRadius: 4 },
  waitingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: color.infoSoft },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subjectTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  iconSm: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconMd: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line },
  rosterTop: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' },
});
