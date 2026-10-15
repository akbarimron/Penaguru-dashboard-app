import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { parseVoiceJournalWithAI } from '../api/gemini';
import { speechManager } from '../lib/speech';
import { playPopSound } from '../lib/sound';
import { color, radius, space } from '../theme/tokens';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';
import { toast } from '../store/useUiStore';

interface VoiceJournalModalProps {
  open: boolean;
  onClose: () => void;
  onApplyNote: (note: string) => void;
  onApplyParsed?: (parsed: {
    catatan: string;
    studentIds: string[];
    kog?: number | null;
    ket?: number | null;
    sik?: number | null;
    tags: string[];
  }) => void;
  availableStudents?: { id: string; nama_lengkap: string }[];
  currentMateri?: string;
}

export function VoiceJournalModal({
  open,
  onClose,
  onApplyNote,
  onApplyParsed,
  availableStudents = [],
  currentMateri = '',
}: VoiceJournalModalProps) {
  const [listening, setListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [parsingAI, setParsingAI] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (listening) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      loop?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [listening, pulseAnim]);

  useEffect(() => {
    if (open) {
      setTranscribedText('');
      setInterimText('');
      startVoiceSession();
    } else {
      stopVoiceSession();
    }
  }, [open]);

  const startVoiceSession = async () => {
    try {
      playPopSound(1.2);
      setListening(true);
      await speechManager.startListening({
        onInterim: (txt) => setInterimText(txt),
        onFinal: (txt) => {
          setTranscribedText(txt);
          setInterimText('');
        },
        onError: (err) => {
          toast(err, 'error');
          setListening(false);
        },
        onStatusChange: (isAct) => setListening(isAct),
      });
    } catch (e: any) {
      toast(e?.message || 'Gagal menyalakan mikrofon.', 'error');
      setListening(false);
    }
  };

  const stopVoiceSession = async () => {
    setListening(false);
    try {
      const fallbackText = await speechManager.stopListening();
      if (fallbackText && fallbackText.trim()) {
        setTranscribedText((prev) => (prev ? `${prev} ${fallbackText}` : fallbackText));
      }
    } catch {}
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentDisplay = interimText || transcribedText || 'Mendengarkan... Silakan berbicara mengenai observasi siswa Anda.';

  const handleApplyTextOnly = async () => {
    await stopVoiceSession();
    const finalTxt = transcribedText.trim() || interimText.trim();
    if (!finalTxt) {
      toast('Belum ada suara yang terdeteksi.', 'info');
      return;
    }
    onApplyNote(finalTxt);
    onClose();
    toast('Catatan suara dimasukkan.');
  };

  const handleParseWithAI = async () => {
    await stopVoiceSession();
    const finalTxt = transcribedText.trim() || interimText.trim();
    if (!finalTxt) {
      toast('Belum ada suara yang terdeteksi.', 'info');
      return;
    }

    setParsingAI(true);
    try {
      const parsed = await parseVoiceJournalWithAI({
        voiceText: finalTxt,
        availableStudents,
        currentMateri,
      });

      if (onApplyParsed) {
        onApplyParsed({
          catatan: parsed.catatan,
          studentIds: parsed.matchedStudentIds || [],
          kog: parsed.nilai_kognitif,
          ket: parsed.nilai_keterampilan,
          sik: parsed.skor_sikap,
          tags: parsed.tags || [],
        });
        toast('AI berhasil memetakan nama siswa, skor, dan catatan!');
      } else {
        onApplyNote(parsed.catatan);
        toast('Catatan suara dirapikan AI.');
      }
      onClose();
    } catch (e: any) {
      toast('Gagal memproses dengan AI, menggunakan teks mentah.', 'info');
      onApplyNote(finalTxt);
      onClose();
    } finally {
      setParsingAI(false);
    }
  };

  return (
    <Dialog visible={open} onClose={onClose} title="Dikte Jurnal lewat Mikrofon">
      <View style={styles.container}>
        {/* Lingkaran Animasi Mikrofon */}
        <View style={styles.micWrap}>
          <Animated.View
            style={[
              styles.micRing,
              {
                transform: [{ scale: pulseAnim }],
                backgroundColor: listening ? color.dangerSoft : color.brandSoft,
                borderColor: listening ? color.danger : color.brand,
              },
            ]}
          />
          <View
            style={[
              styles.micCore,
              { backgroundColor: listening ? color.danger : color.brand },
            ]}
          >
            <Ionicons
              name={listening ? 'mic' : 'mic-off'}
              size={36}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Status & Timer */}
        <View style={styles.statusBox}>
          <AppText variant="caption" weight="bold" tone={listening ? color.danger : color.muted}>
            {listening ? `MEREKAM SUARA (${formatTimer(seconds)})` : 'SELESAI MEREKAM'}
          </AppText>
          <AppText variant="small" tone={color.muted} align="center">
            {listening
              ? 'Bicaralah dengan wajar. Sebutkan nama siswa, aktivitas, dan nilai.'
              : 'Tekan "Dikte Lagi" untuk menambah suara, atau terapkan ke jurnal.'}
          </AppText>
        </View>

        {/* Kotak Transkripsi Teks Real-Time */}
        <View style={styles.transcriptCard}>
          <View style={styles.transcriptHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={color.brandDeep} />
            <AppText variant="caption" weight="bold" tone={color.brandDeep}>
              Hasil Transkripsi Suara:
            </AppText>
          </View>
          <AppText
            variant="body"
            tone={transcribedText || interimText ? color.ink : color.muted}
            style={styles.transcriptContent}
          >
            {currentDisplay}
          </AppText>
        </View>

        {/* Kontrol dan Aksi */}
        <View style={styles.actions}>
          {listening ? (
            <Button
              label="Selesai Bicara"
              icon="stop-circle-outline"
              variant="secondary"
              onPress={stopVoiceSession}
            />
          ) : (
            <Button
              label="Dikte Lagi"
              icon="mic-outline"
              variant="ghost"
              onPress={startVoiceSession}
            />
          )}

          <Button
            label="Tempel ke Catatan"
            icon="checkmark"
            variant="secondary"
            disabled={!transcribedText.trim() && !interimText.trim()}
            onPress={handleApplyTextOnly}
          />

          <Button
            label="Isi Otomatis dengan AI"
            icon="sparkles"
            variant="primary"
            loading={parsingAI}
            disabled={!transcribedText.trim() && !interimText.trim()}
            onPress={handleParseWithAI}
          />
        </View>
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  micWrap: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  micRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  micCore: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  statusBox: {
    alignItems: 'center',
    gap: 4,
  },
  transcriptCard: {
    width: '100%',
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.md,
    padding: space.md,
    gap: 8,
    minHeight: 90,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transcriptContent: {
    lineHeight: 22,
    fontStyle: 'normal',
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
});
