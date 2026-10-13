import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color, radius } from '../../theme/tokens';
import { ReportStatus, StudentStatus } from '../../types';
import { AppText } from './AppText';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type PillKind = StudentStatus | ReportStatus | 'Final' | 'Belum dibuat' | 'Menunggu sinkron';

// Status selalu ditampilkan sebagai ikon + teks, bukan warna saja.
const MAP: Record<PillKind, { bg: string; fg: string; icon: IconName }> = {
  Aman: { bg: color.successSoft, fg: color.success, icon: 'checkmark-circle' },
  Perhatian: { bg: color.accentSoft, fg: color.accentInk, icon: 'alert-circle' },
  Kritis: { bg: color.criticalSoft, fg: color.critical, icon: 'warning' },
  'Belum ada data': { bg: '#EEF2F6', fg: color.muted, icon: 'ellipsis-horizontal-circle' },
  Draft: { bg: '#EEF2F6', fg: color.inkSoft, icon: 'create-outline' },
  Diajukan: { bg: color.infoSoft, fg: color.info, icon: 'time-outline' },
  Revisi: { bg: color.accentSoft, fg: color.accentInk, icon: 'arrow-undo' },
  Disetujui: { bg: color.successSoft, fg: color.success, icon: 'checkmark-done' },
  Final: { bg: color.successSoft, fg: color.success, icon: 'lock-closed' },
  'Belum dibuat': { bg: '#EEF2F6', fg: color.muted, icon: 'remove-circle-outline' },
  'Menunggu sinkron': { bg: color.accentSoft, fg: color.accentInk, icon: 'cloud-upload-outline' },
};

export function StatusPill({ status, compact }: { status: PillKind; compact?: boolean }) {
  const m = MAP[status];
  return (
    <View style={[styles.pill, { backgroundColor: m.bg }, compact && styles.compact]}>
      <Ionicons name={m.icon} size={compact ? 13 : 14} color={m.fg} />
      <AppText variant="caption" weight="bold" tone={m.fg} numberOfLines={1}>
        {status}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  compact: { paddingHorizontal: 6, paddingVertical: 2 },
});
