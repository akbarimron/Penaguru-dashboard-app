import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { color, radius, space } from '../../theme/tokens';
import { MiniNibbyAvatar } from './MiniNibbyAvatar';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Komponen Skeleton dasar dengan animasi denyut (pulse) halus.
 * Menggantikan indikator loading lingkaran putar (ActivityIndicator).
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton baris teks.
 */
export function SkeletonText({
  width = '100%',
  height = 14,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <Skeleton width={width} height={height} borderRadius={radius.sm} style={style} />;
}

/**
 * Skeleton gelembung chat AI saat asisten sedang berpikir atau menyusun jawaban.
 * Menampilkan avatar maskot dan baris-baris paragraf animasi shimmer.
 */
export function SkeletonChatBubble() {
  return (
    <View style={styles.chatSkeletonRow} accessibilityLiveRegion="polite">
      <View style={styles.avatarWrap}>
        <MiniNibbyAvatar size={34} isThinking={true} />
      </View>
      <View style={styles.chatBubble}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Skeleton width={120} height={12} borderRadius={radius.sm} />
          <Skeleton width={40} height={12} borderRadius={radius.sm} />
        </View>
        <View style={{ gap: 8 }}>
          <Skeleton width="96%" height={14} borderRadius={radius.sm} />
          <Skeleton width="88%" height={14} borderRadius={radius.sm} />
          <Skeleton width="72%" height={14} borderRadius={radius.sm} />
          <View style={{ height: 4 }} />
          <Skeleton width="92%" height={14} borderRadius={radius.sm} />
          <Skeleton width="60%" height={14} borderRadius={radius.sm} />
        </View>
        <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
          <Skeleton width={80} height={10} borderRadius={radius.sm} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton kartu untuk daftar siswa, jurnal, atau rapor.
 */
export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Skeleton width={38} height={38} borderRadius={radius.full} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="65%" height={16} />
          <Skeleton width="40%" height={12} />
        </View>
        <Skeleton width={50} height={24} borderRadius={radius.full} />
      </View>
      <View style={{ gap: 8, marginTop: 10 }}>
        <Skeleton width="95%" height={13} />
        <Skeleton width="80%" height={13} />
      </View>
    </View>
  );
}

/**
 * Skeleton tampilan penuh dashboard saat inisialisasi aplikasi (booting).
 */
export function SkeletonDashboard() {
  return (
    <View style={styles.dashboardContainer}>
      {/* Header Bar */}
      <View style={styles.dashboardHeader}>
        <View style={{ gap: 6, flex: 1 }}>
          <Skeleton width={180} height={24} />
          <Skeleton width={120} height={14} />
        </View>
        <Skeleton width={40} height={40} borderRadius={radius.full} />
      </View>

      {/* Chips Row */}
      <View style={styles.chipsRow}>
        <Skeleton width={100} height={34} borderRadius={radius.full} />
        <Skeleton width={120} height={34} borderRadius={radius.full} />
        <Skeleton width={90} height={34} borderRadius={radius.full} />
      </View>

      {/* Main Banner Card */}
      <View style={styles.heroCard}>
        <Skeleton width="45%" height={20} />
        <Skeleton width="80%" height={14} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <Skeleton width={110} height={36} borderRadius={radius.md} />
          <Skeleton width={110} height={36} borderRadius={radius.md} />
        </View>
      </View>

      {/* List Cards */}
      <View style={{ gap: 12, marginTop: 4 }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: color.lineStrong,
  },
  chatSkeletonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
    paddingVertical: 4,
  },
  avatarWrap: {
    marginTop: 2,
  },
  chatBubble: {
    flex: 1,
    maxWidth: 680,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.lg,
    borderTopLeftRadius: radius.sm,
    padding: space.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  card: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.lg,
    padding: space.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: color.bg,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    gap: space.md,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  heroCard: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
  },
});
