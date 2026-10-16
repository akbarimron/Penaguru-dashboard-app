import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';

export interface AnimatedDoodleCharactersProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  isDarkBg?: boolean;
}

/**
 * Animated Doodle Characters Mascot Troupe (Disney 12 Principles of Animation)
 * 100% Original "Cute Graphic Non-Human" educational mascots for PenaGuru:
 * 1. "Nibby" (Blue Pen-Nib Creature with Golden Star Pin)
 * 2. "Buku" (Coral Squishy Notebook with Round Spectacles & Bookmark Ribbon)
 * 3. "Star-Jelly" (Energetic Golden Star Bouncing with Squash & Stretch)
 * 4. "Puff" (Floating Mint Cloud with Blissful Dreamy Expression & Mini Pencil)
 *
 * Upgraded Motion Design (Web + Native Android/iOS parity):
 * - True volume-preserving Squash & Stretch (`scaleX` inversely coupled to `scaleY`, anchored at feet)
 * - Continuous ambient breathing / idle float so characters never freeze stiffly between hops
 * - Arcs & rotational tilt during jumps (`rotate` coupled with trajectory)
 * - Overlapping secondary action on accessories (Nibby's star pin, Buku's ribbon, Puff's fairy pencil)
 * - Interactive tap-to-boing response on every mascot!
 */
export function AnimatedDoodleCharacters({
  width = '100%',
  height = 260,
  style,
  isDarkBg = false,
}: AnimatedDoodleCharactersProps) {
  const useNative = Platform.OS !== 'web';

  // -------------------------------------------------------------
  // 1. STAR-JELLY ANIMATION VALUES (Energetic Bouncer)
  // -------------------------------------------------------------
  const starY = useRef(new Animated.Value(0)).current;
  const starScaleX = useRef(new Animated.Value(1)).current;
  const starScaleY = useRef(new Animated.Value(1)).current;
  const starTilt = useRef(new Animated.Value(0)).current;
  const starTapBounce = useRef(new Animated.Value(1)).current;

  // -------------------------------------------------------------
  // 2. NIBBY ANIMATION VALUES (Joyful Pen-Nib Mascot)
  // -------------------------------------------------------------
  const nibbyY = useRef(new Animated.Value(0)).current;
  const nibbyScaleX = useRef(new Animated.Value(1)).current;
  const nibbyScaleY = useRef(new Animated.Value(1)).current;
  const nibbyTilt = useRef(new Animated.Value(0)).current;
  const nibbyPinSwing = useRef(new Animated.Value(0)).current;
  const nibbyTapBounce = useRef(new Animated.Value(1)).current;

  // -------------------------------------------------------------
  // 3. BUKU ANIMATION VALUES (Squishy Notebook Companion)
  // -------------------------------------------------------------
  const bukuY = useRef(new Animated.Value(0)).current;
  const bukuScaleX = useRef(new Animated.Value(1)).current;
  const bukuScaleY = useRef(new Animated.Value(1)).current;
  const bukuTilt = useRef(new Animated.Value(0)).current;
  const bukuTapBounce = useRef(new Animated.Value(1)).current;

  // -------------------------------------------------------------
  // 4. PUFF CLOUD & SPARKLES (Figure-8 Floating & Twinkle)
  // -------------------------------------------------------------
  const puffY = useRef(new Animated.Value(0)).current;
  const puffX = useRef(new Animated.Value(0)).current;
  const puffTilt = useRef(new Animated.Value(0)).current;
  const puffTapBounce = useRef(new Animated.Value(1)).current;

  // Eyelid blink overlay & podium shadow pulse
  const blinkScaleY = useRef(new Animated.Value(0)).current;
  const podiumScaleX = useRef(new Animated.Value(1)).current;
  const sparklePulse = useRef(new Animated.Value(0.85)).current;

  // Interactive tap boing helper
  const triggerBoing = (val: Animated.Value) => {
    val.setValue(0.84);
    Animated.spring(val, {
      toValue: 1,
      friction: 3.5,
      tension: 210,
      useNativeDriver: useNative,
    }).start();
  };

  useEffect(() => {
    // =========================================================================
    // 1. STAR-JELLY CONTINUOUS ORGANIC LOOP (Hop -> Settle -> Happy Idle Sway)
    // =========================================================================
    const starLoop = Animated.loop(
      Animated.sequence([
        // Anticipation crouch (volume-preserving: wider X, shorter Y)
        Animated.parallel([
          Animated.timing(starY, {
            toValue: 5,
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleX, {
            toValue: 1.18,
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleY, {
            toValue: 0.82,
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(starTilt, {
            toValue: -0.5,
            duration: 180,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Launch upward into apex (stretch Y, narrow X)
        Animated.parallel([
          Animated.timing(starY, {
            toValue: -28,
            duration: 340,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleX, {
            toValue: 0.88,
            duration: 340,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleY, {
            toValue: 1.15,
            duration: 340,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.timing(starTilt, {
            toValue: -1,
            duration: 340,
            easing: Easing.out(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Fall & landing squash impact
        Animated.parallel([
          Animated.timing(starY, {
            toValue: 4,
            duration: 300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleX, {
            toValue: 1.2,
            duration: 300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleY, {
            toValue: 0.8,
            duration: 300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(starTilt, {
            toValue: 0.6,
            duration: 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Elastic rebound hop
        Animated.parallel([
          Animated.timing(starY, {
            toValue: -9,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleX, {
            toValue: 0.95,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleY, {
            toValue: 1.06,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(starTilt, {
            toValue: 0.3,
            duration: 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Soft settle into breathing idle (never freezes!)
        Animated.parallel([
          Animated.timing(starY, {
            toValue: 0,
            duration: 220,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleX, {
            toValue: 1,
            duration: 220,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleY, {
            toValue: 1,
            duration: 220,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starTilt, {
            toValue: 0,
            duration: 220,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Continuous cheering rhythm while Nibby & Buku hop (2 gentle pulses)
        Animated.parallel([
          Animated.timing(starY, {
            toValue: -4,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleX, {
            toValue: 1.04,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleY, {
            toValue: 0.96,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starTilt, {
            toValue: 0.4,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        Animated.parallel([
          Animated.timing(starY, {
            toValue: 0,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleX, {
            toValue: 0.98,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleY, {
            toValue: 1.02,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starTilt, {
            toValue: -0.3,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        Animated.parallel([
          Animated.timing(starY, {
            toValue: -3,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleX, {
            toValue: 1.03,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleY, {
            toValue: 0.97,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starTilt, {
            toValue: 0,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        Animated.parallel([
          Animated.timing(starY, {
            toValue: 0,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleX, {
            toValue: 1,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(starScaleY, {
            toValue: 1,
            duration: 440,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
      ])
    );

    // =========================================================================
    // 2. NIBBY CONTINUOUS ORGANIC LOOP (Breathing -> Anticipation -> Leap -> Settle)
    // =========================================================================
    const nibbyLoop = Animated.loop(
      Animated.sequence([
        // Gentle breathing while Star-Jelly jumps first
        Animated.parallel([
          Animated.timing(nibbyY, {
            toValue: -4,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleX, {
            toValue: 0.98,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleY, {
            toValue: 1.02,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyTilt, {
            toValue: -0.3,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyPinSwing, {
            toValue: -0.4,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        Animated.parallel([
          Animated.timing(nibbyY, {
            toValue: 0,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleX, {
            toValue: 1.02,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleY, {
            toValue: 0.98,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyTilt, {
            toValue: 0.2,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyPinSwing, {
            toValue: 0.3,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Anticipation crouch before Nibby's big jump
        Animated.parallel([
          Animated.timing(nibbyY, {
            toValue: 5,
            duration: 190,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleX, {
            toValue: 1.14,
            duration: 190,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleY, {
            toValue: 0.86,
            duration: 190,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyTilt, {
            toValue: -0.5,
            duration: 190,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyPinSwing, {
            toValue: -1,
            duration: 190,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
        ]),
        // Joyful leap upward!
        Animated.parallel([
          Animated.timing(nibbyY, {
            toValue: -26,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleX, {
            toValue: 0.9,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleY, {
            toValue: 1.13,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyTilt, {
            toValue: 0.9,
            duration: 380,
            easing: Easing.out(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyPinSwing, {
            toValue: 1.3,
            duration: 380,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: useNative,
          }),
        ]),
        // Landing impact squash
        Animated.parallel([
          Animated.timing(nibbyY, {
            toValue: 4,
            duration: 330,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleX, {
            toValue: 1.15,
            duration: 330,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleY, {
            toValue: 0.85,
            duration: 330,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyTilt, {
            toValue: -0.3,
            duration: 330,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyPinSwing, {
            toValue: -0.8,
            duration: 330,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Rebound hop
        Animated.parallel([
          Animated.timing(nibbyY, {
            toValue: -7,
            duration: 210,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleX, {
            toValue: 0.96,
            duration: 210,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleY, {
            toValue: 1.04,
            duration: 210,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyTilt, {
            toValue: 0.2,
            duration: 210,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyPinSwing, {
            toValue: 0.5,
            duration: 210,
            easing: Easing.out(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Smooth settle back to neutral
        Animated.parallel([
          Animated.timing(nibbyY, {
            toValue: 0,
            duration: 430,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleX, {
            toValue: 1,
            duration: 430,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleY, {
            toValue: 1,
            duration: 430,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyTilt, {
            toValue: 0,
            duration: 430,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyPinSwing, {
            toValue: 0,
            duration: 430,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Extra gentle breath at end of cycle
        Animated.parallel([
          Animated.timing(nibbyY, {
            toValue: -2,
            duration: 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleY, {
            toValue: 1.01,
            duration: 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        Animated.parallel([
          Animated.timing(nibbyY, {
            toValue: 0,
            duration: 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(nibbyScaleY, {
            toValue: 1,
            duration: 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
      ])
    );

    // =========================================================================
    // 3. BUKU CONTINUOUS ORGANIC LOOP (Rhythmic Sway + Squishy Hop)
    // =========================================================================
    const bukuLoop = Animated.loop(
      Animated.sequence([
        // Gentle curious sway left-right while others start
        Animated.parallel([
          Animated.timing(bukuY, {
            toValue: -3,
            duration: 560,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleX, {
            toValue: 1.03,
            duration: 560,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleY, {
            toValue: 0.97,
            duration: 560,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuTilt, {
            toValue: -0.45,
            duration: 560,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bukuY, {
            toValue: 0,
            duration: 560,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleX, {
            toValue: 0.98,
            duration: 560,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleY, {
            toValue: 1.02,
            duration: 560,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuTilt, {
            toValue: 0.35,
            duration: 560,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Anticipation squish before Buku's hop
        Animated.parallel([
          Animated.timing(bukuY, {
            toValue: 4,
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleX, {
            toValue: 1.13,
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleY, {
            toValue: 0.87,
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuTilt, {
            toValue: -0.6,
            duration: 180,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Joyful companion hop!
        Animated.parallel([
          Animated.timing(bukuY, {
            toValue: -18,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleX, {
            toValue: 0.92,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleY, {
            toValue: 1.09,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuTilt, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Squishy landing
        Animated.parallel([
          Animated.timing(bukuY, {
            toValue: 3,
            duration: 310,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleX, {
            toValue: 1.14,
            duration: 310,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleY, {
            toValue: 0.86,
            duration: 310,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuTilt, {
            toValue: -0.5,
            duration: 310,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        // Soft bounce & settle
        Animated.parallel([
          Animated.timing(bukuY, {
            toValue: -5,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleX, {
            toValue: 0.97,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleY, {
            toValue: 1.03,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuTilt, {
            toValue: 0.25,
            duration: 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bukuY, {
            toValue: 0,
            duration: 840,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleX, {
            toValue: 1,
            duration: 840,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuScaleY, {
            toValue: 1,
            duration: 840,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
          Animated.timing(bukuTilt, {
            toValue: 0,
            duration: 840,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: useNative,
          }),
        ]),
      ])
    );

    // =========================================================================
    // 4. PUFF CLOUD FIGURE-8 HOVER & SPARKLE TWINKLE
    // =========================================================================
    const puffYLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(puffY, {
          toValue: -14,
          duration: 1650,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(puffY, {
          toValue: 4,
          duration: 1650,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    const puffXLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(puffX, {
          toValue: -7,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(puffX, {
          toValue: 7,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    const puffTiltLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(puffTilt, {
          toValue: 1,
          duration: 1850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(puffTilt, {
          toValue: -1,
          duration: 1850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    // =========================================================================
    // 5. NATURAL DOUBLE/SINGLE EYE BLINK & PODIUM PULSE
    // =========================================================================
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(blinkScaleY, {
          toValue: 1,
          duration: 75,
          easing: Easing.out(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(blinkScaleY, {
          toValue: 0,
          duration: 85,
          easing: Easing.in(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.delay(1400),
        // Occasional quick double-blink for life-like charm!
        Animated.timing(blinkScaleY, {
          toValue: 1,
          duration: 70,
          easing: Easing.out(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(blinkScaleY, {
          toValue: 0,
          duration: 80,
          easing: Easing.in(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.delay(130),
        Animated.timing(blinkScaleY, {
          toValue: 1,
          duration: 70,
          easing: Easing.out(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(blinkScaleY, {
          toValue: 0,
          duration: 85,
          easing: Easing.in(Easing.quad),
          useNativeDriver: useNative,
        }),
      ])
    );

    const podiumLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(podiumScaleX, {
          toValue: 0.92,
          duration: 750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(podiumScaleX, {
          toValue: 1.06,
          duration: 750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparklePulse, {
          toValue: 1.25,
          duration: 950,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
        Animated.timing(sparklePulse, {
          toValue: 0.75,
          duration: 950,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: useNative,
        }),
      ])
    );

    starLoop.start();
    nibbyLoop.start();
    bukuLoop.start();
    puffYLoop.start();
    puffXLoop.start();
    puffTiltLoop.start();
    blinkLoop.start();
    podiumLoop.start();
    sparkleLoop.start();

    return () => {
      starLoop.stop();
      nibbyLoop.stop();
      bukuLoop.stop();
      puffYLoop.stop();
      puffXLoop.stop();
      puffTiltLoop.stop();
      blinkLoop.stop();
      podiumLoop.stop();
      sparkleLoop.stop();
    };
  }, [
    blinkScaleY,
    bukuScaleX,
    bukuScaleY,
    bukuTilt,
    bukuY,
    nibbyPinSwing,
    nibbyScaleX,
    nibbyScaleY,
    nibbyTilt,
    nibbyY,
    podiumScaleX,
    puffTilt,
    puffX,
    puffY,
    sparklePulse,
    starScaleX,
    starScaleY,
    starTilt,
    starY,
    useNative,
  ]);

  // Interpolated rotations & bottom-anchor compensation so squash happens on the floor
  const starRotate = starTilt.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });
  const starPivotCompY = starScaleY.interpolate({
    inputRange: [0.75, 1, 1.25],
    outputRange: [17, 0, -17],
  });

  const nibbyRotate = nibbyTilt.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-4.5deg', '4.5deg'],
  });
  const nibbyPivotCompY = nibbyScaleY.interpolate({
    inputRange: [0.8, 1, 1.2],
    outputRange: [24, 0, -24],
  });
  const nibbyPinRotate = nibbyPinSwing.interpolate({
    inputRange: [-1, 1.5],
    outputRange: ['-14deg', '22deg'],
  });

  const bukuRotate = bukuTilt.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });
  const bukuPivotCompY = bukuScaleY.interpolate({
    inputRange: [0.8, 1, 1.2],
    outputRange: [21, 0, -21],
  });

  const puffRotate = puffTilt.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-4deg', '4deg'],
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          alignItems: 'center',
          justifyContent: 'flex-end',
          overflow: 'visible',
        },
        style,
      ]}
    >
      {/* ------------------------------------------------------------- */}
      {/* SCENE STAGE (420 x 290 coordinate space, scaled responsively)  */}
      {/* ------------------------------------------------------------- */}
      <View
        style={[
          styles.sceneContainer,
          {
            transform: [{ scale: Math.min(1.15, height / 250) }],
            ...(Platform.OS === 'web' ? { transformOrigin: 'bottom center' } : {}),
          } as any,
        ]}
      >
        {/* Soft Stage Platform Glow under feet */}
        <Animated.View
          style={[
            styles.stagePodium,
            isDarkBg ? styles.stagePodiumDark : styles.stagePodiumLight,
            {
              transform: [{ scaleX: podiumScaleX }],
            },
          ]}
        />

        {/* ============================================================= */}
        {/* CHARACTER 1: "NIBBY" (Blue Pen-Nib Creature, Center-Left)     */}
        {/* ============================================================= */}
        <Animated.View
          style={[
            styles.charNibbyWrap,
            {
              transform: [
                { translateY: nibbyY },
                { translateY: nibbyPivotCompY },
                { rotate: nibbyRotate },
                { scaleX: nibbyScaleX },
                { scaleY: nibbyScaleY },
                { scale: nibbyTapBounce },
              ],
            },
          ]}
        >
          <Pressable
            onPress={() => triggerBoing(nibbyTapBounce)}
            accessibilityRole="imagebutton"
            accessibilityLabel="Maskot Nibby PenaGuru"
          >
            <Svg width={160} height={250} viewBox="0 0 160 250" style={{ overflow: 'visible' }}>
              <Defs>
                <LinearGradient id="nibbyBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#38BDF8" />
                  <Stop offset="50%" stopColor="#2563EB" />
                  <Stop offset="100%" stopColor="#1D4ED8" />
                </LinearGradient>
              </Defs>

              {/* Squishy Feet */}
              <Ellipse cx={60} cy={242} rx={16} ry={7} fill="#1E40AF" />
              <Ellipse cx={100} cy={242} rx={16} ry={7} fill="#1E40AF" />

              {/* Main Pen-Nib Body (Teardrop Arch with Ample Headroom) */}
              <Path
                d="
                  M 80 70
                  C 95 95 135 150 135 200
                  C 135 228 112 242 80 242
                  C 48 242 25 228 25 200
                  C 25 150 65 95 80 70
                  Z
                "
                fill="url(#nibbyBodyGrad)"
                stroke={isDarkBg ? 'rgba(255, 255, 255, 0.4)' : '#1E40AF'}
                strokeWidth={2.5}
              />

              {/* Lavender Belly Patch */}
              <Path
                d="
                  M 80 160
                  C 95 160 112 180 112 210
                  C 112 228 98 236 80 236
                  C 62 236 48 228 48 210
                  C 48 180 65 160 80 160
                  Z
                "
                fill="#EEF2FF"
                opacity={0.92}
              />

              {/* Soft Rosy Cheeks */}
              <Circle cx={54} cy={178} r={7} fill="#FDA4AF" opacity={0.8} />
              <Circle cx={106} cy={178} r={7} fill="#FDA4AF" opacity={0.8} />

              {/* Large Anime/Cartoon Eyes */}
              <G>
                {/* Left Eye */}
                <Circle cx={62} cy={165} r={10} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
                <Circle cx={63.5} cy={165} r={5.5} fill="#0F172A" />
                <Circle cx={65.5} cy={162.5} r={2} fill="#FFFFFF" />
                <Circle cx={62} cy={167} r={1} fill="#FFFFFF" />

                {/* Right Eye */}
                <Circle cx={98} cy={165} r={10} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
                <Circle cx={99.5} cy={165} r={5.5} fill="#0F172A" />
                <Circle cx={101.5} cy={162.5} r={2} fill="#FFFFFF" />
                <Circle cx={98} cy={167} r={1} fill="#FFFFFF" />
              </G>

              {/* Sweet Happy Smile */}
              <Path
                d="M 74 180 Q 80 188 86 180"
                stroke="#0F172A"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>

            {/* Secondary Motion Star Headpin Overlay (Swings with inertia on both Android & Web!) */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.nibbyPinOverlay,
                {
                  transform: [{ rotate: nibbyPinRotate }],
                },
              ]}
            >
              <Svg width={44} height={44} viewBox="-22 -22 44 44">
                <Polygon
                  points="0,-18 5,-6 18,-4 8,6 11,18 0,11 -11,18 -8,6 -18,-4 -5,-6"
                  fill="#F59E0B"
                  stroke="#B45309"
                  strokeWidth={1.5}
                />
                <Circle cx={0} cy={-2} r={3} fill="#FEF3C7" />
              </Svg>
            </Animated.View>

            {/* Natural Eyelid Blink Overlay for Nibby */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.nibbyBlinkLeft,
                { transform: [{ scaleY: blinkScaleY }] },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.nibbyBlinkRight,
                { transform: [{ scaleY: blinkScaleY }] },
              ]}
            />
          </Pressable>
        </Animated.View>

        {/* ============================================================= */}
        {/* CHARACTER 2: "BUKU" (Coral Squishy Notebook, Center-Right)   */}
        {/* ============================================================= */}
        <Animated.View
          style={[
            styles.charBukuWrap,
            {
              transform: [
                { translateY: bukuY },
                { translateY: bukuPivotCompY },
                { rotate: bukuRotate },
                { scaleX: bukuScaleX },
                { scaleY: bukuScaleY },
                { scale: bukuTapBounce },
              ],
            },
          ]}
        >
          <Pressable
            onPress={() => triggerBoing(bukuTapBounce)}
            accessibilityRole="imagebutton"
            accessibilityLabel="Maskot Buku PenaGuru"
          >
            <Svg width={170} height={220} viewBox="0 0 170 220" style={{ overflow: 'visible' }}>
              <Defs>
                <LinearGradient id="bukuCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FB7185" />
                  <Stop offset="100%" stopColor="#E11D48" />
                </LinearGradient>
              </Defs>

              {/* Cream Notebook Pages base */}
              <Rect x={30} y={185} width={105} height={18} rx={6} fill="#FEF3C7" stroke="#D97706" strokeWidth={1.5} />
              {/* Page line divisions */}
              <Line x1={35} y1={191} x2={130} y2={191} stroke="#FDE68A" strokeWidth={1.5} />
              <Line x1={35} y1={196} x2={130} y2={196} stroke="#FDE68A" strokeWidth={1.5} />

              {/* Main Chubby Squishy Book Body */}
              <Rect
                x={26}
                y={63}
                width={112}
                height={128}
                rx={28}
                fill="url(#bukuCoverGrad)"
                stroke={isDarkBg ? 'rgba(255, 255, 255, 0.45)' : '#BE123C'}
                strokeWidth={2.5}
              />

              {/* White Soft Spine Accent Band */}
              <Path
                d="M 38 63 L 38 191"
                stroke="#FFF1F2"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.8}
              />

              {/* Bookmark Ribbon Tail dangling out top-right */}
              <G transform="translate(112, 63)">
                <Path
                  d="M 0 0 C 8 -18 20 -12 24 -24 L 28 -22 C 22 -8 10 -10 2 6 Z"
                  fill="#818CF8"
                  stroke="#4F46E5"
                  strokeWidth={1.5}
                />
              </G>

              {/* Round Glasses Rims (Tortoiseshell/Navy style) */}
              <G id="glasses">
                {/* Left Lens */}
                <Circle cx={60} cy={117} r={17} fill="#FFFFFF" stroke="#0F172A" strokeWidth={3} />
                {/* Right Lens */}
                <Circle cx={104} cy={117} r={17} fill="#FFFFFF" stroke="#0F172A" strokeWidth={3} />
                {/* Bridge */}
                <Path d="M 77 115 Q 82 110 87 115" stroke="#0F172A" strokeWidth={3} fill="none" />
                {/* Frame arms extending to sides */}
                <Line x1={43} y1={117} x2={28} y2={113} stroke="#0F172A" strokeWidth={2.5} strokeLinecap="round" />
                <Line x1={121} y1={117} x2={136} y2={113} stroke="#0F172A" strokeWidth={2.5} strokeLinecap="round" />

                {/* Expressive Pupils behind glasses */}
                <G>
                  <Circle cx={62} cy={118} r={7} fill="#0F172A" />
                  <Circle cx={64.5} cy={115.5} r={2.5} fill="#FFFFFF" />

                  <Circle cx={106} cy={118} r={7} fill="#0F172A" />
                  <Circle cx={108.5} cy={115.5} r={2.5} fill="#FFFFFF" />
                </G>
              </G>

              {/* Cheeks */}
              <Circle cx={46} cy={139} r={6} fill="#FECDD3" opacity={0.8} />
              <Circle cx={118} cy={139} r={6} fill="#FECDD3" opacity={0.8} />

              {/* Cute Content Smile */}
              <Path
                d="M 74 141 Q 82 151 90 141"
                stroke="#0F172A"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>

            {/* Eyelid Blink Overlay for Buku */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.bukuBlinkLeft,
                { transform: [{ scaleY: blinkScaleY }] },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.bukuBlinkRight,
                { transform: [{ scaleY: blinkScaleY }] },
              ]}
            />
          </Pressable>
        </Animated.View>

        {/* ============================================================= */}
        {/* CHARACTER 3: "STAR-JELLY" (Energetic Golden Star, Front Center)*/}
        {/* ============================================================= */}
        <Animated.View
          style={[
            styles.charStarWrap,
            {
              transform: [
                { translateY: starY },
                { translateY: starPivotCompY },
                { rotate: starRotate },
                { scaleX: starScaleX },
                { scaleY: starScaleY },
                { scale: starTapBounce },
              ],
            },
          ]}
        >
          <Pressable
            onPress={() => triggerBoing(starTapBounce)}
            accessibilityRole="imagebutton"
            accessibilityLabel="Maskot Bintang PenaGuru"
          >
            <Svg width={140} height={140} viewBox="0 0 140 140" style={{ overflow: 'visible' }}>
              <Defs>
                <LinearGradient id="starJellyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FDE047" />
                  <Stop offset="50%" stopColor="#FBBF24" />
                  <Stop offset="100%" stopColor="#F59E0B" />
                </LinearGradient>
              </Defs>

              {/* Tiny Golden Feet */}
              <Ellipse cx={53} cy={126} rx={10} ry={5} fill="#D97706" />
              <Ellipse cx={87} cy={126} rx={10} ry={5} fill="#D97706" />

              {/* Chubby 4-Point Star-Jelly Body */}
              <Path
                d="
                  M 70 28
                  C 77 42 85 50 99 54
                  C 113 58 119 66 117 78
                  C 115 90 103 96 97 108
                  C 91 120 83 124 70 122
                  C 57 124 49 120 43 108
                  C 37 96 25 90 23 78
                  C 21 66 27 58 41 54
                  C 55 50 63 42 70 28
                  Z
                "
                fill="url(#starJellyGrad)"
                stroke={isDarkBg ? '#FFFFFF' : '#D97706'}
                strokeWidth={2.5}
              />

              {/* Star Highlight Glow Crescent */}
              <Path
                d="M 47 51 C 59 42 79 41 91 49"
                stroke="#FEF08A"
                strokeWidth={3.5}
                strokeLinecap="round"
                fill="none"
                opacity={0.8}
              />

              {/* Big Enthusiastic Eyes */}
              <G>
                <Circle cx={57} cy={70} r={8} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.2} />
                <Circle cx={59} cy={70} r={4.5} fill="#0F172A" />
                <Circle cx={60.5} cy={68} r={1.6} fill="#FFFFFF" />

                <Circle cx={83} cy={70} r={8} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.2} />
                <Circle cx={85} cy={70} r={4.5} fill="#0F172A" />
                <Circle cx={86.5} cy={68} r={1.6} fill="#FFFFFF" />
              </G>

              {/* Rosy Cheeks */}
              <Circle cx={46} cy={80} r={5} fill="#FB923C" opacity={0.7} />
              <Circle cx={94} cy={80} r={5} fill="#FB923C" opacity={0.7} />

              {/* Laughing Open Mouth with pink tongue (:D) */}
              <Path
                d="M 61 82 C 61 94 79 94 79 82 Z"
                fill="#991B1B"
                stroke="#0F172A"
                strokeWidth={2}
              />
              {/* Tongue */}
              <Path
                d="M 65 90 C 69 86 71 86 75 90 Z"
                fill="#F472B6"
              />
            </Svg>

            {/* Eyelid Blink Overlay for Star-Jelly */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.starBlinkLeft,
                { transform: [{ scaleY: blinkScaleY }] },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.starBlinkRight,
                { transform: [{ scaleY: blinkScaleY }] },
              ]}
            />
          </Pressable>
        </Animated.View>

        {/* ============================================================= */}
        {/* CHARACTER 4: "PUFF" (Dreamy Mint Cloud, Hovering Top-Right)    */}
        {/* ============================================================= */}
        <Animated.View
          style={[
            styles.charPuffWrap,
            {
              transform: [
                { translateX: puffX },
                { translateY: puffY },
                { rotate: puffRotate },
                { scale: puffTapBounce },
              ],
            },
          ]}
        >
          <Pressable
            onPress={() => triggerBoing(puffTapBounce)}
            accessibilityRole="imagebutton"
            accessibilityLabel="Maskot Awan PenaGuru"
          >
            <Svg width={130} height={105} viewBox="0 0 130 105" style={{ overflow: 'visible' }}>
              <Defs>
                <LinearGradient id="puffCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#5EEAD4" />
                  <Stop offset="100%" stopColor="#14B8A6" />
                </LinearGradient>
              </Defs>

              {/* Fluffy Mint Marshmallow Cloud Body */}
              <Path
                d="
                  M 35 77
                  C 20 77 15 62 23 50
                  C 15 38 29 24 45 28
                  C 55 16 77 16 87 26
                  C 100 18 115 32 111 47
                  C 123 57 117 77 103 80
                  C 99 92 83 94 75 87
                  C 65 96 47 94 39 84
                  C 29 87 21 80 35 77
                  Z
                "
                fill="url(#puffCloudGrad)"
                stroke={isDarkBg ? 'rgba(255, 255, 255, 0.7)' : '#0F766E'}
                strokeWidth={2.2}
              />

              {/* Blissful Curved Closed Eyes (^  ^) */}
              <Path
                d="M 47 54 Q 52 48 57 54"
                stroke="#0F172A"
                strokeWidth={2.6}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M 73 54 Q 78 48 83 54"
                stroke="#0F172A"
                strokeWidth={2.6}
                strokeLinecap="round"
                fill="none"
              />

              {/* Cheeks */}
              <Circle cx={43} cy={60} r={5} fill="#F472B6" opacity={0.65} />
              <Circle cx={87} cy={60} r={5} fill="#F472B6" opacity={0.65} />

              {/* Tiny Smile */}
              <Path
                d="M 62 60 Q 65 64 68 60"
                stroke="#0F172A"
                strokeWidth={2.2}
                strokeLinecap="round"
                fill="none"
              />

              {/* Fairy Mini Pencil Companion hovering next to Puff */}
              <G transform="translate(99, 22) rotate(25)">
                {/* Pencil Body */}
                <Rect x={0} y={0} width={8} height={20} rx={2} fill="#F59E0B" />
                {/* Eraser */}
                <Rect x={0} y={-5} width={8} height={5} rx={1.5} fill="#F472B6" />
                {/* Tip */}
                <Polygon points="0,20 8,20 4,26" fill="#FDE68A" />
                <Polygon points="2,23 6,23 4,26" fill="#1E293B" />
              </G>
            </Svg>
          </Pressable>
        </Animated.View>

        {/* ============================================================= */}
        {/* AMBIENT FLOATING SPARKLE STARS                                */}
        {/* ============================================================= */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sparkleTopLeft,
            { transform: [{ scale: sparklePulse }] },
          ]}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Polygon
              points="12,1 15,9 23,12 15,15 12,23 9,15 1,12 9,9"
              fill="#FDE047"
            />
          </Svg>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.sparkleBottomRight,
            { transform: [{ scale: sparklePulse }] },
          ]}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Polygon
              points="12,1 15,9 23,12 15,15 12,23 9,15 1,12 9,9"
              fill="#F472B6"
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sceneContainer: {
    width: 420,
    height: 290,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  stagePodium: {
    position: 'absolute',
    bottom: 2,
    width: 370,
    height: 24,
    borderRadius: 24,
  },
  stagePodiumDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  stagePodiumLight: {
    backgroundColor: '#0F172A',
    opacity: 0.06,
  },
  // Character 1: Nibby (Blue Pen-Nib Creature, Center-Left)
  charNibbyWrap: {
    position: 'absolute',
    left: 45,
    bottom: 12,
    zIndex: 10,
    overflow: 'visible',
  },
  nibbyPinOverlay: {
    position: 'absolute',
    left: 58,
    top: 42,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nibbyBlinkLeft: {
    position: 'absolute',
    left: 51,
    top: 154,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
  },
  nibbyBlinkRight: {
    position: 'absolute',
    left: 87,
    top: 154,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2563EB',
  },
  // Character 2: Buku (Coral Squishy Notebook, Center-Right)
  charBukuWrap: {
    position: 'absolute',
    right: 40,
    bottom: 12,
    zIndex: 8,
    overflow: 'visible',
  },
  bukuBlinkLeft: {
    position: 'absolute',
    left: 53,
    top: 109,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FB7185',
  },
  bukuBlinkRight: {
    position: 'absolute',
    left: 97,
    top: 109,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FB7185',
  },
  // Character 3: Star-Jelly (Energetic Golden Star, Front Center)
  charStarWrap: {
    position: 'absolute',
    left: 140,
    bottom: 8,
    zIndex: 25,
    overflow: 'visible',
  },
  starBlinkLeft: {
    position: 'absolute',
    left: 48,
    top: 61,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FBBF24',
  },
  starBlinkRight: {
    position: 'absolute',
    left: 74,
    top: 61,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FBBF24',
  },
  // Character 4: Puff (Dreamy Mint Cloud, Hovering Top-Right)
  charPuffWrap: {
    position: 'absolute',
    right: 22,
    top: 22,
    zIndex: 30,
    overflow: 'visible',
  },
  sparkleTopLeft: {
    position: 'absolute',
    top: 30,
    left: 30,
    zIndex: 5,
  },
  sparkleBottomRight: {
    position: 'absolute',
    bottom: 45,
    right: 30,
    zIndex: 5,
  },
});
