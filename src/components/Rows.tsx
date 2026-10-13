import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { isAttentionTag, StudentStats } from '../lib/analytics';
import { formatShortDate, relativeDay } from '../lib/dates';
import { useAppStore } from '../store/useAppStore';
import { color, radius, subjectPalette } from '../theme/tokens';
import { DailyJournal, Student, Subject } from '../types';
import { AppText, Avatar, PressableScale, StatusPill } from './ui';

export function StudentRow({ student, stats, onPress, right, actionLabel = 'Buka detail siswa' }: { student: Student; stats?: StudentStats; onPress: () => void; right?: React.ReactNode; actionLabel?: string }) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      accessibilityLabel={`${student.nama_lengkap}${stats ? `, status ${stats.status}` : ''}. ${actionLabel}`}
      style={styles.row}
    >
      <Avatar name={student.nama_lengkap} size={44} />
      <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
        <AppText variant="body" weight="bold" numberOfLines={1}>
          {student.nama_lengkap}
        </AppText>
        {stats?.scores ? (
          <View style={styles.scores}>
            <Score label="P" value={stats.scores.kognitif} full="Pengetahuan" />
            <Score label="K" value={stats.scores.keterampilan} full="Keterampilan" />
            <Score label="S" value={stats.scores.sikap} full="Sikap" />
            {stats.trend ? (
              <View style={styles.trend}>
                <Ionicons
                  name={stats.trend === 'naik' ? 'trending-up' : stats.trend === 'turun' ? 'trending-down' : 'remove'}
                  size={15}
                  color={stats.trend === 'turun' ? color.critical : stats.trend === 'naik' ? color.success : color.mutedOnWhite}
                />
                <AppText variant="caption" tone={color.mutedOnWhite}>
                  {stats.trend}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : (
          <AppText variant="caption" tone={color.mutedOnWhite}>
            NISN {student.nisn}
          </AppText>
        )}
        {stats?.reason ? (
          <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={1}>
            {stats.reason}
          </AppText>
        ) : null}
      </View>
      {right ?? (stats ? <StatusPill status={stats.status} compact /> : null)}
      <Ionicons name="chevron-forward" size={18} color={color.mutedOnWhite} />
    </PressableScale>
  );
}

function Score({ label, value, full }: { label: string; value: number; full: string }) {
  return (
    <View style={styles.score} accessibilityLabel={`${full} ${value}`}>
      <AppText variant="caption" weight="bold" tone={color.muted}>
        {label}
      </AppText>
      <AppText variant="caption" weight="extrabold" tone={color.ink}>
        {value}
      </AppText>
    </View>
  );
}

export function JournalItem({ journal, student, subject, showSubject, showStudent = true, onPress }: { journal: DailyJournal; student?: Student; subject?: Subject; showSubject?: boolean; showStudent?: boolean; onPress?: () => void }) {
  const p = subject ? subjectPalette[subject.warna] : null;
  const colleagues = useAppStore((s) => s.ws?.colleagues);
  const me = useAppStore((s) => s.ws?.teacher.id);
  const author = journal.teacher_id === me ? 'Anda' : colleagues?.find((c) => c.id === journal.teacher_id)?.nama_lengkap;
  const body = (
    <>
      <View style={styles.journalHead}>
        {showStudent && student ? <Avatar name={student.nama_lengkap} size={32} /> : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          {showStudent && student ? (
            <AppText variant="small" weight="bold" numberOfLines={1}>
              {student.nama_lengkap}
            </AppText>
          ) : null}
          <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={1}>
            {relativeDay(journal.tanggal)} · {journal.materi}
            {showSubject && author ? ` · ${author}` : ''}
          </AppText>
        </View>
        {!journal.is_synced ? <StatusPill status="Menunggu sinkron" compact /> : null}
      </View>
      {showSubject && subject && p ? (
        <View style={[styles.subjectTag, { backgroundColor: p.soft }]}>
          <View style={[styles.dot, { backgroundColor: p.bg }]} />
          <AppText variant="caption" weight="bold" tone={p.ink}>
            {subject.nama}
          </AppText>
        </View>
      ) : null}
      <View style={styles.scores}>
        <Score label="P" value={journal.nilai_kognitif} full="Pengetahuan" />
        <Score label="K" value={journal.nilai_keterampilan} full="Keterampilan" />
        <Score label="S" value={journal.skor_sikap} full="Sikap" />
        <AppText variant="caption" tone={color.mutedOnWhite}>
          skala 1-5
        </AppText>
      </View>
      {journal.catatan ? (
        <AppText variant="small" tone={color.inkSoft}>
          {journal.catatan}
        </AppText>
      ) : null}
      {journal.tags.length ? (
        <View style={styles.tags}>
          {journal.tags.map((t) => {
            const attention = isAttentionTag(t);
            return (
              <View key={t} style={[styles.tag, attention ? { backgroundColor: color.accentSoft } : null]}>
                {attention ? <Ionicons name="alert-circle" size={12} color={color.accentInk} /> : null}
                <AppText variant="caption" weight="semibold" tone={attention ? color.accentInk : color.inkSoft}>
                  {t}
                </AppText>
              </View>
            );
          })}
        </View>
      ) : null}
    </>
  );
  if (!onPress) return <View style={styles.journal}>{body}</View>;
  return (
    <PressableScale onPress={onPress} scaleTo={0.985} style={styles.journal} accessibilityLabel={`Catatan ${student?.nama_lengkap || ''} ${formatShortDate(journal.tanggal)}`}>
      {body}
    </PressableScale>
  );
}

export function DemoBanner() {
  const mode = useAppStore((s) => s.mode);
  if (mode !== 'demo') return null;
  return (
    <View style={styles.demo} accessibilityRole="text">
      <Ionicons name="flask-outline" size={16} color={color.info} />
      <AppText variant="caption" weight="semibold" tone={color.info} style={{ flex: 1 }}>
        Mode demo: nama guru, siswa, dan nilai di sini adalah data contoh yang tersimpan di perangkat ini.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    minHeight: 64,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
  },
  scores: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  score: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, backgroundColor: '#F1F5F9' },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  journal: {
    gap: 8,
    padding: 14,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.line,
  },
  journalHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subjectTag: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#F1F5F9' },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: color.infoSoft,
  },
});
