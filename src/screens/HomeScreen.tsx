import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DemoBanner, JournalItem } from '../components/Rows';
import { SubjectCard } from '../components/SubjectCard';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Dialog,
  EmptyState,
  EnterView,
  Grid,
  IconButton,
  PressableScale,
  ProgressBar,
  Screen,
  SectionHeader,
  TextField,
} from '../components/ui';
import { assignmentSummary, crossSubjectStats } from '../lib/analytics';
import { addDays, greeting, HARI, reportPeriods, toISODate } from '../lib/dates';
import { useLayout } from '../lib/layout';
import { firstName } from '../lib/phone';
import { focusSession, studentContext, todaySessions } from '../lib/schedule';
import { assignmentLabel, myAssignments, myHomeroomClasses } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { color, radius, space, subjectPalette } from '../theme/tokens';
import { ClassRoom, Workspace } from '../types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function HomeScreen({ navigation }: any) {
  const ws = useAppStore((s) => s.ws)!;
  const refresh = useAppStore((s) => s.refresh);
  const pendingCount = useAppStore((s) => s.pending.length);
  const layout = useLayout();
  const [refreshing, setRefreshing] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const mine = myAssignments(ws);
  const homerooms = myHomeroomClasses(ws);
  const focus = focusSession(mine);
  const today = todaySessions(mine);
  const notifications = useNotifications(ws, pendingCount);

  const myJournals = useMemo(
    () => ws.journals.filter((j) => j.teacher_id === ws.teacher.id).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 4),
    [ws.journals, ws.teacher.id]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const header = (
    <EnterView>
      <View style={styles.header}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="body" tone={color.muted}>
            {greeting()},
          </AppText>
          <AppText variant="display" numberOfLines={2}>
            {firstName(ws.teacher.nama_lengkap)}!
          </AppText>
        </View>
        <IconButton icon="search" label="Cari siswa" onPress={() => setSearchOpen(true)} />
        <IconButton icon="notifications-outline" label="Pemberitahuan" badge={notifications.length} onPress={() => setNotifOpen(true)} />
      </View>
    </EnterView>
  );

  const hero = mine.length ? <FocusCard focus={focus} navigation={navigation} /> : null;

  const homeroomCards = homerooms.map((c, i) => (
    <EnterView key={c.id} index={i + 1}>
      <HomeroomCard cls={c} ws={ws} onPress={() => navigation.navigate('Homeroom', { classId: c.id })} />
    </EnterView>
  ));

  const subjects = (
    <View style={{ gap: space.sm }}>
      <SectionHeader
        title="Mapel yang Anda ajar"
        subtitle={mine.length ? `${mine.length} dashboard mapel x kelas` : undefined}
        action={<Button label="Kelola" size="sm" variant="ghost" onPress={() => navigation.navigate('ManageRoles')} />}
      />
      {mine.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title="Anda belum mengampu mapel"
          message="Sebagai wali kelas Anda tetap bisa meninjau semua isian guru mapel. Tambahkan mapel bila Anda juga mengajar di kelas tertentu."
          action={{ label: 'Tambah mapel', icon: 'add', onPress: () => navigation.navigate('ManageRoles') }}
        />
      ) : (
        <Grid columns={layout.isExpanded ? 3 : layout.subjectColumns}>
          {mine.map((a, i) => {
            const { subject, cls } = assignmentLabel(ws, a);
            const summary = assignmentSummary(a, ws.students, ws.journals);
            return subject && cls ? (
              <EnterView key={a.id} index={i + 2}>
                <SubjectCard
                  subject={subject}
                  className={cls.nama_kelas}
                  studentCount={summary.rows.length}
                  attention={summary.counts.Perhatian + summary.counts.Kritis}
                  onPress={() => navigation.navigate('SubjectClass', { assignmentId: a.id })}
                />
              </EnterView>
            ) : null;
          })}
        </Grid>
      )}
    </View>
  );

  const schedule = mine.length ? (
    <View style={{ gap: space.sm }}>
      <SectionHeader title="Jadwal hari ini" subtitle={HARI[new Date().getDay()]} />
      {today.length === 0 ? (
        <Card>
          <AppText variant="small" tone={color.mutedOnWhite}>
            Tidak ada jam mengajar hari ini{focus ? `. Sesi berikutnya ${HARI[addDays(new Date(), focus.dayOffset).getDay()]} pukul ${focus.slot.jam_mulai}.` : '.'}
          </AppText>
        </Card>
      ) : (
        <Card padded={false}>
          {today.map((s, i) => {
            const { subject, cls } = assignmentLabel(ws, s.assignment);
            const p = subject ? subjectPalette[subject.warna] : subjectPalette.violet;
            return (
              <PressableScale
                key={`${s.assignment.id}-${s.slot.jam_mulai}`}
                onPress={() => navigation.navigate('SubjectClass', { assignmentId: s.assignment.id })}
                scaleTo={0.985}
                accessibilityLabel={`${s.slot.jam_mulai} sampai ${s.slot.jam_selesai}, ${subject?.nama} ${cls?.nama_kelas}, ${s.state}`}
                style={[styles.slotRow, i > 0 && { borderTopWidth: 1, borderTopColor: color.line }]}
              >
                <View style={{ width: 52 }}>
                  <AppText variant="small" weight="bold">
                    {s.slot.jam_mulai}
                  </AppText>
                  <AppText variant="caption" tone={color.mutedOnWhite}>
                    {s.slot.jam_selesai}
                  </AppText>
                </View>
                <View style={[styles.slotDot, { backgroundColor: p.bg }]} />
                <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                  <AppText variant="small" weight="bold" numberOfLines={2}>
                    {subject?.nama}
                  </AppText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <AppText variant="caption" tone={color.mutedOnWhite}>
                      {cls?.nama_kelas}
                    </AppText>
                    <SessionBadge state={s.state} />
                  </View>
                </View>
              </PressableScale>
            );
          })}
        </Card>
      )}
    </View>
  ) : null;

  const recent = (
    <View style={{ gap: space.sm }}>
      <SectionHeader title="Catatan terbaru Anda" />
      {myJournals.length === 0 ? (
        <EmptyState
          icon="create-outline"
          title="Belum ada catatan jurnal"
          message={mine.length ? 'Catat pengamatan pertama Anda. Status dan grafik siswa dihitung dari catatan ini.' : 'Jurnal ditulis oleh guru mapel. Sebagai wali kelas, lihat catatan mereka di dashboard perwalian.'}
          action={mine.length ? { label: 'Catat jurnal', icon: 'create-outline', onPress: () => navigation.navigate('Journal') } : undefined}
        />
      ) : (
        myJournals.map((j) => (
          <JournalItem
            key={j.id}
            journal={j}
            student={ws.students.find((s) => s.id === j.student_id)}
            subject={ws.subjects.find((s) => s.id === j.subject_id)}
            showSubject
            onPress={() => navigation.navigate('Student', { studentId: j.student_id, assignmentId: j.assignment_id })}
          />
        ))
      )}
    </View>
  );

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      {header}
      <DemoBanner />
      {layout.twoPane ? (
        <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.6, gap: space.lg, minWidth: 0 }}>
            {hero}
            {homeroomCards}
            {subjects}
          </View>
          <View style={{ flex: 1, gap: space.lg, minWidth: 0 }}>
            {schedule}
            {recent}
          </View>
        </View>
      ) : (
        <>
          {hero}
          {homeroomCards}
          {subjects}
          {schedule}
          {recent}
        </>
      )}
      <NotificationsDialog visible={notifOpen} onClose={() => setNotifOpen(false)} items={notifications} navigation={navigation} />
      <SearchDialog visible={searchOpen} onClose={() => setSearchOpen(false)} navigation={navigation} />
    </Screen>
  );
}

function SessionBadge({ state }: { state: 'berlangsung' | 'berikutnya' | 'selesai' }) {
  const map = {
    berlangsung: { bg: color.successSoft, fg: color.success, label: 'Berlangsung', icon: 'radio-button-on' as IconName },
    berikutnya: { bg: color.infoSoft, fg: color.info, label: 'Nanti', icon: 'time-outline' as IconName },
    selesai: { bg: '#EEF2F6', fg: color.muted, label: 'Selesai', icon: 'checkmark' as IconName },
  }[state];
  return (
    <View style={[styles.sessionBadge, { backgroundColor: map.bg }]}>
      <Ionicons name={map.icon} size={12} color={map.fg} />
      <AppText variant="caption" weight="bold" tone={map.fg}>
        {map.label}
      </AppText>
    </View>
  );
}

// Fokus utama layar: sesi yang sedang berlangsung atau berikutnya.
function FocusCard({ focus, navigation }: { focus: ReturnType<typeof focusSession>; navigation: any }) {
  const ws = useAppStore((s) => s.ws)!;
  if (!focus) {
    return (
      <EnterView index={1}>
        <View style={[styles.hero, { gap: 10 }]}>
          <AppText variant="small" weight="bold" tone={color.onBrandSoft}>
            Jadwal belum diisi
          </AppText>
          <AppText variant="title" tone="#FFFFFF">
            Isi jadwal mengajar agar sesi yang sedang berlangsung muncul di sini.
          </AppText>
          <Button label="Isi jadwal" variant="onColor" icon="time-outline" onPress={() => navigation.navigate('ManageRoles')} />
        </View>
      </EnterView>
    );
  }
  const { subject, cls } = assignmentLabel(ws, focus.assignment);
  const live = focus.state === 'berlangsung';
  const when =
    focus.dayOffset === 0
      ? live
        ? `Sedang berlangsung · sampai ${focus.slot.jam_selesai}`
        : `Berikutnya hari ini · ${focus.slot.jam_mulai}`
      : `Berikutnya · ${HARI[addDays(new Date(), focus.dayOffset).getDay()]} ${focus.slot.jam_mulai}`;
  const p = subject ? subjectPalette[subject.warna] : null;
  return (
    <EnterView index={1}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroWhen}>
            {live ? <View style={styles.liveDot} accessibilityLabel="Kelas sedang berlangsung" /> : <Ionicons name="time-outline" size={14} color="#FFFFFF" />}
            <AppText variant="caption" weight="bold" tone="#FFFFFF">
              {when}
            </AppText>
          </View>
          {p ? (
            <View style={[styles.heroSubject, { backgroundColor: p.bg }]}>
              <AppText variant="caption" weight="bold" tone={p.fg}>
                {subject!.nama}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText variant="display" tone="#FFFFFF" numberOfLines={2}>
          {cls?.nama_kelas}
        </AppText>
        <AppText variant="body" tone={color.onBrandSoft} numberOfLines={2}>
          {focus.assignment.materi_aktif ? `Materi: ${focus.assignment.materi_aktif}` : `${subject?.nama}`}
        </AppText>
        <View style={styles.heroActions}>
          <Button label="Catat jurnal" icon="create-outline" variant="onColor" onPress={() => navigation.navigate('Journal', { assignmentId: focus.assignment.id })} />
          <Button
            label="Buka kelas"
            variant="ghost"
            fg="#FFFFFF"
            onPress={() => navigation.navigate('SubjectClass', { assignmentId: focus.assignment.id })}
          />
        </View>
      </View>
    </EnterView>
  );
}

function HomeroomCard({ cls, ws, onPress }: { cls: ClassRoom; ws: Workspace; onPress: () => void }) {
  const [periode] = reportPeriods();
  const students = ws.students.filter((s) => s.class_id === cls.id);
  const classAssignments = ws.assignments.filter((a) => a.class_id === cls.id);
  const reports = ws.reports.filter((r) => r.class_id === cls.id && r.periode === periode);
  const waiting = reports.filter((r) => r.status === 'Diajukan').length;
  const approved = reports.filter((r) => r.status === 'Disetujui').length;
  const target = students.length * classAssignments.length;
  const flagged = students.filter((s) => {
    const o = crossSubjectStats(s, ws.assignments, ws.subjects, ws.journals).overall;
    return o === 'Kritis' || o === 'Perhatian';
  }).length;
  return (
    <PressableScale onPress={onPress} scaleTo={0.985} style={styles.homeroom} accessibilityLabel={`Kelas perwalian ${cls.nama_kelas}. ${waiting} rapor menunggu tinjauan. Buka dashboard wali kelas`}>
      <View style={styles.homeroomHead}>
        <View style={styles.homeroomIcon}>
          <Ionicons name="ribbon" size={22} color={color.brandDeep} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="caption" weight="bold" tone={color.brand}>
            Kelas perwalian
          </AppText>
          <AppText variant="title">{cls.nama_kelas}</AppText>
        </View>
        <View style={styles.openCircle}>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </View>
      </View>
      <View style={styles.homeroomStats}>
        <Stat icon="time-outline" tone={color.info} soft={color.infoSoft} value={waiting} label="rapor menunggu tinjauan" />
        <Stat icon="alert-circle-outline" tone={color.accentInk} soft={color.accentSoft} value={flagged} label="siswa perlu perhatian" />
        <Stat icon="people-outline" tone={color.inkSoft} soft="#EEF2F6" value={students.length} label={`siswa · ${classAssignments.length} mapel`} />
      </View>
      {target > 0 ? (
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="caption" weight="semibold" tone={color.mutedOnWhite}>
              Rapor mapel disetujui · {periode}
            </AppText>
            <AppText variant="caption" weight="bold">
              {approved}/{target}
            </AppText>
          </View>
          <ProgressBar value={(approved / target) * 100} label={`${approved} dari ${target} rapor mapel disetujui`} />
        </View>
      ) : null}
    </PressableScale>
  );
}

function Stat({ icon, tone, soft, value, label }: { icon: IconName; tone: string; soft: string; value: number; label: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: soft }]}>
      <Ionicons name={icon} size={16} color={tone} />
      <AppText variant="body" weight="extrabold" tone={tone}>
        {value}
      </AppText>
      <AppText variant="caption" weight="semibold" tone={tone} style={{ flexShrink: 1 }}>
        {label}
      </AppText>
    </View>
  );
}

interface Notif {
  id: string;
  icon: IconName;
  tone: string;
  title: string;
  detail?: string;
  go: (nav: any) => void;
}

function useNotifications(ws: Workspace, pendingCount: number): Notif[] {
  return useMemo(() => {
    const list: Notif[] = [];
    myHomeroomClasses(ws).forEach((c) => {
      const n = ws.reports.filter((r) => r.class_id === c.id && r.status === 'Diajukan').length;
      if (n) list.push({ id: `rev-${c.id}`, icon: 'time-outline', tone: color.info, title: `${n} rapor mapel menunggu tinjauan Anda`, detail: `Kelas perwalian ${c.nama_kelas}`, go: (nav) => nav.navigate('Homeroom', { classId: c.id, tab: 'tinjauan' }) });
    });
    ws.reports
      .filter((r) => r.teacher_id === ws.teacher.id && r.status === 'Revisi')
      .forEach((r) => {
        const st = ws.students.find((s) => s.id === r.student_id);
        const sub = ws.subjects.find((s) => s.id === r.subject_id);
        list.push({ id: `revisi-${r.id}`, icon: 'arrow-undo', tone: color.accentInk, title: `Rapor ${st?.nama_lengkap} dikembalikan wali kelas`, detail: `${sub?.nama}: ${r.catatan_wali_kelas || 'perlu revisi'}`, go: (nav) => nav.navigate('Report', { assignmentId: r.assignment_id, studentId: r.student_id, periode: r.periode }) });
      });
    if (pendingCount) list.push({ id: 'sync', icon: 'cloud-upload-outline', tone: color.accentInk, title: `${pendingCount} catatan belum tersinkron`, detail: 'Sinkronkan dari halaman Profil', go: (nav) => nav.navigate('Main', { screen: 'Profile' }) });
    const soon = toISODate(addDays(new Date(), 3));
    const todayIso = toISODate(new Date());
    const relevant = new Set([...myAssignments(ws).map((a) => a.id)]);
    const homeroomIds = new Set(myHomeroomClasses(ws).map((c) => c.id));
    ws.assessments
      .filter((a) => a.tanggal >= todayIso && a.tanggal <= soon && (relevant.has(a.assignment_id) || homeroomIds.has(a.class_id)))
      .forEach((a) => {
        const sub = ws.subjects.find((s) => s.id === a.subject_id);
        const cls = ws.classes.find((c) => c.id === a.class_id);
        list.push({ id: `as-${a.id}`, icon: 'calendar-outline', tone: color.brand, title: a.judul, detail: `${sub?.nama} · ${cls?.nama_kelas} · ${a.tanggal === todayIso ? 'hari ini' : 'dalam 3 hari'}`, go: (nav) => nav.navigate('Main', { screen: 'Agenda' }) });
      });
    return list;
  }, [ws, pendingCount]);
}

function NotificationsDialog({ visible, onClose, items, navigation }: { visible: boolean; onClose: () => void; items: Notif[]; navigation: any }) {
  return (
    <Dialog visible={visible} onClose={onClose} title="Pemberitahuan" description="Hal yang perlu Anda tindak lanjuti.">
      {items.length === 0 ? (
        <EmptyState icon="checkmark-done-outline" title="Semua beres" message="Tidak ada rapor yang menunggu, revisi, atau agenda dalam 3 hari ke depan." />
      ) : (
        items.map((n) => (
          <PressableScale
            key={n.id}
            onPress={() => {
              onClose();
              n.go(navigation);
            }}
            scaleTo={0.98}
            style={styles.notif}
            accessibilityLabel={`${n.title}. ${n.detail || ''}`}
          >
            <Ionicons name={n.icon} size={20} color={n.tone} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="small" weight="bold">
                {n.title}
              </AppText>
              {n.detail ? (
                <AppText variant="caption" tone={color.mutedOnWhite} numberOfLines={2}>
                  {n.detail}
                </AppText>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={color.mutedOnWhite} />
          </PressableScale>
        ))
      )}
    </Dialog>
  );
}

function SearchDialog({ visible, onClose, navigation }: { visible: boolean; onClose: () => void; navigation: any }) {
  const ws = useAppStore((s) => s.ws)!;
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    return ws.students.filter((s) => s.nama_lengkap.toLowerCase().includes(query) || s.nisn.includes(query)).slice(0, 20);
  }, [q, ws.students]);
  return (
    <Dialog visible={visible} onClose={onClose} title="Cari siswa" description="Hanya siswa di kelas yang Anda ajar atau walikan.">
      <TextField label="Nama atau NISN" value={q} onChangeText={setQ} leftIcon="search" autoFocus returnKeyType="search" />
      {q.trim().length >= 2 && results.length === 0 ? (
        <AppText variant="small" tone={color.mutedOnWhite}>
          Tidak ada siswa yang cocok dengan "{q.trim()}".
        </AppText>
      ) : null}
      {results.map((s) => {
        const cls = ws.classes.find((c) => c.id === s.class_id);
        return (
          <PressableScale
            key={s.id}
            onPress={() => {
              onClose();
              setQ('');
              navigation.navigate('Student', studentContext(ws, s));
            }}
            scaleTo={0.98}
            style={styles.notif}
            accessibilityLabel={`${s.nama_lengkap}, ${cls?.nama_kelas}`}
          >
            <Avatar name={s.nama_lengkap} size={36} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="small" weight="bold" numberOfLines={1}>
                {s.nama_lengkap}
              </AppText>
              <AppText variant="caption" tone={color.mutedOnWhite}>
                {cls?.nama_kelas} · NISN {s.nisn}
              </AppText>
            </View>
          </PressableScale>
        );
      })}
    </Dialog>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hero: { backgroundColor: color.brand, borderRadius: radius.xl, padding: space.lg, gap: 6 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  heroWhen: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm, backgroundColor: color.brandDeep },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#86EFAC' },
  heroSubject: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  heroActions: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  homeroom: { backgroundColor: color.surface, borderRadius: radius.xl, padding: space.md, gap: 14, borderWidth: 1, borderColor: color.line },
  homeroomHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  homeroomIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center' },
  openCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.brand, alignItems: 'center', justifyContent: 'center' },
  homeroomStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.md, flexGrow: 1 },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.md, paddingVertical: 12, minHeight: 56 },
  slotDot: { width: 10, height: 10, borderRadius: 5 },
  sessionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  notif: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 56, borderRadius: radius.md, backgroundColor: color.surfaceMuted, borderWidth: 1, borderColor: color.line },
});
