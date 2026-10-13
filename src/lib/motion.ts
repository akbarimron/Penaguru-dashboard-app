import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform } from 'react-native';

// Identitas gerak PenaGuru (personality: Corporate, sedikit lentur saat ditekan).
// Setiap animasi punya tujuan UX:
// - press   : umpan balik sentuhan supaya guru yakin ketukannya terbaca.
// - enter   : kartu masuk dari bawah 12px agar urutan baca terlihat.
// - indicator: penanda tab/segmen bergeser untuk menunjukkan asal dan tujuan.
// - fill    : bilah progres terisi untuk menunjukkan angka itu dihitung.
// - shake   : form salah bergetar singkat supaya error tidak terlewat.
// Tidak ada animasi berulang tanpa pemicu. Bila pengguna menyalakan
// "kurangi gerakan", semua durasi menjadi 0.

export const duration = {
  press: 120,
  quick: 180,
  standard: 260,
  slow: 420,
};

export const easing = {
  // Material 3 standard, dipakai untuk 80% animasi.
  standard: Easing.bezier(0.2, 0, 0, 1),
  enter: Easing.bezier(0.05, 0.7, 0.1, 1),
  exit: Easing.bezier(0.3, 0, 1, 1),
};

export const useNativeDriver = Platform.OS !== 'web';

let reducedMotion = false;
AccessibilityInfo.isReduceMotionEnabled?.()
  .then((v) => {
    reducedMotion = Boolean(v);
  })
  .catch(() => undefined);
AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => {
  reducedMotion = Boolean(v);
});

export function isReducedMotion() {
  return reducedMotion;
}

export function useReducedMotion() {
  const [value, setValue] = useState(reducedMotion);
  useEffect(() => {
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setValue(Boolean(v)));
    return () => sub?.remove?.();
  }, []);
  return value;
}

// Masuk bertahap. Stagger dibatasi 6 item x 40ms = 240ms agar total < 500ms.
export function useEntrance(index = 0) {
  const progress = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  useEffect(() => {
    if (reducedMotion) return;
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: duration.standard,
      delay: Math.min(index, 6) * 40,
      easing: easing.enter,
      useNativeDriver,
    });
    anim.start();
    return () => anim.stop();
  }, [index, progress]);
  return {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  };
}

export function shake(value: Animated.Value) {
  if (reducedMotion) return;
  value.setValue(0);
  Animated.sequence(
    [10, -10, 7, -7, 0].map((toValue) =>
      Animated.timing(value, { toValue, duration: 64, easing: easing.standard, useNativeDriver })
    )
  ).start();
}
