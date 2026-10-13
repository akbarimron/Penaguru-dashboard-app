import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color, radius, subjectPalette } from '../theme/tokens';
import { Subject } from '../types';
import { AppText, PressableScale } from './ui';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function subjectIcon(nama: string): IconName {
  const n = nama.toLowerCase();
  if (n.includes('informatika') || n.includes('program') || n.includes('rpl')) return 'code-slash';
  if (n.includes('matematika')) return 'calculator';
  if (n.includes('indonesia')) return 'book';
  if (n.includes('inggris')) return 'language';
  if (n.includes('ipa') || n.includes('fisika') || n.includes('kimia') || n.includes('biologi')) return 'flask';
  if (n.includes('sejarah')) return 'time';
  if (n.includes('agama')) return 'moon';
  if (n.includes('olahraga') || n.includes('pjok')) return 'football';
  if (n.includes('seni') || n.includes('budaya')) return 'color-palette';
  return 'school';
}

interface SubjectCardProps {
  subject: Subject;
  className: string;
  studentCount: number;
  attention: number;
  onPress: () => void;
  notchColor?: string;
}

// Motif identitas PenaGuru: kartu mapel "bertakik". Takik di sisi kanan
// menampung penanda buka (panah), jadi takik itu sendiri adalah afordans
// "buka dashboard mapel ini". Diadaptasi dari gambar referensi.
export function SubjectCard({ subject, className, studentCount, attention, onPress, notchColor = color.bg }: SubjectCardProps) {
  const p = subjectPalette[subject.warna];
  return (
    <View>
      <PressableScale
        onPress={onPress}
        accessibilityLabel={`${subject.nama}, kelas ${className}, ${studentCount} siswa${attention ? `, ${attention} perlu perhatian` : ''}. Buka dashboard mapel`}
        style={[styles.card, { backgroundColor: p.bg }]}
      >
        <View style={[styles.iconBox, { backgroundColor: p.iconBox }]}>
          <Ionicons name={subjectIcon(subject.nama)} size={22} color={p.fg} />
        </View>
        <View style={{ flex: 1 }} />
        <AppText variant={subject.nama.length > 16 ? 'body' : 'heading'} weight="extrabold" tone={p.fg} numberOfLines={3}>
          {subject.nama}
        </AppText>
        <AppText variant="small" weight="bold" tone={p.fg} numberOfLines={1}>
          {className}
        </AppText>
        <View style={styles.meta}>
          <AppText variant="caption" tone={p.fg}>
            {studentCount} siswa
          </AppText>
          {attention > 0 ? (
            <View style={[styles.flag, { backgroundColor: p.fg === '#FFFFFF' ? 'rgba(255,255,255,0.92)' : 'rgba(61,46,0,0.9)' }]}>
              <Ionicons name="alert-circle" size={12} color={p.fg === '#FFFFFF' ? color.accentInk : '#FEF3C7'} />
              <AppText variant="caption" weight="bold" tone={p.fg === '#FFFFFF' ? color.accentInk : '#FEF3C7'}>
                {attention} perlu perhatian
              </AppText>
            </View>
          ) : null}
        </View>
      </PressableScale>
      <View pointerEvents="none" style={[styles.notch, { backgroundColor: notchColor }]}>
        <View style={styles.notchInner}>
          <Ionicons name="arrow-forward" size={14} color={color.ink} style={{ transform: [{ rotate: '-45deg' }] }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 184,
    borderRadius: radius.xl,
    padding: 16,
    gap: 4,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  flag: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  notch: {
    position: 'absolute',
    right: -12,
    top: 19,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notchInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
