import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RatingInput } from '../components/RatingInput';
import { AppText, Button, Card, Chip, EmptyState, EnterView, IconButton, PressableScale, Screen, SectionHeader, TextField } from '../components/ui';
import { VoiceJournalModal } from '../components/VoiceJournalModal';
import { PRESET_TAGS } from '../lib/analytics';
import { formatLongDate, toISODate } from '../lib/dates';
import { useLayout } from '../lib/layout';
import { focusSession } from '../lib/schedule';
import { playPopSound } from '../lib/sound';
import { assignmentLabel, myAssignments } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { toast } from '../store/useUiStore';
import { color, elevation, radius, space, subjectPalette } from '../theme/tokens';

export function JournalScreen({ navigation, route }: any) {
  const ws = useAppStore((s) => s.ws)!;
  const offline = useAppStore((s) => s.offline);
  const addJournals = useAppStore((s) => s.addJournals);
  const layout = useLayout();
  const mine = myAssignments(ws);

  const defaultAssignment = route.params?.assignmentId || focusSession(mine)?.assignment.id || mine[0]?.id || null;
  const [assignmentId, setAssignmentId] = useState<string | null>(defaultAssignment);
  const [selected, setSelected] = useState<string[]>(route.params?.studentId ? [route.params.studentId] : []);
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [kog, setKog] = useState<number | null>(null);
  const [ket, setKet] = useState<number | null>(null);
  const [sik, setSik] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [materi, setMateri] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const assignment = mine.find((a) => a.id === assignmentId) || null;

  // Konteks bisa dikirim dari Beranda / dashboard mapel / detail siswa.
  useEffect(() => {
    if (route.params?.assignmentId) setAssignmentId(route.params.assignmentId);
    if (route.params?.studentId) setSelected([route.params.studentId]);
  }, [route.params?.assignmentId, route.params?.studentId]);

  useEffect(() => {
    setMateri(assignment?.materi_aktif || '');
  }, [assignment?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const students = useMemo(
    () => (assignment ? ws.students.filter((s) => s.class_id === assignment.class_id).sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap)) : []),
    [assignment, ws.students]
  );
  const visible = query.trim() ? students.filter((s) => s.nama_lengkap.toLowerCase().includes(query.trim().toLowerCase())) : students;

  if (mine.length === 0) {
    return (
      <Screen>
        <SectionHeader title="Catat jurnal" />
        <EmptyState
          icon="create-outline"
          title="Jurnal ditulis per mapel"
          message="Anda belum mengampu mapel. Tambahkan mapel yang Anda ajar untuk mulai mencatat. Sebagai wali kelas, catatan guru mapel bisa dilihat di dashboard perwalian."
          action={{ label: 'Tambah mapel', icon: 'add', onPress: () => navigation.navigate('ManageRoles') }}
        />
      </Screen>
    );
  }

  const toggleStudent = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleTag = (t: string) => setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  const errors = {
    students: selected.length === 0 ? 'Pilih minimal satu siswa.' : null,
    ratings: !kog || !ket || !sik ? 'Isi ketiga skor.' : null,
    materi: materi.trim() ? null : 'Tulis materi yang diajarkan.',
  };

  const save = async () => {
    setSubmitted(true);
    if (!assignment || errors.students || errors.ratings || errors.materi) {
      toast(errors.students || errors.ratings || errors.materi || 'Lengkapi isian.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await addJournals(
        selected.map((studentId) => ({
          assignment_id: assignment.id,
          class_id: assignment.class_id,
          subject_id: assignment.subject_id,
          teacher_id: ws.teacher.id,
          student_id: studentId,
          tanggal: toISODate(new Date()),
          materi: materi.trim(),
          nilai_kognitif: kog!,
          nilai_keterampilan: ket!,
          skor_sikap: sik!,
          tags,
          catatan: note.trim(),
        }))
      );
      toast(res.queued ? `${res.saved} catatan disimpan di perangkat. Sinkronkan saat online.` : `${res.saved} catatan jurnal tersimpan.`, res.queued ? 'info' : 'success');
      setSelected([]);
      setTags([]);
      setKog(null);
      setKet(null);
      setSik(null);
      setNote('');
      setSubmitted(false);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan jurnal.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const contextPicker = (
    <EnterView>
      <Card style={{ gap: 10 }}>
        <View style={styles.rowBetween}>
          <AppText variant="small" weight="semibold" tone={color.inkSoft}>
            Mapel dan kelas
          </AppText>
          {assignment ? (
            <Button
              label="Buka dashboard kelas"
              size="sm"
              variant="ghost"
              icon="easel-outline"
              onPress={() => navigation.navigate('SubjectClass', { assignmentId: assignment.id })}
            />
          ) : null}
        </View>
        <View style={styles.wrap}>
          {mine.map((a) => {
            const { subject, title } = assignmentLabel(ws, a);
            return (
              <Chip
                key={a.id}
                label={title}
                palette={subject ? subjectPalette[subject.warna] : undefined}
                selected={a.id === assignmentId}
                onPress={() => {
                  playPopSound(1.15);
                  setAssignmentId(a.id);
                  setSelected([]);
                }}
              />
            );
          })}
        </View>
        <TextField label="Materi" value={materi} onChangeText={setMateri} error={submitted ? errors.materi : null} />
      </Card>
    </EnterView>
  );

  const studentPicker = (
    <EnterView index={1}>
      <Card style={{ gap: 12 }}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="heading">Siswa</AppText>
            <AppText variant="caption" tone={selected.length ? color.brand : color.mutedOnWhite} weight="semibold">
              {selected.length ? `${selected.length} dipilih, catatan yang sama dibuat untuk tiap siswa` : 'Pilih satu atau beberapa siswa'}
            </AppText>
          </View>
          {students.length ? (
            <Button
              size="sm"
              variant="ghost"
              label={selected.length === students.length ? 'Kosongkan' : 'Pilih semua'}
              onPress={() => setSelected(selected.length === students.length ? [] : students.map((s) => s.id))}
            />
          ) : null}
        </View>
        {students.length > 8 ? <TextField label="Cari nama" value={query} onChangeText={setQuery} leftIcon="search" /> : null}
        {students.length === 0 ? (
          <AppText variant="small" tone={color.mutedOnWhite}>
            Belum ada siswa di kelas ini. Wali kelas menambahkan siswa dari dashboard perwalian.
          </AppText>
        ) : (
          <View style={styles.wrap}>
            {visible.map((s) => (
              <Chip key={s.id} label={s.nama_lengkap} selected={selected.includes(s.id)} onPress={() => toggleStudent(s.id)} />
            ))}
          </View>
        )}
        {submitted && errors.students ? <InlineError text={errors.students} /> : null}
      </Card>
    </EnterView>
  );

  const observation = (
    <EnterView index={2}>
      <Card style={{ gap: 14 }}>
        <AppText variant="heading">Pengamatan</AppText>
        <View style={{ gap: 8 }}>
          <AppText variant="small" weight="semibold" tone={color.success}>
            Hal positif
          </AppText>
          <View style={styles.wrap}>
            {PRESET_TAGS.filter((t) => t.kind === 'positif').map((t) => (
              <Chip key={t.label} label={t.label} tone="positive" selected={tags.includes(t.label)} onPress={() => toggleTag(t.label)} />
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <AppText variant="small" weight="semibold" tone={color.accentInk}>
            Perlu perhatian
          </AppText>
          <View style={styles.wrap}>
            {PRESET_TAGS.filter((t) => t.kind === 'perhatian').map((t) => (
              <Chip key={t.label} label={t.label} icon="alert-circle-outline" tone="attention" selected={tags.includes(t.label)} onPress={() => toggleTag(t.label)} />
            ))}
          </View>
        </View>
      </Card>
    </EnterView>
  );

  const scores = (
    <EnterView index={3}>
      <Card style={{ gap: 18 }}>
        <View>
          <AppText variant="heading">Skor tiga ranah</AppText>
          <AppText variant="caption" tone={color.mutedOnWhite}>
            1 = belum muncul, 5 = sangat baik. Rata-rata skor menentukan status siswa.
          </AppText>
        </View>
        <RatingInput label="Pengetahuan" description="Pemahaman konsep dan teori" value={kog} onChange={setKog} error={submitted && !kog} />
        <RatingInput label="Keterampilan" description="Praktik dan penyelesaian tugas" value={ket} onChange={setKet} error={submitted && !ket} />
        <RatingInput label="Sikap" description="Kerja sama, disiplin, keaktifan" value={sik} onChange={setSik} error={submitted && !sik} />
        <View style={{ gap: 8, marginTop: 4 }}>
          <AppText variant="small" weight="bold" tone={color.ink}>
            Catatan Observasi
          </AppText>
          <TextField
            label="Catatan Observasi"
            hideLabel
            multiline
            value={note}
            onChangeText={setNote}
            placeholder="Tulis catatan observasi pembelajaran siswa..."
          />
        </View>
      </Card>
    </EnterView>
  );

  return (
    <Screen
      footer={
        <View style={{ width: '100%', position: 'relative' }}>
          <View style={styles.floatingMicRow} pointerEvents="box-none">
            <PressableScale
              onPress={() => setVoiceModalOpen(true)}
              style={styles.stickyMicFab}
              accessibilityLabel="Dikte suara mikrofon"
            >
              <Ionicons name="mic" size={24} color="#FFFFFF" />
            </PressableScale>
          </View>
          <View style={styles.footer}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="small" weight="bold" numberOfLines={1}>
                {selected.length} siswa · {tags.length} tag
              </AppText>
              <AppText variant="caption" tone={offline ? color.accentInk : color.mutedOnWhite} numberOfLines={1}>
                {offline ? 'Mode luring: disimpan di perangkat' : formatLongDate(toISODate(new Date()))}
              </AppText>
            </View>
            <Button label="Simpan jurnal" icon="checkmark" onPress={save} loading={saving} />
          </View>
        </View>
      }
    >
      <View style={styles.titleRow}>
        <IconButton
          icon="arrow-back"
          label="Kembali"
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
          variant="surface"
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="display" accessibilityRole="header">
            Catat jurnal
          </AppText>
          <AppText variant="small" tone={color.muted} numberOfLines={1}>
            Pengamatan singkat selama atau setelah kelas.
          </AppText>
        </View>
        {offline ? (
          <View style={styles.offline}>
            <Ionicons name="cloud-offline-outline" size={14} color={color.accentInk} />
            <AppText variant="caption" weight="bold" tone={color.accentInk}>
              Luring
            </AppText>
          </View>
        ) : null}
      </View>

      {layout.twoPane ? (
        <View style={{ flexDirection: 'row', gap: space.lg, alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: space.lg, minWidth: 0 }}>
            {contextPicker}
            {studentPicker}
          </View>
          <View style={{ flex: 1, gap: space.lg, minWidth: 0 }}>
            {observation}
            {scores}
          </View>
        </View>
      ) : (
        <>
          {contextPicker}
          {studentPicker}
          {observation}
          {scores}
        </>
      )}

      <VoiceJournalModal
        open={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onApplyNote={(txt) => setNote((prev) => (prev ? `${prev} ${txt}` : txt))}
        onApplyParsed={({ catatan, studentIds, kog: k, ket: kt, sik: s, tags: t }) => {
          setNote((prev) => (prev ? `${prev} ${catatan}` : catatan));
          if (studentIds.length > 0) {
            setSelected((prev) => Array.from(new Set([...prev, ...studentIds])));
          }
          if (k) setKog(k);
          if (kt) setKet(kt);
          if (s) setSik(s);
          if (t.length > 0) {
            setTags((prev) => Array.from(new Set([...prev, ...t])));
          }
        }}
        availableStudents={students}
        currentMateri={materi}
      />
    </Screen>
  );
}

function InlineError({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={15} color={color.danger} />
      <AppText variant="small" tone={color.danger}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  offline: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: color.accentSoft },
  floatingMicRow: {
    position: 'absolute',
    top: -64,
    right: 4,
    zIndex: 99,
  },
  stickyMicFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.floating,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
