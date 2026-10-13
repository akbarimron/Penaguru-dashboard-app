import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, Card, Chip, EmptyState, Screen, ScreenHeader, TextField } from '../components/ui';
import { isHomeroomOf } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { confirmDialog, toast } from '../store/useUiStore';
import { color, space } from '../theme/tokens';

export function StudentFormScreen({ route, navigation }: any) {
  const ws = useAppStore((s) => s.ws)!;
  const saveStudent = useAppStore((s) => s.saveStudent);
  const deleteStudent = useAppStore((s) => s.deleteStudent);
  const { classId, studentId } = route.params || {};
  const existing = ws.students.find((s) => s.id === studentId);
  const cls = ws.classes.find((c) => c.id === classId);
  const [v, setV] = useState({
    nama: existing?.nama_lengkap || '',
    nisn: existing?.nisn || '',
    jk: (existing?.jenis_kelamin || null) as 'L' | 'P' | null,
    wali: existing?.nama_wali || '',
    wa: existing?.no_whatsapp_wali || '',
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);

  if (!cls || !isHomeroomOf(ws, cls.id)) {
    return (
      <Screen header={<ScreenHeader title="Data siswa" />}>
        <EmptyState icon="lock-closed-outline" title="Hanya untuk wali kelas" message="Data siswa dikelola oleh wali kelas masing-masing." />
      </Screen>
    );
  }

  const set = (k: keyof typeof v) => (t: any) => {
    setV((x) => ({ ...x, [k]: t }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const save = async () => {
    const e: Record<string, string> = {};
    if (v.nama.trim().length < 3) e.nama = 'Tulis nama lengkap siswa.';
    if (!/^\d{10}$/.test(v.nisn.trim())) e.nisn = 'NISN terdiri dari 10 angka.';
    if (!v.jk) e.jk = 'Pilih jenis kelamin.';
    if (v.wa && !/^(\+?62|0)8\d{7,12}$/.test(v.wa.replace(/[\s-]/g, ''))) e.wa = 'Gunakan nomor ponsel Indonesia, contoh 0812xxxxxxx.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy('save');
    try {
      await saveStudent({
        id: existing?.id,
        class_id: cls.id,
        nama_lengkap: v.nama.trim(),
        nisn: v.nisn.trim(),
        jenis_kelamin: v.jk!,
        nama_wali: v.wali.trim() || null,
        no_whatsapp_wali: v.wa.replace(/[\s-]/g, '') || null,
      });
      toast(existing ? 'Data siswa diperbarui.' : `${v.nama.trim()} ditambahkan ke ${cls.nama_kelas}.`);
      navigation.goBack();
    } catch (err: any) {
      toast(err?.message || 'Gagal menyimpan.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    const ok = await confirmDialog({
      title: `Hapus ${existing!.nama_lengkap}?`,
      message: 'Semua jurnal, rapor mapel, dan catatan wali kelas untuk siswa ini ikut terhapus dari semua guru. Tindakan ini tidak bisa dibatalkan.',
      confirmLabel: 'Hapus siswa',
      destructive: true,
    });
    if (!ok) return;
    setBusy('delete');
    try {
      await deleteStudent(existing!.id);
      toast('Siswa dihapus.');
      navigation.navigate('Homeroom', { classId: cls.id, tab: 'siswa' });
    } catch (err: any) {
      toast(err?.message || 'Gagal menghapus.', 'error');
      setBusy(null);
    }
  };

  return (
    <Screen
      header={<ScreenHeader title={existing ? 'Ubah data siswa' : 'Tambah siswa'} subtitle={cls.nama_kelas} />}
      footer={
        <View style={styles.footer}>
          {existing ? <Button label="Hapus" variant="ghost" fg={color.danger} icon="trash-outline" onPress={remove} loading={busy === 'delete'} /> : <View />}
          <Button label={existing ? 'Simpan perubahan' : 'Tambah siswa'} icon="checkmark" onPress={save} loading={busy === 'save'} />
        </View>
      }
    >
      <Card style={{ gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <AppText variant="heading">Data siswa</AppText>
        <TextField label="Nama lengkap" value={v.nama} onChangeText={set('nama')} error={errors.nama} autoCapitalize="words" />
        <TextField label="NISN" value={v.nisn} onChangeText={set('nisn')} error={errors.nisn} keyboardType="number-pad" maxLength={10} hint="10 angka sesuai Dapodik." />
        <View style={{ gap: 6 }}>
          <AppText variant="small" weight="semibold" tone={color.inkSoft}>
            Jenis kelamin
          </AppText>
          <View style={styles.row}>
            <Chip label="Laki-laki" selected={v.jk === 'L'} onPress={() => set('jk')('L')} />
            <Chip label="Perempuan" selected={v.jk === 'P'} onPress={() => set('jk')('P')} />
          </View>
          {errors.jk ? (
            <AppText variant="small" tone={color.danger}>
              {errors.jk}
            </AppText>
          ) : null}
        </View>
        <AppText variant="heading" style={{ marginTop: 8 }}>
          Kontak orang tua/wali
        </AppText>
        <AppText variant="caption" tone={color.mutedOnWhite}>
          Hanya terlihat oleh wali kelas. Dipakai untuk mengirim pesan rapor lewat WhatsApp.
        </AppText>
        <TextField label="Nama orang tua/wali" optional value={v.wali} onChangeText={set('wali')} autoCapitalize="words" />
        <TextField label="Nomor WhatsApp" optional value={v.wa} onChangeText={set('wa')} error={errors.wa} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
