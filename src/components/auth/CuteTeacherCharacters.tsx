import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  FeDropShadow,
  Filter,
  G,
  Line,
  Path,
  Polygon,
  Rect,
} from 'react-native-svg';

export interface CuteTeacherCharactersProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

// Playful geometric teacher & student character troupe
// Inspired by modern whimsical character illustrations (Image 1 reference)
export function CuteTeacherCharacters({
  width = '100%',
  height = 190,
  style,
}: CuteTeacherCharactersProps) {
  return (
    <View style={[{ width: width as any, height, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width="100%" height={height} viewBox="0 0 420 230" preserveAspectRatio="xMidYMax meet">
        <Defs>
          <Filter id="charDropShadow" x="-10%" y="-10%" width="120%" height="120%">
            <FeDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.06" />
          </Filter>
        </Defs>

        {/* ------------------------------------------------------------- */}
        {/* CHARACTER 1: Toothy Ruler Character (Pink/Magenta - Top Left) */}
        {/* ------------------------------------------------------------- */}
        <G id="toothyCharacter">
          {/* Angled Neck reaching down */}
          <Path d="M 95 65 L 125 180" stroke="#F43F5E" strokeWidth="14" strokeLinecap="round" />
          <Path d="M 115 65 L 140 180" stroke="#E11D48" strokeWidth="12" strokeLinecap="round" />

          {/* Two Big Cartoon Eyes on Top */}
          <Circle cx="88" cy="38" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <Circle cx="90" cy="38" r="4.5" fill="#0F172A" />
          <Circle cx="91.5" cy="36.5" r="1.5" fill="#FFFFFF" />

          <Circle cx="109" cy="38" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <Circle cx="111" cy="38" r="4.5" fill="#0F172A" />
          <Circle cx="112.5" cy="36.5" r="1.5" fill="#FFFFFF" />

          {/* Wide Pill Head with Grin */}
          <Rect x="40" y="46" width="105" height="34" rx="17" fill="#F43F5E" />
          {/* Inner Mouth */}
          <Rect x="48" y="52" width="89" height="22" rx="11" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          {/* Tooth Divider Lines */}
          <Line x1="62" y1="52" x2="62" y2="74" stroke="#0F172A" strokeWidth="2" />
          <Line x1="77" y1="52" x2="77" y2="74" stroke="#0F172A" strokeWidth="2" />
          <Line x1="92" y1="52" x2="92" y2="74" stroke="#0F172A" strokeWidth="2" />
          <Line x1="107" y1="52" x2="107" y2="74" stroke="#0F172A" strokeWidth="2" />
          <Line x1="122" y1="52" x2="122" y2="74" stroke="#0F172A" strokeWidth="2" />
          {/* Horizontal Tooth Line */}
          <Line x1="48" y1="63" x2="137" y2="63" stroke="#0F172A" strokeWidth="1.5" />
        </G>

        {/* ------------------------------------------------------------- */}
        {/* CHARACTER 2: Pak Guru (Tall Indigo Arch Character with Glasses) */}
        {/* ------------------------------------------------------------- */}
        <G id="pakGuruCharacter">
          {/* Tall Body Arch */}
          <Path
            d="M 160 230 L 160 115 C 160 62 265 62 265 115 L 265 230 Z"
            fill="#4F46E5"
          />

          {/* Graduation Mortarboard Cap (Topi Toga) */}
          <G id="togaCap">
            <Polygon points="212,24 252,38 212,52 172,38" fill="#0F172A" />
            <Path d="M 194 45 L 230 45 L 226 58 L 198 58 Z" fill="#1E293B" />
            {/* Golden Tassel */}
            <Line x1="212" y1="38" x2="246" y2="48" stroke="#F59E0B" strokeWidth="2.5" />
            <Circle cx="247" cy="51" r="3.5" fill="#F59E0B" />
          </G>

          {/* Teacher Round Spectacles / Glasses */}
          <G id="teacherGlasses">
            {/* Left Glass Rim */}
            <Circle cx="193" cy="115" r="17" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
            {/* Right Glass Rim */}
            <Circle cx="232" cy="115" r="17" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
            {/* Bridge */}
            <Path d="M 210 115 Q 212.5 110 215 115" stroke="#0F172A" strokeWidth="3" fill="none" />
            {/* Glasses Arms */}
            <Line x1="176" y1="115" x2="164" y2="112" stroke="#0F172A" strokeWidth="2.5" />
            <Line x1="249" y1="115" x2="261" y2="112" stroke="#0F172A" strokeWidth="2.5" />

            {/* Kind Teacher Pupils looking down */}
            <Circle cx="195" cy="116" r="7" fill="#0F172A" />
            <Circle cx="197" cy="114" r="2.5" fill="#FFFFFF" />
            <Circle cx="234" cy="116" r="7" fill="#0F172A" />
            <Circle cx="236" cy="114" r="2.5" fill="#FFFFFF" />
          </G>

          {/* Encouraging Teacher Smile */}
          <Path
            d="M 203 146 Q 212.5 156 222 146"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Golden Pen Nib Badge on Pocket */}
          <Path d="M 209 174 L 217 174 L 213 186 Z" fill="#F59E0B" />
          <Line x1="213" y1="174" x2="213" y2="182" stroke="#FFFFFF" strokeWidth="1" />
        </G>

        {/* ------------------------------------------------------------- */}
        {/* CHARACTER 3: Bu Guru Buku / Pink Arch Character (Right) */}
        {/* ------------------------------------------------------------- */}
        <G id="buGuruPink">
          {/* Arch Body */}
          <Path
            d="M 252 230 L 252 135 C 252 90 350 90 350 135 L 350 230 Z"
            fill="#FB7185"
          />

          {/* Little Red Apple Hairpin on Head */}
          <Circle cx="320" cy="95" r="9" fill="#EF4444" />
          <Path d="M 320 86 Q 323 82 321 80" stroke="#78350F" strokeWidth="2" fill="none" />
          <Path d="M 321 84 Q 327 82 325 87 Z" fill="#22C55E" />

          {/* Big Cartoon Eye (Left) */}
          <Circle cx="290" cy="130" r="18" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <Circle cx="293" cy="130" r="8" fill="#0F172A" />
          <Circle cx="295" cy="127" r="2.5" fill="#FFFFFF" />

          {/* Small Cartoon Eye (Right) */}
          <Circle cx="325" cy="138" r="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="323" cy="138" r="5" fill="#0F172A" />
          <Circle cx="324" cy="136" r="1.5" fill="#FFFFFF" />

          {/* Cheerful Open Mouth with Tooth */}
          <Path d="M 295 166 C 295 182 322 182 322 166 Z" fill="#9F1239" />
          <Rect x="303" y="166" width="7" height="5" rx="1.5" fill="#FFFFFF" />
          <Path d="M 299 174 Q 308 171 317 174 Q 308 181 299 174 Z" fill="#FDA4AF" />
        </G>

        {/* ------------------------------------------------------------- */}
        {/* CHARACTER 4: Penghapus Awan / Fluffy Mint Cloud (Left) */}
        {/* ------------------------------------------------------------- */}
        <G id="fluffyCloudStudent">
          {/* Stick Legs */}
          <Rect x="88" y="175" width="8" height="50" rx="4" fill="#0D9488" />
          <Rect x="122" y="175" width="8" height="50" rx="4" fill="#0D9488" />

          {/* Fluffy Scalloped Cloud Body */}
          <Path
            d="
              M 80 180
              C 62 180 50 166 50 150
              C 50 136 60 126 72 122
              C 68 106 82 92 98 92
              C 108 92 118 98 122 108
              C 132 98 148 104 152 118
              C 165 124 170 138 165 150
              C 170 166 156 180 140 180 Z
            "
            fill="#2DD4BF"
          />

          {/* Balancing Little Pencil on Head */}
          <Rect x="90" y="82" width="30" height="7" rx="2" fill="#FBBF24" />
          <Polygon points="84,85.5 90,82 90,89" fill="#FCD34D" />
          <Polygon points="84,85.5 87,83.5 87,87.5" fill="#1E293B" />
          <Rect x="116" y="82" width="6" height="7" rx="1" fill="#F472B6" />

          {/* Googly Eyes */}
          <Circle cx="98" cy="136" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="100" cy="136" r="4.5" fill="#0F172A" />
          <Circle cx="101" cy="134" r="1.5" fill="#FFFFFF" />

          <Circle cx="124" cy="136" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="122" cy="136" r="4.5" fill="#0F172A" />
          <Circle cx="123" cy="134" r="1.5" fill="#FFFFFF" />

          {/* Curious "O" Mouth */}
          <Circle cx="111" cy="154" r="5.5" fill="#0F172A" />
        </G>

        {/* ------------------------------------------------------------- */}
        {/* CHARACTER 5: Si Bola Biru / Excited Student Ball (Front Center) */}
        {/* ------------------------------------------------------------- */}
        <G id="excitedBallStudent">
          {/* Stick Legs */}
          <Rect x="206" y="196" width="7" height="32" rx="3.5" fill="#0284C7" />
          <Rect x="224" y="196" width="7" height="32" rx="3.5" fill="#0284C7" />

          {/* Round Body */}
          <Circle cx="218" cy="170" r="34" fill="#38BDF8" />

          {/* Eyes looking up at Teacher with Wonder */}
          <Circle cx="210" cy="156" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="212" cy="153" r="4" fill="#0F172A" />
          <Circle cx="213" cy="151.5" r="1.5" fill="#FFFFFF" />

          <Circle cx="228" cy="156" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="226" cy="153" r="4" fill="#0F172A" />
          <Circle cx="227" cy="151.5" r="1.5" fill="#FFFFFF" />

          {/* Excited Open Mouth with 2 Tiny Teeth */}
          <Circle cx="219" cy="177" r="9" fill="#0F172A" />
          <Rect x="215" y="168" width="3.5" height="4" rx="1" fill="#FFFFFF" />
          <Rect x="220" y="168" width="3.5" height="4" rx="1" fill="#FFFFFF" />
          <Path d="M 215 181 Q 219 179 223 181 Q 219 186 215 181 Z" fill="#EF4444" />
        </G>
      </Svg>
    </View>
  );
}
