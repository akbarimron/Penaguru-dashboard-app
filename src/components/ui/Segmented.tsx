import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native';
import { duration, easing, isReducedMotion } from '../../lib/motion';
import { color, radius } from '../../theme/tokens';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface SegmentOption<K extends string> {
  key: K;
  label: string;
  badge?: number;
}

interface SegmentedProps<K extends string> {
  options: SegmentOption<NoInfer<K>>[];
  value: K;
  onChange: (key: NoInfer<K>) => void;
  accessibilityLabel: string;
}

// Kontrol segmen dengan penanda yang bergeser ke tab terpilih
// (menunjukkan asal dan tujuan perpindahan, 260ms).
export function Segmented<K extends string>({ options, value, onChange, accessibilityLabel }: SegmentedProps<K>) {
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const x = useRef(new Animated.Value(0)).current;
  const w = useRef(new Animated.Value(0)).current;
  const ready = useRef(false);

  useEffect(() => {
    const l = layouts[value];
    if (!l) return;
    if (!ready.current || isReducedMotion()) {
      x.setValue(l.x);
      w.setValue(l.width);
      ready.current = true;
      return;
    }
    Animated.parallel([
      Animated.timing(x, { toValue: l.x, duration: duration.standard, easing: easing.standard, useNativeDriver: false }),
      Animated.timing(w, { toValue: l.width, duration: duration.standard, easing: easing.standard, useNativeDriver: false }),
    ]).start();
  }, [value, layouts, x, w]);

  const onItemLayout = (key: string) => (e: LayoutChangeEvent) => {
    const { x: lx, width } = e.nativeEvent.layout;
    setLayouts((prev) => (prev[key]?.x === lx && prev[key]?.width === width ? prev : { ...prev, [key]: { x: lx, width } }));
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.track} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
        {layouts[value] ? <Animated.View style={[styles.indicator, { left: x, width: w }]} /> : null}
        {options.map((o) => {
          const active = o.key === value;
          return (
            <PressableScale
              key={o.key}
              onLayout={onItemLayout(o.key)}
              onPress={() => onChange(o.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={o.badge ? `${o.label}, ${o.badge}` : o.label}
              scaleTo={0.96}
              style={styles.item}
            >
              <AppText variant="small" weight={active ? 'bold' : 'semibold'} tone={active ? color.ink : color.muted} numberOfLines={1}>
                {o.label}
              </AppText>
              {o.badge ? (
                <View style={[styles.badge, active && { backgroundColor: color.brand }]}>
                  <AppText variant="caption" weight="bold" tone={active ? '#FFFFFF' : color.inkSoft} style={{ fontSize: 11, lineHeight: 14 }}>
                    {o.badge}
                  </AppText>
                </View>
              ) : null}
            </PressableScale>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: radius.md + 2,
    padding: 4,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: color.surface,
    borderRadius: radius.md - 2,
  },
  item: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: radius.md - 2,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
