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
  const animPuffY = useRef(new Animated.Value(0)).current;
  const animNibbyBreathe = useRef(new Animated.Value(1)).current;
  const animBukuWobble = useRef(new Animated.Value(0)).current;
  const animBlink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Star-Jelly Bounce Loop (Squash, Launch, Stretch, Land, Settle)
    const starHopLoop = Animated.loop(
      Animated.sequence([
        // Anticipation (Squash down)
        Animated.parallel([
          Animated.timing(animStarSquash, {
            toValue: 0.82,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animStarHop, {
            toValue: 4,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Launch up (Stretch)
        Animated.parallel([
          Animated.timing(animStarHop, {
            toValue: -26,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(animStarSquash, {
            toValue: 1.18,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        // Fall down (Prepare to hit floor)
        Animated.parallel([
          Animated.timing(animStarHop, {
            toValue: 0,
            duration: 340,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animStarSquash, {
            toValue: 0.8,
            duration: 340,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Impact squash & rebound settle
        Animated.sequence([
          Animated.timing(animStarSquash, {
            toValue: 1.1,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animStarSquash, {
            toValue: 1.0,
            duration: 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(600),
      ])
    );

    // 2. Puff Float Loop (Helium drifting hover)
    const puffFloatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animPuffY, {
          toValue: -14,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animPuffY, {
          toValue: 4,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Nibby Breathing Loop
    const nibbyBreatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animNibbyBreathe, {
          toValue: 1.035,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animNibbyBreathe, {
          toValue: 0.985,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Buku Wobble Loop
    const bukuWobbleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animBukuWobble, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animBukuWobble, {
          toValue: -1,
          duration: 1400,
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
    puffFloatLoop.start();
    nibbyBreatheLoop.start();
    bukuWobbleLoop.start();
    blinkLoop.start();

    return () => {
      starHopLoop.stop();
      puffFloatLoop.stop();
      nibbyBreatheLoop.stop();
      bukuWobbleLoop.stop();
      blinkLoop.stop();
    };
  }, []);

  const bukuRotate = animBukuWobble.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  return (
    <View style={[{ width: width as any, height, alignItems: 'center', justifyContent: 'center' }, style]}>
      {/* ------------------------------------------------------------- */}
      {/* WEB CSS KEYFRAMES: Disney-Grade Physics, Squash & Secondary Lag */}
      {/* ------------------------------------------------------------- */}
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes starJellyHop {
            0% { transform: translateY(0) scale(1, 1); }
            12% { transform: translateY(4px) scale(1.22, 0.78); } /* Anticipation squash */
            40% { transform: translateY(-28px) scale(0.85, 1.22); } /* Peak stretch */
            68% { transform: translateY(0) scale(1.24, 0.76); } /* Landing impact */
            82% { transform: translateY(-5px) scale(0.96, 1.05); } /* Rebound */
            100% { transform: translateY(0) scale(1, 1); }
          }
          @keyframes puffCloudHover {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            35% { transform: translateY(-12px) rotate(2deg); }
            70% { transform: translateY(-4px) rotate(-1.5deg); }
          }
          @keyframes nibbyBreathe {
            0%, 100% { transform: scaleY(1) scaleX(1); }
            50% { transform: scaleY(1.04) scaleX(0.98); }
          }
          @keyframes bukuJiggle {
            0%, 100% { transform: rotate(0deg) scale(1, 1); }
            25% { transform: rotate(-2.5deg) scale(1.03, 0.97); }
            75% { transform: rotate(2.5deg) scale(0.97, 1.03); }
          }
          @keyframes eyeBlink {
            0%, 94%, 98%, 100% { transform: scaleY(1); }
            96% { transform: scaleY(0.12); }
          }
          @keyframes starPinWiggle {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(18deg) scale(1.1); }
          }
          @keyframes bookmarkRibbonWiggle {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-15deg); }
          }
          .pg-star-hop {
            animation: starJellyHop 1.9s cubic-bezier(0.34, 1.3, 0.64, 1) infinite;
            transform-origin: 50% 100%;
          }
          .pg-puff-hover {
            animation: puffCloudHover 3.2s ease-in-out infinite;
          }
          .pg-nibby-breathe {
            animation: nibbyBreathe 2.8s ease-in-out infinite;
            transform-origin: 50% 100%;
          }
          .pg-buku-jiggle {
            animation: bukuJiggle 2.6s ease-in-out infinite;
            transform-origin: 50% 100%;
          }
          .pg-eye-blink {
            animation: eyeBlink 3.6s infinite;
            transform-origin: 50% 50%;
          }
          .pg-pin-wiggle {
            animation: starPinWiggle 2.8s ease-in-out infinite;
            transform-origin: 50% 100%;
          }
          .pg-ribbon-wiggle {
            animation: bookmarkRibbonWiggle 2.4s ease-in-out infinite;
            transform-origin: 0% 0%;
          }
        `}} />
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCENE STAGE (400 x 260 coordinate space)                      */}
      {/* ------------------------------------------------------------- */}
      <View style={styles.sceneContainer}>
        {/* Soft Stage Platform Glow under feet */}
        <View
          style={[
            styles.stagePodium,
            isDarkBg
              ? styles.stagePodiumDark
              : styles.stagePodiumLight,
          ]}
        />

        {/* ============================================================= */}
        {/* CHARACTER 1: "NIBBY" (Blue Pen-Nib Creature, Center-Left)     */}
        {/* ============================================================= */}
        <Animated.View
          style={[
            styles.charNibbyWrap,
            Platform.OS !== 'web' && {
              transform: [{ scaleY: animNibbyBreathe }],
            },
          ]}
          // @ts-ignore Web class
          className="pg-nibby-breathe"
        >
          <Svg width={140} height={210} viewBox="0 0 140 210">
            <Defs>
              <LinearGradient id="nibbyBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#38BDF8" />
                <Stop offset="50%" stopColor="#2563EB" />
                <Stop offset="100%" stopColor="#1D4ED8" />
              </LinearGradient>
            </Defs>

            {/* Squishy Feet */}
            <Ellipse cx={50} cy={202} rx={16} ry={7} fill="#1E40AF" />
            <Ellipse cx={90} cy={202} rx={16} ry={7} fill="#1E40AF" />

            {/* Main Pen-Nib Body (Smooth Teardrop Arch) */}
            <Path
              d="
                M 70 30
                C 85 55 125 110 125 160
                C 125 188 102 202 70 202
                C 38 202 15 188 15 160
                C 15 110 55 55 70 30
                Z
              "
              fill="url(#nibbyBodyGrad)"
              stroke={isDarkBg ? 'rgba(255, 255, 255, 0.4)' : '#1E40AF'}
              strokeWidth={2.5}
            />

            {/* Lavender Belly Patch */}
            <Path
              d="
                M 70 120
                C 85 120 102 140 102 170
                C 102 188 88 196 70 196
                C 52 196 38 188 38 170
                C 38 140 55 120 70 120
                Z
              "
              fill="#EEF2FF"
              opacity={0.92}
            />

            {/* Soft Rosy Cheeks */}
            <Circle cx={44} cy={138} r={7} fill="#FDA4AF" opacity={0.8} />
            <Circle cx={96} cy={138} r={7} fill="#FDA4AF" opacity={0.8} />

            {/* Large Anime/Cartoon Eyes */}
            <G className="pg-eye-blink">
              {/* Left Eye */}
              <Circle cx={52} cy={125} r={10} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
              <Circle cx={53.5} cy={125} r={5.5} fill="#0F172A" />
              <Circle cx={55.5} cy={122.5} r={2} fill="#FFFFFF" />
              <Circle cx={52} cy={127} r={1} fill="#FFFFFF" />

              {/* Right Eye */}
              <Circle cx={88} cy={125} r={10} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
              <Circle cx={89.5} cy={125} r={5.5} fill="#0F172A" />
              <Circle cx={91.5} cy={122.5} r={2} fill="#FFFFFF" />
              <Circle cx={88} cy={127} r={1} fill="#FFFFFF" />
            </G>

            {/* Sweet Happy Smile */}
            <Path
              d="M 64 140 Q 70 148 76 140"
              stroke="#0F172A"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />

            {/* Golden Star Headpin / Tassel (Wiggles with secondary motion) */}
            <G className="pg-pin-wiggle" transform="translate(70, 24)">
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
              transform: [{ rotate: bukuRotate }],
            },
          ]}
          // @ts-ignore Web class
          className="pg-buku-jiggle"
        >
          <Svg width={150} height={190} viewBox="0 0 150 190">
            <Defs>
              <LinearGradient id="bukuCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FB7185" />
                <Stop offset="100%" stopColor="#E11D48" />
              </LinearGradient>
            </Defs>

            {/* Cream Notebook Pages base */}
            <Rect x={20} y={160} width={105} height={18} rx={6} fill="#FEF3C7" stroke="#D97706" strokeWidth={1.5} />
            {/* Page line divisions */}
            <Line x1={25} y1={166} x2={120} y2={166} stroke="#FDE68A" strokeWidth={1.5} />
            <Line x1={25} y1={171} x2={120} y2={171} stroke="#FDE68A" strokeWidth={1.5} />

            {/* Main Chubby Squishy Book Body */}
            <Rect
              x={16}
              y={38}
              width={112}
              height={128}
              rx={28}
              fill="url(#bukuCoverGrad)"
              stroke={isDarkBg ? 'rgba(255, 255, 255, 0.45)' : '#BE123C'}
              strokeWidth={2.5}
            />

            {/* White Soft Spine Accent Band */}
            <Path
              d="M 28 38 L 28 166"
              stroke="#FFF1F2"
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.8}
            />

            {/* Bookmark Ribbon Tail dangling out top-right (wiggles) */}
            <G className="pg-ribbon-wiggle" transform="translate(102, 38)">
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
              <Circle cx={50} cy={92} r={17} fill="#FFFFFF" stroke="#0F172A" strokeWidth={3} />
              {/* Right Lens */}
              <Circle cx={94} cy={92} r={17} fill="#FFFFFF" stroke="#0F172A" strokeWidth={3} />
              {/* Bridge */}
              <Path d="M 67 90 Q 72 85 77 90" stroke="#0F172A" strokeWidth={3} fill="none" />
              {/* Frame arms extending to sides */}
              <Line x1={33} y1={92} x2={18} y2={88} stroke="#0F172A" strokeWidth={2.5} strokeLinecap="round" />
              <Line x1={111} y1={92} x2={126} y2={88} stroke="#0F172A" strokeWidth={2.5} strokeLinecap="round" />

              {/* Expressive Pupils behind glasses */}
              <G className="pg-eye-blink">
                <Circle cx={52} cy={93} r={7} fill="#0F172A" />
                <Circle cx={54.5} cy={90.5} r={2.5} fill="#FFFFFF" />

                <Circle cx={96} cy={93} r={7} fill="#0F172A" />
                <Circle cx={98.5} cy={90.5} r={2.5} fill="#FFFFFF" />
              </G>
            </G>

            {/* Cheeks */}
            <Circle cx={36} cy={114} r={6} fill="#FECDD3" opacity={0.8} />
            <Circle cx={108} cy={114} r={6} fill="#FECDD3" opacity={0.8} />

            {/* Cute Content Smile */}
            <Path
              d="M 64 116 Q 72 126 80 116"
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
          <Svg width={110} height={120} viewBox="0 0 110 120">
            <Defs>
              <LinearGradient id="starJellyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FDE047" />
                <Stop offset="50%" stopColor="#FBBF24" />
                <Stop offset="100%" stopColor="#F59E0B" />
              </LinearGradient>
            </Defs>

            {/* Tiny Golden Feet */}
            <Ellipse cx={38} cy={110} rx={10} ry={5} fill="#D97706" />
            <Ellipse cx={72} cy={110} rx={10} ry={5} fill="#D97706" />

            {/* Chubby 4-Point Star-Jelly Body */}
            <Path
              d="
                M 55 12
                C 62 26 70 34 84 38
                C 98 42 104 50 102 62
                C 100 74 88 80 82 92
                C 76 104 68 108 55 106
                C 42 108 34 104 28 92
                C 22 80 10 74 8 62
                C 6 50 12 42 26 38
                C 40 34 48 26 55 12
                Z
              "
              fill="url(#starJellyGrad)"
              stroke={isDarkBg ? '#FFFFFF' : '#D97706'}
              strokeWidth={2.5}
            />

            {/* Star Highlight Glow Crescent */}
            <Path
              d="M 32 35 C 44 26 64 25 76 33"
              stroke="#FEF08A"
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
              opacity={0.8}
            />

            {/* Big Enthusiastic Eyes */}
            <G className="pg-eye-blink">
              <Circle cx={42} cy={54} r={8} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.2} />
              <Circle cx={44} cy={54} r={4.5} fill="#0F172A" />
              <Circle cx={45.5} cy={52} r={1.6} fill="#FFFFFF" />

              <Circle cx={68} cy={54} r={8} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.2} />
              <Circle cx={70} cy={54} r={4.5} fill="#0F172A" />
              <Circle cx={71.5} cy={52} r={1.6} fill="#FFFFFF" />
            </G>

            {/* Rosy Cheeks */}
            <Circle cx={31} cy={64} r={5} fill="#FB923C" opacity={0.7} />
            <Circle cx={79} cy={64} r={5} fill="#FB923C" opacity={0.7} />

            {/* Laughing Open Mouth with pink tongue (:D) */}
            <Path
              d="M 46 66 C 46 78 64 78 64 66 Z"
              fill="#991B1B"
              stroke="#0F172A"
              strokeWidth={2}
            />
            {/* Tongue */}
            <Path
              d="M 50 74 C 54 70 56 70 60 74 Z"
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
          <Svg width={120} height={90} viewBox="0 0 120 90">
            <Defs>
              <LinearGradient id="puffCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#5EEAD4" />
                <Stop offset="100%" stopColor="#14B8A6" />
              </LinearGradient>
            </Defs>

            {/* Fluffy Mint Marshmallow Cloud Body */}
            <Path
              d="
                M 30 65
                C 15 65 10 50 18 38
                C 10 26 24 12 40 16
                C 50 4 72 4 82 14
                C 95 6 110 20 106 35
                C 118 45 112 65 98 68
                C 94 80 78 82 70 75
                C 60 84 42 82 34 72
                C 24 75 16 68 30 65
                Z
              "
              fill="url(#puffCloudGrad)"
              stroke={isDarkBg ? 'rgba(255, 255, 255, 0.7)' : '#0F766E'}
              strokeWidth={2.2}
            />

            {/* Blissful Curved Closed Eyes (^  ^) */}
            <Path
              d="M 42 42 Q 47 36 52 42"
              stroke="#0F172A"
              strokeWidth={2.6}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M 68 42 Q 73 36 78 42"
              stroke="#0F172A"
              strokeWidth={2.6}
              strokeLinecap="round"
              fill="none"
            />

            {/* Cheeks */}
            <Circle cx={38} cy={48} r={5} fill="#F472B6" opacity={0.65} />
            <Circle cx={82} cy={48} r={5} fill="#F472B6" opacity={0.65} />

            {/* Tiny Smile */}
            <Path
              d="M 57 48 Q 60 52 63 48"
              stroke="#0F172A"
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="none"
            />

            {/* Fairy Mini Pencil Companion hovering next to Puff */}
            <G transform="translate(94, 10) rotate(25)">
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
    width: 380,
    height: 250,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stagePodium: {
    position: 'absolute',
    bottom: 2,
    width: 340,
    height: 22,
    borderRadius: 22,
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
  },
  // Character 2: Buku (Coral Squishy Notebook, Center-Right)
  charBukuWrap: {
    position: 'absolute',
    right: 40,
    bottom: 12,
    zIndex: 8,
  },
  // Character 3: Star-Jelly (Energetic Golden Star, Front Center)
  charStarWrap: {
    position: 'absolute',
    left: 135,
    bottom: 8,
    zIndex: 25,
  },
  // Character 4: Puff (Dreamy Mint Cloud, Hovering Top-Right)
  charPuffWrap: {
    position: 'absolute',
    right: 20,
    top: 6,
    zIndex: 30,
  },
  sparkleTopLeft: {
    position: 'absolute',
    top: 25,
    left: 30,
    zIndex: 5,
  },
  sparkleBottomRight: {
    position: 'absolute',
    bottom: 40,
    right: 25,
    zIndex: 5,
  },
});
