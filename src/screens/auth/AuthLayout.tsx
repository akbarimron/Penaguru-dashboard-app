import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, EnterView } from '../../components/ui';
import { useLayout } from '../../lib/layout';
import { color, radius, space } from '../../theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const POINTS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'create-outline', title: 'Guru mapel', text: 'Satu dashboard untuk tiap mapel di tiap kelas yang Anda ajar.' },
  { icon: 'people-outline', title: 'Wali kelas', text: 'Semua jurnal dan rapor mapel dari kelas perwalian terkumpul di satu tempat untuk ditinjau.' },
  { icon: 'lock-closed-outline', title: 'Data per kelas', text: 'Guru hanya melihat siswa di kelas yang ia ajar atau walikan.' },
];

// Kerangka layar masuk/daftar. Ponsel: satu kolom. Layar lebar: panel
// penjelasan teal di kiri + formulir di kanan.
export function AuthLayout({ title, subtitle, children, top }: { title: string; subtitle: string; children: React.ReactNode; top?: React.ReactNode }) {
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const wide = layout.width >= 900;

  const form = (
    <View style={{ width: '100%', maxWidth: 440, alignSelf: 'center', gap: space.lg }}>
      {top}
      {!wide ? (
        <AppText variant="title" weight="extrabold" tone={color.brandDeep}>
          PenaGuru
        </AppText>
      ) : null}
      <View style={{ gap: 6 }}>
        <AppText variant="display" accessibilityRole="header">
          {title}
        </AppText>
        <AppText tone={color.muted}>{subtitle}</AppText>
      </View>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: color.bg }}>
      <View style={{ flex: 1, flexDirection: wide ? 'row' : 'column' }}>
        {wide ? (
          <View style={[styles.panel, { paddingTop: insets.top + 48 }]}>
            <AppText variant="title" weight="extrabold" tone="#FFFFFF">
              PenaGuru
            </AppText>
            <AppText variant="display" tone="#FFFFFF" style={{ marginTop: 40, maxWidth: 420 }}>
              Catatan kelas yang rapi, dari jurnal harian sampai rapor.
            </AppText>
            <View style={{ gap: 14, marginTop: 32, maxWidth: 440 }}>
              {POINTS.map((p, i) => (
                <EnterView key={p.title} index={i}>
                  <View style={styles.point}>
                    <View style={styles.pointIcon}>
                      <Ionicons name={p.icon} size={20} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText weight="bold" tone="#FFFFFF">
                        {p.title}
                      </AppText>
                      <AppText variant="small" tone={color.onBrandSoft}>
                        {p.text}
                      </AppText>
                    </View>
                  </View>
                </EnterView>
              ))}
            </View>
          </View>
        ) : null}
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: wide ? 'center' : 'flex-start',
            paddingHorizontal: layout.gutter,
            paddingTop: insets.top + (wide ? 32 : 24),
            paddingBottom: insets.bottom + 32,
          }}
        >
          <EnterView>{form}</EnterView>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '42%',
    maxWidth: 560,
    backgroundColor: color.brand,
    paddingHorizontal: 48,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  point: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  pointIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
});
