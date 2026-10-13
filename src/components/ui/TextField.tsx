import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import { Platform, Pressable, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { color, font, radius } from '../../theme/tokens';
import { AppText } from './AppText';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  hint?: string;
  leftIcon?: IconName;
  secureToggle?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  optional?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, hint, leftIcon, secureToggle, containerStyle, optional, multiline, secureTextEntry, onFocus, onBlur, editable, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  // Kolom multi-baris tumbuh mengikuti isi (84-320px) agar teks panjang terbaca utuh.
  const [contentH, setContentH] = useState(84);
  const readOnly = editable === false;
  const borderColor = error ? color.danger : focused ? color.brand : color.lineStrong;

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      <AppText variant="small" weight="semibold" tone={color.inkSoft}>
        {label}
        {optional ? <AppText variant="small" tone={color.muted}> (opsional)</AppText> : null}
      </AppText>
      <View
        style={[
          styles.box,
          { borderColor, borderWidth: focused || error ? 2 : 1.5 },
          multiline && { minHeight: 104, alignItems: 'flex-start', paddingVertical: 10 },
          readOnly && { backgroundColor: color.surfaceMuted, borderColor: color.line, borderWidth: 1 },
        ]}
      >
        {leftIcon ? <Ionicons name={leftIcon} size={18} color={color.muted} style={multiline ? { marginTop: 2 } : null} /> : null}
        <TextInput
          ref={ref}
          {...rest}
          multiline={multiline}
          editable={editable}
          onContentSizeChange={multiline ? (e) => setContentH(e.nativeEvent.contentSize.height) : undefined}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          placeholderTextColor={color.mutedOnWhite}
          accessibilityLabel={label}
          accessibilityHint={error || hint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            multiline && { textAlignVertical: 'top', minHeight: 84, height: Math.min(320, Math.max(84, contentH)) },
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
          ]}
        />
        {secureToggle ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi'}
            hitSlop={10}
            style={styles.eye}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={color.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.row} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={15} color={color.danger} />
          <AppText variant="small" tone={color.danger} style={{ flex: 1 }}>
            {error}
          </AppText>
        </View>
      ) : hint ? (
        <AppText variant="caption" tone={color.muted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: color.surface,
  },
  input: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: 15,
    color: color.ink,
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    minWidth: 0,
  },
  eye: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
