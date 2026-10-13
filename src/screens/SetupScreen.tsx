import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, Card, Chip, Divider, EnterView, IconButton, PressableScale, Screen, ScreenHeader, Segmented, TextField } from '../components/ui';
import { currentAcademicTerm, HARI } from '../lib/dates';
import { useLayout } from '../lib/layout';
import { myAssignments, teacherName } from '../store/selectors';
import { needsSetup, useAppStore } from '../store/useAppStore';
import { confirmDialog, toast } from '../store/useUiStore';
import { color, radius, space, subjectColorOrder, subjectPalette } from '../theme/tokens';
import { ClassRoom, ScheduleSlot, SubjectColor, Weekday } from '../types';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Satu layar untuk dua keperluan:
// - route "Setup"      : langkah awal setelah daftar (3 langkah).
// - route "ManageRoles": mengubah peran kapan saja dari Profil.
export function SetupScreen({ route, navigation }: any) {
  const manage = route.name === 'ManageRoles';
  const ws = useAppStore((s) => s.ws);
  const signOut = useAppStore((s) => s.signOut);
  const finishSetup = useAppStore((s) => s.finishSetup);
  const [step, setStep] = useState(ws?.school ? 1 : 0);
  const layout = useLayout();

  if (!ws) return null;
  const steps = ['Sekolah', 'Wali kelas', 'Mapel diampu'];
  const canFinish = !needsSetup(ws);

  if (manage) {
    return (
      <Screen header={<ScreenHeader title="Kelola peran mengajar" subtitle={ws.school?.nama} />}>
        <SchoolInfo />
        <HomeroomSection />
        <AssignmentsSection />
      </Screen>
    );
  }

  return (
    <Screen
      header={
        <ScreenHeader
          back={false}
          title="Atur peran mengajar"
          subtitle={`Langkah ${step + 1} dari 3 · ${steps[step]}`}
          right={<Button label="Keluar" variant="ghost" size="sm" onPress={signOut} />}
        />
      }
      footer={
        <View style={styles.footer}>
          {step > 0 ? <Button label="Kembali" variant="ghost" onPress={() => setStep(step - 1)} /> : <View />}
          {step < 2 ? (
            <Button label="Lanjut" icon="arrow-forward" onPress={() => setStep(step + 1)} disabled={step === 0 && !ws.school} />
          ) : (
            <Button
              label="Selesai, buka beranda"
              icon="checkmark"
              disabled={!canFinish}
              onPress={() => {
                if (finishSetup()) toast('Ruang kerja siap. Selamat mengajar!');
              }}
            />
          )}
        </View>
      }
    >
      <View style={styles.stepper} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: 3, now: step + 1 }}>
        {steps.map((s, i) => (
          <View key={s} style={{ flex: 1, gap: 6 }}>
            <View style={[styles.stepBar, { backgroundColor: i <= step ? color.brand : '#CBD5E1' }]} />
            <AppText variant="caption" weight={i === step ? 'bold' : 'medium'} tone={i <= step ? color.brandDeep : color.muted}>
              {i + 1}. {s}
            </AppText>
          </View>
        ))}
      </View>
      {step === 0 ? <SchoolStep onDone={() => setStep(1)} /> : null}
      {step === 1 ? <HomeroomSection intro /> : null}
      {step === 2 ? (
        <>
          <AssignmentsSection intro />
          {!canFinish ? (
            <AppText variant="small" tone={color.accentInk} style={{ textAlign: layout.isCompact ? 'left' : 'center' }}>
              Tambahkan minimal satu mapel yang Anda ajar, atau pilih kelas perwalian di langkah 2, untuk melanjutkan.
            </AppText>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function SchoolStep({ onDone }: { onDone: () => void }) {
  const ws = useAppStore((s) => s.ws)!;
  const mode = useAppStore((s) => s.mode);
  const joinSchool = useAppStore((s) => s.joinSchool);
  const createSchool = useAppStore((s) => s.createSchool);
  const [tab, setTab] = useState<'join' | 'create'>('join');
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [npsn, setNpsn] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (ws.school) return <SchoolInfo />;

  const submit = async () => {
    setError(null);
    if (tab === 'join' && kode.trim().length < 4) return setError('Kode sekolah terdiri dari 6 huruf/angka.');
    if (tab === 'create' && nama.trim().length < 5) return setError('Tulis nama sekolah lengkap.');
    if (tab === 'create' && npsn && !/^\d{8}$/.test(npsn)) return setError('NPSN terdiri dari 8 angka.');
    setLoading(true);
    try {
      if (tab === 'join') await joinSchool(kode);
      else await createSchool(nama, npsn || null);
      toast(tab === 'join' ? 'Berhasil bergabung dengan sekolah.' : 'Sekolah terdaftar. Bagikan kodenya ke rekan guru.');
      onDone();
    } catch (e: any) {
      setError(e?.message || 'Gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <EnterView>
      <Card style={{ gap: space.md }}>
        <View style={{ gap: 4 }}>
          <AppText variant="heading">Di sekolah mana Anda mengajar?</AppText>
          <AppText variant="small" tone={color.mutedOnWhite}>
            Guru di sekolah yang sama berbagi daftar kelas dan mapel. Data siswa tetap hanya terlihat sesuai peran.
          </AppText>
        </View>
        <Segmented
          accessibilityLabel="Cara memilih sekolah"
          value={tab}
          onChange={(k) => {
            setTab(k);
            setError(null);
          }}
          options={[
            { key: 'join', label: 'Gabung dengan kode' },
            { key: 'create', label: 'Daftarkan sekolah' },
          ]}
        />
        {tab === 'join' ? (
          <TextField
            label="Kode sekolah"
            value={kode}
            onChangeText={(t) => setKode(t.toUpperCase())}
            autoCapitalize="characters"
            maxLength={8}
            placeholder="6 huruf/angka"
            hint={mode === 'demo' ? 'Mode demo: kode sekolah contoh adalah DEMO26.' : 'Minta kode ke rekan guru yang sudah terdaftar.'}
            error={error}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        ) : (
          <>
            <TextField label="Nama sekolah" value={nama} onChangeText={setNama} placeholder="SMK Negeri ..." error={error} />
            <TextField label="NPSN" optional value={npsn} onChangeText={setNpsn} keyboardType="number-pad" maxLength={8} hint="8 angka, tertera di data Dapodik." />
          </>
        )}
        <Button label={tab === 'join' ? 'Gabung' : 'Daftarkan sekolah'} onPress={submit} loading={loading} />
      </Card>
    </EnterView>
  );
}

function SchoolInfo() {
  const ws = useAppStore((s) => s.ws)!;
  if (!ws.school) return null;
  return (
    <Card style={styles.schoolCard}>
      <View style={styles.schoolIcon}>
        <Ionicons name="business-outline" size={22} color={color.brandDeep} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <AppText variant="body" weight="bold" numberOfLines={2}>
          {ws.school.nama}
        </AppText>
        <AppText variant="small" tone={color.mutedOnWhite}>
          Kode gabung untuk rekan guru: {ws.school.kode_gabung}
        </AppText>
      </View>
      <IconButton
        icon="copy-outline"
        label="Salin kode sekolah"
        onPress={async () => {
          await Clipboard.setStringAsync(ws.school!.kode_gabung);
          toast('Kode sekolah disalin.');
        }}
      />
    </Card>
  );
}

function HomeroomSection({ intro }: { intro?: boolean }) {
  const ws = useAppStore((s) => s.ws)!;
  const setHomeroom = useAppStore((s) => s.setHomeroom);
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const term = currentAcademicTerm();
  const mine = ws.classes.filter((c) => c.homeroom_teacher_id === ws.teacher.id);

  const toggle = async (c: ClassRoom) => {
    const claim = c.homeroom_teacher_id !== ws.teacher.id;
    if (!claim) {
      const ok = await confirmDialog({
        title: `Lepas perwalian ${c.nama_kelas}?`,
        message: 'Anda tidak akan lagi melihat jurnal dan rapor dari guru mapel lain di kelas ini. Data tidak dihapus.',
        confirmLabel: 'Lepas perwalian',
        destructive: true,
      });
      if (!ok) return;
    }
    setBusy(c.id);
    try {
      await setHomeroom(c.id, claim);
      toast(claim ? `Anda sekarang wali kelas ${c.nama_kelas}.` : `Perwalian ${c.nama_kelas} dilepas.`);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <EnterView>
      <Card style={{ gap: space.md }}>
        <View style={{ gap: 4 }}>
          <AppText variant="heading">Kelas perwalian</AppText>
          <AppText variant="small" tone={color.mutedOnWhite}>
            {intro
              ? `Lewati bila Anda bukan wali kelas di tahun ajaran ${term.tahun_ajaran}. Wali kelas melihat semua jurnal dan rapor mapel di kelasnya, lalu menyetujui atau mengembalikan untuk revisi.`
              : 'Wali kelas melihat semua jurnal dan rapor mapel di kelasnya.'}
          </AppText>
        </View>
        {mine.length ? (
          <View style={styles.mineBox}>
            <Ionicons name="ribbon-outline" size={18} color={color.brandDeep} />
            <AppText variant="small" weight="bold" tone={color.brandDeep}>
              Anda wali kelas: {mine.map((c) => c.nama_kelas).join(', ')}
            </AppText>
          </View>
        ) : null}
        <View style={{ gap: 8 }}>
          {ws.classes.length === 0 ? (
            <AppText variant="small" tone={color.mutedOnWhite}>
              Belum ada kelas di sekolah ini. Tambahkan kelas terlebih dahulu.
            </AppText>
          ) : null}
          {ws.classes.map((c) => {
            const isMine = c.homeroom_teacher_id === ws.teacher.id;
            const takenByOther = Boolean(c.homeroom_teacher_id) && !isMine;
            return (
              <View key={c.id} style={styles.classRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText variant="body" weight="bold">
                    {c.nama_kelas}
                  </AppText>
                  <AppText variant="caption" tone={color.mutedOnWhite}>
                    {takenByOther ? `Wali kelas: ${teacherName(ws, c.homeroom_teacher_id)}` : isMine ? 'Wali kelas: Anda' : 'Belum ada wali kelas'}
                  </AppText>
                </View>
                {takenByOther ? null : (
                  <Button
                    size="sm"
                    label={isMine ? 'Lepas' : 'Jadikan perwalian'}
                    variant={isMine ? 'ghost' : 'subtle'}
                    loading={busy === c.id}
                    onPress={() => toggle(c)}
                  />
                )}
              </View>
            );
          })}
        </View>
        {adding ? (
          <ClassCreateForm onDone={() => setAdding(false)} />
        ) : (
          <Button label="Tambah kelas baru" icon="add" variant="ghost" size="sm" onPress={() => setAdding(true)} />
        )}
      </Card>
    </EnterView>
  );
}

function ClassCreateForm({ onDone }: { onDone: (c?: ClassRoom) => void }) {
  const createClass = useAppStore((s) => s.createClass);
  const [nama, setNama] = useState('');
  const [tingkat, setTingkat] = useState<ClassRoom['tingkat']>('X');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const term = currentAcademicTerm();

  const submit = async () => {
    if (nama.trim().length < 2) return setError('Tulis nama kelas, contoh: X PPLG 1.');
    setLoading(true);
    try {
      const c = await createClass({ nama_kelas: nama.trim(), tingkat, ...term });
      toast(`Kelas ${c.nama_kelas} ditambahkan.`);
      onDone(c);
    } catch (e: any) {
      setError(e?.message || 'Gagal menambah kelas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.inlineForm}>
      <TextField label="Nama kelas" value={nama} onChangeText={(t) => { setNama(t); setError(null); }} placeholder="Contoh: X PPLG 1" error={error} />
      <View style={{ gap: 6 }}>
        <AppText variant="small" weight="semibold" tone={color.inkSoft}>
          Tingkat
        </AppText>
        <View style={styles.chips}>
          {(['X', 'XI', 'XII'] as const).map((t) => (
            <Chip key={t} label={`Kelas ${t}`} selected={tingkat === t} onPress={() => setTingkat(t)} />
          ))}
        </View>
      </View>
      <AppText variant="caption" tone={color.muted}>
        Tahun ajaran {term.tahun_ajaran}, semester {term.semester}.
      </AppText>
      <View style={styles.formActions}>
        <Button label="Batal" variant="ghost" size="sm" onPress={() => onDone()} />
        <Button label="Simpan kelas" size="sm" onPress={submit} loading={loading} />
      </View>
    </View>
  );
}

function AssignmentsSection({ intro }: { intro?: boolean }) {
  const ws = useAppStore((s) => s.ws)!;
  const removeAssignment = useAppStore((s) => s.removeAssignment);
  const [adding, setAdding] = useState(false);
  const mine = myAssignments(ws);

  const remove = async (id: string, title: string) => {
    const ok = await confirmDialog({
      title: `Hapus ${title}?`,
      message: 'Jurnal, rapor, agenda, dan kelompok untuk mapel ini di kelas tersebut ikut terhapus. Tindakan ini tidak bisa dibatalkan.',
      confirmLabel: 'Hapus penugasan',
      destructive: true,
    });
    if (!ok) return;
    try {
      await removeAssignment(id);
      toast('Penugasan dihapus.');
    } catch (e: any) {
      toast(e?.message || 'Gagal menghapus.', 'error');
    }
  };

  return (
    <EnterView index={1}>
      <Card style={{ gap: space.md }}>
        <View style={{ gap: 4 }}>
          <AppText variant="heading">Mapel yang Anda ajar</AppText>
          <AppText variant="small" tone={color.mutedOnWhite}>
            {intro ? 'Setiap pasangan mapel dan kelas mendapat dashboard sendiri. ' : ''}Satu mapel di satu kelas hanya diampu satu guru.
          </AppText>
        </View>
        {mine.length === 0 ? (
          <View style={styles.emptyLine}>
            <Ionicons name="information-circle-outline" size={18} color={color.mutedOnWhite} />
            <AppText variant="small" tone={color.mutedOnWhite}>
              Belum ada mapel. Tambahkan di bawah.
            </AppText>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {mine.map((a) => {
              const subject = ws.subjects.find((s) => s.id === a.subject_id);
              const cls = ws.classes.find((c) => c.id === a.class_id);
              const p = subject ? subjectPalette[subject.warna] : subjectPalette.violet;
              const title = `${subject?.nama} · ${cls?.nama_kelas}`;
              return (
                <View key={a.id} style={styles.assignRow}>
                  <View style={[styles.swatch, { backgroundColor: p.bg }]} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <AppText variant="body" weight="bold" numberOfLines={1}>
                      {title}
                    </AppText>
                    <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={2}>
                      {a.jadwal.length ? a.jadwal.map((j) => `${HARI[j.hari]} ${j.jam_mulai}-${j.jam_selesai}`).join(' · ') : 'Jadwal belum diisi'}
                    </AppText>
                  </View>
                  <IconButton icon="trash-outline" label={`Hapus ${title}`} variant="ghost" iconColor={color.danger} onPress={() => remove(a.id, title)} />
                </View>
              );
            })}
          </View>
        )}
        <Divider />
        {adding ? (
          <AssignmentForm onDone={() => setAdding(false)} />
        ) : (
          <Button label="Tambah mapel di kelas" icon="add" variant="subtle" onPress={() => setAdding(true)} />
        )}
      </Card>
    </EnterView>
  );
}

function AssignmentForm({ onDone }: { onDone: () => void }) {
  const ws = useAppStore((s) => s.ws)!;
  const addAssignment = useAppStore((s) => s.addAssignment);
  const createSubject = useAppStore((s) => s.createSubject);
  const [classId, setClassId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [newClass, setNewClass] = useState(false);
  const [newSubject, setNewSubject] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectColor, setSubjectColor] = useState<SubjectColor>('violet');
  const [materi, setMateri] = useState('');
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [slotDraft, setSlotDraft] = useState<{ hari: Weekday; mulai: string; selesai: string }>({ hari: 1, mulai: '07:00', selesai: '08:30' });
  const [error, setError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const taken = useMemo(() => {
    if (!classId || !subjectId) return null;
    return ws.assignments.find((a) => a.class_id === classId && a.subject_id === subjectId) || null;
  }, [classId, subjectId, ws.assignments]);

  const addSlot = () => {
    if (!TIME_RE.test(slotDraft.mulai) || !TIME_RE.test(slotDraft.selesai)) return setSlotError('Gunakan format jam 24 jam, contoh 07:30.');
    if (slotDraft.mulai >= slotDraft.selesai) return setSlotError('Jam selesai harus setelah jam mulai.');
    setSlotError(null);
    setSlots([...slots, { hari: slotDraft.hari, jam_mulai: slotDraft.mulai, jam_selesai: slotDraft.selesai }].sort((a, b) => a.hari - b.hari || a.jam_mulai.localeCompare(b.jam_mulai)));
  };

  const submit = async () => {
    setError(null);
    if (!classId) return setError('Pilih kelas.');
    let sid = subjectId;
    if (newSubject) {
      if (subjectName.trim().length < 3) return setError('Tulis nama mapel.');
    } else if (!sid) return setError('Pilih mapel.');
    if (taken) return setError('Mapel ini di kelas tersebut sudah diampu guru lain.');
    setLoading(true);
    try {
      if (newSubject) sid = (await createSubject({ nama: subjectName.trim(), warna: subjectColor })).id;
      await addAssignment({ class_id: classId, subject_id: sid!, materi_aktif: materi.trim(), jadwal: slots });
      toast('Mapel ditambahkan. Dashboard-nya sudah tersedia di beranda.');
      onDone();
    } catch (e: any) {
      setError(e?.message || 'Gagal menambah mapel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.inlineForm}>
      <AppText variant="body" weight="bold">
        Tambah mapel di kelas
      </AppText>

      <View style={{ gap: 6 }}>
        <AppText variant="small" weight="semibold" tone={color.inkSoft}>
          Kelas
        </AppText>
        <View style={styles.chips}>
          {ws.classes.map((c) => (
            <Chip key={c.id} label={c.nama_kelas} selected={classId === c.id} onPress={() => { setClassId(c.id); setNewClass(false); }} />
          ))}
          <Chip label="Kelas baru" icon="add" selected={newClass} onPress={() => setNewClass(true)} />
        </View>
        {newClass ? (
          <ClassCreateForm
            onDone={(c) => {
              setNewClass(false);
              if (c) setClassId(c.id);
            }}
          />
        ) : null}
      </View>

      <View style={{ gap: 6 }}>
        <AppText variant="small" weight="semibold" tone={color.inkSoft}>
          Mapel
        </AppText>
        <View style={styles.chips}>
          {ws.subjects.map((s) => (
            <Chip key={s.id} label={s.nama} palette={subjectPalette[s.warna]} selected={!newSubject && subjectId === s.id} onPress={() => { setSubjectId(s.id); setNewSubject(false); }} />
          ))}
          <Chip label="Mapel baru" icon="add" selected={newSubject} onPress={() => { setNewSubject(true); setSubjectId(null); }} />
        </View>
        {newSubject ? (
          <View style={{ gap: 10 }}>
            <TextField label="Nama mapel" value={subjectName} onChangeText={setSubjectName} placeholder="Contoh: Sejarah" />
            <AppText variant="small" weight="semibold" tone={color.inkSoft}>
              Warna kartu mapel
            </AppText>
            <View style={styles.chips}>
              {subjectColorOrder.map((c) => (
                <PressableScale
                  key={c}
                  onPress={() => setSubjectColor(c)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: subjectColor === c }}
                  accessibilityLabel={`Warna ${c}`}
                  style={[styles.colorDot, { backgroundColor: subjectPalette[c].bg }, subjectColor === c && { borderColor: color.ink }]}
                >
                  {subjectColor === c ? <Ionicons name="checkmark" size={18} color={subjectPalette[c].fg} /> : null}
                </PressableScale>
              ))}
            </View>
          </View>
        ) : null}
        {taken ? (
          <AppText variant="small" tone={color.accentInk}>
            Sudah diampu {teacherName(ws, taken.teacher_id)}.
          </AppText>
        ) : null}
      </View>

      <TextField label="Materi yang sedang diajarkan" optional value={materi} onChangeText={setMateri} placeholder="Contoh: Fungsi linear" hint="Dipakai sebagai isian awal jurnal harian." />

      <View style={{ gap: 8 }}>
        <AppText variant="small" weight="semibold" tone={color.inkSoft}>
          Jadwal mingguan <AppText variant="small" tone={color.muted}>(opsional)</AppText>
        </AppText>
        {slots.map((s, i) => (
          <View key={`${s.hari}-${s.jam_mulai}`} style={styles.slotRow}>
            <Ionicons name="time-outline" size={16} color={color.muted} />
            <AppText variant="small" weight="semibold" style={{ flex: 1 }}>
              {HARI[s.hari]}, {s.jam_mulai}-{s.jam_selesai}
            </AppText>
            <IconButton icon="close" label={`Hapus jadwal ${HARI[s.hari]}`} variant="ghost" size={36} onPress={() => setSlots(slots.filter((_, j) => j !== i))} />
          </View>
        ))}
        <View style={styles.chips}>
          {([1, 2, 3, 4, 5, 6] as Weekday[]).map((d) => (
            <Chip key={d} label={HARI[d].slice(0, 3)} accessibilityLabel={HARI[d]} selected={slotDraft.hari === d} onPress={() => setSlotDraft({ ...slotDraft, hari: d })} />
          ))}
        </View>
        <View style={styles.timeRow}>
          <TextField containerStyle={{ flex: 1, minWidth: 110 }} label="Mulai" value={slotDraft.mulai} onChangeText={(t) => setSlotDraft({ ...slotDraft, mulai: t })} maxLength={5} keyboardType="numbers-and-punctuation" />
          <TextField containerStyle={{ flex: 1, minWidth: 110 }} label="Selesai" value={slotDraft.selesai} onChangeText={(t) => setSlotDraft({ ...slotDraft, selesai: t })} maxLength={5} keyboardType="numbers-and-punctuation" />
        </View>
        {slotError ? (
          <AppText variant="small" tone={color.danger}>
            {slotError}
          </AppText>
        ) : null}
        <Button label="Tambah ke jadwal" icon="add" variant="secondary" size="sm" onPress={addSlot} />
      </View>

      {error ? (
        <View style={styles.errorLine} accessibilityRole="alert">
          <Ionicons name="alert-circle" size={16} color={color.danger} />
          <AppText variant="small" weight="semibold" tone={color.danger} style={{ flex: 1 }}>
            {error}
          </AppText>
        </View>
      ) : null}
      <View style={styles.formActions}>
        <Button label="Batal" variant="ghost" onPress={onDone} />
        <Button label="Simpan mapel" icon="checkmark" onPress={submit} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  stepper: { flexDirection: 'row', gap: 8 },
  stepBar: { height: 6, borderRadius: 3 },
  schoolCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  schoolIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center' },
  mineBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: color.brandTint },
  classRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, minHeight: 48 },
  inlineForm: { gap: 14, padding: 14, borderRadius: radius.md, backgroundColor: color.surfaceMuted, borderWidth: 1, borderColor: color.line },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' },
  emptyLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  assignRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  swatch: { width: 14, height: 14, borderRadius: 4 },
  colorDot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10, borderRadius: radius.sm, backgroundColor: color.surface, borderWidth: 1, borderColor: color.line },
  timeRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  errorLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
