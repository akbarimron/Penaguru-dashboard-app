// src/screens/AIFeedbackScreen.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { Badge } from '../components/common/Badge';
import { Header } from '../components/common/Header';
import { usePenaGuruStore } from '../store/usePenaGuruStore';
import { colors } from '../theme/colors';

interface AIFeedbackScreenProps {
  navigation: any;
  route?: any;
}

export const AIFeedbackScreen: React.FC<AIFeedbackScreenProps> = ({ navigation, route }) => {
  const {
    students,
    selectedClassId,
    classes,
    feedbacks,
    generateAIFeedback,
    updateFeedbackDraft,
    approveFeedback,
    isGeneratingAI,
  } = usePenaGuruStore();

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.class_id === currentClass.id);

  const initialStudentId = route?.params?.initialStudentId || classStudents[0]?.id || 's-001';
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('PTS Ganjil 2026/2027');
  const [activeTab, setActiveTab] = useState<'siswa' | 'wali'>('siswa');

  const currentStudent = classStudents.find((s) => s.id === selectedStudentId) || classStudents[0];
  const feedback = feedbacks[selectedStudentId];

  const handleGenerateAI = async () => {
    if (!currentStudent) return;
    await generateAIFeedback(currentStudent.id, selectedPeriod);
    Alert.alert(
      'Sintesis Berhasil!',
      `Draf narasi rapor personal untuk ${currentStudent.nama_lengkap} berhasil disusun oleh Gemini AI. Silakan tinjau dan sunting draf di bawah.`
    );
  };

  const handleApprove = () => {
    if (!currentStudent) return;
    approveFeedback(currentStudent.id);
    Alert.alert(
      'Rapor Disetujui!',
      `Umpan balik personal untuk ${currentStudent.nama_lengkap} telah berstatus 'Approved' dan dikunci ke database rapor.`
    );
  };

  const handleShareWhatsApp = () => {
    if (!feedback) return;
    const phone = currentStudent.no_whatsapp_wali || '0812XXXXXXXX';
    Alert.alert(
      'Format WhatsApp Siap Dibagikan',
      `Nomor Tujuan: ${phone}\n\n"${feedback.catatan_wali_murid}"\n\n(Teks disalin ke clipboard untuk dikirim langsung ke aplikasi WhatsApp)`
    );
  };

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title Bar */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.screenTitle}>AI Feedback & Rapor Generator</Text>
            <Text style={styles.screenSubtitle}>Prinsip Teacher-in-the-Loop • Google Gemini Engine</Text>
          </View>
          <View style={styles.geminiBadge}>
            <Ionicons name="sparkles" size={14} color={colors.teal[700]} />
            <Text style={styles.geminiText}>Gemini AI</Text>
          </View>
        </View>

        {/* 1. Student Selector Carousel */}
        <Text style={styles.inputLabel}>Pilih Siswa Penerima Rapor:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={classStudents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.studentChipsContent}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedStudentId;
            const hasFeedback = Boolean(feedbacks[item.id]);
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
                {hasFeedback && (
                  <View style={styles.checkDot}>
                    <Ionicons name="checkmark" size={10} color={colors.pureWhite} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />

        {/* 2. Generation Control Card */}
        <View style={styles.generationCard}>
          <View style={styles.generationHeader}>
            <View>
              <Text style={styles.generationStudentName}>{currentStudent?.nama_lengkap}</Text>
              <Text style={styles.generationMeta}>
                NISN: {currentStudent?.nisn} • Periode: {selectedPeriod}
              </Text>
            </View>
            {feedback && <Badge type={feedback.status_approval} />}
          </View>

          <TouchableOpacity
            style={[styles.generateButton, isGeneratingAI && styles.generatingBtn]}
            onPress={handleGenerateAI}
            disabled={isGeneratingAI}
            activeOpacity={0.85}
          >
            {isGeneratingAI ? (
              <ActivityIndicator color={colors.pureWhite} size="small" />
            ) : (
              <Ionicons name="sparkles" size={18} color={colors.pureWhite} />
            )}
            <Text style={styles.generateButtonText}>
              {isGeneratingAI ? 'Gemini Sedang Menyintesis...' : 'Sintesis Umpan Balik AI'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Feedback Review Editor (Teacher-in-the-Loop) */}
        {feedback ? (
          <View style={styles.editorContainer}>
            {/* Perspective Switcher: Mode Siswa vs Mode Wali */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'siswa' && styles.tabBtnActive]}
                onPress={() => setActiveTab('siswa')}
              >
                <Ionicons
                  name="person"
                  size={15}
                  color={activeTab === 'siswa' ? colors.pureWhite : colors.slate[600]}
                />
                <Text style={[styles.tabBtnText, activeTab === 'siswa' && styles.tabBtnTextActive]}>
                  Mode Siswa (Rapor)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'wali' && styles.tabBtnActive]}
                onPress={() => setActiveTab('wali')}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={15}
                  color={activeTab === 'wali' ? colors.pureWhite : colors.slate[600]}
                />
                <Text style={[styles.tabBtnText, activeTab === 'wali' && styles.tabBtnTextActive]}>
                  Mode Wali Murid (WA)
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB CONTENT: MODE SISWA */}
            {activeTab === 'siswa' && (
              <View style={styles.tabCard}>
                {/* Strength */}
                <View style={styles.subCardHighlight}>
                  <View style={styles.subCardHeader}>
                    <Ionicons name="trophy-outline" size={16} color={colors.primary[700]} />
                    <Text style={styles.subCardTitle}>Keunggulan & Potensi Diri</Text>
                  </View>
                  <TextInput
                    style={styles.editableField}
                    multiline
                    value={feedback.keunggulan}
                    onChangeText={(val) =>
                      updateFeedbackDraft(selectedStudentId, { keunggulan: val })
                    }
                  />
                </View>

                {/* Recommendations */}
                <View style={[styles.subCardHighlight, styles.subCardWarning]}>
                  <View style={styles.subCardHeader}>
                    <Ionicons name="compass-outline" size={16} color={colors.amber[800]} />
                    <Text style={[styles.subCardTitle, { color: colors.amber[900] }]}>
                      Rekomendasi Peningkatan Konkret
                    </Text>
                  </View>
                  <TextInput
                    style={[styles.editableField, { color: colors.amber[900] }]}
                    multiline
                    value={feedback.rekomendasi_peningkatan}
                    onChangeText={(val) =>
                      updateFeedbackDraft(selectedStudentId, { rekomendasi_peningkatan: val })
                    }
                  />
                </View>

                {/* Full Report Narrative */}
                <View style={styles.subCardNarrative}>
                  <View style={styles.subCardHeader}>
                    <Ionicons name="document-text-outline" size={16} color={colors.teal[700]} />
                    <Text style={[styles.subCardTitle, { color: colors.teal[900] }]}>
                      Draf Paragraf Evaluatif Rapor (60 - 80 Kata)
                    </Text>
                  </View>
                  <TextInput
                    style={styles.editableFieldNarrative}
                    multiline
                    value={feedback.narasi_rapor_siswa}
                    onChangeText={(val) =>
                      updateFeedbackDraft(selectedStudentId, { narasi_rapor_siswa: val })
                    }
                  />
                </View>
              </View>
            )}

            {/* TAB CONTENT: MODE WALI MURID */}
            {activeTab === 'wali' && (
              <View style={styles.tabCard}>
                <View style={styles.whatsappCard}>
                  <View style={styles.whatsappHeader}>
                    <View style={styles.whatsappHeaderLeft}>
                      <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                      <View>
                        <Text style={styles.whatsappRecipient}>
                          Wali: {currentStudent.nama_wali || 'Orang Tua Murid'}
                        </Text>
                        <Text style={styles.whatsappPhone}>
                          No: {currentStudent.no_whatsapp_wali || '0812-xxxx-xxxx'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.waShareBtn} onPress={handleShareWhatsApp}>
                      <Ionicons name="send" size={14} color={colors.pureWhite} />
                      <Text style={styles.waShareBtnText}>Kirim WA</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.waMessageLabel}>Teks Pesan Santun & Edukatif:</Text>
                  <TextInput
                    style={styles.editableFieldWa}
                    multiline
                    value={feedback.catatan_wali_murid}
                    onChangeText={(val) =>
                      updateFeedbackDraft(selectedStudentId, { catatan_wali_murid: val })
                    }
                  />
                </View>
              </View>
            )}

            {/* Action Buttons: Teacher in the Loop Approval */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.approveBtn,
                  feedback.status_approval === 'Approved' && styles.approvedBtn,
                ]}
                onPress={handleApprove}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={
                    feedback.status_approval === 'Approved'
                      ? 'checkmark-done-circle'
                      : 'checkmark-circle-outline'
                  }
                  size={18}
                  color={colors.pureWhite}
                />
                <Text style={styles.approveBtnText}>
                  {feedback.status_approval === 'Approved'
                    ? 'Terkunci di Rapor (Approved)'
                    : 'Setujui & Kunci ke Rapor'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="sparkles-outline" size={40} color={colors.teal[300]} />
            <Text style={styles.emptyTitle}>Belum Ada Draf Umpan Balik</Text>
            <Text style={styles.emptyDesc}>
              Tekan tombol "Sintesis Umpan Balik AI" di atas untuk menghasilkan narasi rapor personal bagi {currentStudent?.nama_lengkap} dari data jurnal harian.
            </Text>
          </View>
        )}
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
  geminiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.teal[200],
  },
  geminiText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.teal[800],
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
  checkDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  generationCard: {
    backgroundColor: colors.pureWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.slate[200],
    gap: 12,
  },
  generationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  generationStudentName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.slate[900],
  },
  generationMeta: {
    fontSize: 11,
    color: colors.slate[500],
    marginTop: 2,
  },
  generateButton: {
    backgroundColor: colors.teal[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.teal[800],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generatingBtn: {
    backgroundColor: colors.teal[800],
  },
  generateButtonText: {
    color: colors.pureWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  editorContainer: {
    gap: 12,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.slate[200],
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: colors.teal[700],
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate[600],
  },
  tabBtnTextActive: {
    color: colors.pureWhite,
    fontWeight: '700',
  },
  tabCard: {
    gap: 10,
  },
  subCardHighlight: {
    backgroundColor: colors.primary[50],
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  subCardWarning: {
    backgroundColor: colors.amber[50],
    borderColor: colors.amber[200],
  },
  subCardNarrative: {
    backgroundColor: colors.pureWhite,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  subCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary[900],
  },
  editableField: {
    fontSize: 12,
    color: colors.slate[800],
    lineHeight: 18,
    padding: 0,
  },
  editableFieldNarrative: {
    fontSize: 12,
    color: colors.slate[800],
    lineHeight: 19,
    padding: 0,
    minHeight: 60,
  },
  whatsappCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  whatsappHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  whatsappHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whatsappRecipient: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  whatsappPhone: {
    fontSize: 10,
    color: '#15803d',
  },
  waShareBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  waShareBtnText: {
    color: colors.pureWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  waMessageLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 6,
  },
  editableFieldWa: {
    fontSize: 12,
    color: colors.slate[800],
    lineHeight: 18,
    padding: 8,
    backgroundColor: colors.pureWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    minHeight: 60,
  },
  actionsRow: {
    marginTop: 4,
  },
  approveBtn: {
    backgroundColor: colors.teal[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  approvedBtn: {
    backgroundColor: colors.primary[600],
  },
  approveBtnText: {
    color: colors.pureWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: colors.pureWhite,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.slate[200],
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate[800],
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.slate[500],
    textAlign: 'center',
    lineHeight: 18,
  },
});
