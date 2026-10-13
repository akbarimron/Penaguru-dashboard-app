import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, Card, Chip, DateBlock, Dialog, EmptyState, EnterView, IconButton, PressableScale, Screen, SectionHeader, TextField } from '../components/ui';
import { BULAN, formatLongDate, fromISODate, HARI_SINGKAT, monthMatrix, relativeDay, toISODate } from '../lib/dates';
import { useLayout } from '../lib/layout';
import { assignmentLabel, myAssignments, teacherName } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { confirmDialog, toast } from '../store/useUiStore';
import { color, radius, space, subjectPalette } from '../theme/tokens';
import { Assessment, AssessmentKind } from '../types';

const KINDS: AssessmentKind[] = ['Ulangan', 'Praktikum', 'Tugas', 'Proyek', 'PTS', 'PAS'];
const WEEK = [1, 2, 3, 4, 5, 6, 0];

export function AgendaScreen() {
  const ws = useAppStore((s) => s.ws)!;
  const deleteAssessment = useAppStore((s) => s.deleteAssessment);
  const layout = useLayout();
  const todayIso = toISODate(new Date());
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState(todayIso);
  const [addOpen, setAddOpen] = useState(false);
  const mine = myAssignments(ws);
  const myIds = new Set(mine.map((a) => a.id));

  const byDate = useMemo(() => {
    const map = new Map<string, Assessment[]>();
    ws.assessments.forEach((a) => map.set(a.tanggal, [...(map.get(a.tanggal) || []), a]));
    return map;
  }, [ws.assessments]);

  const upcoming = useMemo(
    () => ws.assessments.filter((a) => a.tanggal >= todayIso).sort((a, b) => a.tanggal.localeCompare(b.tanggal)).slice(0, 8),
    [ws.assessments, todayIso]
  );

  const cells = monthMatrix(cursor.y, cursor.m);
  const shift = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const remove = async (a: Assessment) => {
    const ok = await confirmDialog({ title: `Hapus "${a.judul}"?`, message: 'Agenda ini hilang dari kalender semua guru di kelas tersebut.', confirmLabel: 'Hapus agenda', destructive: true });
    if (!ok) return;
    try {
      await deleteAssessment(a.id);
      toast('Agenda dihapus.');
    } catch (e: any) {
      toast(e?.message || 'Gagal menghapus.', 'error');
    }
  };

  const calendar = (
    <EnterView>
      <Card style={{ gap: 10 }}>
        <View style={styles.monthRow}>
          <IconButton icon="chevron-back" label="Bulan sebelumnya" variant="ghost" onPress={() => shift(-1)} />
          <AppText variant="heading" align="center" style={{ flex: 1 }} accessibilityRole="header" accessibilityLiveRegion="polite">
            {BULAN[cursor.m]} {cursor.y}
          </AppText>
          <IconButton icon="chevron-forward" label="Bulan berikutnya" variant="ghost" onPress={() => shift(1)} />
        </View>
        <View style={styles.week}>
          {WEEK.map((d) => (
            <AppText key={d} variant="caption" weight="bold" tone={color.mutedOnWhite} align="center" style={{ flex: 1 }}>
              {HARI_SINGKAT[d]}
            </AppText>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((d, i) => {
            if (!d) return <View key={`e${i}`} style={styles.cell} />;
            const iso = toISODate(d);
            const items = byDate.get(iso) || [];
            const isSel = iso === selected;
            const isToday = iso === todayIso;
            return (
              <PressableScale
                key={iso}
                onPress={() => setSelected(iso)}
                scaleTo={0.9}
                accessibilityRole="button"
                accessibilityState={{ selected: isSel }}
                accessibilityLabel={`${formatLongDate(iso)}${items.length ? `, ${items.length} agenda` : ''}${isToday ? ', hari ini' : ''}`}
                style={styles.cell}
              >
                <View style={[styles.day, isToday && styles.today, isSel && styles.daySelected]}>
                  <AppText variant="small" weight={isSel || isToday ? 'bold' : 'medium'} tone={isSel ? '#FFFFFF' : d.getDay() === 0 ? color.critical : color.ink}>
                    {d.getDate()}
                  </AppText>
                </View>
                <View style={styles.marks}>
                  {items.slice(0, 3).map((a) => {
                    const sub = ws.subjects.find((s) => s.id === a.subject_id);
                    return <View key={a.id} style={[styles.mark, { backgroundColor: sub ? subjectPalette[sub.warna].bg : color.brand }]} />;
                  })}
                </View>
              </PressableScale>
            );
          })}
        </View>
      </Card>
    </EnterView>
  );

  const dayItems = byDate.get(selected) || [];
  const dayPanel = (
    <EnterView index={1}>
      <View style={{ gap: space.sm }}>
        <SectionHeader
          title={formatLongDate(selected)}
          subtitle={dayItems.length ? `${dayItems.length} agenda` : 'Tidak ada agenda'}
          action={mine.length ? <Button size="sm" icon="add" label="Tambah" variant="subtle" onPress={() => setAddOpen(true)} /> : undefined}
        />
        {dayItems.map((a) => (
          <AgendaRow key={a.id} a={a} own={myIds.has(a.assignment_id)} onDelete={() => remove(a)} />
        ))}
      </View>
    </EnterView>
  );

  const upcomingList = (
    <EnterView index={2}>
      <View style={{ gap: space.sm }}>
        <SectionHeader title="Asesmen mendatang" subtitle="Di kelas yang Anda ajar dan walikan" />
        {upcoming.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Belum ada agenda"
            message={mine.length ? 'Pilih tanggal di kalender lalu tekan Tambah untuk menjadwalkan ulangan, praktikum, atau tugas.' : 'Agenda dibuat oleh guru mapel di kelas perwalian Anda.'}
          />
        ) : (
          upcoming.map((a) => <AgendaRow key={a.id} a={a} own={myIds.has(a.assignment_id)} onDelete={() => remove(a)} showDate />)
        )}
      </View>
    </EnterView>
  );

  return (
    <Screen>
      <View>
        <AppText variant="display" accessibilityRole="header">
          Agenda
        </AppText>
        <AppText variant="small" tone={color.muted}>
          Ulangan, praktikum, dan tugas. Terlihat oleh semua guru di kelas yang sama agar jadwal tidak bentrok.
        </AppText>
      </View>
      {layout.twoPane ? (
        <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.1, gap: space.lg }}>
            {calendar}
            {dayPanel}
          </View>
          <View style={{ flex: 1, gap: space.lg }}>{upcomingList}</View>
        </View>
      ) : (
        <>
          {calendar}
          {dayPanel}
          {upcomingList}
        </>
      )}
      <AddAssessmentDialog visible={addOpen} date={selected} onClose={() => setAddOpen(false)} />
    </Screen>
  );
}

function AgendaRow({ a, own, onDelete, showDate }: { a: Assessment; own: boolean; onDelete: () => void; showDate?: boolean }) {
  const ws = useAppStore((s) => s.ws)!;
  const sub = ws.subjects.find((s) => s.id === a.subject_id);
  const cls = ws.classes.find((c) => c.id === a.class_id);
  const owner = ws.assignments.find((x) => x.id === a.assignment_id);
  const p = sub ? subjectPalette[sub.warna] : subjectPalette.violet;
  return (
    <View style={styles.agenda}>
      <DateBlock date={fromISODate(a.tanggal)} palette={p} size={54} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <AppText variant="body" weight="bold" numberOfLines={2}>
          {a.judul}
        </AppText>
        <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={1}>
          {sub?.nama} · {cls?.nama_kelas} · {a.jenis}
        </AppText>
        <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={1}>
          {showDate ? `${relativeDay(a.tanggal)} · ` : ''}
          {own ? 'Agenda Anda' : `oleh ${teacherName(ws, owner?.teacher_id || null)}`}
        </AppText>
      </View>
      {own ? <IconButton icon="trash-outline" label={`Hapus ${a.judul}`} variant="ghost" iconColor={color.danger} onPress={onDelete} /> : null}
    </View>
  );
}

function AddAssessmentDialog({ visible, date, onClose }: { visible: boolean; date: string; onClose: () => void }) {
  const ws = useAppStore((s) => s.ws)!;
  const addAssessment = useAppStore((s) => s.addAssessment);
  const mine = myAssignments(ws);
  const [assignmentId, setAssignmentId] = useState<string | null>(mine[0]?.id || null);
  const [judul, setJudul] = useState('');
  const [jenis, setJenis] = useState<AssessmentKind>('Ulangan');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!assignmentId) return setError('Pilih mapel dan kelas.');
    if (judul.trim().length < 3) return setError('Tulis judul agenda.');
    setLoading(true);
    try {
      await addAssessment({ assignment_id: assignmentId, judul: judul.trim(), jenis, tanggal: date });
      toast('Agenda ditambahkan.');
      setJudul('');
      setError(null);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="Tambah agenda"
      description={`${formatLongDate(date)}. Pilih tanggal lain di kalender bila perlu.`}
      footer={
        <>
          <Button label="Batal" variant="ghost" onPress={onClose} />
          <Button label="Simpan agenda" icon="checkmark" onPress={submit} loading={loading} />
        </>
      }
    >
      <View style={{ gap: 8 }}>
        <AppText variant="small" weight="semibold" tone={color.inkSoft}>
          Mapel dan kelas
        </AppText>
        <View style={styles.wrap}>
          {mine.map((a) => {
            const { subject, title } = assignmentLabel(ws, a);
            return <Chip key={a.id} label={title} palette={subject ? subjectPalette[subject.warna] : undefined} selected={assignmentId === a.id} onPress={() => setAssignmentId(a.id)} />;
          })}
        </View>
      </View>
      <TextField label="Judul" value={judul} onChangeText={(t) => { setJudul(t); setError(null); }} placeholder="Contoh: Ulangan harian bab 2" error={error} />
      <View style={{ gap: 8 }}>
        <AppText variant="small" weight="semibold" tone={color.inkSoft}>
          Jenis
        </AppText>
        <View style={styles.wrap}>
          {KINDS.map((k) => (
            <Chip key={k} label={k} selected={jenis === k} onPress={() => setJenis(k)} />
          ))}
        </View>
      </View>
      <View style={styles.hint}>
        <Ionicons name="people-outline" size={16} color={color.info} />
        <AppText variant="caption" tone={color.info} style={{ flex: 1 }}>
          Agenda terlihat oleh guru lain dan wali kelas di kelas ini.
        </AppText>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  week: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, minHeight: 52, alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 2 },
  day: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 2, borderColor: color.brand },
  daySelected: { backgroundColor: color.brand, borderColor: color.brand },
  marks: { flexDirection: 'row', gap: 3, height: 8, marginTop: 2 },
  mark: { width: 7, height: 7, borderRadius: 2 },
  agenda: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: radius.md, backgroundColor: color.infoSoft },
});
