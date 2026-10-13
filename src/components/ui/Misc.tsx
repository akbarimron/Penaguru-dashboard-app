import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { initials } from '../../lib/phone';
import { duration, easing, isReducedMotion, useEntrance } from '../../lib/motion';
import { color, radius, space, SubjectPalette } from '../../theme/tokens';
import { AppText } from './AppText';
import { Button } from './Button';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Avatar inisial. Sengaja tanpa foto: aplikasi tidak menyimpan foto siswa.
export function Avatar({ name, size = 40, palette }: { name: string; size?: number; palette?: SubjectPalette }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette ? palette.soft : color.brandSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AppText weight="bold" tone={palette ? palette.ink : color.brandDeep} style={{ fontSize: size * 0.36, lineHeight: size * 0.46 }}>
        {initials(name)}
      </AppText>
    </View>
  );
}

export function Card({ children, style, padded = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  return <View style={[styles.card, padded && { padding: space.md }, style]}>{children}</View>;
}

// Kartu yang masuk bertahap (enter 260ms, stagger 40ms).
export function EnterView({ index = 0, children, style }: { index?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const anim = useEntrance(index);
  return <Animated.View style={[anim, style]}>{children}</Animated.View>;
}

export function ProgressBar({ value, tint = color.brand, height = 8, label }: { value: number; tint?: string; height?: number; label: string }) {
  const progress = useRef(new Animated.Value(isReducedMotion() ? value : 0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: value, duration: duration.slow, easing: easing.standard, useNativeDriver: false }).start();
  }, [value, progress]);
  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
    >
      <Animated.View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: tint,
          width: progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' }),
        }}
      />
    </View>
  );
}

export function SectionHeader({ title, action, subtitle }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="small" tone={color.muted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function EmptyState({ icon, title, message, action }: { icon: IconName; title: string; message: string; action?: { label: string; onPress: () => void; icon?: IconName } }) {
  return (
    <View style={styles.state}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={26} color={color.brand} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText variant="small" tone={color.muted} align="center" style={{ maxWidth: 360 }}>
        {message}
      </AppText>
      {action ? <Button label={action.label} icon={action.icon} onPress={action.onPress} size="sm" variant="subtle" style={{ alignSelf: 'center', marginTop: 4 }} /> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.state, { backgroundColor: color.dangerSoft, borderColor: '#FECACA' }]} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={26} color={color.danger} />
      <AppText variant="heading" align="center" tone={color.danger}>
        Data belum bisa dimuat
      </AppText>
      <AppText variant="small" tone={color.inkSoft} align="center">
        {message}
      </AppText>
      {onRetry ? <Button label="Coba lagi" icon="refresh" size="sm" variant="secondary" onPress={onRetry} style={{ alignSelf: 'center' }} /> : null}
    </View>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <View style={[styles.state, { borderWidth: 0, backgroundColor: 'transparent' }]} accessibilityLiveRegion="polite">
      <ActivityIndicator color={color.brand} />
      <AppText variant="small" tone={color.muted} align="center">
        {label}
      </AppText>
    </View>
  );
}

// Grid yang menghitung lebar item dari lebar wadah, supaya kolom selalu pas
// tanpa luapan horizontal.
export function Grid({ columns, gap = 12, children }: { columns: number; gap?: number; children: React.ReactNode }) {
  const [width, setWidth] = useState(0);
  const items = React.Children.toArray(children);
  // Dibulatkan ke bawah agar pembulatan sub-piksel tidak membuat item terakhir turun baris.
  const itemWidth = width > 0 ? Math.floor((width - gap * (columns - 1)) / columns) - 0.5 : 0;
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}
    >
      {width > 0 ? items.map((child, i) => <View key={i} style={{ width: itemWidth }}>{child}</View>) : null}
    </View>
  );
}

// Blok tanggal berwarna, motif yang dipakai berulang di agenda.
export function DateBlock({ date, palette, size = 56 }: { date: Date; palette: SubjectPalette; size?: number }) {
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return (
    <View style={{ width: size, height: size, borderRadius: 14, backgroundColor: palette.bg, alignItems: 'center', justifyContent: 'center' }}>
      <AppText weight="extrabold" tone={palette.fg} style={{ fontSize: size * 0.36, lineHeight: size * 0.42 }}>
        {date.getDate()}
      </AppText>
      <AppText variant="caption" weight="bold" tone={palette.fg}>
        {bulan[date.getMonth()]}
      </AppText>
    </View>
  );
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: color.line }} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
  },
  track: { backgroundColor: '#E2E8F0', overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 2 },
  state: {
    alignItems: 'center',
    gap: 8,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: color.surface,
  },
  stateIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: color.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
