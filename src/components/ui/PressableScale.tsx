import React, { useRef, useState } from 'react';
import { Animated, GestureResponderEvent, Insets, Platform, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { useKeyboardMode } from '../../lib/focus';
import { duration, easing, isReducedMotion, useNativeDriver } from '../../lib/motion';
import { color } from '../../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Outline hanya diatur di web. Bawaan browser dimatikan dan diganti cincin
// sendiri yang muncul saat navigasi keyboard, jadi fokus tetap terlihat.
export function focusStyle(visible: boolean, ringColor: string = color.brand): any {
  if (Platform.OS !== 'web') return null;
  return visible
    ? { outlineStyle: 'solid', outlineWidth: 2, outlineColor: ringColor, outlineOffset: 2 }
    : { outlineStyle: 'none' };
}

export interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  scaleTo?: number;
  focusRingColor?: string;
  hitSlop?: Insets | number;
}

// Semua elemen yang bisa diketuk memakai komponen ini:
// - mengecil ke 0.97 dalam 120ms saat ditekan, lalu memantul halus kembali
//   (umpan balik bahwa ketukan terbaca),
// - menampilkan cincin fokus 2px saat dinavigasi dengan keyboard (R-32).
export function PressableScale({
  style,
  pressedStyle,
  children,
  scaleTo = 0.97,
  focusRingColor = color.brand,
  disabled,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  accessibilityRole = 'button',
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const keyboardMode = useKeyboardMode();

  const handleIn = (e: GestureResponderEvent) => {
    setPressed(true);
    if (!isReducedMotion()) {
      Animated.timing(scale, { toValue: scaleTo, duration: duration.press, easing: easing.standard, useNativeDriver }).start();
    }
    onPressIn?.(e);
  };
  const handleOut = (e: GestureResponderEvent) => {
    setPressed(false);
    Animated.spring(scale, { toValue: 1, friction: 6, tension: 260, useNativeDriver }).start();
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: Boolean(disabled), ...(rest.accessibilityState || {}) }}
      disabled={disabled}
      onPressIn={handleIn}
      onPressOut={handleOut}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        style,
        pressed && pressedStyle,
        { transform: [{ scale }] },
        focusStyle(focused && keyboardMode, focusRingColor),
        disabled ? { opacity: 0.5 } : null,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}
