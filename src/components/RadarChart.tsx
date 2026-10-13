import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText, TSpan } from 'react-native-svg';
import { color, font } from '../theme/tokens';

interface Axis {
  label: string;
  value: number | null; // 0-100, null = belum ada data
}

// Radar lintas mapel untuk wali kelas: satu sumbu per mapel di kelas itu.
// Menjawab pertanyaan "di mapel mana siswa ini kuat atau tertinggal?".
// Dipakai hanya bila ada >= 3 mapel berdata; kurang dari itu, layar memakai bilah.
// Kanvas diberi ruang samping (pad) agar label mapel tidak terpotong.
export function RadarChart({ axes, width = 380, tint = color.brand }: { axes: Axis[]; width?: number; tint?: string }) {
  // Ukuran radar diturunkan dari lebar yang tersedia, sisanya untuk label.
  const pad = 58;
  const size = Math.max(160, Math.min(300, width - pad * 2));
  const W = size + pad * 2;
  const H = size + 64;
  const cx = W / 2;
  const cy = H / 2;
  const r = size * 0.38;
  const n = axes.length;
  const point = (i: number, ratio: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * ratio * Math.cos(a), y: cy + r * ratio * Math.sin(a) };
  };
  const ring = (level: number) => axes.map((_, i) => point(i, level)).map((p) => `${p.x},${p.y}`).join(' ');
  const data = axes.map((ax, i) => point(i, Math.max(0, Math.min(100, ax.value ?? 0)) / 100));

  return (
    <View
      accessible
      accessibilityLabel={`Diagram radar: ${axes.map((a) => `${a.label} ${a.value ?? 'belum ada data'}`).join(', ')}`}
      style={{ alignItems: 'center' }}
    >
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {[0.25, 0.5, 0.75, 1].map((lv) => (
          <Polygon key={lv} points={ring(lv)} fill={lv === 1 ? '#F8FAFC' : 'none'} stroke="#CBD5E1" strokeWidth={1} />
        ))}
        {axes.map((_, i) => {
          const p = point(i, 1);
          return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#CBD5E1" strokeWidth={1} />;
        })}
        <Polygon points={data.map((p) => `${p.x},${p.y}`).join(' ')} fill={tint} fillOpacity={0.22} stroke={tint} strokeWidth={2} />
        {data.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={axes[i].value === null ? '#FFFFFF' : tint} stroke={tint} strokeWidth={2} />
        ))}
        {axes.map((ax, i) => {
          const p = point(i, 1.16);
          const anchor = Math.abs(p.x - cx) < 8 ? 'middle' : p.x > cx ? 'start' : 'end';
          const short = ax.label.length > 10 ? `${ax.label.slice(0, 9)}…` : ax.label;
          const top = p.y < cy - 8;
          const y = top ? p.y - 14 : p.y;
          return (
            <SvgText key={i} x={p.x} y={y} fontSize={11} fontFamily={font.semibold} fill={color.inkSoft} textAnchor={anchor as any}>
              <TSpan x={p.x} dy={0}>
                {short}
              </TSpan>
              <TSpan x={p.x} dy={14} fontFamily={font.bold} fill={color.ink}>
                {ax.value ?? '-'}
              </TSpan>
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
