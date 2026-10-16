import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { AppText } from './ui/AppText';

const LogoColorMark = require('../../assets/logo/penaguru-mark-color.png');

export interface AnimatedSplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
}

/**
 * AnimatedSplashScreen
 * Urutan animasi sesuai permintaan pengguna:
 * 1. Latar belakang putih bersih (#FFFFFF)
 * 2. Logo PenaGuru muncul dengan animasi organik (elastic spring scale + fade)
 * 3. Teks "PenaGuru" + subjudul muncul di bawah logo dengan animasi slide & fade
 * 4. Setelah aplikasi siap (fonts & boot state), transisi keluar halus ke halaman Login / Beranda
 */
export function AnimatedSplashScreen({ isReady, onFinish }: AnimatedSplashScreenProps) {
  const useNative = Platform.OS !== 'web';

  // Stage 1: Logo mark entrance
  const logoScale = useRef(new Animated.Value(0.35)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(18)).current;

  // Subtle ambient halo behind logo
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  // Stage 2: "PenaGuru" wordmark & subtitle entrance
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(12)).current;

  // Stage 3: Container exit fade + slight zoom
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;

  const [introComplete, setIntroComplete] = useState(false);
  const exitingRef = useRef(false);

  useEffect(() => {
    // Sequence:
    // 1. Logo mark pops in on white background (0ms - 560ms)
    // 2. "PenaGuru" text & tagline reveal smoothly (500ms - 1050ms)
    // 3. Hold briefly so brand mark & name register clearly (~450ms)
    const sequence = Animated.sequence([
      Animated.delay(80),
      // Step 1: Logo entrance with organic overshoot
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: useNative,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 85,
          useNativeDriver: useNative,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 460,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: useNative,
        }),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0.55,
            duration: 320,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(ringScale, {
            toValue: 1.15,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: useNative,
          }),
        ]),
      ]),

      // Step 2: Nudge logo slightly up as "PenaGuru" wordmark slides & fades in
      Animated.parallel([
        Animated.timing(logoTranslateY, {
          toValue: -6,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: useNative,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: useNative,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 90,
          useNativeDriver: useNative,
        }),
        Animated.sequence([
          Animated.delay(130),
          Animated.parallel([
            Animated.timing(taglineOpacity, {
              toValue: 1,
              duration: 340,
              easing: Easing.out(Easing.quad),
              useNativeDriver: useNative,
            }),
            Animated.timing(taglineTranslateY, {
              toValue: 0,
              duration: 340,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: useNative,
            }),
          ]),
        ]),
      ]),

      // Step 3: Brief hold for readability
      Animated.delay(480),
    ]);

    sequence.start(() => {
      setIntroComplete(true);
    });

    return () => {
      sequence.stop();
    };
  }, [
    logoOpacity,
    logoScale,
    logoTranslateY,
    ringOpacity,
    ringScale,
    taglineOpacity,
    taglineTranslateY,
    textOpacity,
    textTranslateY,
    useNative,
  ]);

  useEffect(() => {
    if (introComplete && isReady && !exitingRef.current) {
      exitingRef.current = true;
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 340,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: useNative,
        }),
        Animated.timing(containerScale, {
          toValue: 1.04,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: useNative,
        }),
      ]).start(() => {
        onFinish();
      });
    }
  }, [introComplete, isReady, containerOpacity, containerScale, onFinish, useNative]);

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        styles.overlay,
        {
          opacity: containerOpacity,
          transform: [{ scale: containerScale }],
        },
      ]}
    >
      <View style={styles.centerContent}>
        {/* Stage 1: Animated Logo Mark */}
        <View style={styles.logoStage}>
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.logoBox,
              {
                opacity: logoOpacity,
                transform: [
                  { translateY: logoTranslateY },
                  { scale: logoScale },
                ],
              },
            ]}
          >
            <Image
              source={LogoColorMark}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Stage 2: Animated "PenaGuru" Brand Name & Tagline */}
        <Animated.View
          style={[
            styles.wordmarkWrap,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <View style={styles.brandRow}>
            <AppText
              variant="display"
              weight="extrabold"
              tone="#0F172A"
              style={styles.brandTitle}
            >
              Pena
            </AppText>
            <AppText
              variant="display"
              weight="extrabold"
              tone="#2563EB"
              style={styles.brandTitle}
            >
              Guru
            </AppText>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.taglineWrap,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          <AppText
            variant="small"
            weight="semibold"
            tone="#64748B"
            align="center"
            style={styles.taglineText}
          >
            Ruang Kerja Cerdas Guru Indonesia
          </AppText>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoStage: {
    width: 136,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glowRing: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
  },
  logoBox: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 96,
    height: 96,
  },
  wordmarkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  taglineWrap: {
    marginTop: 6,
    alignItems: 'center',
  },
  taglineText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
