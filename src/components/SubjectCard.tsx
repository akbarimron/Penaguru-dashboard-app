import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { color, radius, subjectPalette } from '../theme/tokens';
import { Subject } from '../types';
import { AppText, PressableScale } from './ui';
import { resolveSubjectIcon } from '../lib/icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function subjectIcon(nama: string, customIcon?: string | null): IconName {
  return resolveSubjectIcon(nama, customIcon);
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
  const icon = resolveSubjectIcon(subject.nama, subject.icon);

  return (
    <View>
      <PressableScale
        onPress={onPress}
        accessibilityLabel={`${subject.nama}, kelas ${className}, ${studentCount} siswa${attention ? `, ${attention} perlu perhatian` : ''}. Buka dashboard mapel`}
        style={[styles.card, { backgroundColor: p.bg }]}
      >
        <View style={[styles.iconBox, { backgroundColor: p.iconBox, overflow: 'hidden' }]}>
          {subject.gambar ? (
            <Image
              source={{ uri: subject.gambar }}
              style={{ width: '100%', height: '100%', borderRadius: 14 }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name={icon} size={22} color={p.fg} />
          )}
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
