import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { AppText, Avatar, Button, Card, Divider, EnterView, IconButton, PressableScale, Screen, SectionHeader } from '../components/ui';
import { useLayout } from '../lib/layout';
import { assignmentLabel, myAssignments, myHomeroomClasses } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { confirmDialog, toast } from '../store/useUiStore';
import { color, radius, space, subjectPalette } from '../theme/tokens';

export function ProfileScreen({ navigation }: any) {
  const ws = useAppStore((s) => s.ws)!;
  const mode = useAppStore((s) => s.mode);
  const offline = useAppStore((s) => s.offline);
  const pending = useAppStore((s) => s.pending.length);
  const syncing = useAppStore((s) => s.syncing);
  const setOffline = useAppStore((s) => s.setOffline);
  const syncPending = useAppStore((s) => s.syncPending);
  const signOut = useAppStore((s) => s.signOut);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const layout = useLayout();
  const homerooms = myHomeroomClasses(ws);
  const mine = myAssignments(ws);

  const sync = async () => {
    try {
      const n = await syncPending();
      toast(`${n} catatan berhasil disinkronkan.`);
    } catch (e: any) {
      toast(e?.message || 'Sinkronisasi gagal. Data tetap aman di perangkat.', 'error');
    }
  };

  const logout = async () => {
    const ok = await confirmDialog({
      title: 'Keluar dari PenaGuru?',
      message: pending ? `${pending} catatan belum tersinkron dan tetap tersimpan di perangkat ini sampai Anda masuk lagi.` : 'Anda perlu masuk lagi untuk membuka data kelas.',
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
        <Avatar name={ws.teacher.nama_lengkap} size={64} />
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

  const syncCard = (
    <EnterView index={3}>
      <View style={{ gap: space.sm }}>
        <SectionHeader title="Penyimpanan & sinkron" />
        <Card style={{ gap: 14 }}>
          <View style={styles.row}>
            <Ionicons name={mode === 'demo' ? 'phone-portrait-outline' : 'cloud-outline'} size={22} color={color.brandDeep} />
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="bold">
                {mode === 'demo' ? 'Mode demo (lokal)' : 'Terhubung ke Supabase'}
              </AppText>
              <AppText variant="caption" tone={color.mutedOnWhite}>
                {mode === 'demo' ? 'Data contoh tersimpan di perangkat ini. Isi .env Supabase untuk memakai database sekolah.' : 'Data tersimpan di database dan dilindungi aturan akses per kelas.'}
              </AppText>
            </View>
          </View>
          <Divider />
          <View style={styles.row}>
            <Ionicons name="cloud-offline-outline" size={22} color={color.inkSoft} />
            <View style={{ flex: 1 }}>
              <AppText variant="body" weight="bold" nativeID="offline-label">
                Mode luring
              </AppText>
              <AppText variant="caption" tone={color.mutedOnWhite}>
                Jurnal disimpan di perangkat dulu, cocok saat sinyal lab lemah.
              </AppText>
            </View>
            <Switch
              value={offline}
              onValueChange={setOffline}
              accessibilityLabel="Mode luring"
              trackColor={{ true: color.brand, false: '#94A3B8' }}
              thumbColor="#FFFFFF"
              {...({ activeThumbColor: '#FFFFFF' } as any)}
            />
          </View>
          <View style={[styles.pending, pending ? { backgroundColor: color.accentSoft } : null]}>
            <Ionicons name={pending ? 'cloud-upload-outline' : 'checkmark-done'} size={18} color={pending ? color.accentInk : color.success} />
            <AppText variant="small" weight="semibold" tone={pending ? color.accentInk : color.success} style={{ flex: 1 }}>
              {pending ? `${pending} catatan menunggu sinkron` : 'Semua catatan sudah tersinkron'}
            </AppText>
            {pending ? <Button label="Sinkronkan" size="sm" icon="sync" onPress={sync} loading={syncing} /> : null}
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
            {school}
            {roles}
          </View>
          <View style={{ flex: 1, gap: space.lg }}>
            {syncCard}
            {account}
          </View>
        </View>
      ) : (
        <>
          {identity}
          {school}
          {roles}
          {syncCard}
          {account}
        </>
      )}
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
  pending: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: color.successSoft, flexWrap: 'wrap' },
});
