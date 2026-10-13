// src/screens/QuickJournalScreen.tsx
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/common/Header';
import { VoiceWaveform } from '../components/common/VoiceWaveform';
import { mockPresetTags } from '../data/mockData';
import { usePenaGuruStore } from '../store/usePenaGuruStore';
import { colors } from '../theme/colors';

interface QuickJournalScreenProps {
  navigation: any;
  route?: any;
}

export const QuickJournalScreen: React.FC<QuickJournalScreenProps> = ({ navigation, route }) => {
  const { students, selectedClassId, classes, addJournal, isOfflineMode, teacher } = usePenaGuruStore();
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.class_id === currentClass.id);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    classStudents[0]?.id || 's-001'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(['#paham_logika_loop']);
  const [scoreKog, setScoreKog] = useState<number>(4);
  const [scoreKet, setScoreKet] = useState<number>(4);
  const [scoreSos, setScoreSos] = useState<number>(5);
  const [narrativeText, setNarrativeText] = useState<string>('');

  // Audio Voice Memo State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  const toggleTag = (tagLabel: string) => {
    if (selectedTags.includes(tagLabel)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagLabel));
    } else {
      setSelectedTags([...selectedTags, tagLabel]);
    }
  };

  const handleStartStopRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsTranscribing(true);

      // Simulate Gemini Multimodal Audio / Whisper Speech-to-Text
      setTimeout(() => {
        setIsTranscribing(false);
        const targetStudent = classStudents.find((s) => s.id === selectedStudentId);
        const name = targetStudent?.nama_lengkap || 'Siswa';
        setNarrativeText(
          `Hasil Observasi Suara: ${name} menunjukkan fokus baik dalam praktikum perulangan bersarang. Sempat bertanya terkait syntax list comprehension dan mampu menyelesaikannya secara mandiri.`
        );
      }, 1200);
    } else {
      // Start recording
      setIsRecording(true);
      setRecordSeconds(0);
      const timer = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 29) {
            clearInterval(timer);
            setIsRecording(false);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleSaveJournal = async () => {
    const student = classStudents.find((s) => s.id === selectedStudentId);
    if (!student) return;

    await addJournal({
      student_id: student.id,
      student_nama: student.nama_lengkap,
      class_id: currentClass.id,
      teacher_id: teacher.id,
      tanggal_observasi: new Date().toISOString().split('T')[0],
      materi_pokok: currentClass.materi_aktif,
      nilai_kognitif: scoreKog,
      nilai_keterampilan: scoreKet,
      skor_sikap: scoreSos,
      tags_observasi: selectedTags,
      catatan_naratif: narrativeText.trim() || 'Observasi praktikum dicatat menggunakan preset chip tags.',
    });

    Alert.alert(
      isOfflineMode ? 'Disimpan ke Antrean Lokal (Offline)' : 'Berhasil Disimpan!',
      `Jurnal observasi untuk ${student.nama_lengkap} berhasil dicatat.${
        isOfflineMode ? ' Data akan otomatis disinkronkan saat online.' : ''
      }`,
      [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]
    );
  };

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Bar */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.screenTitle}>Quick Daily Journal</Text>
            <Text style={styles.screenSubtitle}>{currentClass.nama_kelas} • Alur Cepat &lt;30 Detik</Text>
          </View>
          <View style={[styles.offlineFlag, isOfflineMode ? styles.flagOffline : styles.flagOnline]}>
            <Ionicons
              name={isOfflineMode ? 'save-outline' : 'cloud-done-outline'}
              size={12}
              color={isOfflineMode ? colors.amber[800] : colors.primary[700]}
            />
            <Text style={[styles.flagText, isOfflineMode ? styles.flagTextOff : styles.flagTextOn]}>
              {isOfflineMode ? 'Cache Mode' : 'Cloud Sync'}
            </Text>
          </View>
        </View>

        {/* 1. Student Selector Carousel */}
        <Text style={styles.inputLabel}>1. Pilih Siswa yang Diobservasi:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={classStudents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.studentChipsContent}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedStudentId;
            return (
              <TouchableOpacity
                style={[styles.studentChip, isSelected && styles.studentChipActive]}
                onPress={() => setSelectedStudentId(item.id)}
              >
                <View
                  style={[
                    styles.studentChipAvatar,
                    { backgroundColor: item.avatar_color || colors.teal[600] },
                  ]}
                >
                  <Text style={styles.studentChipAvatarText}>{item.nama_lengkap.charAt(0)}</Text>
                </View>
                <Text
                  style={[styles.studentChipName, isSelected && styles.studentChipNameActive]}
                  numberOfLines={1}
                >
                  {item.nama_lengkap.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* 2. Preset Chip Tags */}
        <View style={styles.sectionCard}>
          <Text style={styles.inputLabel}>2. Preset Chip Tags Perilaku & Belajar:</Text>
          <View style={styles.tagsContainer}>
            {mockPresetTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.label);
              const isPositive = tag.category === 'positive';
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    isSelected
                      ? isPositive
                        ? styles.tagButtonPositiveActive
                        : styles.tagButtonNeedsActive
                      : styles.tagButtonInactive,
                  ]}
                  onPress={() => toggleTag(tag.label)}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'pricetag-outline'}
                    size={13}
                    color={
                      isSelected
                        ? colors.pureWhite
                        : isPositive
                        ? colors.primary[700]
                        : colors.amber[800]
                    }
                  />
                  <Text
                    style={[
                      styles.tagButtonText,
                      isSelected
                        ? styles.tagButtonTextActive
                        : isPositive
                        ? styles.tagButtonTextPositive
                        : styles.tagButtonTextNeeds,
                    ]}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. 3-Domain Star Rating Sliders */}
        <View style={styles.sectionCard}>
          <Text style={styles.inputLabel}>3. Penilaian 3 Ranah Observasi (Skala 1 - 5):</Text>

          {/* Pengetahuan */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingInfo}>
              <Text style={styles.ratingDomain}>Pengetahuan</Text>
              <Text style={styles.ratingDesc}>Teori & Logika Algoritma</Text>
            </View>
            <View style={styles.starsGroup}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity key={`kog-${val}`} onPress={() => setScoreKog(val)}>
                  <Ionicons
                    name={val <= scoreKog ? 'star' : 'star-outline'}
                    size={22}
                    color={val <= scoreKog ? colors.amber[500] : colors.slate[300]}
                  />
                </TouchableOpacity>
              ))}
              <Text style={styles.scoreNumberDisplay}>{scoreKog}.0</Text>
            </View>
          </View>

          {/* Keterampilan / Coding */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingInfo}>
              <Text style={styles.ratingDomain}>Keterampilan</Text>
              <Text style={styles.ratingDesc}>Praktikum & Debugging</Text>
            </View>
            <View style={styles.starsGroup}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity key={`ket-${val}`} onPress={() => setScoreKet(val)}>
                  <Ionicons
                    name={val <= scoreKet ? 'star' : 'star-outline'}
                    size={22}
                    color={val <= scoreKet ? colors.teal[600] : colors.slate[300]}
                  />
                </TouchableOpacity>
              ))}
              <Text style={[styles.scoreNumberDisplay, { color: colors.teal[700] }]}>
                {scoreKet}.0
              </Text>
            </View>
          </View>

          {/* Sikap / Kolaborasi */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingInfo}>
              <Text style={styles.ratingDomain}>Sikap Sosial</Text>
              <Text style={styles.ratingDesc}>Kerjasama & Etika Kelas</Text>
            </View>
            <View style={styles.starsGroup}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity key={`sos-${val}`} onPress={() => setScoreSos(val)}>
                  <Ionicons
                    name={val <= scoreSos ? 'star' : 'star-outline'}
                    size={22}
                    color={val <= scoreSos ? colors.indigo[500] : colors.slate[300]}
                  />
                </TouchableOpacity>
              ))}
              <Text style={[styles.scoreNumberDisplay, { color: colors.indigo[700] }]}>
                {scoreSos}.0
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Voice Recorder (Audio 15-30 detik) Widget */}
        <View style={styles.voiceCard}>
          <View style={styles.voiceHeader}>
            <View style={styles.voiceTitleRow}>
              <Ionicons name="mic-circle" size={20} color={colors.teal[700]} />
              <Text style={styles.voiceTitle}>Voice-to-Text Journaling</Text>
            </View>
            <Text style={styles.timerText}>
              {isRecording ? `00:${recordSeconds < 10 ? '0' : ''}${recordSeconds}` : 'Maks 30 Detik'}
            </Text>
          </View>

          <VoiceWaveform isRecording={isRecording} />

          <View style={styles.voiceControls}>
            <TouchableOpacity
              style={[styles.recordBtn, isRecording && styles.recordingActiveBtn]}
              onPress={handleStartStopRecord}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={18}
                color={colors.pureWhite}
              />
              <Text style={styles.recordBtnText}>
                {isRecording ? 'Berhenti & Transkripsi' : 'Mulai Rekam Suara Guru'}
              </Text>
            </TouchableOpacity>
          </View>

          {isTranscribing && (
            <Text style={styles.transcribingText}>
              Memproses audio via Gemini Speech Engine...
            </Text>
          )}
        </View>

        {/* 5. Narrative Note Input */}
        <View style={styles.sectionCard}>
          <Text style={styles.inputLabel}>Catatan Naratif Jurnal (Opsional / Terisi Suara):</Text>
          <TextInput
            style={styles.narrativeInput}
            multiline
            numberOfLines={3}
            placeholder="Ketik catatan tambahan guru atau hasil rekaman suara akan muncul di sini..."
            value={narrativeText}
            onChangeText={setNarrativeText}
            placeholderTextColor={colors.slate[400]}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveJournalBtn} onPress={handleSaveJournal} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={20} color={colors.pureWhite} />
          <Text style={styles.saveJournalBtnText}>Simpan ke Jurnal Harian</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.slate[50],
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.slate[900],
  },
  screenSubtitle: {
    fontSize: 11,
    color: colors.slate[500],
    marginTop: 2,
  },
  offlineFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  flagOnline: {
    backgroundColor: colors.primary[50],
  },
  flagOffline: {
    backgroundColor: colors.amber[50],
  },
  flagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  flagTextOn: {
    color: colors.primary[700],
  },
  flagTextOff: {
    color: colors.amber[800],
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate[800],
    marginBottom: 8,
  },
  studentChipsContent: {
    gap: 8,
    paddingBottom: 4,
  },
  studentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pureWhite,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  studentChipActive: {
    backgroundColor: colors.teal[700],
    borderColor: colors.teal[800],
  },
  studentChipAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentChipAvatarText: {
    color: colors.pureWhite,
    fontSize: 11,
    fontWeight: '800',
  },
  studentChipName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate[700],
  },
  studentChipNameActive: {
    color: colors.pureWhite,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.pureWhite,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
  },
  tagButtonInactive: {
    backgroundColor: colors.slate[50],
    borderColor: colors.slate[200],
  },
  tagButtonPositiveActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[700],
  },
  tagButtonNeedsActive: {
    backgroundColor: colors.amber[600],
    borderColor: colors.amber[700],
  },
  tagButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagButtonTextPositive: {
    color: colors.primary[800],
  },
  tagButtonTextNeeds: {
    color: colors.amber[900],
  },
  tagButtonTextActive: {
    color: colors.pureWhite,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  ratingInfo: {
    flex: 1,
  },
  ratingDomain: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate[800],
  },
  ratingDesc: {
    fontSize: 10,
    color: colors.slate[500],
  },
  starsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreNumberDisplay: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.amber[600],
    marginLeft: 6,
    width: 24,
  },
  voiceCard: {
    backgroundColor: colors.teal[50],
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.teal[200],
  },
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  voiceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.teal[900],
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.teal[700],
  },
  voiceControls: {
    alignItems: 'center',
    marginTop: 6,
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal[700],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  recordingActiveBtn: {
    backgroundColor: colors.rose[600],
  },
  recordBtnText: {
    color: colors.pureWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  transcribingText: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.teal[800],
    fontStyle: 'italic',
    marginTop: 8,
  },
  narrativeInput: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: colors.slate[800],
    backgroundColor: colors.slate[50],
    textAlignVertical: 'top',
    minHeight: 70,
  },
  saveJournalBtn: {
    backgroundColor: colors.teal[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: colors.teal[800],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveJournalBtnText: {
    color: colors.pureWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});
