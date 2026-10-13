import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { color, font, minTap, radius } from '../../theme/tokens';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Variant = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger' | 'onColor';

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: color.brand, fg: color.onBrand },
  secondary: { bg: color.surface, fg: color.brand, border: color.brand },
  subtle: { bg: color.brandSoft, fg: color.brandDeep },
  ghost: { bg: 'transparent', fg: color.brand },
  danger: { bg: color.danger, fg: '#FFFFFF' },
  onColor: { bg: '#FFFFFF', fg: color.brandDeep },
};

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  size?: 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  fg?: string;
}

export function Button({ label, onPress, variant = 'primary', icon, size = 'md', loading, disabled, fullWidth, style, accessibilityHint, fg }: ButtonProps) {
  const v = VARIANTS[variant];
  const textColor = fg || v.fg;
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      // Di atas permukaan berwarna (kartu teal/mapel) cincin fokus putih agar tetap terlihat.
      focusRingColor={variant === 'onColor' || textColor === '#FFFFFF' && variant === 'ghost' ? '#FFFFFF' : color.brand}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: Boolean(loading) }}
      hitSlop={size === 'sm' ? 4 : 0}
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: v.bg, borderColor: v.border || 'transparent' },
        fullWidth && { alignSelf: 'stretch' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : icon ? (
        <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={textColor} />
      ) : null}
      <AppText variant={size === 'sm' ? 'small' : 'body'} weight="bold" tone={textColor} numberOfLines={1} style={{ flexShrink: 1 }}>
        {label}
      </AppText>
    </PressableScale>
  );
}

interface IconButtonProps {
  icon: IconName;
  label: string; // wajib untuk pembaca layar
  onPress?: () => void;
  variant?: 'surface' | 'brand' | 'ghost' | 'onColor';
  badge?: number;
  size?: number;
  iconColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({ icon, label, onPress, variant = 'surface', badge, size = minTap, iconColor, disabled, style }: IconButtonProps) {
  const bg =
    variant === 'brand' ? color.brand : variant === 'surface' ? color.surface : variant === 'onColor' ? 'rgba(255,255,255,0.18)' : 'transparent';
  const fg = iconColor || (variant === 'brand' || variant === 'onColor' ? '#FFFFFF' : color.ink);
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={badge ? `${label}, ${badge} baru` : label}
      focusRingColor={variant === 'onColor' ? '#FFFFFF' : color.brand}
      scaleTo={0.92}
      style={[
        styles.icon,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        variant === 'surface' && styles.iconSurface,
        style,
      ]}
    >
      <Ionicons name={icon} size={Math.round(size * 0.45)} color={fg} />
      {badge ? (
        <View style={styles.badge} accessibilityElementsHidden importantForAccessibility="no">
          <AppText variant="caption" weight="bold" tone="#FFFFFF" style={{ fontSize: 11, lineHeight: 14 }}>
            {badge > 9 ? '9+' : badge}
          </AppText>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  md: { minHeight: 48, paddingHorizontal: 18 },
  sm: { minHeight: 38, paddingHorizontal: 12 },
  icon: { alignItems: 'center', justifyContent: 'center' },
  iconSurface: { borderWidth: 1, borderColor: color.line },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: color.critical,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export const buttonFont = font.bold;
