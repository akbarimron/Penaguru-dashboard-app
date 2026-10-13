import React from 'react';
import { StyleProp, Text, TextProps, TextStyle, useWindowDimensions } from 'react-native';
import { color, font, FontWeightKey, typeScale, TypeVariant } from '../../theme/tokens';

interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  weight?: FontWeightKey;
  tone?: string;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

const defaultWeight: Record<TypeVariant, FontWeightKey> = {
  display: 'extrabold',
  title: 'bold',
  heading: 'bold',
  body: 'regular',
  small: 'medium',
  caption: 'medium',
};

const lineHeight = (size: number) => Math.round(size * (size >= 20 ? 1.25 : 1.45));

export function AppText({ variant = 'body', weight, tone = color.ink, align, style, children, ...rest }: AppTextProps) {
  const { width } = useWindowDimensions();
  const scale = width >= 1024 ? typeScale.wide : typeScale.compact;
  const size = scale[variant];
  return (
    <Text
      maxFontSizeMultiplier={2}
      {...rest}
      style={[
        { fontFamily: font[weight || defaultWeight[variant]], fontSize: size, lineHeight: lineHeight(size), color: tone, textAlign: align },
        variant === 'display' || variant === 'title' ? { letterSpacing: -0.3 } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
