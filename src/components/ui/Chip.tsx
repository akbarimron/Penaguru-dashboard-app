import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { color, radius, SubjectPalette } from '../../theme/tokens';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  tone?: 'brand' | 'positive' | 'attention';
  palette?: SubjectPalette;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  asButton?: boolean; // aksi sekali tekan, bukan pilihan
}

// Chip pilihan. Status terpilih ditandai ikon centang + warna, tidak hanya warna.
export function Chip({ label, selected, onPress, icon, tone = 'brand', palette, style, accessibilityLabel, asButton }: ChipProps) {
  let bg = color.surface;
  let fg = color.inkSoft;
  let border = color.lineStrong;
  if (selected) {
    if (palette) {
      bg = palette.bg;
      fg = palette.fg;
      border = palette.bg;
    } else if (tone === 'attention') {
      bg = color.accentSoft;
      fg = color.accentInk;
      border = color.accentInk;
    } else if (tone === 'positive') {
      bg = color.successSoft;
      fg = color.success;
      border = color.success;
    } else {
      bg = color.brand;
      fg = color.onBrand;
      border = color.brand;
    }
  }
  const shownIcon: IconName | undefined = selected ? 'checkmark-circle' : icon;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole={asButton ? 'button' : 'checkbox'}
      accessibilityState={asButton ? undefined : { checked: Boolean(selected) }}
      accessibilityLabel={accessibilityLabel || label}
      hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
      scaleTo={0.95}
      style={[styles.chip, { backgroundColor: bg, borderColor: border }, style]}
    >
      {shownIcon ? <Ionicons name={shownIcon} size={16} color={fg} /> : null}
      <AppText variant="small" weight={selected ? 'bold' : 'semibold'} tone={fg} numberOfLines={1} style={{ flexShrink: 1 }}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    maxWidth: '100%',
  },
});

export const chipRadius = radius.sm;
