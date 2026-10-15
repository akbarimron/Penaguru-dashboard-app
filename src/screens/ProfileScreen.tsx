import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { AppText, Avatar, Button, Card, Divider, EnterView, IconButton, PressableScale, Screen, SectionHeader } from '../components/ui';
import { CustomAssetModal } from '../components/CustomAssetModal';
import { useLayout } from '../lib/layout';
import { assignmentLabel, myAssignments, myHomeroomClasses } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { confirmDialog, toast } from '../store/useUiStore';
import { color, radius, space, subjectPalette } from '../theme/tokens';
import { useSettingsStore } from '../store/useSettingsStore';

export function ProfileScreen({ navigation }: any) {
  const ws = useAppStore((s) => s.ws)!;
  const mode = useAppStore((s) => s.mode);
  const signOut = useAppStore((s) => s.signOut);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const updateTeacherProfile = useAppStore((s) => s.updateTeacherProfile);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const muteSound = useSettingsStore((s) => s.muteSound);
  const setMuteSound = useSettingsStore((s) => s.setMuteSound);
  const hapticFeedback = useSettingsStore((s) => s.hapticFeedback);
  const setHapticFeedback = useSettingsStore((s) => s.setHapticFeedback);
  const scheduleReminder = useSettingsStore((s) => s.scheduleReminder);
  const setScheduleReminder = useSettingsStore((s) => s.setScheduleReminder);
  const compactMode = useSettingsStore((s) => s.compactMode);
  const setCompactMode = useSettingsStore((s) => s.setCompactMode);
  const layout = useLayout();
  const homerooms = myHomeroomClasses(ws);
  const mine = myAssignments(ws);
  const isAdmin = ws.teacher.role === 'admin' || ws.teacher.email.toLowerCase().includes('admin');

  const logout = async () => {
    const ok = await confirmDialog({
      title: 'Keluar dari PenaGuru?',
      message: 'Anda perlu masuk lagi dengan email dan kata sandi untuk membuka data kelas.',
      confirmLabel: 'Keluar',
    });
    if (ok) await signOut();
  };

  const reset = async () => {
    const ok = await confirmDialog({
      title: 'Reset data demo?',
      message: 'Semua perubahan di mode demo (akun baru, jurnal, rapor) dihapus dari perangkat ini dan data contoh dibuat ulang.',
      confirmLabel: 'Reset data demo',
      destructive: true,
    });
    if (ok) {
      await resetDemo();
      toast('Data demo dibuat ulang.', 'info');
    }
  };

  const identity = (
    <EnterView>
      <Card style={styles.identity}>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Avatar name={ws.teacher.nama_lengkap} size={68} photoUrl={ws.teacher.foto_profil} />
          <Button
            label="Ubah Foto"
            icon="camera-outline"
            size="sm"
            variant="ghost"
            onPress={() => setPhotoModalOpen(true)}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <AppText variant="title" numberOfLines={2}>
            {ws.teacher.nama_lengkap}
          </AppText>
          <AppText variant="small" tone={color.mutedOnWhite} numberOfLines={1}>
            {ws.teacher.email}
          </AppText>
          <AppText variant="small" tone={color.mutedOnWhite}>
            {ws.teacher.nip ? `NIP ${ws.teacher.nip}` : 'NIP belum diisi'}
          </AppText>
        </View>
      </Card>
    </EnterView>
  );

  const adminCard = isAdmin ? (
    <EnterView index={1}>
      <Card style={{ backgroundColor: color.brandSoft, borderColor: color.brand, borderWidth: 1, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: color.brand, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="shield-checkmark" size={24} color="#FFF" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="body" weight="bold">Akses Administrator</AppText>
            <AppText variant="caption" tone={color.muted}>Kelola penuh sekolah, guru, kelas, siswa, jurnal 30 hari, mapel, & rapor</AppText>
          </View>
        </View>
        <Button
          label="Buka Dashboard Admin"
          icon="settings-outline"
          variant="primary"
          onPress={() => navigation.navigate('AdminDashboard')}
        />
      </Card>
    </EnterView>
  ) : null;

  const school = ws.school ? (
    <EnterView index={1}>
      <Card style={styles.row}>
        <Ionicons name="business-outline" size={22} color={color.brandDeep} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="body" weight="bold" numberOfLines={2}>
            {ws.school.nama}
          </AppText>
          <AppText variant="caption" tone={color.mutedOnWhite}>
            Kode gabung rekan guru: {ws.school.kode_gabung}
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
    </EnterView>
  ) : null;

  const roles = (
    <EnterView index={2}>
      <View style={{ gap: space.sm }}>
        <SectionHeader title="Peran Anda" action={<Button label="Kelola" size="sm" variant="ghost" onPress={() => navigation.navigate('ManageRoles')} />} />
        <Card padded={false}>
          {homerooms.map((c) => (
            <RoleRow
              key={c.id}
              icon="ribbon-outline"
              swatch={color.brand}
              title={`Wali kelas ${c.nama_kelas}`}
              detail="Meninjau jurnal dan rapor dari semua guru mapel"
              onPress={() => navigation.navigate('Homeroom', { classId: c.id })}
            />
          ))}
          {mine.map((a) => {
            const { subject, title } = assignmentLabel(ws, a);
            return (
              <RoleRow
                key={a.id}
                icon="book-outline"
                swatch={subject ? subjectPalette[subject.warna].bg : color.brand}
                title={title}
                detail={a.materi_aktif ? `Materi: ${a.materi_aktif}` : 'Guru mapel'}
                onPress={() => navigation.navigate('SubjectClass', { assignmentId: a.id })}
              />
            );
          })}
        </Card>
      </View>
    </EnterView>
  );

  const settingsCard = (
    <EnterView index={3}>
      <View style={{ gap: space.sm }}>
        <SectionHeader title="Pengaturan Aplikasi" />
        <Card style={{ gap: 14 }}>
          {/* Setting 1: Bisukan Efek Suara */}
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrap}>
              <Ionicons
                name={muteSound ? 'volume-mute-outline' : 'volume-high-outline'}
                size={20}
                color={muteSound ? color.muted : color.brand}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="body" weight="bold">
                Bisukan Efek Suara
              </AppText>
              <AppText variant="caption" tone={color.mutedOnWhite}>
                Menonaktifkan suara notifikasi dan interaksi aplikasi
              </AppText>
            </View>
            <Switch
              value={muteSound}
              onValueChange={setMuteSound}
              accessibilityLabel="Bisukan Efek Suara"
              trackColor={{ true: color.brand, false: '#CBD5E1' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Divider />

          {/* Setting 2: Pengingat Jadwal Mengajar */}
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrap}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={scheduleReminder ? color.brand : color.muted}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="body" weight="bold">
                Pengingat Jadwal Mengajar
              </AppText>
              <AppText variant="caption" tone={color.mutedOnWhite}>
                Pemberitahuan otomatis 15 menit sebelum kelas dimulai
              </AppText>
            </View>
            <Switch
              value={scheduleReminder}
              onValueChange={setScheduleReminder}
              accessibilityLabel="Pengingat Jadwal Mengajar"
              trackColor={{ true: color.brand, false: '#CBD5E1' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Divider />

          {/* Setting 3: Umpan Balik Getar */}
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrap}>
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color={hapticFeedback ? color.brand : color.muted}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="body" weight="bold">
                Umpan Balik Getar
              </AppText>
              <AppText variant="caption" tone={color.mutedOnWhite}>
                Getaran halus saat mencatat presensi atau aksi penting
              </AppText>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              accessibilityLabel="Umpan Balik Getar"
              trackColor={{ true: color.brand, false: '#CBD5E1' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Divider />

          {/* Setting 4: Tampilan Ringkas */}
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrap}>
              <Ionicons
                name="contract-outline"
                size={20}
                color={compactMode ? color.brand : color.muted}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="body" weight="bold">
                Tampilan Ringkas
              </AppText>
              <AppText variant="caption" tone={color.mutedOnWhite}>
                Kepadatan tinggi untuk menampilkan lebih banyak daftar siswa
              </AppText>
            </View>
            <Switch
              value={compactMode}
              onValueChange={setCompactMode}
              accessibilityLabel="Tampilan Ringkas"
              trackColor={{ true: color.brand, false: '#CBD5E1' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>
      </View>
    </EnterView>
  );

  const account = (
    <EnterView index={4}>
      <View style={{ gap: 10 }}>
        <Button label="Keluar" icon="log-out-outline" variant="secondary" onPress={logout} fullWidth />
        {mode === 'demo' ? <Button label="Reset data demo" icon="refresh" variant="ghost" fg={color.danger} onPress={reset} style={{ alignSelf: 'center' }} /> : null}
      </View>
    </EnterView>
  );

  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        Profil
      </AppText>
      {layout.twoPane ? (
        <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: space.lg }}>
            {identity}
            {adminCard}
            {school}
            {roles}
          </View>
          <View style={{ flex: 1, gap: space.lg }}>
            {settingsCard}
            {account}
          </View>
        </View>
      ) : (
        <>
          {identity}
          {adminCard}
          {school}
          {roles}
          {settingsCard}
          {account}
        </>
      )}

      <CustomAssetModal
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        targetType="profile"
        title="Foto Profil Guru"
        currentName={ws.teacher.nama_lengkap}
        initialImage={ws.teacher.foto_profil}
        onSave={async ({ image }) => {
          await updateTeacherProfile({ foto_profil: image });
        }}
      />
    </Screen>
  );
}

function RoleRow({ icon, swatch, title, detail, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; swatch: string; title: string; detail: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.985} style={styles.roleRow} accessibilityLabel={`${title}. ${detail}`}>
      <View style={[styles.roleIcon, { backgroundColor: swatch }]}>
        <Ionicons name={icon} size={18} color={swatch === subjectPalette.yellow.bg ? subjectPalette.yellow.fg : '#FFFFFF'} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="body" weight="bold" numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={1}>
          {detail}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={color.mutedOnWhite} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.md, paddingVertical: 12, minHeight: 60, borderBottomWidth: 1, borderBottomColor: color.line },
  roleIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: color.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
});
