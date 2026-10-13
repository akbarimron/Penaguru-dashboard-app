import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '../../lib/layout';
import { duration, easing, useNativeDriver } from '../../lib/motion';
import { useUiStore } from '../../store/useUiStore';
import { color, elevation, radius } from '../../theme/tokens';
import { AppText } from './AppText';

const ICON = { success: 'checkmark-circle', error: 'alert-circle', info: 'information-circle' } as const;
const TINT = { success: '#86EFAC', error: '#FCA5A5', info: '#93C5FD' } as const;

// Toast muncul dari bawah (enter 260ms, exit 180ms) di atas bar navigasi,
// diumumkan ke pembaca layar, hilang sendiri setelah 3,5 detik atau diketuk.
export function ToastHost() {
  const toast = useUiStore((s) => s.toast);
  const hide = useUiStore((s) => s.hideToast);
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: duration.standard, easing: easing.enter, useNativeDriver }).start();
    const t = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: duration.quick, easing: easing.exit, useNativeDriver }).start(() => hide());
    }, 3500);
    return () => clearTimeout(t);
  }, [toast, anim, hide]);

  if (!toast) return null;
  const bottom = (layout.isExpanded ? 24 : 104) + insets.bottom;
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { bottom, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
      ]}
    >
      <Pressable onPress={hide} accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.toast, elevation.floating]}>
        <Ionicons name={ICON[toast.tone]} size={20} color={TINT[toast.tone]} />
        <AppText variant="small" weight="semibold" tone="#FFFFFF" style={{ flex: 1 }}>
          {toast.message}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 520,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.md + 2,
    backgroundColor: color.ink,
  },
});
