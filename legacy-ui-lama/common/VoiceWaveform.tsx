// src/components/common/VoiceWaveform.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

interface VoiceWaveformProps {
  isRecording: boolean;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isRecording }) => {
  const bars = [
    useRef(new Animated.Value(10)).current,
    useRef(new Animated.Value(18)).current,
    useRef(new Animated.Value(28)).current,
    useRef(new Animated.Value(14)).current,
    useRef(new Animated.Value(32)).current,
    useRef(new Animated.Value(22)).current,
    useRef(new Animated.Value(36)).current,
    useRef(new Animated.Value(16)).current,
    useRef(new Animated.Value(24)).current,
    useRef(new Animated.Value(12)).current,
  ];

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      const createLoop = () => {
        const anims = bars.map((bar) => {
          const toValue = Math.floor(Math.random() * 32) + 10;
          return Animated.sequence([
            Animated.timing(bar, {
              toValue,
              duration: 180 + Math.random() * 150,
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 8,
              duration: 180 + Math.random() * 150,
              useNativeDriver: false,
            }),
          ]);
        });
        animation = Animated.loop(Animated.parallel(anims));
        animation.start();
      };
      createLoop();
    } else {
      bars.forEach((bar) => bar.setValue(10));
      if (animation) (animation as Animated.CompositeAnimation).stop();
    }

    return () => {
      if (animation) (animation as Animated.CompositeAnimation).stop();
    };
  }, [isRecording]);

  return (
    <View style={styles.container}>
      {bars.map((bar, index) => (
        <Animated.View
          key={`bar-${index}`}
          style={[
            styles.bar,
            {
              height: bar,
              backgroundColor: isRecording ? colors.teal[600] : colors.slate[300],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    gap: 4,
    paddingHorizontal: 16,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});
