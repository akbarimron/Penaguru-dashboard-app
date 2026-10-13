// src/components/common/Badge.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { AcademicStatus, ApprovalStatus, RiskLevel } from '../../types';

interface BadgeProps {
  type: AcademicStatus | ApprovalStatus | RiskLevel | 'synced' | 'pending';
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type, label, size = 'md' }) => {
  let bg = colors.slate[100];
  let text = colors.slate[700];
  let border = colors.slate[200];
  let displayLabel = label || type;

  switch (type) {
    case 'Aman':
    case 'Rendah':
    case 'Approved':
    case 'synced':
      bg = colors.primary[50];
      text = colors.primary[700];
      border = colors.primary[200];
      break;
    case 'Perhatian':
    case 'Sedang':
    case 'Draft':
    case 'pending':
      bg = colors.amber[50];
      text = colors.amber[800];
      border = colors.amber[200];
      break;
    case 'Kritis':
    case 'Tinggi':
      bg = colors.rose[50];
      text = colors.rose[700];
      border = colors.rose[200];
      break;
    case 'Exported':
      bg = colors.indigo[50];
      text = colors.indigo[700];
      border = colors.indigo[200];
      break;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text style={[styles.badgeText, { color: text }, isSmall && styles.badgeTextSm]}>
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextSm: {
    fontSize: 10,
    fontWeight: '600',
  },
});
