import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Avatar, PressableScale } from '../components/ui';
import { useLayout } from '../lib/layout';
import { isReducedMotion } from '../lib/motion';
import { useAppStore } from '../store/useAppStore';
import { color, elevation, radius } from '../theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ITEMS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  Home: { label: 'Beranda', icon: 'home-outline', iconActive: 'home' },
  Journal: { label: 'Catat', icon: 'create-outline', iconActive: 'create' },
  Agenda: { label: 'Agenda', icon: 'calendar-outline', iconActive: 'calendar' },
  Assistant: { label: 'Asisten', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  Profile: { label: 'Profil', icon: 'person-circle-outline', iconActive: 'person-circle' },
};

// Ponsel & tablet: bar teal melayang dengan penanda putih yang bergeser ke tab
// aktif (pola dari referensi). Layar lebar (>= 1024): sidebar kiri berlabel.
export function TabBar(props: BottomTabBarProps) {
  const layout = useLayout();
  return layout.isExpanded ? <SideBar {...props} /> : <FloatingBar {...props} />;
}

function useBadges() {
  const pending = useAppStore((s) => s.pending.length);
  return { Profile: pending } as Record<string, number>;
}

function FloatingBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const badges = useBadges();
  const [barWidth, setBarWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const itemWidth = barWidth > 0 ? (barWidth - 12) / state.routes.length : 0;

  useEffect(() => {
    if (!itemWidth) return;
    const to = 6 + state.index * itemWidth;
    if (isReducedMotion()) x.setValue(to);
    else Animated.spring(x, { toValue: to, friction: 9, tension: 120, useNativeDriver: false }).start();
  }, [state.index, itemWidth, x]);

  return (
    <View style={[styles.floatWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View
        style={[styles.pill, elevation.floating, { maxWidth: layout.isCompact ? undefined : 560 }]}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        accessibilityRole="tablist"
      >
        {itemWidth ? <Animated.View style={[styles.indicator, { width: itemWidth, left: x }]} /> : null}
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const item = ITEMS[route.name];
          const badge = badges[route.name];
          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={badge ? `${item.label}, ${badge} menunggu` : item.label}
              focusRingColor="#FFFFFF"
              scaleTo={0.9}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
              }}
              style={styles.floatItem}
            >
              <View>
                <Ionicons name={focused ? item.iconActive : item.icon} size={22} color={focused ? color.brand : '#FFFFFF'} />
                {badge ? <View style={styles.dotBadge} /> : null}
              </View>
              <AppText variant="caption" weight={focused ? 'bold' : 'semibold'} tone={focused ? color.brandDeep : '#FFFFFF'} numberOfLines={1}>
                {item.label}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

function SideBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const ws = useAppStore((s) => s.ws);
  const badges = useBadges();
  return (
    <View style={[styles.side, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16 }]} accessibilityRole="tablist">
      {/* Logo belum ditetapkan pemilik produk: pakai nama produk sebagai wordmark teks (R-23). */}
      <View style={styles.brandRow}>
        <AppText variant="title" weight="extrabold" tone={color.brandDeep}>
          PenaGuru
        </AppText>
      </View>
      <View style={{ gap: 4, marginTop: 24 }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const item = ITEMS[route.name];
          const badge = badges[route.name];
          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={item.label}
              scaleTo={0.97}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name as never);
              }}
              style={[styles.sideItem, focused && { backgroundColor: color.brandSoft }]}
            >
              <Ionicons name={focused ? item.iconActive : item.icon} size={22} color={focused ? color.brandDeep : color.inkSoft} />
              <AppText variant="body" weight={focused ? 'bold' : 'semibold'} tone={focused ? color.brandDeep : color.inkSoft} style={{ flex: 1 }}>
                {item.label}
              </AppText>
              {badge ? (
                <View style={styles.sideBadge}>
                  <AppText variant="caption" weight="bold" tone={color.accentInk}>
                    {badge}
                  </AppText>
                </View>
              ) : null}
            </PressableScale>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      {ws ? (
        <View style={styles.sideUser}>
          <Avatar name={ws.teacher.nama_lengkap} size={40} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="small" weight="bold" numberOfLines={1}>
              {ws.teacher.nama_lengkap}
            </AppText>
            <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={1}>
              {ws.school?.nama || 'Belum ada sekolah'}
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  floatWrap: { backgroundColor: color.bg, paddingHorizontal: 12, paddingTop: 6 },
  pill: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
    backgroundColor: color.brand,
    borderRadius: radius.xl,
    padding: 6,
  },
  indicator: { position: 'absolute', top: 6, bottom: 6, backgroundColor: '#FFFFFF', borderRadius: radius.xl - 6 },
  floatItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 56, borderRadius: radius.xl - 6 },
  dotBadge: { position: 'absolute', top: -2, right: -4, width: 10, height: 10, borderRadius: 5, backgroundColor: color.accent, borderWidth: 2, borderColor: color.brand },
  side: { width: 256, backgroundColor: color.surface, borderRightWidth: 1, borderRightColor: color.line, paddingHorizontal: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8 },
  sideItem: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 12, borderRadius: radius.md },
  sideBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: color.accentSoft },
  sideUser: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: radius.md, backgroundColor: color.surfaceMuted },
});
