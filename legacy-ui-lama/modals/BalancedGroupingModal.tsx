// src/components/modals/BalancedGroupingModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePenaGuruStore } from '../../store/usePenaGuruStore';
import { colors } from '../../theme/colors';

interface BalancedGroupingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BalancedGroupingModal: React.FC<BalancedGroupingModalProps> = ({
  visible,
  onClose,
}) => {
  const { studyGroups, generateBalancedGroups, selectedClassId } = usePenaGuruStore();
  const [groupCount, setGroupCount] = useState<number>(2);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleRegenerate = (count: number) => {
    setGroupCount(count);
    generateBalancedGroups(selectedClassId, count);
    setIsSaved(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Balanced Grouping Generator</Text>
              <Text style={styles.subtitle}>Algoritma Heterogen Cerdas (Anti-Jompang)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.slate[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark" size={18} color={colors.indigo[600]} />
              <Text style={styles.infoText}>
                Algoritma serpentine memetakan distribusi kognitif, koding, dan kolaborasi agar setiap kelompok memiliki lead mentor tanpa monopoli siswa mahir.
              </Text>
            </View>

            {/* Group Count Selector */}
            <View style={styles.selectorRow}>
              <Text style={styles.selectorLabel}>Jumlah Kelompok:</Text>
              <View style={styles.countButtonGroup}>
                {[2, 3, 4, 6].map((cnt) => (
                  <TouchableOpacity
                    key={`cnt-${cnt}`}
                    style={[styles.countBtn, groupCount === cnt && styles.countBtnActive]}
                    onPress={() => handleRegenerate(cnt)}
                  >
                    <Text
                      style={[
                        styles.countBtnText,
                        groupCount === cnt && styles.countBtnTextActive,
                      ]}
                    >
                      {cnt} Tim
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Generated Groups Cards */}
            <View style={styles.groupsContainer}>
              {studyGroups.map((group, index) => (
                <View key={group.id} style={styles.groupCard}>
                  <View style={styles.groupHeader}>
                    <View>
                      <Text style={styles.groupName}>{group.nama_kelompok}</Text>
                      <Text style={styles.groupTopic}>{group.topik_proyek}</Text>
                    </View>
                    <View style={styles.teamScoreBadge}>
                      <Text style={styles.teamScoreLabel}>Rerata Skor</Text>
                      <Text style={styles.teamScoreVal}>{group.rerata_skor_tim}</Text>
                    </View>
                  </View>

                  {/* Members list */}
                  <View style={styles.membersList}>
                    {group.members.map((member, mIdx) => (
                      <View key={`mem-${mIdx}`} style={styles.memberRow}>
                        <View style={styles.memberLeft}>
                          <View
                            style={[
                              styles.roleTag,
                              member.peran === 'Ketua'
                                ? styles.roleLead
                                : member.peran === 'Mentor Sebaya'
                                ? styles.roleMentor
                                : member.peran === 'Programmer'
                                ? styles.roleProg
                                : styles.roleTester,
                            ]}
                          >
                            <Text
                              style={[
                                styles.roleText,
                                member.peran === 'Ketua'
                                  ? styles.roleTextLead
                                  : member.peran === 'Mentor Sebaya'
                                  ? styles.roleTextMentor
                                  : member.peran === 'Programmer'
                                  ? styles.roleTextProg
                                  : styles.roleTextTester,
                              ]}
                            >
                              {member.peran}
                            </Text>
                          </View>
                          <Text style={styles.memberName}>{member.student_nama}</Text>
                        </View>
                        <Text style={styles.memberScore}>Skor: {member.skor_kombinasi}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Save & Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={() => handleRegenerate(groupCount)}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color={colors.teal[700]} />
                <Text style={styles.regenerateBtnText}>Acak Ulang</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, isSaved && styles.savedBtn]}
                onPress={() => setIsSaved(true)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isSaved ? 'checkmark-circle' : 'save-outline'}
                  size={16}
                  color={colors.pureWhite}
                />
                <Text style={styles.saveBtnText}>
                  {isSaved ? 'Tersimpan ke Supabase' : 'Setujui & Simpan Kelompok'}
                </Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.slate[900],
  },
  subtitle: {
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.indigo[50],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.indigo[100],
    gap: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 11,
    color: colors.indigo[800],
    flex: 1,
    lineHeight: 16,
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate[800],
  },
  countButtonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  countBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.slate[100],
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  countBtnActive: {
    backgroundColor: colors.teal[600],
    borderColor: colors.teal[700],
  },
  countBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate[700],
  },
  countBtnTextActive: {
    color: colors.pureWhite,
    fontWeight: '700',
  },
  groupsContainer: {
    gap: 12,
  },
  groupCard: {
    backgroundColor: colors.slate[50],
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  groupName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate[900],
  },
  groupTopic: {
    fontSize: 11,
    color: colors.slate[500],
    marginTop: 2,
  },
  teamScoreBadge: {
    backgroundColor: colors.pureWhite,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  teamScoreLabel: {
    fontSize: 9,
    color: colors.slate[400],
    fontWeight: '600',
  },
  teamScoreVal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.teal[700],
  },
  membersList: {
    gap: 6,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.pureWhite,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleLead: {
    backgroundColor: colors.primary[50],
  },
  roleMentor: {
    backgroundColor: colors.teal[50],
  },
  roleProg: {
    backgroundColor: colors.indigo[50],
  },
  roleTester: {
    backgroundColor: colors.amber[50],
  },
  roleText: {
    fontSize: 9,
    fontWeight: '700',
  },
  roleTextLead: {
    color: colors.primary[700],
  },
  roleTextMentor: {
    color: colors.teal[700],
  },
  roleTextProg: {
    color: colors.indigo[700],
  },
  roleTextTester: {
    color: colors.amber[700],
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate[800],
  },
  memberScore: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate[500],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  regenerateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.teal[600],
    gap: 6,
  },
  regenerateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.teal[700],
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.teal[600],
    gap: 6,
  },
  savedBtn: {
    backgroundColor: colors.primary[600],
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.pureWhite,
  },
});
