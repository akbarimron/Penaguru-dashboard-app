import React, { useEffect, useRef } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '../../lib/layout';
import { duration, easing, isReducedMotion, useNativeDriver } from '../../lib/motion';
import { color, elevation, radius, space } from '../../theme/tokens';
import { useUiStore } from '../../store/useUiStore';
import { AppText } from './AppText';
import { Button, IconButton } from './Button';

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

// Dialog: di ponsel tampil sebagai lembar dari bawah (mudah dijangkau jempol),
// di layar lebar tampil di tengah. Tutup dengan tombol X, ketuk latar, Escape
// (web) atau tombol kembali (Android).
export function Dialog({ visible, onClose, title, description, children, footer }: DialogProps) {
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const sheet = layout.isCompact;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    progress.setValue(isReducedMotion() ? 1 : 0);
    Animated.timing(progress, { toValue: 1, duration: 320, easing: easing.enter, useNativeDriver }).start();
  }, [visible, progress]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, sheet ? styles.rootSheet : styles.rootCenter]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Tutup dialog" accessibilityRole="button">
          <View style={[StyleSheet.absoluteFill, { backgroundColor: color.scrim }]} />
        </Pressable>
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.panel,
            elevation.dialog,
            sheet
              ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingBottom: space.md + insets.bottom, maxHeight: '92%' }
              : { width: 520, maxWidth: '92%', maxHeight: '86%' },
            {
              opacity: progress,
              transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [sheet ? 40 : 16, 0] }) }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="title" accessibilityRole="header">
                {title}
              </AppText>
              {description ? (
                <AppText variant="small" tone={color.mutedOnWhite}>
                  {description}
                </AppText>
              ) : null}
            </View>
            <IconButton icon="close" label="Tutup" onPress={onClose} variant="ghost" />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: space.md, paddingBottom: 4 }} style={{ flexGrow: 0 }}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ConfirmHost() {
  const req = useUiStore((s) => s.confirmRequest);
  const close = useUiStore((s) => s.closeConfirm);
  return (
    <Dialog
      visible={Boolean(req)}
      onClose={() => close(false)}
      title={req?.title || ''}
      footer={
        <>
          <Button label="Batal" variant="ghost" onPress={() => close(false)} />
          <Button label={req?.confirmLabel || 'Lanjutkan'} variant={req?.destructive ? 'danger' : 'primary'} onPress={() => close(true)} />
        </>
      }
    >
      <AppText tone={color.inkSoft}>{req?.message}</AppText>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  rootSheet: { justifyContent: 'flex-end' },
  rootCenter: { justifyContent: 'center', alignItems: 'center' },
  panel: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    gap: space.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' },
});

export const dialogDuration = duration.standard;
