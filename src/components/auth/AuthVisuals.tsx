import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, FeDropShadow, Filter, G, Line, Path, Rect } from 'react-native-svg';

// 6-pointed rounded starburst/asterisk mark
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

// Organic curved blue shape in top-left corner
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

// Flat Vector Illustration of Teacher at Workspace (Desk, Laptop, Lamp, Plant, Floating Stats)
// Matching the reference layout in Sleeknote style
export function TeacherWorkspaceIllustration({ width = 460, height = 360, style }: { width?: number; height?: number; style?: ViewStyle }) {
  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height} viewBox="0 0 500 400">
        <Defs>
          <Filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <FeDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.08" />
          </Filter>
        </Defs>

        {/* Soft Ambient Ground Shadow */}
        <Path d="M 60 360 Q 250 375 440 360 Q 250 355 60 360 Z" fill="#E2E8F0" opacity={0.7} />

        {/* --- DESK STRUCTURE --- */}
        {/* Left A-frame legs */}
        <Line x1="120" y1="245" x2="80" y2="355" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" />
        <Line x1="120" y1="245" x2="160" y2="355" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" />
        <Line x1="95" y1="315" x2="145" y2="315" stroke="#93C5FD" strokeWidth="5" strokeLinecap="round" />

        {/* Right A-frame legs */}
        <Line x1="380" y1="245" x2="340" y2="355" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" />
        <Line x1="380" y1="245" x2="420" y2="355" stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" />
        <Line x1="355" y1="315" x2="405" y2="315" stroke="#93C5FD" strokeWidth="5" strokeLinecap="round" />

        {/* Desk Lamp */}
        <Path d="M 92 242 L 112 242 L 108 238 L 96 238 Z" fill="#2563EB" />
        <Line x1="104" y1="238" x2="104" y2="205" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" />
        <Line x1="104" y1="205" x2="118" y2="182" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" />
        <Path d="M 112 174 L 132 192 L 122 202 L 102 184 Z" fill="#2563EB" />
        {/* Subtle light glow from lamp */}
        <Path d="M 122 202 L 175 242 L 135 242 Z" fill="#FEF08A" opacity="0.3" />

        {/* Character Legs (Sitting on Chair) */}
        <Path d="M 275 250 L 275 285 L 340 330" stroke="#334155" strokeWidth="18" strokeLinecap="round" fill="none" />
        <Path d="M 292 250 L 316 288 L 360 330" stroke="#1E293B" strokeWidth="16" strokeLinecap="round" fill="none" />
        {/* Shoes */}
        <Path d="M 335 330 L 360 338 L 338 342 Z" fill="#94A3B8" />

        {/* Desk Surface Tabletop */}
        <Rect x="55" y="240" width="390" height="12" rx="6" fill="#BFDBFE" />

        {/* Coffee Mug on Desk */}
        <Rect x="340" y="224" width="14" height="16" rx="3" fill="#60A5FA" />
        <Path d="M 354 227 C 358 227 358 237 354 237" stroke="#60A5FA" strokeWidth="2.5" fill="none" />

        {/* Potted Plant on Desk */}
        <Path d="M 395 240 L 418 240 L 414 268 L 399 268 Z" fill="#334155" />
        <Path d="M 406 240 C 394 218 409 198 409 190 C 419 208 414 225 406 240 Z" fill="#10B981" />
        <Path d="M 409 240 C 420 224 430 212 426 200 C 420 216 412 228 409 240 Z" fill="#059669" />
        <Path d="M 404 240 C 388 230 395 214 398 206 C 402 218 402 230 404 240 Z" fill="#34D399" />

        {/* Character Torso & Shirt */}
        <Path d="M 272 188 C 280 184 306 184 314 188 L 318 250 L 268 250 Z" fill="#9333EA" />

        {/* Character Head & Hair */}
        <Circle cx="293" cy="162" r="15" fill="#FCD34D" />
        <Path d="M 280 162 C 280 148 290 140 305 140 C 312 140 316 146 312 153 C 307 153 298 157 295 165 Z" fill="#1E293B" />
        <Rect x="289" y="174" width="8" height="9" fill="#FCD34D" />

        {/* Character Arms Typing on Laptop */}
        <Path d="M 274 195 L 254 222 L 284 236" stroke="#9333EA" strokeWidth="12" strokeLinecap="round" fill="none" />
        <Circle cx="284" cy="236" r="5" fill="#FCD34D" />

        {/* Laptop on Desk */}
        <Rect x="260" y="235" width="55" height="5" rx="2.5" fill="#E2E8F0" />
        <Path d="M 265 235 L 270 196 L 315 196 L 312 235 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
        <Circle cx="290" cy="214" r="3" fill="#3B82F6" />

        {/* Floating Stat Card 1: Attendance & Class Bar Chart */}
        <G filter="url(#cardShadow)">
          <Rect x="240" y="175" width="34" height="34" rx="7" fill="#FFFFFF" />
          <Rect x="246" y="193" width="4" height="10" rx="2" fill="#8B5CF6" />
          <Rect x="254" y="185" width="4" height="18" rx="2" fill="#EC4899" />
          <Rect x="262" y="189" width="4" height="14" rx="2" fill="#3B82F6" />
        </G>

        {/* Floating Stat Card 2: Student Grade / Rapor Distribution */}
        <G filter="url(#cardShadow)">
          <Rect x="325" y="160" width="36" height="36" rx="7" fill="#FFFFFF" />
          <Circle cx="343" cy="178" r="10" fill="#10B981" />
          <Path d="M 343 178 L 343 168 A 10 10 0 0 1 353 178 Z" fill="#3B82F6" />
        </G>
      </Svg>
    </View>
  );
}
