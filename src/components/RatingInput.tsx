import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { RATING_LABELS } from '../lib/analytics';
import { isReducedMotion, useNativeDriver } from '../lib/motion';
import { color, radius } from '../theme/tokens';
import { AppText, PressableScale } from './ui';

interface RatingInputProps {
  label: string;
  description: string;
  value: number | null;
  onChange: (v: number) => void;
  error?: boolean;
}

// Skor 1-5 sebagai lima tombol 44px. Angka + keterangan teks dipakai
// (bukan bintang) supaya arti tiap skor jelas bagi semua guru.
export function RatingInput({ label, description, value, onChange, error }: RatingInputProps) {
  const pop = useRef([1, 2, 3, 4, 5].map(() => new Animated.Value(1))).current;

  const select = (v: number) => {
    onChange(v);
    if (isReducedMotion()) return;
    const a = pop[v - 1];
    a.setValue(0.85);
    Animated.spring(a, { toValue: 1, friction: 4, tension: 300, useNativeDriver }).start();
  };

  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <View style={styles.head}>
        <View style={{ flex: 1, minWidth: 140 }}>
          <AppText variant="body" weight="bold">
            {label}
          </AppText>
          <AppText variant="caption" tone={color.mutedOnWhite}>
            {description}
          </AppText>
        </View>
        <AppText variant="small" weight="bold" tone={value ? color.brand : error ? color.danger : color.mutedOnWhite}>
          {value ? RATING_LABELS[value - 1] : error ? 'Belum dipilih' : 'Pilih 1-5'}
        </AppText>
      </View>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((v) => {
          const active = value === v;
          const filled = value !== null && v <= value;
          return (
            <Animated.View key={v} style={{ flex: 1, transform: [{ scale: pop[v - 1] }] }}>
              <PressableScale
                onPress={() => select(v)}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                accessibilityLabel={`${v}, ${RATING_LABELS[v - 1]}`}
                scaleTo={0.92}
                style={[
                  styles.btn,
                  filled && { backgroundColor: active ? color.brand : color.brandSoft, borderColor: color.brand },
                  error && !value && { borderColor: color.danger },
                ]}
              >
                <AppText variant="body" weight="bold" tone={active ? '#FFFFFF' : filled ? color.brandDeep : color.inkSoft}>
                  {v}
                </AppText>
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  head: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' },
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: color.lineStrong,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
