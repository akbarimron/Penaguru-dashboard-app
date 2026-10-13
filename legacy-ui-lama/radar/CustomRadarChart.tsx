// src/components/radar/CustomRadarChart.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface RadarData {
  logika: number;
  sintaks: number;
  debugging: number;
  kolaborasi: number;
  disiplin: number;
}

interface CustomRadarChartProps {
  data: RadarData;
  size?: number;
  showLabels?: boolean;
}

export const CustomRadarChart: React.FC<CustomRadarChartProps> = ({
  data,
  size = 280,
  showLabels = true,
}) => {
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = 5;

  const axes = [
    { label: 'Logika', value: data.logika },
    { label: 'Sintaks', value: data.sintaks },
    { label: 'Debugging', value: data.debugging },
    { label: 'Kolaborasi', value: data.kolaborasi },
    { label: 'Disiplin', value: data.disiplin },
  ];

  // Calculate coordinates for an axis point at a given ratio (0 to 1)
  const getCoordinates = (index: number, ratio: number) => {
    // Start at top (-PI/2) and rotate clockwise
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const x = center + radius * ratio * Math.cos(angle);
    const y = center + radius * ratio * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric polygon background grids (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridLevels.map((level) => {
    const points = axes
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(' ');
    return points;
  });

  // Data polygon points
  const dataPoints = axes
    .map((axis, i) => {
      const ratio = Math.max(0, Math.min(100, axis.value)) / 100;
      const { x, y } = getCoordinates(i, ratio);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Concentric grid lines */}
        {gridPolygons.map((pts, idx) => (
          <Polygon
            key={`grid-${idx}`}
            points={pts}
            fill={idx === gridPolygons.length - 1 ? 'rgba(240, 253, 250, 0.5)' : 'none'}
            stroke="#cbd5e1"
            strokeWidth={idx === gridPolygons.length - 1 ? '1.5' : '1'}
            strokeDasharray={idx < gridPolygons.length - 1 ? '3, 3' : undefined}
          />
        ))}

        {/* Spoke lines */}
        {axes.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <Line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={dataPoints}
          fill="rgba(13, 148, 136, 0.28)"
          stroke={colors.teal[600]}
          strokeWidth="2.5"
        />

        {/* Data vertex circles */}
        {axes.map((axis, i) => {
          const ratio = Math.max(0, Math.min(100, axis.value)) / 100;
          const { x, y } = getCoordinates(i, ratio);
          return (
            <Circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r="4"
              fill={colors.teal[700]}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}
      </Svg>

      {/* Axis Labels positioned around the radar */}
      {showLabels && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {axes.map((axis, i) => {
            const { x, y, angle } = getCoordinates(i, 1.26);
            return (
              <View
                key={`label-${i}`}
                style={[
                  styles.labelContainer,
                  {
                    left: x - 48,
                    top: y - 16,
                  },
                ]}
              >
                <Text style={styles.labelText}>{axis.label}</Text>
                <Text style={styles.labelValue}>{axis.value}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  labelContainer: {
    position: 'absolute',
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate[700],
    textAlign: 'center',
  },
  labelValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.teal[700],
  },
});
