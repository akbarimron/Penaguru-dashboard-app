import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  EmptyState,
  EnterView,
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
import { useLayout } from '../lib/layout';
import { toISODate } from '../lib/dates';
import { useAppStore } from '../store/useAppStore';
import { confirmDialog, toast } from '../store/useUiStore';
import { color, radius, space, subjectPalette } from '../theme/tokens';
import {
  ClassRoom,
  DailyJournal,
  HomeroomReport,
  Student,
  Subject,
  SubjectColor,
  SubjectReport,
  Teacher,
  TeachingAssignment,
} from '../types';

type AdminTab = 'ringkasan' | 'guru' | 'kelas' | 'siswa' | 'mapel' | 'jurnal' | 'rapor';

export function AdminDashboardScreen({ navigation }: any) {
  const ws = useAppStore((s) => s.ws)!;
  const layout = useLayout();
  const [tab, setTab] = useState<AdminTab>('ringkasan');

  return (
    <Screen
      header={
        <ScreenHeader
          title="🛡️ Dashboard Admin"
          subtitle={`${ws.school?.nama || 'Sekolah'} · ${ws.teacher.nama_lengkap}`}
          tone={{ bg: color.brandDeep, fg: '#FFFFFF' }}
        />
      }
    >
      <Segmented
        accessibilityLabel="Menu Admin"
        value={tab}
        onChange={setTab}
        options={[
          { key: 'ringkasan', label: 'Ringkasan' },
          { key: 'guru', label: 'Guru' },
          { key: 'kelas', label: 'Kelas' },
          { key: 'siswa', label: 'Siswa' },
          { key: 'mapel', label: 'Mapel' },
          { key: 'jurnal', label: 'Jurnal' },
          { key: 'rapor', label: 'Rapor' },
        ]}
      />

      {tab === 'ringkasan' && <OverviewTab />}
      {tab === 'guru' && <TeachersTab />}
      {tab === 'kelas' && <ClassesTab />}
      {tab === 'siswa' && <StudentsTab />}
      {tab === 'mapel' && <SubjectsTab />}
      {tab === 'jurnal' && <JournalsTab />}
      {tab === 'rapor' && <ReportsTab />}
    </Screen>
  );
}

// -----------------------------------------------------------------------------
// TAB 1: RINGKASAN & SEKOLAH
// -----------------------------------------------------------------------------
function OverviewTab() {
  const ws = useAppStore((s) => s.ws)!;
  const adminUpdateSchool = useAppStore((s) => s.adminUpdateSchool);

  const [nama, setNama] = useState(ws.school?.nama || '');
  const [npsn, setNpsn] = useState(ws.school?.npsn || '');
  const [kode, setKode] = useState(ws.school?.kode_gabung || '');
  const [saving, setSaving] = useState(false);

  const handleSaveSchool = async () => {
    if (!nama.trim()) {
      toast('Nama sekolah wajib diisi', 'error');
      return;
    }
    setSaving(true);
    try {
      await adminUpdateSchool({ nama: nama.trim(), npsn: npsn.trim() || null, kode_gabung: kode.trim().toUpperCase() });
      toast('Profil sekolah berhasil disimpan!');
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan sekolah', 'error');
    } finally {
      setSaving(false);
    }
  };

  const approvedReports = ws.reports.filter((r) => r.status === 'Disetujui').length;

  return (
    <EnterView>
      <Card style={{ gap: space.md }}>
        <SectionHeader title="Statistik Sekolah" subtitle="Rekapitulasi seluruh ekosistem belajar" />
        <View style={styles.statsGrid}>
          <StatBox icon="people" label="Total Guru" value={ws.colleagues.length || 1} tint={color.brand} />
          <StatBox icon="school" label="Total Kelas" value={ws.classes.length} tint="#2563EB" />
          <StatBox icon="person" label="Total Siswa" value={ws.students.length} tint="#166534" />
          <StatBox icon="book" label="Total Mapel" value={ws.subjects.length} tint="#9333EA" />
          <StatBox icon="newspaper" label="Daily Journal (1 Bulan)" value={ws.journals.length} tint="#D97706" />
          <StatBox icon="ribbon" label="Rapor Disetujui" value={`${approvedReports}/${ws.reports.length}`} tint="#059669" />
        </View>
      </Card>

      <Card style={{ gap: space.md, marginTop: space.md }}>
        <SectionHeader title="Pengaturan Sekolah" subtitle="Perbarui identitas instansi sekolah" />
        <TextField label="Nama Sekolah" value={nama} onChangeText={setNama} placeholder="Contoh: SMK Negeri 1 Bandung" />
        <TextField label="NPSN (Nomor Pokok Sekolah Nasional)" value={npsn} onChangeText={setNpsn} placeholder="Contoh: 20219876" />
        <TextField label="Kode Gabung Guru" value={kode} onChangeText={setKode} placeholder="Contoh: SMKBDG1" autoCapitalize="characters" />
        <Button label="Simpan Profil Sekolah" icon="checkmark-circle-outline" onPress={handleSaveSchool} loading={saving} style={{ alignSelf: 'flex-start' }} />
      </Card>
    </EnterView>
  );
}

// -----------------------------------------------------------------------------
// TAB 2: KELOLA GURU
// -----------------------------------------------------------------------------
function TeachersTab() {
  const ws = useAppStore((s) => s.ws)!;
  const adminSaveTeacher = useAppStore((s) => s.adminSaveTeacher);
  const adminDeleteTeacher = useAppStore((s) => s.adminDeleteTeacher);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'guru'>('guru');
  const [busy, setBusy] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setNama('');
    setNip('');
    setEmail('');
    setRole('guru');
    setModalOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditingId(t.id);
    setNama(t.nama_lengkap);
    setNip(t.nip || '');
    setEmail(t.email);
    setRole(t.role || 'guru');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nama.trim() || !email.trim()) {
      toast('Nama dan email guru wajib diisi', 'error');
      return;
    }
    setBusy(true);
    try {
      await adminSaveTeacher({ id: editingId || undefined, nama_lengkap: nama.trim(), nip: nip.trim() || null, email: email.trim(), role });
      toast(editingId ? 'Data guru diperbarui!' : 'Guru baru ditambahkan!');
      setModalOpen(false);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan data guru', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (t: Teacher) => {
    if (t.id === ws.teacher.id) {
      toast('Tidak bisa menghapus akun Anda sendiri yang sedang aktif.', 'error');
      return;
    }
    const ok = await confirmDialog({
      title: `Hapus guru ${t.nama_lengkap}?`,
      message: 'Penugasan mengajar dan status perwalian guru ini akan dilepas.',
      confirmLabel: 'Hapus Guru',
      destructive: true,
    });
    if (!ok) return;
    try {
      await adminDeleteTeacher(t.id);
      toast('Guru berhasil dihapus.');
    } catch (e: any) {
      toast(e?.message || 'Gagal menghapus guru', 'error');
    }
  };

  return (
    <EnterView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm }}>
        <SectionHeader title="Daftar Guru & Admin" subtitle={`${ws.colleagues.length} guru terdaftar`} />
        <Button label="Tambah Guru" icon="add" size="sm" onPress={openAdd} />
      </View>

      <Card style={{ padding: 0 }}>
        {ws.colleagues.map((t) => {
          const isMe = t.id === ws.teacher.id;
          const assignedClass = ws.classes.find((c) => c.homeroom_teacher_id === t.id);
          const teaches = ws.assignments.filter((a) => a.teacher_id === t.id);
          return (
            <View key={t.id} style={styles.listItem}>
              <Avatar name={t.nama_lengkap} size={44} />
              <View style={{ flex: 1, minWidth: 160 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AppText variant="body" weight="bold">
                    {t.nama_lengkap}
                  </AppText>
                  {isMe ? <Chip label="Anda" size="sm" /> : null}
                  <Chip label={t.role === 'admin' ? '🛡️ Admin' : 'Guru'} size="sm" selected={t.role === 'admin'} />
                </View>
                <AppText variant="caption" tone={color.inkSoft}>
                  {t.email} · {t.nip ? `NIP ${t.nip}` : 'NIP -'}
                </AppText>
                <AppText variant="caption" tone={color.mutedOnWhite}>
                  {assignedClass ? `Wali kelas: ${assignedClass.nama_kelas} · ` : ''}
                  {teaches.length} mapel diajar
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <IconButton icon="create-outline" label="Edit" size={36} onPress={() => openEdit(t)} />
                {!isMe ? <IconButton icon="trash-outline" label="Hapus" size={36} iconColor={color.danger} onPress={() => handleDelete(t)} /> : null}
              </View>
            </View>
          );
        })}
      </Card>

      <Dialog
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Data Guru' : 'Tambah Guru Baru'}
        footer={
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button label="Batal" variant="ghost" onPress={() => setModalOpen(false)} />
            <Button label="Simpan Guru" icon="checkmark" onPress={handleSave} loading={busy} />
          </View>
        }
      >
        <View style={{ gap: space.md }}>
          <TextField label="Nama Lengkap & Gelar" value={nama} onChangeText={setNama} placeholder="Contoh: Drs. Budi Santoso, M.Pd" />
          <TextField label="NIP (Nomor Induk Pegawai)" value={nip} onChangeText={setNip} placeholder="Contoh: 198005122005011003" />
          <TextField label="Alamat Email" value={email} onChangeText={setEmail} placeholder="Contoh: guru@penaguru.sch.id" autoCapitalize="none" keyboardType="email-address" />
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Peran Akun
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label="Guru Mapel / Wali" selected={role === 'guru'} onPress={() => setRole('guru')} />
              <Chip label="🛡️ Administrator" selected={role === 'admin'} onPress={() => setRole('admin')} />
            </View>
          </View>
        </View>
      </Dialog>
    </EnterView>
  );
}

// -----------------------------------------------------------------------------
// TAB 3: KELOLA KELAS
// -----------------------------------------------------------------------------
function ClassesTab() {
  const ws = useAppStore((s) => s.ws)!;
  const adminSaveClass = useAppStore((s) => s.adminSaveClass);
  const adminDeleteClass = useAppStore((s) => s.adminDeleteClass);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [namaKelas, setNamaKelas] = useState('');
  const [tingkat, setTingkat] = useState<'X' | 'XI' | 'XII'>('X');
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [waliId, setWaliId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setNamaKelas('');
    setTingkat('X');
    setTahunAjaran('2026/2027');
    setSemester('Ganjil');
    setWaliId(null);
    setModalOpen(true);
  };

  const openEdit = (c: ClassRoom) => {
    setEditingId(c.id);
    setNamaKelas(c.nama_kelas);
    setTingkat(c.tingkat);
    setTahunAjaran(c.tahun_ajaran);
    setSemester(c.semester);
    setWaliId(c.homeroom_teacher_id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!namaKelas.trim()) {
      toast('Nama kelas wajib diisi', 'error');
      return;
    }
    setBusy(true);
    try {
      await adminSaveClass({
        id: editingId || undefined,
        nama_kelas: namaKelas.trim(),
        tingkat,
        tahun_ajaran: tahunAjaran.trim(),
        semester,
        homeroom_teacher_id: waliId,
      });
      toast(editingId ? 'Kelas berhasil diperbarui!' : 'Kelas baru ditambahkan!');
      setModalOpen(false);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan kelas', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (c: ClassRoom) => {
    const ok = await confirmDialog({
      title: `Hapus kelas ${c.nama_kelas}?`,
      message: 'Seluruh siswa dan penugasan mapel di kelas ini akan ikut terhapus.',
      confirmLabel: 'Hapus Kelas',
      destructive: true,
    });
    if (!ok) return;
    try {
      await adminDeleteClass(c.id);
      toast('Kelas berhasil dihapus.');
    } catch (e: any) {
      toast(e?.message || 'Gagal menghapus kelas', 'error');
    }
  };

  return (
    <EnterView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm }}>
        <SectionHeader title="Daftar Kelas" subtitle={`${ws.classes.length} kelas aktif`} />
        <Button label="Tambah Kelas" icon="add" size="sm" onPress={openAdd} />
      </View>

      <Card style={{ padding: 0 }}>
        {ws.classes.map((c) => {
          const wali = ws.colleagues.find((t) => t.id === c.homeroom_teacher_id);
          const studentCount = ws.students.filter((s) => s.class_id === c.id).length;
          return (
            <View key={c.id} style={styles.listItem}>
              <View style={[styles.classIcon, { backgroundColor: color.brandSoft }]}>
                <AppText variant="body" weight="extrabold" tone={color.brandDeep}>
                  {c.tingkat}
                </AppText>
              </View>
              <View style={{ flex: 1, minWidth: 160 }}>
                <AppText variant="body" weight="bold">
                  {c.nama_kelas}
                </AppText>
                <AppText variant="caption" tone={color.inkSoft}>
                  Wali Kelas: {wali?.nama_lengkap || 'Belum ditentukan'}
                </AppText>
                <AppText variant="caption" tone={color.mutedOnWhite}>
                  {c.tahun_ajaran} ({c.semester}) · {studentCount} siswa
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <IconButton icon="create-outline" label="Edit" size={36} onPress={() => openEdit(c)} />
                <IconButton icon="trash-outline" label="Hapus" size={36} iconColor={color.danger} onPress={() => handleDelete(c)} />
              </View>
            </View>
          );
        })}
      </Card>

      <Dialog
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
        footer={
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button label="Batal" variant="ghost" onPress={() => setModalOpen(false)} />
            <Button label="Simpan Kelas" icon="checkmark" onPress={handleSave} loading={busy} />
          </View>
        }
      >
        <View style={{ gap: space.md }}>
          <TextField label="Nama Kelas" value={namaKelas} onChangeText={setNamaKelas} placeholder="Contoh: X PPLG 1" />
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Tingkat
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['X', 'XI', 'XII'] as const).map((t) => (
                <Chip key={t} label={`Kelas ${t}`} selected={tingkat === t} onPress={() => setTingkat(t)} />
              ))}
            </View>
          </View>
          <TextField label="Tahun Ajaran" value={tahunAjaran} onChangeText={setTahunAjaran} placeholder="2026/2027" />
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Semester
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['Ganjil', 'Genap'] as const).map((sem) => (
                <Chip key={sem} label={`Semester ${sem}`} selected={semester === sem} onPress={() => setSemester(sem)} />
              ))}
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Tunjuk Wali Kelas
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Chip label="Tanpa Wali" selected={waliId === null} onPress={() => setWaliId(null)} />
              {ws.colleagues.map((t) => (
                <Chip key={t.id} label={t.nama_lengkap} selected={waliId === t.id} onPress={() => setWaliId(t.id)} />
              ))}
            </ScrollView>
          </View>
        </View>
      </Dialog>
    </EnterView>
  );
}

// -----------------------------------------------------------------------------
// TAB 4: KELOLA SISWA & WALI MURID
// -----------------------------------------------------------------------------
function StudentsTab() {
  const ws = useAppStore((s) => s.ws)!;
  const saveStudent = useAppStore((s) => s.saveStudent);
  const deleteStudent = useAppStore((s) => s.deleteStudent);

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [classId, setClassId] = useState(ws.classes[0]?.id || '');
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [namaWali, setNamaWali] = useState('');
  const [waWali, setWaWali] = useState('');
  const [busy, setBusy] = useState(false);

  const filteredStudents = selectedClassId === 'all' ? ws.students : ws.students.filter((s) => s.class_id === selectedClassId);

  const openAdd = () => {
    setEditingId(null);
    setNama('');
    setNisn(`008${Date.now().toString().slice(-7)}`);
    setGender('L');
    setClassId(selectedClassId !== 'all' ? selectedClassId : ws.classes[0]?.id || '');
    setNamaWali('');
    setWaWali('');
    setModalOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditingId(s.id);
    setNama(s.nama_lengkap);
    setNisn(s.nisn);
    setGender(s.jenis_kelamin);
    setClassId(s.class_id);
    setNamaWali(s.nama_wali || '');
    setWaWali(s.no_whatsapp_wali || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nama.trim() || !nisn.trim() || !classId) {
      toast('Nama, NISN, dan kelas siswa wajib diisi', 'error');
      return;
    }
    setBusy(true);
    try {
      await saveStudent({
        id: editingId || undefined,
        class_id: classId,
        nama_lengkap: nama.trim(),
        nisn: nisn.trim(),
        jenis_kelamin: gender,
        nama_wali: namaWali.trim() || null,
        no_whatsapp_wali: waWali.trim() || null,
      });
      toast(editingId ? 'Data siswa berhasil diperbarui!' : 'Siswa baru berhasil ditambahkan!');
      setModalOpen(false);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan siswa', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (s: Student) => {
    const ok = await confirmDialog({
      title: `Hapus siswa ${s.nama_lengkap}?`,
      message: 'Seluruh riwayat daily journal dan rapor siswa ini akan ikut terhapus.',
      confirmLabel: 'Hapus Siswa',
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteStudent(s.id);
      toast('Siswa berhasil dihapus.');
    } catch (e: any) {
      toast(e?.message || 'Gagal menghapus siswa', 'error');
    }
  };

  return (
    <EnterView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm }}>
        <SectionHeader title="Kelola Siswa & Kontak Wali" subtitle={`${filteredStudents.length} siswa`} />
        <Button label="Tambah Siswa" icon="add" size="sm" onPress={openAdd} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: space.md }}>
        <Chip label="Semua Kelas" selected={selectedClassId === 'all'} onPress={() => setSelectedClassId('all')} />
        {ws.classes.map((c) => (
          <Chip key={c.id} label={c.nama_kelas} selected={selectedClassId === c.id} onPress={() => setSelectedClassId(c.id)} />
        ))}
      </ScrollView>

      <Card style={{ padding: 0 }}>
        {filteredStudents.map((s) => {
          const cls = ws.classes.find((c) => c.id === s.class_id);
          const journalCount = ws.journals.filter((j) => j.student_id === s.id).length;
          return (
            <View key={s.id} style={styles.listItem}>
              <Avatar name={s.nama_lengkap} size={42} />
              <View style={{ flex: 1, minWidth: 160 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AppText variant="body" weight="bold">
                    {s.nama_lengkap}
                  </AppText>
                  <Chip label={s.jenis_kelamin === 'L' ? 'L' : 'P'} size="sm" />
                </View>
                <AppText variant="caption" tone={color.inkSoft}>
                  NISN {s.nisn} · {cls?.nama_kelas || '-'} · {journalCount} jurnal
                </AppText>
                <AppText variant="caption" tone={color.mutedOnWhite}>
                  Wali: {s.nama_wali || 'Belum diisi'} · WA: {s.no_whatsapp_wali || '-'}
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <IconButton icon="create-outline" label="Edit" size={36} onPress={() => openEdit(s)} />
                <IconButton icon="trash-outline" label="Hapus" size={36} iconColor={color.danger} onPress={() => handleDelete(s)} />
              </View>
            </View>
          );
        })}
      </Card>

      <Dialog
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
        footer={
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button label="Batal" variant="ghost" onPress={() => setModalOpen(false)} />
            <Button label="Simpan Siswa" icon="checkmark" onPress={handleSave} loading={busy} />
          </View>
        }
      >
        <View style={{ gap: space.md }}>
          <TextField label="Nama Lengkap Siswa" value={nama} onChangeText={setNama} placeholder="Nama lengkap siswa" />
          <TextField label="NISN (10 Digit)" value={nisn} onChangeText={setNisn} placeholder="0081234567" keyboardType="numeric" />
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Jenis Kelamin
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label="Laki-laki (L)" selected={gender === 'L'} onPress={() => setGender('L')} />
              <Chip label="Perempuan (P)" selected={gender === 'P'} onPress={() => setGender('P')} />
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Pilih Kelas
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {ws.classes.map((c) => (
                <Chip key={c.id} label={c.nama_kelas} selected={classId === c.id} onPress={() => setClassId(c.id)} />
              ))}
            </ScrollView>
          </View>
          <TextField label="Nama Orang Tua / Wali Murid" value={namaWali} onChangeText={setNamaWali} placeholder="Nama orang tua/wali" />
          <TextField label="Nomor WhatsApp Wali (08xx)" value={waWali} onChangeText={setWaWali} placeholder="081234567890" keyboardType="phone-pad" />
        </View>
      </Dialog>
    </EnterView>
  );
}

// -----------------------------------------------------------------------------
// TAB 5: KELOLA MAPEL & PENUGASAN MENGAJAR
// -----------------------------------------------------------------------------
function SubjectsTab() {
  const ws = useAppStore((s) => s.ws)!;
  const adminSaveSubject = useAppStore((s) => s.adminSaveSubject);
  const adminDeleteSubject = useAppStore((s) => s.adminDeleteSubject);
  const adminSaveAssignment = useAppStore((s) => s.adminSaveAssignment);
  const adminDeleteAssignment = useAppStore((s) => s.adminDeleteAssignment);

  const [subjModalOpen, setSubjModalOpen] = useState(false);
  const [editingSubjId, setEditingSubjId] = useState<string | null>(null);
  const [subjName, setSubjName] = useState('');
  const [subjWarna, setSubjWarna] = useState<SubjectColor>('violet');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingAssignId, setEditingAssignId] = useState<string | null>(null);
  const [selectedSubjId, setSelectedSubjId] = useState(ws.subjects[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState(ws.classes[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState(ws.colleagues[0]?.id || '');
  const [materiAktif, setMateriAktif] = useState('');
  const [busy, setBusy] = useState(false);

  const openAddSubject = () => {
    setEditingSubjId(null);
    setSubjName('');
    setSubjWarna('violet');
    setSubjModalOpen(true);
  };

  const openAddAssignment = () => {
    setEditingAssignId(null);
    setSelectedSubjId(ws.subjects[0]?.id || '');
    setSelectedClassId(ws.classes[0]?.id || '');
    setSelectedTeacherId(ws.colleagues[0]?.id || '');
    setMateriAktif('');
    setAssignModalOpen(true);
  };

  const handleSaveSubject = async () => {
    if (!subjName.trim()) {
      toast('Nama mapel wajib diisi', 'error');
      return;
    }
    setBusy(true);
    try {
      await adminSaveSubject({ id: editingSubjId || undefined, nama: subjName.trim(), warna: subjWarna });
      toast(editingSubjId ? 'Mapel diperbarui!' : 'Mapel baru ditambahkan!');
      setSubjModalOpen(false);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan mapel', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedSubjId || !selectedClassId || !selectedTeacherId) {
      toast('Mapel, Kelas, dan Guru pengampu wajib dipilih', 'error');
      return;
    }
    setBusy(true);
    try {
      await adminSaveAssignment({
        id: editingAssignId || undefined,
        subject_id: selectedSubjId,
        class_id: selectedClassId,
        teacher_id: selectedTeacherId,
        materi_aktif: materiAktif.trim(),
        jadwal: [],
      });
      toast('Penugasan mengajar berhasil disimpan!');
      setAssignModalOpen(false);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan penugasan', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <EnterView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm }}>
        <SectionHeader title="Mata Pelajaran Sekolah" subtitle={`${ws.subjects.length} mata pelajaran`} />
        <Button label="Tambah Mapel" icon="add" size="sm" onPress={openAddSubject} />
      </View>

      <Card style={{ padding: 0, marginBottom: space.lg }}>
        {ws.subjects.map((sub) => {
          const pal = subjectPalette[sub.warna] || subjectPalette.violet;
          return (
            <View key={sub.id} style={styles.listItem}>
              <View style={[styles.dot, { backgroundColor: pal.bg, width: 24, height: 24, borderRadius: 6 }]} />
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="bold">
                  {sub.nama}
                </AppText>
                <AppText variant="caption" tone={color.mutedOnWhite}>
                  Warna: {sub.warna}
                </AppText>
              </View>
              <IconButton
                icon="trash-outline"
                label="Hapus"
                size={36}
                iconColor={color.danger}
                onPress={async () => {
                  const ok = await confirmDialog({ title: `Hapus mapel ${sub.nama}?`, message: 'Seluruh penugasan & jurnal mapel ini akan terhapus.', confirmLabel: 'Hapus' });
                  if (ok) await adminDeleteSubject(sub.id);
                }}
              />
            </View>
          );
        })}
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm }}>
        <SectionHeader title="Penugasan Mengajar (Guru x Kelas)" subtitle={`${ws.assignments.length} penugasan aktif`} />
        <Button label="Tugaskan Guru" icon="people-outline" size="sm" variant="subtle" onPress={openAddAssignment} />
      </View>

      <Card style={{ padding: 0 }}>
        {ws.assignments.map((a) => {
          const sub = ws.subjects.find((s) => s.id === a.subject_id);
          const cls = ws.classes.find((c) => c.id === a.class_id);
          const teacher = ws.colleagues.find((t) => t.id === a.teacher_id);
          const pal = sub ? subjectPalette[sub.warna] : subjectPalette.violet;
          return (
            <View key={a.id} style={styles.listItem}>
              <View style={[styles.dot, { backgroundColor: pal.bg, width: 14, height: 14, borderRadius: 4 }]} />
              <View style={{ flex: 1, minWidth: 160 }}>
                <AppText variant="body" weight="bold">
                  {sub?.nama} · {cls?.nama_kelas}
                </AppText>
                <AppText variant="caption" tone={color.inkSoft}>
                  Guru Pengampu: {teacher?.nama_lengkap || 'Belum ada guru'}
                </AppText>
                <AppText variant="caption" tone={color.mutedOnWhite}>
                  Materi aktif: {a.materi_aktif || '(Belum diset)'}
                </AppText>
              </View>
              <IconButton
                icon="trash-outline"
                label="Hapus"
                size={36}
                iconColor={color.danger}
                onPress={async () => {
                  const ok = await confirmDialog({ title: 'Hapus penugasan mengajar ini?', message: 'Data kelas dan mapel tidak terhapus, hanya ikatan pengampunya.', confirmLabel: 'Hapus' });
                  if (ok) await adminDeleteAssignment(a.id);
                }}
              />
            </View>
          );
        })}
      </Card>

      <Dialog
        visible={subjModalOpen}
        onClose={() => setSubjModalOpen(false)}
        title="Tambah / Ubah Mata Pelajaran"
        footer={
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button label="Batal" variant="ghost" onPress={() => setSubjModalOpen(false)} />
            <Button label="Simpan Mapel" icon="checkmark" onPress={handleSaveSubject} loading={busy} />
          </View>
        }
      >
        <View style={{ gap: space.md }}>
          <TextField label="Nama Mata Pelajaran" value={subjName} onChangeText={setSubjName} placeholder="Contoh: Pemrograman Web" />
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Warna Tema
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {(['violet', 'coral', 'yellow', 'green', 'blue', 'pink'] as SubjectColor[]).map((c) => (
                <Chip key={c} label={c} selected={subjWarna === c} onPress={() => setSubjWarna(c)} />
              ))}
            </View>
          </View>
        </View>
      </Dialog>

      <Dialog
        visible={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Tugaskan Guru ke Mapel & Kelas"
        footer={
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button label="Batal" variant="ghost" onPress={() => setAssignModalOpen(false)} />
            <Button label="Simpan Penugasan" icon="checkmark" onPress={handleSaveAssignment} loading={busy} />
          </View>
        }
      >
        <View style={{ gap: space.md }}>
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Pilih Mata Pelajaran
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {ws.subjects.map((s) => (
                <Chip key={s.id} label={s.nama} selected={selectedSubjId === s.id} onPress={() => setSelectedSubjId(s.id)} />
              ))}
            </ScrollView>
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Pilih Kelas
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {ws.classes.map((c) => (
                <Chip key={c.id} label={c.nama_kelas} selected={selectedClassId === c.id} onPress={() => setSelectedClassId(c.id)} />
              ))}
            </ScrollView>
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Pilih Guru Pengampu
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {ws.colleagues.map((t) => (
                <Chip key={t.id} label={t.nama_lengkap} selected={selectedTeacherId === t.id} onPress={() => setSelectedTeacherId(t.id)} />
              ))}
            </ScrollView>
          </View>
          <TextField label="Materi Aktif Saat Ini" value={materiAktif} onChangeText={setMateriAktif} placeholder="Contoh: Perulangan Looping For & While" />
        </View>
      </Dialog>
    </EnterView>
  );
}

// -----------------------------------------------------------------------------
// TAB 6: KELOLA DAILY JOURNAL
// -----------------------------------------------------------------------------
function JournalsTab() {
  const ws = useAppStore((s) => s.ws)!;
  const adminSaveJournal = useAppStore((s) => s.adminSaveJournal);
  const adminDeleteJournal = useAppStore((s) => s.adminDeleteJournal);

  const [filterClass, setFilterClass] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [studentId, setStudentId] = useState(ws.students[0]?.id || '');
  const [assignId, setAssignId] = useState(ws.assignments[0]?.id || '');
  const [tanggal, setTanggal] = useState(toISODate(new Date()));
  const [materi, setMateri] = useState('');
  const [kog, setKog] = useState('4');
  const [terampil, setTerampil] = useState('4');
  const [sikap, setSikap] = useState('4');
  const [catatan, setCatatan] = useState('');
  const [busy, setBusy] = useState(false);

  const filtered = filterClass === 'all' ? ws.journals : ws.journals.filter((j) => j.class_id === filterClass);

  const openAdd = () => {
    setEditingId(null);
    setStudentId(ws.students[0]?.id || '');
    setAssignId(ws.assignments[0]?.id || '');
    setTanggal(toISODate(new Date()));
    setMateri('');
    setKog('4');
    setTerampil('4');
    setSikap('4');
    setCatatan('');
    setModalOpen(true);
  };

  const openEdit = (j: DailyJournal) => {
    setEditingId(j.id);
    setStudentId(j.student_id);
    setAssignId(j.assignment_id);
    setTanggal(j.tanggal);
    setMateri(j.materi);
    setKog(String(j.nilai_kognitif));
    setTerampil(String(j.nilai_keterampilan));
    setSikap(String(j.skor_sikap));
    setCatatan(j.catatan);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!materi.trim() || !studentId || !assignId) {
      toast('Materi, siswa, dan mapel wajib diisi', 'error');
      return;
    }
    setBusy(true);
    try {
      await adminSaveJournal({
        id: editingId || undefined,
        student_id: studentId,
        assignment_id: assignId,
        tanggal,
        materi: materi.trim(),
        nilai_kognitif: Math.max(1, Math.min(5, parseInt(kog) || 4)),
        nilai_keterampilan: Math.max(1, Math.min(5, parseInt(terampil) || 4)),
        skor_sikap: Math.max(1, Math.min(5, parseInt(sikap) || 4)),
        catatan: catatan.trim(),
      });
      toast(editingId ? 'Catatan jurnal diperbarui!' : 'Jurnal baru dicatat!');
      setModalOpen(false);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan jurnal', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <EnterView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm }}>
        <SectionHeader title="Seluruh Daily Journal" subtitle={`${filtered.length} riwayat pengamatan`} />
        <Button label="Catat Jurnal Manual" icon="add" size="sm" onPress={openAdd} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: space.md }}>
        <Chip label="Semua Kelas" selected={filterClass === 'all'} onPress={() => setFilterClass('all')} />
        {ws.classes.map((c) => (
          <Chip key={c.id} label={c.nama_kelas} selected={filterClass === c.id} onPress={() => setFilterClass(c.id)} />
        ))}
      </ScrollView>

      <Card style={{ padding: 0 }}>
        {filtered.slice(0, 50).map((j) => {
          const st = ws.students.find((s) => s.id === j.student_id);
          const sub = ws.subjects.find((s) => s.id === j.subject_id);
          const cls = ws.classes.find((c) => c.id === j.class_id);
          return (
            <View key={j.id} style={styles.listItem}>
              <View style={{ flex: 1, minWidth: 160, gap: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText variant="small" weight="bold">
                    {st?.nama_lengkap || 'Siswa'} ({cls?.nama_kelas})
                  </AppText>
                  <AppText variant="caption" tone={color.mutedOnWhite}>
                    {j.tanggal}
                  </AppText>
                </View>
                <AppText variant="caption" weight="bold" tone={color.brandDeep}>
                  {sub?.nama}: "{j.materi}"
                </AppText>
                <AppText variant="caption" tone={color.inkSoft}>
                  Skor: Pengetahuan={j.nilai_kognitif}, Terampil={j.nilai_keterampilan}, Sikap={j.skor_sikap}
                </AppText>
                {j.catatan ? (
                  <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={2}>
                    Catatan: "{j.catatan}"
                  </AppText>
                ) : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <IconButton icon="create-outline" label="Edit" size={36} onPress={() => openEdit(j)} />
                <IconButton
                  icon="trash-outline"
                  label="Hapus"
                  size={36}
                  iconColor={color.danger}
                  onPress={async () => {
                    const ok = await confirmDialog({ title: 'Hapus catatan jurnal ini?', message: 'Data observasi akan dihapus permanen.', confirmLabel: 'Hapus' });
                    if (ok) await adminDeleteJournal(j.id);
                  }}
                />
              </View>
            </View>
          );
        })}
      </Card>

      <Dialog
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Daily Journal' : 'Tambah Daily Journal Manual'}
        footer={
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button label="Batal" variant="ghost" onPress={() => setModalOpen(false)} />
            <Button label="Simpan Jurnal" icon="checkmark" onPress={handleSave} loading={busy} />
          </View>
        }
      >
        <View style={{ gap: space.md }}>
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Pilih Siswa
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {ws.students.map((s) => (
                <Chip key={s.id} label={s.nama_lengkap} selected={studentId === s.id} onPress={() => setStudentId(s.id)} />
              ))}
            </ScrollView>
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Pilih Mapel & Kelas
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {ws.assignments.map((a) => {
                const sub = ws.subjects.find((s) => s.id === a.subject_id);
                const cls = ws.classes.find((c) => c.id === a.class_id);
                return (
                  <Chip key={a.id} label={`${sub?.nama} (${cls?.nama_kelas})`} selected={assignId === a.id} onPress={() => setAssignId(a.id)} />
                );
              })}
            </ScrollView>
          </View>
          <TextField label="Tanggal (YYYY-MM-DD)" value={tanggal} onChangeText={setTanggal} placeholder="2026-10-14" />
          <TextField label="Materi Pelajaran" value={materi} onChangeText={setMateri} placeholder="Contoh: Algoritma Pencarian Biner" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <TextField label="Kognitif (1-5)" value={kog} onChangeText={setKog} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Terampil (1-5)" value={terampil} onChangeText={setTerampil} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Sikap (1-5)" value={sikap} onChangeText={setSikap} keyboardType="numeric" />
            </View>
          </View>
          <TextField label="Catatan Observasi Guru" multiline numberOfLines={3} value={catatan} onChangeText={setCatatan} placeholder="Tuliskan catatan kemajuan atau kendala belajar siswa..." />
        </View>
      </Dialog>
    </EnterView>
  );
}

// -----------------------------------------------------------------------------
// TAB 7: KELOLA RAPOR
// -----------------------------------------------------------------------------
function ReportsTab() {
  const ws = useAppStore((s) => s.ws)!;
  const adminSaveReport = useAppStore((s) => s.adminSaveReport);
  const adminSaveHomeroomReport = useAppStore((s) => s.adminSaveHomeroomReport);

  const [editReportModal, setEditReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState<SubjectReport | null>(null);
  const [keunggulan, setKeunggulan] = useState('');
  const [rekomendasi, setRekomendasi] = useState('');
  const [narasi, setNarasi] = useState('');
  const [pesanWali, setPesanWali] = useState('');
  const [status, setStatus] = useState<any>('Draft');
  const [busy, setBusy] = useState(false);

  const openEdit = (r: SubjectReport) => {
    setEditingReport(r);
    setKeunggulan(r.keunggulan || '');
    setRekomendasi(r.rekomendasi || '');
    setNarasi(r.narasi || '');
    setPesanWali(r.pesan_wali || '');
    setStatus(r.status);
    setEditReportModal(true);
  };

  const handleSaveReport = async () => {
    if (!editingReport) return;
    setBusy(true);
    try {
      await adminSaveReport({
        id: editingReport.id,
        keunggulan,
        rekomendasi,
        narasi,
        pesan_wali: pesanWali,
        status,
      });
      toast('Rapor mapel berhasil diperbarui!');
      setEditReportModal(false);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan rapor', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <EnterView>
      <SectionHeader title="Status & Rekapitulasi Rapor" subtitle={`${ws.reports.length} rapor mapel terdata`} />
      <Card style={{ padding: 0 }}>
        {ws.reports.map((r) => {
          const st = ws.students.find((s) => s.id === r.student_id);
          const sub = ws.subjects.find((s) => s.id === r.subject_id);
          const cls = ws.classes.find((c) => c.id === r.class_id);
          return (
            <View key={r.id} style={styles.listItem}>
              <View style={{ flex: 1, minWidth: 160 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <AppText variant="body" weight="bold">
                    {st?.nama_lengkap}
                  </AppText>
                  <StatusPill status={r.status} compact />
                </View>
                <AppText variant="caption" tone={color.brandDeep} weight="semibold">
                  Mapel: {sub?.nama} · Kelas {cls?.nama_kelas} · {r.periode}
                </AppText>
                <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={2}>
                  Narasi: {r.narasi || '(Belum ada narasi)'}
                </AppText>
              </View>
              <IconButton icon="create-outline" label="Edit Rapor" size={36} onPress={() => openEdit(r)} />
            </View>
          );
        })}
      </Card>

      <Dialog
        visible={editReportModal}
        onClose={() => setEditReportModal(false)}
        title="Edit Rapor Siswa (Admin)"
        footer={
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button label="Batal" variant="ghost" onPress={() => setEditReportModal(false)} />
            <Button label="Simpan Rapor" icon="checkmark" onPress={handleSaveReport} loading={busy} />
          </View>
        }
      >
        <View style={{ gap: space.md }}>
          <View style={{ gap: 6 }}>
            <AppText variant="small" weight="bold">
              Ubah Status Rapor
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {(['Draft', 'Diajukan', 'Disetujui', 'Revisi'] as const).map((st) => (
                <Chip key={st} label={st} selected={status === st} onPress={() => setStatus(st)} />
              ))}
            </View>
          </View>
          <TextField label="Keunggulan Siswa" multiline numberOfLines={2} value={keunggulan} onChangeText={setKeunggulan} />
          <TextField label="Rekomendasi Tindak Lanjut" multiline numberOfLines={2} value={rekomendasi} onChangeText={setRekomendasi} />
          <TextField label="Narasi Rapor Resmi" multiline numberOfLines={4} value={narasi} onChangeText={setNarasi} />
          <TextField label="Pesan untuk Orang Tua (WhatsApp)" multiline numberOfLines={3} value={pesanWali} onChangeText={setPesanWali} />
        </View>
      </Dialog>
    </EnterView>
  );
}

function StatBox({ icon, label, value, tint }: { icon: any; label: string; value: string | number; tint: string }) {
  return (
    <View style={[styles.statBox, { borderLeftColor: tint, borderLeftWidth: 4 }]}>
      <Ionicons name={icon} size={20} color={tint} />
      <AppText variant="caption" tone={color.mutedOnWhite}>
        {label}
      </AppText>
      <AppText variant="title" weight="extrabold">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  statBox: {
    flex: 1,
    minWidth: 140,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
    gap: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
    gap: space.md,
  },
  classIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    alignSelf: 'center',
  },
});
