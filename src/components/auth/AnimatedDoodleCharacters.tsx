import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  Polygon,
  Rect,
} from 'react-native-svg';

export interface AnimatedDoodleCharactersProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  isDarkBg?: boolean;
}

/**
 * Animated Doodle Characters Mascot Troupe
 * Inspired by modern flat whimsical geometric character illustration (Duolingo / Headspace / Miro style)
 * Follows /motion-design guidelines:
 * - Playful archetype (bouncy, floaty, lively, joyful)
 * - Three motion layers:
 *   1. Primary: Staggered bobbing/floating loops for each of the 4 characters
 *   2. Secondary: Squash & stretch on hop, cyclops eye gaze shift, tilt sways
 *   3. Ambient: Sparkle star twinkles
 */
export function AnimatedDoodleCharacters({
  width = '100%',
  height = 240,
  style,
  isDarkBg = false,
}: AnimatedDoodleCharactersProps) {
  // -------------------------------------------------------------
  // ANIMATION DRIVERS (Staggered independent loops for natural life)
  // -------------------------------------------------------------
  // Character 1: Pink Toothy Pill (Floating & gentle tilt)
  const animPillY = useRef(new Animated.Value(0)).current;
  const animPillRot = useRef(new Animated.Value(0)).current;

  // Character 2: Big Pink Arch (Breathing scale & cyclops eye look)
  const animArchScale = useRef(new Animated.Value(1)).current;
  const animArchEyeX = useRef(new Animated.Value(0)).current;

  // Character 3: Mint Fluffy Cloud (Airy float)
  const animCloudY = useRef(new Animated.Value(0)).current;

  // Character 4: Blue Ball Student (Excited spring hop & squash)
  const animBlueHopY = useRef(new Animated.Value(0)).current;
  const animBlueSquash = useRef(new Animated.Value(1)).current;

  // Ambient Twinkle
  const animSparkle = useRef(new Animated.Value(0.4)).current;
  const animSparkleRot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Pink Pill: Floating oscillation (2.8s cycle)
    const pillFloatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animPillY, {
          toValue: -9,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animPillY, {
          toValue: 6,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Pink Pill: Subtle tilt sway (3.2s cycle)
    const pillTiltLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animPillRot, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animPillRot, {
          toValue: -1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Big Pink Arch: Gentle breathing scale (3.4s cycle)
    const archBreathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animArchScale, {
          toValue: 1.035,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animArchScale, {
          toValue: 0.985,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Arch Cyclops Eye: Gaze looking around (4.0s cycle)
    const archEyeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animArchEyeX, {
          toValue: 4,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(600),
        Animated.timing(animArchEyeX, {
          toValue: -3,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(400),
        Animated.timing(animArchEyeX, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Mint Fluffy Cloud: Gentle airy bob (2.2s cycle)
    const cloudBobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animCloudY, {
          toValue: -12,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animCloudY, {
          toValue: 3,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Blue Ball Student: Energetic spring hop (1.8s cycle)
    const blueHopLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(animBlueHopY, {
            toValue: -18,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animBlueSquash, {
            toValue: 1.08,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(animBlueHopY, {
            toValue: 0,
            duration: 450,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animBlueSquash, {
            toValue: 0.92,
            duration: 450,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Little bounce settling
        Animated.timing(animBlueSquash, {
          toValue: 1.0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(700),
      ])
    );

    // 5. Sparkle Star Twinkle & Rotation
    const sparkleLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(animSparkle, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animSparkle, {
            toValue: 0.35,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(animSparkleRot, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    pillFloatLoop.start();
    pillTiltLoop.start();
    archBreathLoop.start();
    archEyeLoop.start();
    cloudBobLoop.start();
    blueHopLoop.start();
    sparkleLoop.start();

    return () => {
      pillFloatLoop.stop();
      pillTiltLoop.stop();
      archBreathLoop.stop();
      archEyeLoop.stop();
      cloudBobLoop.stop();
      blueHopLoop.stop();
      sparkleLoop.stop();
    };
  }, []);

  const pillRotateInterpolate = animPillRot.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  const sparkleRotInterpolate = animSparkleRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate container aspect ratio (400x260 base)
  const containerStyle: ViewStyle = {
    width: width as any,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  };

  return (
    <View style={[containerStyle, style]}>
      {/* ------------------------------------------------------------- */}
      {/* SVG Canvas for characters and limbs                           */}
      {/* ------------------------------------------------------------- */}
      <View style={styles.sceneContainer}>
        {/* Soft Ambient Glow under characters */}
        <View
          style={[
            styles.ambientShadow,
            isDarkBg && {
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
            },
          ]}
        />

        {/* 1. CHARACTER 2: Large Pink Arch Cyclops (Right Center) */}
        <Animated.View
          style={[
            styles.charArchWrap,
            {
              transform: [
                { scaleY: animArchScale },
                {
                  translateY: animArchScale.interpolate({
                    inputRange: [0.985, 1.035],
                    outputRange: [2, -2],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width={160} height={210} viewBox="0 0 160 210">
            {/* Arch Body (Bubblegum Pink) */}
            <Path
              d="M 10 210 L 10 75 C 10 25 150 25 150 75 L 150 210 Z"
              fill="#F9A8D4"
            />
            {/* Subtle inner shadow highlight */}
            <Path
              d="M 22 210 L 22 78 C 22 36 138 36 138 78 L 138 210"
              fill="none"
              stroke="#FBCFE8"
              strokeWidth={5}
              opacity={0.7}
            />

            {/* Giant Cyclops Cartoon Eye (White circle) */}
            <Circle cx={80} cy={82} r={26} fill="#FFFFFF" stroke="#0F172A" strokeWidth={3} />

            {/* Eye Pupil with dynamic tracking */}
            <AnimatedCircleEye xAnim={animArchEyeX} />

            {/* Cute Little Open Mouth with 2 buck teeth */}
            <G transform="translate(80, 128)">
              {/* Mouth background */}
              <Path
                d="M -16 0 C -16 16 16 16 16 0 Z"
                fill="#881337"
                stroke="#0F172A"
                strokeWidth={2}
              />
              {/* White buck teeth */}
              <Rect x={-7} y={0} width={6} height={6} rx={1} fill="#FFFFFF" />
              <Rect x={1} y={0} width={6} height={6} rx={1} fill="#FFFFFF" />
            </G>
          </Svg>
        </Animated.View>

        {/* 2. CHARACTER 1: Pink Toothy Monster (Top Left, elevated with long legs) */}
        <Animated.View
          style={[
            styles.charPillWrap,
            {
              transform: [
                { translateY: animPillY },
                { rotate: pillRotateInterpolate },
              ],
            },
          ]}
        >
          <Svg width={160} height={170} viewBox="0 0 160 170">
            {/* Angled Legs reaching down behind cloud */}
            <Line x1={60} y1={65} x2={85} y2={165} stroke="#F43F5E" strokeWidth={11} strokeLinecap="round" />
            <Line x1={88} y1={65} x2={110} y2={165} stroke="#E11D48" strokeWidth={11} strokeLinecap="round" />

            {/* Two Cartoon Eyes on top of pill */}
            <Circle cx={55} cy={22} r={10} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.8} />
            <Circle cx={57} cy={22} r={5} fill="#0F172A" />
            <Circle cx={58.5} cy={20.5} r={1.5} fill="#FFFFFF" />

            <Circle cx={85} cy={22} r={10} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.8} />
            <Circle cx={87} cy={22} r={5} fill="#0F172A" />
            <Circle cx={88.5} cy={20.5} r={1.5} fill="#FFFFFF" />

            {/* Wide Pill Body (Pink/Coral) */}
            <Rect x={10} y={30} width={125} height={38} rx={19} fill="#FB7185" />

            {/* Big Wide Smile Mouth with White Teeth Grid */}
            <Rect x={18} y={36} width={109} height={26} rx={13} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
            {/* Vertical tooth divider lines */}
            <Line x1={34} y1={36} x2={34} y2={62} stroke="#0F172A" strokeWidth={2} />
            <Line x1={51} y1={36} x2={51} y2={62} stroke="#0F172A" strokeWidth={2} />
            <Line x1={68} y1={36} x2={68} y2={62} stroke="#0F172A" strokeWidth={2} />
            <Line x1={85} y1={36} x2={85} y2={62} stroke="#0F172A" strokeWidth={2} />
            <Line x1={102} y1={36} x2={102} y2={62} stroke="#0F172A" strokeWidth={2} />
            {/* Center horizontal divider line */}
            <Line x1={18} y1={49} x2={127} y2={49} stroke="#0F172A" strokeWidth={1.8} />
          </Svg>
        </Animated.View>

        {/* 3. CHARACTER 3: Mint Fluffy Cloud Monster (Left Middle) */}
        <Animated.View
          style={[
            styles.charCloudWrap,
            {
              transform: [{ translateY: animCloudY }],
            },
          ]}
        >
          <Svg width={135} height={175} viewBox="0 0 135 175">
            {/* Teal Stick Legs */}
            <Line x1={48} y1={105} x2={48} y2={170} stroke="#0D9488" strokeWidth={9} strokeLinecap="round" />
            <Line x1={84} y1={105} x2={84} y2={170} stroke="#0D9488" strokeWidth={9} strokeLinecap="round" />

            {/* Fluffy Scalloped Cloud Shape */}
            <Path
              d="
                M 35 75
                C 20 75 15 55 25 45
                C 15 32 30 18 45 22
                C 55 10 75 10 85 20
                C 98 12 115 25 110 40
                C 125 50 120 72 105 78
                C 115 95 95 112 80 105
                C 68 116 48 114 40 102
                C 25 108 12 90 22 78
                Z
              "
              fill="#2DD4BF"
              stroke="#0F766E"
              strokeWidth={2}
            />

            {/* Big Wide Eyes */}
            <Circle cx={52} cy={55} r={8.5} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.4} />
            <Circle cx={54} cy={55} r={4.5} fill="#0F172A" />
            <Circle cx={55.5} cy={53.5} r={1.5} fill="#FFFFFF" />

            <Circle cx={78} cy={55} r={8.5} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.4} />
            <Circle cx={80} cy={55} r={4.5} fill="#0F172A" />
            <Circle cx={81.5} cy={53.5} r={1.5} fill="#FFFFFF" />

            {/* Surprised Open Mouth (:o) */}
            <Circle cx={65} cy={76} r={4.5} fill="#0F172A" />
          </Svg>
        </Animated.View>

        {/* 4. CHARACTER 4: Electric Blue Ball Student (Center Front) */}
        <Animated.View
          style={[
            styles.charBlueWrap,
            {
              transform: [
                { translateY: animBlueHopY },
                { scaleY: animBlueSquash },
                {
                  scaleX: animBlueSquash.interpolate({
                    inputRange: [0.92, 1.08],
                    outputRange: [1.06, 0.94],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width={115} height={145} viewBox="0 0 115 145">
            {/* Blue Stick Legs */}
            <Line
              x1={42}
              y1={80}
              x2={42}
              y2={140}
              stroke={isDarkBg ? "#0284C7" : "#2563EB"}
              strokeWidth={9}
              strokeLinecap="round"
            />
            <Line
              x1={72}
              y1={80}
              x2={72}
              y2={140}
              stroke={isDarkBg ? "#0284C7" : "#2563EB"}
              strokeWidth={9}
              strokeLinecap="round"
            />

            {/* Vivid Blue Circle Body - Brighter with subtle white outline on dark/blue background */}
            <Circle
              cx={57}
              cy={52}
              r={44}
              fill={isDarkBg ? "#38BDF8" : "#3B82F6"}
              stroke={isDarkBg ? "rgba(255, 255, 255, 0.9)" : undefined}
              strokeWidth={isDarkBg ? 2.5 : 0}
            />

            {/* Highlight Crescent on Top Left */}
            <Path
              d="M 28 32 C 34 20 54 16 68 20"
              stroke="#93C5FD"
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              opacity={0.8}
            />

            {/* Big Googly Cartoon Eyes */}
            <Circle cx={44} cy={38} r={9} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
            <Circle cx={46} cy={38} r={5} fill="#0F172A" />
            <Circle cx={47.5} cy={36.5} r={1.5} fill="#FFFFFF" />

            <Circle cx={70} cy={38} r={9} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
            <Circle cx={72} cy={38} r={5} fill="#0F172A" />
            <Circle cx={73.5} cy={36.5} r={1.5} fill="#FFFFFF" />

            {/* Excited Open Circle Mouth (:O) with tiny tooth */}
            <Circle cx={57} cy={64} r={12} fill="#1E293B" stroke="#0F172A" strokeWidth={2} />
            {/* Cute bottom tooth */}
            <Rect x={54} y={70} width={6} height={5} rx={1.5} fill="#FFFFFF" />
          </Svg>
        </Animated.View>

        {/* 5. AMBIENT SPARKLES & STARS */}
        <Animated.View
          style={[
            styles.sparkleOneWrap,
            {
              opacity: animSparkle,
              transform: [{ rotate: sparkleRotInterpolate }],
            },
          ]}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Polygon
              points="12,1 15,9 23,12 15,15 12,23 9,15 1,12 9,9"
              fill="#F59E0B"
            />
          </Svg>
        </Animated.View>

        <Animated.View
          style={[
            styles.sparkleTwoWrap,
            {
              opacity: animSparkle.interpolate({
                inputRange: [0.35, 1],
                outputRange: [1, 0.4],
              }),
              transform: [{ rotate: sparkleRotInterpolate }],
            },
          ]}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Polygon
              points="12,1 15,9 23,12 15,15 12,23 9,15 1,12 9,9"
              fill="#EC4899"
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}

// Helper component for arch cyclops moving pupil
function AnimatedCircleEye({ xAnim }: { xAnim: Animated.Value }) {
  return (
    <G>
      <Circle cx={80} cy={82} r={14} fill="#0F172A" />
      <Circle cx={84} cy={78} r={4.5} fill="#FFFFFF" />
    </G>
  );
}

const styles = StyleSheet.create({
  sceneContainer: {
    width: 360,
    height: 240,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientShadow: {
    position: 'absolute',
    bottom: 6,
    width: 320,
    height: 18,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    opacity: 0.05,
  },
  // Character 2: Pink Arch (Right Center)
  charArchWrap: {
    position: 'absolute',
    right: 25,
    bottom: 8,
    zIndex: 5,
  },
  // Character 1: Pink Toothy (Top Left)
  charPillWrap: {
    position: 'absolute',
    left: 20,
    top: 0,
    zIndex: 8,
  },
  // Character 3: Mint Cloud (Left Center)
  charCloudWrap: {
    position: 'absolute',
    left: 35,
    bottom: 8,
    zIndex: 12,
  },
  // Character 4: Blue Ball (Front Center)
  charBlueWrap: {
    position: 'absolute',
    left: 125,
    bottom: 8,
    zIndex: 20,
  },
  // Ambient Sparkles
  sparkleOneWrap: {
    position: 'absolute',
    top: 15,
    right: 30,
    zIndex: 25,
  },
  sparkleTwoWrap: {
    position: 'absolute',
    top: 70,
    left: 10,
    zIndex: 25,
  },
});
