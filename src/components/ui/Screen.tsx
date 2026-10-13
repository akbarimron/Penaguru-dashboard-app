import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '../../lib/layout';
import { color, space } from '../../theme/tokens';
import { AppText } from './AppText';
import { IconButton } from './Button';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  header?: React.ReactNode; // menempel di atas, tidak ikut bergulir
  footer?: React.ReactNode; // bar aksi menempel di bawah
  onRefresh?: () => void;
  refreshing?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  bg?: string;
  topInset?: boolean;
}

// Wadah layar: lebar konten dibatasi sesuai ukuran layar (R-03) dan
// form tidak tertutup keyboard di ponsel.
export function Screen({ children, scroll = true, header, footer, onRefresh, refreshing = false, contentStyle, bg = color.bg, topInset = true }: ScreenProps) {
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const inner = [
    { width: '100%' as const, maxWidth: layout.contentMaxWidth, alignSelf: 'center' as const, paddingHorizontal: layout.gutter, gap: space.lg },
    contentStyle,
  ];
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1, paddingTop: topInset ? insets.top : 0 }}>
        {header}
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingTop: space.md, paddingBottom: space.xxl }}
            refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.brand} colors={[color.brand]} /> : undefined}
          >
            <View style={inner}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, inner]}>{children}</View>
        )}
        {footer ? (
          <View style={styles.footer}>
            <View style={{ width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter }}>{footer}</View>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  back?: boolean;
  tone?: { bg: string; fg: string };
}

export function ScreenHeader({ title, subtitle, right, back = true, tone }: ScreenHeaderProps) {
  const nav = useNavigation<any>();
  const layout = useLayout();
  const fg = tone?.fg || color.ink;
  return (
    <View style={{ backgroundColor: tone?.bg || color.bg }}>
      <View style={[styles.header, { maxWidth: layout.contentMaxWidth, paddingHorizontal: layout.gutter }]}>
        {back && nav.canGoBack() ? (
          <IconButton icon="arrow-back" label="Kembali" onPress={() => nav.goBack()} variant={tone ? 'onColor' : 'surface'} iconColor={tone ? fg : undefined} />
        ) : null}
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="heading" tone={fg} numberOfLines={1} accessibilityRole="header">
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="small" tone={tone ? fg : color.muted} numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: color.line,
    backgroundColor: color.surface,
    paddingVertical: 12,
  },
});
