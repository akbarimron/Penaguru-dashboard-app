// src/components/modals/StudentDetailModal.tsx
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../common/Badge';
import { CustomRadarChart } from '../radar/CustomRadarChart';
import { usePenaGuruStore } from '../../store/usePenaGuruStore';
import { colors } from '../../theme/colors';
import { Student } from '../../types';

interface StudentDetailModalProps {
  visible: boolean;
  student: Student | null;
  onClose: () => void;
  onNavigateToFeedback: (studentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  visible,
  student,
  onClose,
  onNavigateToFeedback,
}) => {
  const { analytics, journals } = usePenaGuruStore();
  if (!student) return null;

  const studentAnalytics = analytics[student.id] || {
    id: 'an-def',
    student_id: student.id,
    score_logika: student.rerata_kognitif,
    score_sintaks: student.rerata_keterampilan,
    score_debugging: Math.round((student.rerata_kognitif + student.rerata_keterampilan) / 2),
    score_kolaborasi: Math.round(student.rerata_sosial * 20),
    score_disiplin: 85,
    level_risiko: student.status_akademik === 'Aman' ? 'Rendah' : 'Sedang',
    faktor_kendala: ['Perlu pendampingan berkala pada modul praktikum'],
    saran_intervensi: 'Dampingi dengan modul praktikum bertahap.',
    last_calculated: new Date().toISOString(),
  };

  const studentJournals = journals.filter((j) => j.student_id === student.id);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerInfo}>
              <View style={[styles.avatar, { backgroundColor: student.avatar_color || colors.teal[600] }]}>
                <Text style={styles.avatarText}>{student.nama_lengkap.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.studentName}>{student.nama_lengkap}</Text>
                <Text style={styles.nisnText}>NISN: {student.nisn} • Wali: {student.nama_wali || '-'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.slate[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Status & Composite Score */}
            <View style={styles.summaryBar}>
              <View>
                <Text style={styles.summaryLabel}>Status Akademik</Text>
                <View style={styles.badgeWrap}>
                  <Badge type={student.status_akademik} />
                </View>
              </View>
              <View style={styles.scorePillCol}>
                <Text style={styles.summaryLabel}>Rerata Kognitif</Text>
                <Text style={styles.scoreVal}>{student.rerata_kognitif}</Text>
              </View>
              <View style={styles.scorePillCol}>
                <Text style={styles.summaryLabel}>Rerata Koding</Text>
                <Text style={styles.scoreVal}>{student.rerata_keterampilan}</Text>
              </View>
              <View style={styles.scorePillCol}>
                <Text style={styles.summaryLabel}>Skor Sikap</Text>
                <Text style={styles.scoreVal}>{student.rerata_sosial}★</Text>
              </View>
            </View>

            {/* Radar Chart Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="pie-chart-outline" size={18} color={colors.teal[600]} />
                <Text style={styles.sectionTitle}>Profil Analitik 5 Sumbu (Radar Chart)</Text>
              </View>
              <CustomRadarChart
                data={{
                  logika: studentAnalytics.score_logika,
                  sintaks: studentAnalytics.score_sintaks,
                  debugging: studentAnalytics.score_debugging,
                  kolaborasi: studentAnalytics.score_kolaborasi,
                  disiplin: studentAnalytics.score_disiplin,
                }}
                size={270}
              />
            </View>

            {/* Early Warning Indicator Card */}
            <View
              style={[
                styles.warningCard,
                studentAnalytics.level_risiko === 'Tinggi'
                  ? styles.riskHigh
                  : studentAnalytics.level_risiko === 'Sedang'
                  ? styles.riskMed
                  : styles.riskLow,
              ]}
            >
              <View style={styles.warningTitleRow}>
                <Ionicons
                  name={
                    studentAnalytics.level_risiko === 'Rendah'
                      ? 'checkmark-circle'
                      : 'alert-circle'
                  }
                  size={20}
                  color={
                    studentAnalytics.level_risiko === 'Tinggi'
                      ? colors.rose[600]
                      : studentAnalytics.level_risiko === 'Sedang'
                      ? colors.amber[600]
                      : colors.primary[600]
                  }
                />
                <Text style={styles.warningTitle}>
                  Early Warning: Risiko {studentAnalytics.level_risiko}
                </Text>
              </View>
              <Text style={styles.warningDesc}>
                {studentAnalytics.faktor_kendala.join(' • ')}
              </Text>
            </View>

            {/* Pedagogical Intervention Advice */}
            <View style={styles.interventionCard}>
              <View style={styles.interventionHeader}>
                <Ionicons name="bulb-outline" size={18} color={colors.amber[600]} />
                <Text style={styles.interventionTitle}>Rekomendasi Intervensi Pedagogis AI</Text>
              </View>
              <Text style={styles.interventionText}>
                "{studentAnalytics.saran_intervensi}"
              </Text>
            </View>

            {/* Action Trigger for Rapor AI */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                onClose();
                onNavigateToFeedback(student.id);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles" size={18} color={colors.pureWhite} />
              <Text style={styles.actionBtnText}>Sintesis Draf Rapor Personal AI</Text>
            </TouchableOpacity>

            {/* Recent Observations for this student */}
            <Text style={styles.subHeading}>Riwayat Jurnal Observasi ({studentJournals.length})</Text>
            {studentJournals.length === 0 ? (
              <Text style={styles.emptyText}>Belum ada catatan observasi untuk siswa ini.</Text>
            ) : (
              studentJournals.map((j) => (
                <View key={j.id} style={styles.journalItem}>
                  <View style={styles.journalItemTop}>
                    <Text style={styles.journalDate}>{j.tanggal_observasi}</Text>
                    <Text style={styles.journalScores}>
                      Kog: {j.nilai_kognitif}/5 • Kod: {j.nilai_keterampilan}/5 • Sikap: {j.skor_sikap}/5
                    </Text>
                  </View>
                  <Text style={styles.journalTopic}>{j.materi_pokok}</Text>
                  <Text style={styles.journalNote}>{j.catatan_naratif}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.pureWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.pureWhite,
    fontWeight: '800',
    fontSize: 18,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate[900],
  },
  nisnText: {
    fontSize: 11,
    color: colors.slate[500],
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.slate[50],
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.slate[500],
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeWrap: {
    alignItems: 'flex-start',
  },
  scorePillCol: {
    alignItems: 'center',
  },
  scoreVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.teal[700],
  },
  sectionCard: {
    backgroundColor: colors.pureWhite,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.slate[200],
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate[800],
  },
  warningCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  riskLow: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  riskMed: {
    backgroundColor: colors.amber[50],
    borderColor: colors.amber[200],
  },
  riskHigh: {
    backgroundColor: colors.rose[50],
    borderColor: colors.rose[200],
  },
  warningTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate[900],
  },
  warningDesc: {
    fontSize: 12,
    color: colors.slate[600],
    lineHeight: 16,
  },
  interventionCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  interventionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  interventionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.amber[900],
  },
  interventionText: {
    fontSize: 12,
    color: colors.amber[800],
    lineHeight: 18,
    fontStyle: 'italic',
  },
  actionBtn: {
    backgroundColor: colors.teal[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginVertical: 4,
  },
  actionBtnText: {
    color: colors.pureWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate[800],
    marginTop: 6,
  },
  emptyText: {
    fontSize: 12,
    color: colors.slate[400],
    fontStyle: 'italic',
  },
  journalItem: {
    backgroundColor: colors.slate[50],
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
    marginBottom: 8,
  },
  journalItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  journalDate: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.teal[700],
  },
  journalScores: {
    fontSize: 10,
    color: colors.slate[500],
    fontWeight: '600',
  },
  journalTopic: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate[800],
    marginBottom: 3,
  },
  journalNote: {
    fontSize: 11,
    color: colors.slate[600],
    lineHeight: 16,
  },
});
