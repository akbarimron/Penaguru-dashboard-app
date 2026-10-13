import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { AppText, Button, Card, Dialog, EmptyState, EnterView, Screen, ScreenHeader, Segmented, StatusPill, TextField } from '../components/ui';
import { journalsOf } from '../lib/analytics';
import { formatShortDate } from '../lib/dates';
import { useLayout } from '../lib/layout';
import { whatsappLink } from '../lib/phone';
import { draftReportFromJournals } from '../lib/reportGenerator';
import { isHomeroomOf, teacherName } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { confirmDialog, toast } from '../store/useUiStore';
import { color, radius, space, subjectPalette } from '../theme/tokens';

type Fields = { keunggulan: string; rekomendasi: string; narasi: string; pesan_wali: string };
const EMPTY: Fields = { keunggulan: '', rekomendasi: '', narasi: '', pesan_wali: '' };

const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export function ReportScreen({ route, navigation }: any) {
  const ws = useAppStore((s) => s.ws)!;
  const saveReport = useAppStore((s) => s.saveReport);
  const setReportStatus = useAppStore((s) => s.setReportStatus);
  const reviewReport = useAppStore((s) => s.reviewReport);
  const layout = useLayout();
  const { assignmentId, studentId, periode } = route.params || {};
  const a = ws.assignments.find((x) => x.id === assignmentId);
  const student = ws.students.find((s) => s.id === studentId);
  const report = ws.reports.find((r) => r.assignment_id === assignmentId && r.student_id === studentId && r.periode === periode);
  const [fields, setFields] = useState<Fields>(report ? pick(report) : EMPTY);
  const [tab, setTab] = useState<'rapor' | 'ortu'>('rapor');
  const [busy, setBusy] = useState<string | null>(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnNote, setReturnNote] = useState('');
  const [returnError, setReturnError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (report && !dirty) setFields(pick(report));
  }, [report?.updated_at]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!a || !student) {
    return (
      <Screen header={<ScreenHeader title="Rapor mapel" />}>
        <EmptyState icon="document-outline" title="Rapor tidak ditemukan" message="Data rapor ini tidak tersedia untuk akun Anda." />
      </Screen>
    );
  }
  const subject = ws.subjects.find((s) => s.id === a.subject_id)!;
  const cls = ws.classes.find((c) => c.id === a.class_id)!;
  const p = subjectPalette[subject.warna];
  const isAuthor = a.teacher_id === ws.teacher.id;
  const isReviewer = isHomeroomOf(ws, a.class_id);
  if (!isAuthor && !isReviewer) {
    return (
      <Screen header={<ScreenHeader title="Rapor mapel" />}>
        <EmptyState icon="lock-closed-outline" title="Tidak ada akses" message="Rapor ini hanya dapat dibuka guru pengampu dan wali kelasnya." />
      </Screen>
    );
  }

  const status = report?.status;
  const editable = isAuthor && (!report || status === 'Draft' || status === 'Revisi');
  const canReview = isReviewer && status === 'Diajukan';
  const journals = journalsOf(ws.journals, { assignmentId: a.id, studentId: student.id });
  const set = (k: keyof Fields) => (t: string) => {
    setFields((f) => ({ ...f, [k]: t }));
    setDirty(true);
  };

  const generate = async () => {
    const d = draftReportFromJournals(student, subject, journals, periode);
    if (!d) {
      toast('Belum ada jurnal untuk siswa ini. Catat pengamatan dulu.', 'error');
      return;
    }
    if (Object.values(fields).some((v) => v.trim())) {
      const ok = await confirmDialog({ title: 'Ganti isi dengan draf baru?', message: 'Teks yang sudah Anda tulis akan diganti dengan draf dari jurnal.', confirmLabel: 'Ganti' });
      if (!ok) return;
    }
    setFields({ keunggulan: d.keunggulan, rekomendasi: d.rekomendasi, narasi: d.narasi, pesan_wali: d.pesan_wali });
    setDirty(true);
    toast(`Draf disusun dari ${d.basedOn} catatan jurnal. Baca dan sesuaikan.`, 'info');
  };

  const persist = async () => {
    const saved = await saveReport({
      id: report?.id,
      assignment_id: a.id,
      class_id: a.class_id,
      subject_id: a.subject_id,
      teacher_id: ws.teacher.id,
      student_id: student.id,
      periode,
      ...fields,
    });
    setDirty(false);
    return saved;
  };

  const saveDraft = async () => {
    setBusy('save');
    try {
      await persist();
      toast('Draf rapor disimpan.');
    } catch (e: any) {
      toast(e?.message || 'Gagal menyimpan.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    if (!fields.narasi.trim() || !fields.pesan_wali.trim()) {
      toast('Isi narasi rapor dan pesan untuk orang tua sebelum diajukan.', 'error');
      return;
    }
    setBusy('submit');
    try {
      const saved = await persist();
      await setReportStatus(saved.id, 'Diajukan');
      toast('Rapor diajukan ke wali kelas.');
    } catch (e: any) {
      toast(e?.message || 'Gagal mengajukan.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const withdraw = async () => {
    setBusy('withdraw');
    try {
      await setReportStatus(report!.id, 'Draft');
      toast('Rapor ditarik kembali menjadi draf.', 'info');
    } catch (e: any) {
      toast(e?.message || 'Gagal menarik rapor.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const approve = async () => {
    setBusy('approve');
    try {
      await reviewReport(report!.id, 'Disetujui', null);
      toast(`Rapor ${subject.nama} untuk ${student.nama_lengkap} disetujui.`);
    } catch (e: any) {
      toast(e?.message || 'Gagal menyetujui.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const sendBack = async () => {
    if (returnNote.trim().length < 10) {
      setReturnError('Jelaskan apa yang perlu diperbaiki, minimal 10 karakter.');
      return;
    }
    setBusy('return');
    try {
      await reviewReport(report!.id, 'Revisi', returnNote.trim());
      setReturnOpen(false);
      setReturnNote('');
      toast('Rapor dikembalikan ke guru mapel dengan catatan Anda.', 'info');
    } catch (e: any) {
      setReturnError(e?.message || 'Gagal mengembalikan.');
    } finally {
      setBusy(null);
    }
  };

  const wa = whatsappLink(student.no_whatsapp_wali, fields.pesan_wali);

  const meta = (
    <EnterView>
      <Card style={{ gap: 12 }}>
        <View style={styles.between}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="heading" numberOfLines={1}>
              {student.nama_lengkap}
            </AppText>
            <AppText variant="caption" tone={color.mutedOnWhite}>
              {periode} · ditulis {isAuthor ? 'oleh Anda' : `oleh ${teacherName(ws, a.teacher_id)}`}
            </AppText>
          </View>
          <StatusPill status={status || 'Belum dibuat'} />
        </View>
        <View style={styles.timeline}>
          {[
            ['Draf', true, null],
            ['Diajukan', Boolean(report?.submitted_at) || status === 'Disetujui', report?.submitted_at],
            ['Ditinjau', status === 'Disetujui' || status === 'Revisi', report?.reviewed_at],
          ].map(([label, done, at], i) => (
            <View key={label as string} style={styles.step}>
              <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={done ? color.brand : color.lineStrong} />
              <View>
                <AppText variant="caption" weight="bold" tone={done ? color.ink : color.mutedOnWhite}>
                  {label as string}
                </AppText>
                {at ? (
                  <AppText variant="caption" tone={color.mutedOnWhite}>
                    {formatShortDate((at as string).slice(0, 10))}
                  </AppText>
                ) : null}
              </View>
              {i < 2 ? <View style={styles.stepLine} /> : null}
            </View>
          ))}
        </View>
        {status === 'Revisi' && report?.catatan_wali_kelas ? (
          <View style={styles.revisi} accessibilityRole="alert">
            <Ionicons name="arrow-undo" size={18} color={color.accentInk} />
            <View style={{ flex: 1 }}>
              <AppText variant="small" weight="bold" tone={color.accentInk}>
                Catatan revisi dari wali kelas
              </AppText>
              <AppText variant="small" tone={color.accentInk}>
                {report.catatan_wali_kelas}
              </AppText>
            </View>
          </View>
        ) : null}
        {editable ? (
          <View style={styles.genRow}>
            <AppText variant="small" tone={color.inkSoft} style={{ flex: 1, minWidth: 180 }}>
              {journals.length ? `${journals.length} catatan jurnal tersedia sebagai bahan.` : 'Belum ada jurnal untuk siswa ini di mapel Anda.'}
            </AppText>
            <Button label="Susun draf dari jurnal" icon="document-text-outline" variant="subtle" size="sm" onPress={generate} disabled={!journals.length} />
          </View>
        ) : null}
      </Card>
    </EnterView>
  );

  const editor = (
    <EnterView index={1}>
      <Card style={{ gap: 14 }}>
        <Segmented
          accessibilityLabel="Bagian rapor"
          value={tab}
          onChange={setTab}
          options={[
            { key: 'rapor', label: 'Untuk rapor' },
            { key: 'ortu', label: 'Untuk orang tua' },
          ]}
        />
        {tab === 'rapor' ? (
          <>
            <TextField label="Keunggulan" multiline value={fields.keunggulan} onChangeText={set('keunggulan')} editable={editable} placeholder="Kekuatan yang terlihat dari jurnal." />
            <TextField label="Rekomendasi" multiline value={fields.rekomendasi} onChangeText={set('rekomendasi')} editable={editable} placeholder="Satu langkah perbaikan yang konkret." />
            <TextField
              label="Narasi rapor"
              multiline
              value={fields.narasi}
              onChangeText={set('narasi')}
              editable={editable}
              hint={`${words(fields.narasi)} kata. Usahakan 60-80 kata.`}
              placeholder="Paragraf deskripsi capaian untuk rapor."
            />
          </>
        ) : (
          <>
            <TextField
              label="Pesan untuk orang tua"
              multiline
              value={fields.pesan_wali}
              onChangeText={set('pesan_wali')}
              editable={editable}
              hint="Bahasa santun dan mudah dipahami. Dapat dikirim lewat WhatsApp setelah disetujui."
            />
            {status === 'Disetujui' ? (
              <View style={styles.wrap}>
                <Button
                  label="Salin pesan"
                  icon="copy-outline"
                  variant="secondary"
                  size="sm"
                  onPress={async () => {
                    await Clipboard.setStringAsync(fields.pesan_wali);
                    toast('Pesan disalin.');
                  }}
                />
                <Button label="Kirim via WhatsApp" icon="logo-whatsapp" size="sm" disabled={!wa} onPress={() => wa && Linking.openURL(wa)} />
                {!wa ? (
                  <AppText variant="caption" tone={color.mutedOnWhite}>
                    Nomor WhatsApp wali belum diisi wali kelas.
                  </AppText>
                ) : null}
              </View>
            ) : (
              <AppText variant="caption" tone={color.mutedOnWhite}>
                Tombol kirim muncul setelah rapor disetujui wali kelas.
              </AppText>
            )}
          </>
        )}
      </Card>
    </EnterView>
  );

  const footer = editable ? (
    <View style={styles.footer}>
      <Button label="Simpan draf" variant="secondary" onPress={saveDraft} loading={busy === 'save'} />
      <Button label="Ajukan ke wali kelas" icon="send-outline" onPress={submit} loading={busy === 'submit'} />
    </View>
  ) : canReview ? (
    <View style={styles.footer}>
      <Button label="Kembalikan" icon="arrow-undo" variant="secondary" onPress={() => setReturnOpen(true)} />
      <Button label="Setujui" icon="checkmark-done" onPress={approve} loading={busy === 'approve'} />
    </View>
  ) : isAuthor && status === 'Diajukan' ? (
    <View style={styles.footer}>
      <AppText variant="small" tone={color.muted} style={{ flex: 1 }}>
        Menunggu tinjauan wali kelas.
      </AppText>
      <Button label="Tarik kembali" variant="ghost" onPress={withdraw} loading={busy === 'withdraw'} />
    </View>
  ) : undefined;

  return (
    <Screen header={<ScreenHeader title={`Rapor ${subject.nama}`} subtitle={cls.nama_kelas} tone={{ bg: p.bg, fg: p.fg }} />} footer={footer}>
      {layout.twoPane ? (
        <View style={{ flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>{meta}</View>
          <View style={{ flex: 1.4 }}>{editor}</View>
        </View>
      ) : (
        <>
          {meta}
          {editor}
        </>
      )}
      <Dialog
        visible={returnOpen}
        onClose={() => setReturnOpen(false)}
        title="Kembalikan untuk revisi"
        description={isAuthor ? 'Rapor ini Anda tulis sendiri. Catatan disimpan sebagai pengingat revisi.' : `Catatan ini dikirim ke ${teacherName(ws, a.teacher_id)}.`}
        footer={
          <>
            <Button label="Batal" variant="ghost" onPress={() => setReturnOpen(false)} />
            <Button label="Kembalikan" icon="arrow-undo" onPress={sendBack} loading={busy === 'return'} />
          </>
        }
      >
        <TextField
          label="Apa yang perlu diperbaiki?"
          multiline
          value={returnNote}
          onChangeText={(t) => {
            setReturnNote(t);
            setReturnError(null);
          }}
          error={returnError}
          placeholder="Contoh: sebutkan materi yang sudah dikuasai, bukan hanya nilai."
          autoFocus
        />
      </Dialog>
    </Screen>
  );
}

function pick(r: Fields): Fields {
  return { keunggulan: r.keunggulan, rekomendasi: r.rekomendasi, narasi: r.narasi, pesan_wali: r.pesan_wali };
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  timeline: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, flexGrow: 1 },
  stepLine: { flex: 1, height: 2, backgroundColor: color.line, marginTop: 8, minWidth: 12 },
  revisi: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: color.accentSoft },
  genRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: 12, borderRadius: radius.md, backgroundColor: color.brandTint },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
});
