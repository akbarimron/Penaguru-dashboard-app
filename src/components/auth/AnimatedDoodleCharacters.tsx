import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, ViewStyle } from 'react-native';
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
 * Animated Doodle Characters Mascot Troupe
 * 100% Original "Cute Graphic Non-Human" educational mascots for PenaGuru:
 * 1. "Nibby" (Blue Pen-Nib Creature with Golden Star Pin)
 * 2. "Buku" (Coral Squishy Notebook with Round Spectacles & Bookmark Ribbon)
 * 3. "Star-Jelly" (Energetic Golden Star Bouncing with Squash & Stretch)
 * 4. "Puff" (Floating Mint Cloud with Blissful Dreamy Expression & Mini Pencil)
 *
 * Motion Design Principles applied:
 * - Volume-preserving squash and stretch (elastic bounce & landing impact)
 * - Secondary motion / lag on accessories (star pin, ribbon, glasses)
 * - Eye blinks with natural timing
 * - Anticipation wind-up before hops
 */
export function AnimatedDoodleCharacters({
  width = '100%',
  height = 260,
  style,
  isDarkBg = false,
}: AnimatedDoodleCharactersProps) {
  // -------------------------------------------------------------
  // REACT NATIVE ANIMATION HOOKS (Cross-platform fallback)
  // -------------------------------------------------------------
  const animStarHop = useRef(new Animated.Value(0)).current;
  const animStarSquash = useRef(new Animated.Value(1)).current;
  const animNibbyHop = useRef(new Animated.Value(0)).current;
  const animNibbySquash = useRef(new Animated.Value(1)).current;
  const animBukuHop = useRef(new Animated.Value(0)).current;
  const animBukuRotate = useRef(new Animated.Value(0)).current;
  const animPuffY = useRef(new Animated.Value(0)).current;
  const animBlink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Star-Jelly Bounce Loop (Squash, Launch, Stretch, Land, Settle) - Leads the dance (0 - 45%)
    const starHopLoop = Animated.loop(
      Animated.sequence([
        // Anticipation (Squash down)
        Animated.parallel([
          Animated.timing(animStarSquash, {
            toValue: 0.78,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animStarHop, {
            toValue: 4,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Launch up (Stretch)
        Animated.parallel([
          Animated.timing(animStarHop, {
            toValue: -32,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(animStarSquash, {
            toValue: 1.22,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        // Fall down (Prepare to hit floor)
        Animated.parallel([
          Animated.timing(animStarHop, {
            toValue: 0,
            duration: 320,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animStarSquash, {
            toValue: 0.76,
            duration: 320,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Impact squash & rebound settle
        Animated.sequence([
          Animated.parallel([
            Animated.timing(animStarHop, {
              toValue: -8,
              duration: 160,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(animStarSquash, {
              toValue: 1.06,
              duration: 160,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(animStarHop, {
              toValue: 0,
              duration: 180,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(animStarSquash, {
              toValue: 1.0,
              duration: 180,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Cheering rest while Nibby hops
        Animated.delay(1820),
      ])
    );

    // 2. Nibby Joyful Leap Loop (Staggered to follow Star-Jelly)
    const nibbyHopLoop = Animated.loop(
      Animated.sequence([
        // Wait for Star-Jelly
        Animated.delay(1050),
        // Anticipation crouch
        Animated.parallel([
          Animated.timing(animNibbySquash, {
            toValue: 0.86,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animNibbyHop, {
            toValue: 4,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Joyful leap!
        Animated.parallel([
          Animated.timing(animNibbyHop, {
            toValue: -28,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(animNibbySquash, {
            toValue: 1.15,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        // Land impact
        Animated.parallel([
          Animated.timing(animNibbyHop, {
            toValue: 0,
            duration: 360,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animNibbySquash, {
            toValue: 0.84,
            duration: 360,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Rebound & settle
        Animated.sequence([
          Animated.parallel([
            Animated.timing(animNibbyHop, {
              toValue: -6,
              duration: 180,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(animNibbySquash, {
              toValue: 1.04,
              duration: 180,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(animNibbyHop, {
              toValue: 0,
              duration: 200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(animNibbySquash, {
              toValue: 1.0,
              duration: 200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.delay(470),
      ])
    );

    // 3. Buku Companion Squish-Hop Loop
    const bukuHopLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(1250),
        Animated.parallel([
          Animated.timing(animBukuHop, {
            toValue: -16,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(animBukuRotate, {
            toValue: 1,
            duration: 360,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(animBukuHop, {
            toValue: 0,
            duration: 340,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animBukuRotate, {
            toValue: -1,
            duration: 340,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(animBukuRotate, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.delay(800),
      ])
    );

    // 4. Puff Float Loop (Helium drifting hover)
    const puffFloatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animPuffY, {
          toValue: -14,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animPuffY, {
          toValue: 4,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 5. Periodic Eye Blink (Every ~3.2s)
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(animBlink, {
          toValue: 0.1,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animBlink, {
          toValue: 1,
          duration: 90,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    starHopLoop.start();
    nibbyHopLoop.start();
    bukuHopLoop.start();
    puffFloatLoop.start();
    blinkLoop.start();

    return () => {
      starHopLoop.stop();
      nibbyHopLoop.stop();
      bukuHopLoop.stop();
      puffFloatLoop.stop();
      blinkLoop.stop();
    };
  }, []);

  const bukuRotate = animBukuRotate.interpolate({
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
      {/* WEB CSS KEYFRAMES: Disney-Grade Physics, Squash & Secondary Lag */}
      {/* ------------------------------------------------------------- */}
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes starJellyHop {
            0% { transform: translateY(0) scale(1, 1) rotate(0deg); }
            6% { transform: translateY(4px) scale(1.24, 0.76) rotate(0deg); } /* Anticipation squash */
            20% { transform: translateY(-34px) scale(0.86, 1.22) rotate(-5deg); } /* Peak stretch leap */
            32% { transform: translateY(0) scale(1.26, 0.74) rotate(0deg); } /* Landing impact squash */
            40% { transform: translateY(-10px) scale(0.94, 1.06) rotate(2deg); } /* Rebound hop */
            48% { transform: translateY(0) scale(1, 1) rotate(0deg); } /* Settle */
            68% { transform: translateY(-3px) scale(1.04, 0.96) rotate(-2deg); } /* Cheering wiggle while Nibby hops */
            84% { transform: translateY(0) scale(0.98, 1.02) rotate(2deg); }
            100% { transform: translateY(0) scale(1, 1) rotate(0deg); }
          }
          @keyframes nibbyHop {
            0%, 34% { transform: translateY(0) scale(1, 1) rotate(0deg); }
            40% { transform: translateY(4px) scale(1.14, 0.86) rotate(-1deg); } /* Anticipation windup */
            54% { transform: translateY(-30px) scale(0.90, 1.16) rotate(3deg); } /* Big joyful jump! */
            68% { transform: translateY(0) scale(1.16, 0.84) rotate(0deg); } /* Impact squash */
            78% { transform: translateY(-8px) scale(0.96, 1.04) rotate(-1deg); } /* Rebound */
            88% { transform: translateY(0) scale(1.02, 0.98) rotate(0deg); } /* Settle */
            100% { transform: translateY(0) scale(1, 1) rotate(0deg); }
          }
          @keyframes bukuSquishHop {
            0%, 42% { transform: translateY(0) scale(1, 1) rotate(0deg); }
            48% { transform: translateY(3px) scale(1.12, 0.88) rotate(-2deg); } /* Anticipation */
            60% { transform: translateY(-18px) scale(0.92, 1.10) rotate(4deg); } /* Companion hop */
            72% { transform: translateY(0) scale(1.15, 0.85) rotate(0deg); } /* Squishy land */
            82% { transform: translateY(-5px) scale(0.97, 1.03) rotate(-1deg); } /* Soft bounce */
            92% { transform: translateY(0) scale(1, 1) rotate(0deg); }
            100% { transform: translateY(0) scale(1, 1) rotate(0deg); }
          }
          @keyframes puffCloudHover {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-14px) rotate(2.5deg); }
            50% { transform: translateY(-5px) rotate(-1deg); }
            75% { transform: translateY(-16px) rotate(-2.5deg); }
          }
          @keyframes podiumPulse {
            0%, 100% { transform: scaleX(1); opacity: 0.18; }
            20% { transform: scaleX(0.85); opacity: 0.10; } /* Star in air */
            32% { transform: scaleX(1.10); opacity: 0.28; } /* Star lands impact */
            54% { transform: scaleX(0.82); opacity: 0.10; } /* Nibby in air */
            68% { transform: scaleX(1.12); opacity: 0.30; } /* Nibby lands impact */
          }
          @keyframes eyeBlink {
            0%, 94%, 98%, 100% { transform: scaleY(1); }
            96% { transform: scaleY(0.12); }
          }
          @keyframes starPinWiggle {
            0%, 35%, 100% { transform: rotate(0deg); }
            40% { transform: rotate(-12deg); }
            54% { transform: rotate(24deg) scale(1.15); } /* Secondary inertia during leap */
            68% { transform: rotate(-10deg); }
            78% { transform: rotate(4deg); }
          }
          @keyframes bookmarkRibbonWiggle {
            0%, 42%, 100% { transform: rotate(0deg); }
            48% { transform: rotate(14deg); }
            60% { transform: rotate(-22deg) scale(1.08); } /* Flutters with hop */
            72% { transform: rotate(8deg); }
            82% { transform: rotate(-4deg); }
          }
          .pg-star-hop {
            animation: starJellyHop 3s cubic-bezier(0.34, 1.3, 0.64, 1) infinite;
            transform-origin: 50% 100%;
          }
          .pg-nibby-hop {
            animation: nibbyHop 3s cubic-bezier(0.34, 1.3, 0.64, 1) infinite;
            transform-origin: 50% 100%;
          }
          .pg-buku-hop {
            animation: bukuSquishHop 3s cubic-bezier(0.34, 1.3, 0.64, 1) infinite;
            transform-origin: 50% 100%;
          }
          .pg-puff-hover {
            animation: puffCloudHover 3.6s ease-in-out infinite;
            transform-origin: 50% 50%;
          }
          .pg-podium-pulse {
            animation: podiumPulse 3s ease-out infinite;
            transform-origin: 50% 50%;
          }
          .pg-eye-blink {
            animation: eyeBlink 3.6s infinite;
            transform-origin: 50% 50%;
          }
          .pg-pin-wiggle {
            animation: starPinWiggle 3s ease-in-out infinite;
            transform-origin: 50% 100%;
          }
          .pg-ribbon-wiggle {
            animation: bookmarkRibbonWiggle 3s ease-in-out infinite;
            transform-origin: 0% 0%;
          }
        `}} />
      )}

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
            isDarkBg
              ? styles.stagePodiumDark
              : styles.stagePodiumLight,
          ]}
          // @ts-ignore Web class
          className="pg-podium-pulse"
        />

        {/* ============================================================= */}
        {/* CHARACTER 1: "NIBBY" (Blue Pen-Nib Creature, Center-Left)     */}
        {/* ============================================================= */}
        <Animated.View
          style={[
            styles.charNibbyWrap,
            Platform.OS !== 'web' && {
              transform: [
                { translateY: animNibbyHop },
                { scaleY: animNibbySquash },
              ],
            },
          ]}
          // @ts-ignore Web class
          className="pg-nibby-hop"
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
            <G className="pg-eye-blink">
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

            {/* Golden Star Headpin / Tassel (Wiggles with secondary motion, 46px headroom) */}
            <G className="pg-pin-wiggle" transform="translate(80, 64)">
              <Polygon
                points="0,-18 5,-6 18,-4 8,6 11,18 0,11 -11,18 -8,6 -18,-4 -5,-6"
                fill="#F59E0B"
                stroke="#B45309"
                strokeWidth={1.5}
              />
              <Circle cx={0} cy={-2} r={3} fill="#FEF3C7" />
            </G>
          </Svg>
        </Animated.View>

        {/* ============================================================= */}
        {/* CHARACTER 2: "BUKU" (Coral Squishy Notebook, Center-Right)   */}
        {/* ============================================================= */}
        <Animated.View
          style={[
            styles.charBukuWrap,
            Platform.OS !== 'web' && {
              transform: [
                { translateY: animBukuHop },
                { rotate: bukuRotate },
              ],
            },
          ]}
          // @ts-ignore Web class
          className="pg-buku-hop"
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

            {/* Bookmark Ribbon Tail dangling out top-right (wiggles, 39px headroom) */}
            <G className="pg-ribbon-wiggle" transform="translate(112, 63)">
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
              <G className="pg-eye-blink">
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
        </Animated.View>

        {/* ============================================================= */}
        {/* CHARACTER 3: "STAR-JELLY" (Energetic Golden Star, Front Center)*/}
        {/* ============================================================= */}
        <Animated.View
          style={[
            styles.charStarWrap,
            Platform.OS !== 'web' && {
              transform: [
                { translateY: animStarHop },
                { scaleY: animStarSquash },
              ],
            },
          ]}
          // @ts-ignore Web class
          className="pg-star-hop"
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
            <G className="pg-eye-blink">
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
        </Animated.View>

        {/* ============================================================= */}
        {/* CHARACTER 4: "PUFF" (Dreamy Mint Cloud, Hovering Top-Right)    */}
        {/* ============================================================= */}
        <Animated.View
          style={[
            styles.charPuffWrap,
            Platform.OS !== 'web' && {
              transform: [{ translateY: animPuffY }],
            },
          ]}
          // @ts-ignore Web class
          className="pg-puff-hover"
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
        </Animated.View>

        {/* ============================================================= */}
        {/* AMBIENT FLOATING SPARKLE STARS                                */}
        {/* ============================================================= */}
        <View style={styles.sparkleTopLeft}>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Polygon
              points="12,1 15,9 23,12 15,15 12,23 9,15 1,12 9,9"
              fill="#FDE047"
            />
          </Svg>
        </View>

        <View style={styles.sparkleBottomRight}>
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Polygon
              points="12,1 15,9 23,12 15,15 12,23 9,15 1,12 9,9"
              fill="#F472B6"
            />
          </Svg>
        </View>
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
  // Character 2: Buku (Coral Squishy Notebook, Center-Right)
  charBukuWrap: {
    position: 'absolute',
    right: 40,
    bottom: 12,
    zIndex: 8,
    overflow: 'visible',
  },
  // Character 3: Star-Jelly (Energetic Golden Star, Front Center)
  charStarWrap: {
    position: 'absolute',
    left: 140,
    bottom: 8,
    zIndex: 25,
    overflow: 'visible',
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
