import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';

// 6-pointed rounded starburst/asterisk mark from Desktop Web layout
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

// Organic curved blue shape in top-left corner (matching Windows blue gradient)
export function OrganicBlueBlob({ width = 140, height = 130, style }: { width?: number; height?: number; style?: ViewStyle }) {
  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height} viewBox="0 0 140 130">
        <Path
          d="M 0 0 L 105 0 C 115 15 118 35 106 52 C 92 72 98 88 88 102 C 78 116 58 126 40 120 C 22 114 10 118 0 125 Z"
          fill="#60A5FA"
          opacity={0.45}
        />
      </Svg>
    </View>
  );
}

// Organic curved mint shape
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
