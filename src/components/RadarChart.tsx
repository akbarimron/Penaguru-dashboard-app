import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Rect, Text as SvgText, TSpan } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { color, font, radius } from '../theme/tokens';
import { AppText, StatusPill } from './ui';

export interface RadarAxis {
  label: string;
  value: number | null; // 0-100, null = belum ada data
  status?: string;
  color?: string;
}

export interface RadarChartProps {
  axes: RadarAxis[];
  width?: number;
  tint?: string;
  selectedIndex?: number | null;
  onSelectIndex?: (index: number) => void;
}

// Radar lintas mapel interaktif untuk wali kelas:
// - Titik sumbu dan label bisa diketuk (interaktif) dengan umpan balik visual dan audio
// - Menyorot mapel yang dipilih dengan cincin pop, garis aksen, dan tooltip status
// - Mendukung animasi spring saat berpindah pilihan
export function RadarChart({
  axes,
  width = 380,
  tint = color.brand,
  selectedIndex = null,
  onSelectIndex,
}: RadarChartProps) {
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

  // Animasi spring saat titik dipilih
  const popAnim = useRef(new Animated.Value(selectedIndex !== null ? 1 : 0)).current;

  useEffect(() => {
    if (selectedIndex !== null) {
      popAnim.setValue(0.7);
      Animated.spring(popAnim, {
        toValue: 1,
        friction: 5,
        tension: 240,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(popAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedIndex, popAnim]);

  const selectedAxis = selectedIndex !== null ? axes[selectedIndex] : null;

  return (
    <View
      accessible
      accessibilityLabel={`Diagram radar interaktif: ${axes.map((a) => `${a.label} ${a.value ?? 'belum ada data'}`).join(', ')}`}
      style={styles.container}
    >
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Poligon jaring laba-laba tingkat 25%, 50%, 75%, 100% */}
        {[0.25, 0.5, 0.75, 1].map((lv) => (
          <Polygon
            key={lv}
            points={ring(lv)}
            fill={lv === 1 ? '#F8FAFC' : 'none'}
            stroke="#CBD5E1"
            strokeWidth={1}
          />
        ))}

        {/* Garis sumbu dari pusat ke ujung */}
        {axes.map((_, i) => {
          const p = point(i, 1);
          const isSelected = selectedIndex === i;
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke={isSelected ? tint : '#CBD5E1'}
              strokeWidth={isSelected ? 2.5 : 1}
              strokeDasharray={isSelected ? '4 2' : undefined}
            />
          );
        })}

        {/* Poligon data capaian siswa */}
        <Polygon
          points={data.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={tint}
          fillOpacity={0.22}
          stroke={tint}
          strokeWidth={2}
        />

        {/* Titik-titik data capaian (interaktif & responsif terhadap ketukan) */}
        {data.map((p, i) => {
          const isSelected = selectedIndex === i;
          const axColor = axes[i].color || tint;
          return (
            <G key={`point-${i}`}>
              {/* Cincin pop saat terpilih */}
              {isSelected ? (
                <>
                  <Circle cx={p.x} cy={p.y} r={16} fill={axColor} fillOpacity={0.18} />
                  <Circle cx={p.x} cy={p.y} r={10} fill={axColor} fillOpacity={0.35} />
                </>
              ) : null}

              {/* Titik inti */}
              <Circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? 6 : 4.5}
                fill={axes[i].value === null ? '#FFFFFF' : isSelected ? '#FFFFFF' : tint}
                stroke={isSelected ? axColor : tint}
                strokeWidth={isSelected ? 3 : 2}
              />

              {/* Area sentuh ekstra lebar agar nyaman ditekan di ponsel & desktop */}
              {onSelectIndex ? (
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={24}
                  fill="transparent"
                  onPress={() => onSelectIndex(i)}
                />
              ) : null}
            </G>
          );
        })}

        {/* Label sumbu mapel (juga bisa diklik) */}
        {axes.map((ax, i) => {
          const p = point(i, 1.16);
          const anchor = Math.abs(p.x - cx) < 8 ? 'middle' : p.x > cx ? 'start' : 'end';
          const short = ax.label.length > 10 ? `${ax.label.slice(0, 9)}…` : ax.label;
          const top = p.y < cy - 8;
          const y = top ? p.y - 14 : p.y;
          const isSelected = selectedIndex === i;
          const axColor = ax.color || tint;

          // Perkiraan posisi pill latar untuk teks terpilih
          const pillX = anchor === 'middle' ? p.x - 34 : anchor === 'start' ? p.x - 4 : p.x - 64;

          return (
            <G
              key={`label-${i}`}
              onPress={() => onSelectIndex?.(i)}
              style={{ cursor: onSelectIndex ? 'pointer' : 'default' }}
            >
              {isSelected ? (
                <Rect
                  x={pillX}
                  y={y - 12}
                  width={68}
                  height={32}
                  rx={6}
                  fill={color.brandSoft}
                  fillOpacity={0.75}
                  stroke={axColor}
                  strokeWidth={1}
                />
              ) : null}
              <SvgText
                x={p.x}
                y={y}
                fontSize={isSelected ? 11.5 : 11}
                fontFamily={isSelected ? font.bold : font.semibold}
                fill={isSelected ? color.ink : color.inkSoft}
                textAnchor={anchor as any}
              >
                <TSpan x={p.x} dy={0}>
                  {short}
                </TSpan>
                <TSpan
                  x={p.x}
                  dy={14}
                  fontFamily={font.bold}
                  fill={isSelected ? axColor : color.ink}
                >
                  {ax.value !== null ? ax.value : '-'}
                </TSpan>
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* Indikator Tooltip Status Terpilih / Petunjuk Interaksi */}
      {selectedAxis ? (
        <Animated.View
          style={[
            styles.tooltipPill,
            {
              transform: [{ scale: popAnim }],
              opacity: popAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
            },
          ]}
        >
          <View style={[styles.tooltipDot, { backgroundColor: selectedAxis.color || tint }]} />
          <AppText variant="small" weight="bold" tone={color.ink}>
            {selectedAxis.label}: {selectedAxis.value !== null ? selectedAxis.value : 'Belum ada data'}
          </AppText>
          {selectedAxis.status ? <StatusPill status={selectedAxis.status as any} compact /> : null}
        </Animated.View>
      ) : (
        <View style={styles.hintBox}>
          <Ionicons name="finger-print-outline" size={14} color={color.mutedOnWhite} />
          <AppText variant="caption" tone={color.mutedOnWhite}>
            Ketuk titik radar atau daftar di bawah untuk rincian
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  tooltipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: color.surfaceMuted,
    borderWidth: 1,
    borderColor: color.line,
  },
  tooltipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
});
