import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { RadarChart } from '../components/RadarChart';
import { JournalItem } from '../components/Rows';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  EnterView,
  PressableScale,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  Segmented,
  StatusPill,
  TextField,
} from '../components/ui';
import { crossSubjectStats, isAttentionTag, journalsOf, statsFor } from '../lib/analytics';
import { reportPeriods } from '../lib/dates';
import { useLayout } from '../lib/layout';
import { whatsappLink } from '../lib/phone';
import { isHomeroomOf, teacherName } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { toast } from '../store/useUiStore';
import { color, radius, space, subjectPalette } from '../theme/tokens';
import { Student, TeachingAssignment } from '../types';

export function StudentScreen({ route, navigation }: any) {
  const ws = useAppStore((s) => s.ws)!;
  const student = ws.students.find((s) => s.id === route.params?.studentId);
  const homeroom = student ? isHomeroomOf(ws, student.class_id) : false;
  // Mapel yang diajar guru ini di kelas siswa (dari parameter, atau yang pertama).
  const own = student
    ? ws.assignments.find((a) => a.id === route.params?.assignmentId && a.teacher_id === ws.teacher.id) ||
      ws.assignments.find((a) => a.teacher_id === ws.teacher.id && a.class_id === student.class_id)
    : undefined;
  // Dibuka dari konteks mapel -> sudut pandang mapel; dari perwalian -> wali kelas.
  const [view, setView] = useState<'mapel' | 'wali'>(route.params?.assignmentId || !homeroom ? 'mapel' : 'wali');

  if (!student || (!homeroom && !own)) {
    return (
      <Screen header={<ScreenHeader title="Detail siswa" />}>
        <EmptyState icon="lock-closed-outline" title="Siswa tidak tersedia" message="Anda hanya bisa melihat siswa di kelas yang Anda ajar atau walikan." />
      </Screen>
    );
  }
  const cls = ws.classes.find((c) => c.id === student.class_id)!;
  const subject = own ? ws.subjects.find((s) => s.id === own.subject_id) : undefined;
  const p = subject ? subjectPalette[subject.warna] : null;
  const showSubject = view === 'mapel' && own;

  return (
    <Screen
      header={
        <ScreenHeader
          title={student.nama_lengkap}
          subtitle={showSubject ? `${subject?.nama} · ${cls.nama_kelas}` : `Kelas perwalian ${cls.nama_kelas}`}
          tone={showSubject && p ? { bg: p.bg, fg: p.fg } : { bg: color.brand, fg: '#FFFFFF' }}
        />
      }
    >
      {own && homeroom ? (
        <Segmented
          accessibilityLabel="Sudut pandang"
          value={view}
          onChange={setView}
          options={[
            { key: 'mapel', label: subject?.nama || 'Mapel saya' },
            { key: 'wali', label: 'Sebagai wali kelas' },
          ]}
        />
      ) : null}
      <Identity student={student} homeroom={homeroom && view === 'wali'} navigation={navigation} />
      {showSubject ? <SubjectView student={student} a={own!} navigation={navigation} /> : <HomeroomView student={student} navigation={navigation} />}
    </Screen>
  );
}

function Identity({ student, homeroom, navigation }: { student: Student; homeroom: boolean; navigation: any }) {
  const wa = whatsappLink(student.no_whatsapp_wali, '');
  return (
    <EnterView>
      <Card style={styles.identity}>
        <Avatar name={student.nama_lengkap} size={56} />
        <View style={{ flex: 1, minWidth: 180, gap: 2 }}>
          <AppText variant="small" tone={color.mutedOnWhite}>
            NISN {student.nisn} · {student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          </AppText>
          {homeroom ? (
            <>
              <AppText variant="small" tone={color.inkSoft}>
                Wali murid: {student.nama_wali || 'belum diisi'}
              </AppText>
              <AppText variant="small" tone={color.inkSoft}>
                WhatsApp: {student.no_whatsapp_wali || 'belum diisi'}
              </AppText>
            </>
          ) : null}
        </View>
        {homeroom ? (
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button label="Ubah data" size="sm" variant="secondary" icon="create-outline" onPress={() => navigation.navigate('StudentForm', { classId: student.class_id, studentId: student.id })} />
            {wa ? <Button label="Chat wali" size="sm" variant="subtle" icon="logo-whatsapp" onPress={() => Linking.openURL(wa)} /> : null}
          </View>
        ) : null}
      </Card>
    </EnterView>
  );
}

function SubjectView({ student, a, navigation }: { student: Student; a: TeachingAssignment; navigation: any }) {
  const ws = useAppStore((s) => s.ws)!;
  const layout = useLayout();
  const journals = journalsOf(ws.journals, { assignmentId: a.id, studentId: student.id }).sort((x, y) => (x.created_at < y.created_at ? 1 : -1));
  const stats = statsFor(journals);
  const [periode] = reportPeriods();
  const report = ws.reports.find((r) => r.assignment_id === a.id && r.student_id === student.id && r.periode === periode);

  const statCard = (
    <EnterView index={1}>
      <Card style={{ gap: 14 }}>
        <View style={styles.between}>
          <AppText variant="heading">Capaian di mapel ini</AppText>
          <StatusPill status={stats.status} />
        </View>
        {stats.reason ? (
          <View style={styles.reason}>
            <Ionicons name="information-circle-outline" size={16} color={color.accentInk} />
            <AppText variant="small" tone={color.accentInk} style={{ flex: 1 }}>
              {stats.reason}
            </AppText>
          </View>
        ) : null}
        {stats.scores ? (
          <>
            {(
              [
                ['Pengetahuan', stats.scores.kognitif],
                ['Keterampilan', stats.scores.keterampilan],
                ['Sikap', stats.scores.sikap],
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
                <ProgressBar value={v} label={`${label} ${v}`} />
              </View>
            ))}
            <AppText variant="caption" tone={color.mutedOnWhite}>
              Dari {stats.count} catatan · skala 0-100{stats.trend ? ` · tren ${stats.trend}` : ''}
            </AppText>
            {stats.topTags.length ? (
              <View style={styles.wrap}>
                {stats.topTags.map((t) => (
                  <View key={t.tag} style={[styles.tag, isAttentionTag(t.tag) && { backgroundColor: color.accentSoft }]}>
                    {isAttentionTag(t.tag) ? <Ionicons name="alert-circle" size={12} color={color.accentInk} /> : null}
                    <AppText variant="caption" weight="semibold" tone={isAttentionTag(t.tag) ? color.accentInk : color.inkSoft}>
                      {t.tag} ×{t.count}
                    </AppText>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <AppText variant="small" tone={color.mutedOnWhite}>
            Belum ada catatan untuk siswa ini di mapel Anda.
          </AppText>
        )}
        <View style={styles.wrap}>
          <Button label="Catat jurnal" icon="create-outline" onPress={() => navigation.navigate('Main', { screen: 'Journal', params: { assignmentId: a.id, studentId: student.id } })} />
          <Button label={report ? `Rapor: ${report.status}` : 'Tulis rapor'} icon="document-text-outline" variant="secondary" onPress={() => navigation.navigate('Report', { assignmentId: a.id, studentId: student.id, periode })} />
        </View>
      </Card>
    </EnterView>
  );

  const history = (
    <EnterView index={2}>
      <View style={{ gap: space.sm }}>
        <SectionHeader title="Riwayat jurnal" subtitle={`${journals.length} catatan`} />
        {journals.length === 0 ? (
          <EmptyState icon="create-outline" title="Belum ada catatan" message="Catatan Anda untuk siswa ini akan muncul di sini, terbaru di atas." />
        ) : (
          journals.map((j) => <JournalItem key={j.id} journal={j} showStudent={false} />)
        )}
      </View>
    </EnterView>
  );

  if (layout.twoPane) {
    return (
      <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>{statCard}</View>
        <View style={{ flex: 1 }}>{history}</View>
      </View>
    );
  }
  return (
    <>
      {statCard}
      {history}
    </>
  );
}

function HomeroomView({ student, navigation }: { student: Student; navigation: any }) {
  const ws = useAppStore((s) => s.ws)!;
  const saveHomeroomReport = useAppStore((s) => s.saveHomeroomReport);
  const layout = useLayout();
  const periods = reportPeriods();
  const [periode, setPeriode] = useState(periods[0]);
  const { perSubject, overall } = crossSubjectStats(student, ws.assignments, ws.subjects, ws.journals);
  const existing = ws.homeroomReports.find((r) => r.student_id === student.id && r.periode === periode);
  const [note, setNote] = useState(existing?.catatan || '');
  const [saving, setSaving] = useState<'Draft' | 'Final' | null>(null);
  const [showAll, setShowAll] = useState(false);
  const allJournals = journalsOf(ws.journals, { studentId: student.id }).sort((x, y) => (x.created_at < y.created_at ? 1 : -1));
  const withData = perSubject.filter((p) => p.stats.composite !== null);

  useEffect(() => {
    setNote(existing?.catatan || '');
  }, [existing?.id, periode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Draf catatan wali kelas disusun dari status tiap mapel yang tercatat.
  const compose = () => {
    const name = student.nama_lengkap.split(' ')[0];
    const strong = perSubject.filter((p) => p.stats.status === 'Aman').map((p) => p.subject.nama);
    const weak = perSubject.filter((p) => p.stats.status === 'Kritis' || p.stats.status === 'Perhatian').map((p) => p.subject.nama);
    const parts = [`${name} mengikuti pembelajaran di ${perSubject.length} mapel pada ${periode}.`];
    if (strong.length) parts.push(`Capaian baik terlihat di ${strong.join(', ')}.`);
    if (weak.length) parts.push(`${name} perlu pendampingan tambahan di ${weak.join(', ')}; mohon dukungan orang tua untuk mendampingi latihan di rumah.`);
    if (!strong.length && !weak.length) parts.push('Catatan jurnal guru mapel belum cukup untuk menyimpulkan capaian.');
    setNote(parts.join(' '));
  };

  const save = async (status: 'Draft' | 'Final') => {
    if (status === 'Final' && note.trim().length < 20) {
      toast('Tulis catatan minimal 20 karakter sebelum difinalkan.', 'error');
      return;
    }
    setSaving(status);
    try {
      await saveHomeroomReport({ id: existing?.id, class_id: student.class_id, student_id: student.id, periode, catatan: note.trim(), status });
      toast(status === 'Final' ? 'Catatan wali kelas difinalkan.' : 'Draf catatan disimpan.');
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan.', 'error');
    } finally {
      setSaving(null);
    }
  };

  const perSubjectCard = (
    <EnterView index={1}>
      <Card style={{ gap: 14 }}>
        <View style={styles.between}>
          <View style={{ flex: 1 }}>
            <AppText variant="heading">Di mapel mana kuat, di mana tertinggal?</AppText>
            <AppText variant="caption" tone={color.mutedOnWhite}>
              Skor gabungan 0-100 dari jurnal tiap guru mapel
            </AppText>
          </View>
          <StatusPill status={overall} />
        </View>
        {withData.length >= 3 ? (
          <RadarChart axes={perSubject.map((p) => ({ label: p.subject.nama, value: p.stats.composite }))} width={layout.isCompact ? layout.width - 2 * layout.gutter - 34 : 420} />
        ) : null}
        {perSubject.length === 0 ? (
          <AppText variant="small" tone={color.mutedOnWhite}>
            Belum ada guru mapel di kelas ini.
          </AppText>
        ) : (
          perSubject.map((p) => {
            const pal = subjectPalette[p.subject.warna];
            return (
              <View key={p.assignment.id} style={{ gap: 6 }}>
                <View style={styles.between}>
                  <View style={styles.subjectLine}>
                    <View style={[styles.dot, { backgroundColor: pal.bg }]} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <AppText variant="small" weight="bold" numberOfLines={1}>
                        {p.subject.nama}
                      </AppText>
                      <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={1}>
                        {teacherName(ws, p.assignment.teacher_id)} · {p.stats.count} catatan
                      </AppText>
                    </View>
                  </View>
                  <StatusPill status={p.stats.status} compact />
                </View>
                {p.stats.composite !== null ? <ProgressBar value={p.stats.composite} tint={pal.bg === subjectPalette.yellow.bg ? '#B45309' : pal.bg} label={`${p.subject.nama} ${p.stats.composite}`} /> : null}
              </View>
            );
          })
        )}
      </Card>
    </EnterView>
  );

  const reportsCard = (
    <EnterView index={2}>
      <Card style={{ gap: 12 }}>
        <AppText variant="heading">Rapor</AppText>
        <View style={styles.wrap}>
          {periods.map((pr) => (
            <Chip key={pr} label={pr} selected={periode === pr} onPress={() => setPeriode(pr)} />
          ))}
        </View>
        {perSubject.map((p) => {
          const r = ws.reports.find((x) => x.assignment_id === p.assignment.id && x.student_id === student.id && x.periode === periode);
          return (
            <PressableScale
              key={p.assignment.id}
              disabled={!r}
              onPress={() => r && navigation.navigate('Report', { assignmentId: p.assignment.id, studentId: student.id, periode })}
              scaleTo={0.985}
              style={styles.reportRow}
              accessibilityLabel={`Rapor ${p.subject.nama}: ${r ? r.status : 'belum dibuat'}`}
            >
              <AppText variant="small" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
                {p.subject.nama}
              </AppText>
              <StatusPill status={r ? r.status : 'Belum dibuat'} compact />
              {r ? <Ionicons name="chevron-forward" size={16} color={color.mutedOnWhite} /> : <View style={{ width: 16 }} />}
            </PressableScale>
          );
        })}
        <View style={{ gap: 10, borderTopWidth: 1, borderTopColor: color.line, paddingTop: 12 }}>
          <View style={styles.between}>
            <AppText variant="body" weight="bold">
              Catatan wali kelas
            </AppText>
            {existing ? <StatusPill status={existing.status} compact /> : null}
          </View>
          <TextField label="Catatan untuk rapor" multiline value={note} onChangeText={setNote} placeholder="Ringkasan perkembangan siswa di semua mapel." editable={existing?.status !== 'Final'} />
          <View style={styles.wrap}>
            {existing?.status === 'Final' ? (
              <Button label="Buka kunci untuk diubah" size="sm" variant="ghost" icon="lock-open-outline" onPress={() => save('Draft')} loading={saving === 'Draft'} />
            ) : (
              <>
                <Button label="Susun dari data mapel" size="sm" variant="subtle" icon="document-text-outline" onPress={compose} />
                <Button label="Simpan draf" size="sm" variant="secondary" onPress={() => save('Draft')} loading={saving === 'Draft'} />
                <Button label="Finalkan" size="sm" icon="lock-closed-outline" onPress={() => save('Final')} loading={saving === 'Final'} />
              </>
            )}
          </View>
        </View>
      </Card>
    </EnterView>
  );

  const journalsList = (
    <EnterView index={3}>
      <View style={{ gap: space.sm }}>
        <SectionHeader title="Jurnal dari semua guru mapel" subtitle={`${allJournals.length} catatan`} />
        {allJournals.length === 0 ? (
          <EmptyState icon="create-outline" title="Belum ada catatan" message="Catatan jurnal guru mapel untuk siswa ini akan terkumpul di sini." />
        ) : (
          <>
            {(showAll ? allJournals : allJournals.slice(0, 6)).map((j) => (
              <JournalItem key={j.id} journal={j} subject={ws.subjects.find((s) => s.id === j.subject_id)} showSubject showStudent={false} />
            ))}
            {allJournals.length > 6 ? (
              <Button label={showAll ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${allJournals.length})`} variant="ghost" onPress={() => setShowAll(!showAll)} style={{ alignSelf: 'center' }} />
            ) : null}
          </>
        )}
      </View>
    </EnterView>
  );

  if (layout.twoPane) {
    return (
      <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: space.lg }}>
          {perSubjectCard}
          {reportsCard}
        </View>
        <View style={{ flex: 1 }}>{journalsList}</View>
      </View>
    );
  }
  return (
    <>
      {perSubjectCard}
      {reportsCard}
      {journalsList}
    </>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: radius.md, backgroundColor: color.accentSoft },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#F1F5F9' },
  subjectLine: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  dot: { width: 12, height: 12, borderRadius: 4 },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 10, borderRadius: radius.sm, backgroundColor: color.surfaceMuted },
});
