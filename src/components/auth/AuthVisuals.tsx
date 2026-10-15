import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';

// 6-pointed rounded starburst/asterisk mark from Desktop Web layout (Image 2)
export function StarburstIcon({ size = 28, color = '#4F46E5', style }: { size?: number; color?: string; style?: ViewStyle }) {
  const half = size / 2;
  const barW = Math.max(3.5, size * 0.18);
  const barH = size;
  const r = barW / 2;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G transform={`translate(${half}, ${half})`}>
          <Rect x={-barW / 2} y={-barH / 2} width={barW} height={barH} rx={r} fill={color} />
          <Rect x={-barW / 2} y={-barH / 2} width={barW} height={barH} rx={r} fill={color} transform="rotate(60)" />
          <Rect x={-barW / 2} y={-barH / 2} width={barW} height={barH} rx={r} fill={color} transform="rotate(120)" />
        </G>
      </Svg>
    </View>
  );
}

// Potted Snake Plant illustration from Mobile App layout (Image 1)
export function PlantIllustration({ width = 110, height = 150, style }: { width?: number; height?: number; style?: ViewStyle }) {
  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height} viewBox="0 0 110 150">
        {/* Soft ground shadow under pot */}
        <Ellipse cx="55" cy="144" rx="28" ry="5.5" fill="rgba(0, 0, 0, 0.14)" />

        {/* Back / Tall Center Leaf */}
        <Path
          d="M 50 115 C 47 65 52 20 55 6 C 58 20 63 65 60 115 Z"
          fill="#48B895"
        />
        {/* Inner highlight vein on center leaf */}
        <Path
          d="M 54 110 C 53 65 54 22 55 10 C 56 22 57 65 56 110 Z"
          fill="#76DDBE"
          opacity={0.8}
        />

        {/* Left Leaf (arching softly to the left) */}
        <Path
          d="M 40 116 C 30 75 35 38 41 20 C 47 38 48 75 46 116 Z"
          fill="#319E7B"
        />
        <Path
          d="M 41 110 C 34 75 38 40 42 24 C 45 40 46 75 44 110 Z"
          fill="#5CCBAA"
          opacity={0.8}
        />

        {/* Right Leaf (arching softly to the right) */}
        <Path
          d="M 64 116 C 62 75 64 45 70 26 C 76 45 78 78 70 116 Z"
          fill="#5DC8A7"
        />
        <Path
          d="M 65 110 C 64 75 66 48 70 30 C 73 48 74 78 69 110 Z"
          fill="#94ECD0"
          opacity={0.8}
        />

        {/* Ceramic White Pot */}
        {/* Pot base with rounded taper */}
        <Path
          d="M 32 98 Q 28 140 55 140 Q 82 140 78 98 Z"
          fill="#FFFFFF"
        />
        {/* Pot subtle right side ambient shadow */}
        <Path
          d="M 55 98 Q 78 98 78 98 Q 82 140 55 140 Z"
          fill="#F1F5F9"
          opacity={0.7}
        />
        {/* Pot top rim lip */}
        <Ellipse cx="55" cy="98" rx="23" ry="4.5" fill="#E2E8F0" />
        <Ellipse cx="55" cy="98" rx="20" ry="3.5" fill="#475569" opacity={0.15} />
      </Svg>
    </View>
  );
}

// Organic curved mint shape in top-left corner from Mobile App layout (Image 1)
export function OrganicMintBlob({ width = 140, height = 130, style }: { width?: number; height?: number; style?: ViewStyle }) {
  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height} viewBox="0 0 140 130">
        <Path
          d="M 0 0 L 105 0 C 115 15 118 35 106 52 C 92 72 98 88 88 102 C 78 116 58 126 40 120 C 22 114 10 118 0 125 Z"
          fill="#5EC9A8"
          opacity={0.65}
        />
      </Svg>
    </View>
  );
}
