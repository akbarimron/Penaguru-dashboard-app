import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Polygon,
  Stop,
} from 'react-native-svg';

export interface MiniNibbyAvatarProps {
  size?: number;
  isThinking?: boolean;
  style?: ViewStyle;
}

/**
 * Mini Nibby AI Character Avatar / Icon
 * 100% original cute pen-nib head avatar for PenaGuru AI Assistant in Chat:
 * - Pen-nib teardrop arch with sky-to-royal blue gradient
 * - Golden star pin on the top tip with gleam highlight
 * - Cute googly cartoon eyes with sparkle
 * - Rosy peach blush cheeks & sweet smile
 * - Ambient star sparkle
 * - Gentle breathing / thinking pulse when isThinking is true
 */
export function MiniNibbyAvatar({
  size = 34,
  isThinking = false,
  style,
}: MiniNibbyAvatarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isThinking) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 650,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.96,
            duration: 650,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isThinking]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: pulseAnim }],
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Avatar Asisten Guru AI Nibby"
    >
      <Svg width={size} height={size} viewBox="0 0 44 44">
        <Defs>
          <LinearGradient id="miniNibbyBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#38BDF8" />
            <Stop offset="55%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#1D4ED8" />
          </LinearGradient>
          <LinearGradient id="miniAvatarBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#EFF6FF" />
            <Stop offset="100%" stopColor="#DBEAFE" />
          </LinearGradient>
        </Defs>

        {/* Circular Avatar Background with Subtle Border */}
        <Circle cx={22} cy={22} r={21} fill="url(#miniAvatarBgGrad)" stroke="#BFDBFE" strokeWidth={1.5} />

        {/* Ambient Top-Right Sparkle Star */}
        <Polygon
          points="35,6 36,9 39,10 36,11 35,14 34,11 31,10 34,9"
          fill="#FDE047"
        />

        {/* Tiny Ambient Sparkle Dot */}
        <Circle cx={8} cy={16} r={1.2} fill="#93C5FD" />

        {/* Main Pen-Nib Head (Teardrop Arch) */}
        <Path
          d="
            M 22 10
            C 27 16 34 23 34 29
            C 34 35 29 37 22 37
            C 15 37 10 35 10 29
            C 10 23 17 16 22 10
            Z
          "
          fill="url(#miniNibbyBodyGrad)"
          stroke="#1E40AF"
          strokeWidth={1.4}
        />

        {/* Soft Lavender Chin Patch */}
        <Path
          d="
            M 22 25
            C 26 25 29 28 29 32
            C 29 35 26 36 22 36
            C 18 36 15 35 15 32
            C 15 28 18 25 22 25
            Z
          "
          fill="#EEF2FF"
          opacity={0.95}
        />

        {/* Rosy Peach Blush Cheeks */}
        <Circle cx={14.5} cy={27.5} r={2.2} fill="#FDA4AF" opacity={0.85} />
        <Circle cx={29.5} cy={27.5} r={2.2} fill="#FDA4AF" opacity={0.85} />

        {/* Expressive Cartoon Anime Eyes */}
        <Circle cx={17} cy={23.5} r={3.2} fill="#FFFFFF" stroke="#0F172A" strokeWidth={1} />
        <Circle cx={17.5} cy={23.5} r={1.8} fill="#0F172A" />
        <Circle cx={18.2} cy={22.7} r={0.7} fill="#FFFFFF" />

        <Circle cx={27} cy={23.5} r={3.2} fill="#FFFFFF" stroke="#0F172A" strokeWidth={1} />
        <Circle cx={27.5} cy={23.5} r={1.8} fill="#0F172A" />
        <Circle cx={28.2} cy={22.7} r={0.7} fill="#FFFFFF" />

        {/* Sweet Content Smile */}
        <Path
          d="M 20.2 28.5 Q 22 30.5 23.8 28.5"
          stroke="#0F172A"
          strokeWidth={1.3}
          strokeLinecap="round"
          fill="none"
        />

        {/* Golden Star Headpin on Top Tip */}
        <Polygon
          points="22,3 23.2,6.5 27,7 24.2,9.6 25.1,13.2 22,11.2 18.9,13.2 19.8,9.6 17,7 20.8,6.5"
          fill="#F59E0B"
          stroke="#B45309"
          strokeWidth={0.9}
        />
        <Circle cx={22} cy={8.2} r={1.3} fill="#FEF3C7" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
