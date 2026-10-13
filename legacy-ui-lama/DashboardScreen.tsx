// src/screens/DashboardScreen.tsx
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../components/common/Badge';
import { Header } from '../components/common/Header';
import { usePenaGuruStore } from '../store/usePenaGuruStore';
import { colors } from '../theme/colors';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { classes, selectedClassId, journals, students } = usePenaGuruStore();
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Calculate stats from class students
  const classStudents = students.filter((s) => s.class_id === currentClass.id);
  const avgKog = classStudents.length
    ? Math.round(classStudents.reduce((acc, s) => acc + s.rerata_kognitif, 0) / classStudents.length)
    : 81;
  const avgKet = classStudents.length
    ? Math.round(classStudents.reduce((acc, s) => acc + s.rerata_keterampilan, 0) / classStudents.length)
    : 74;
  const avgSos = classStudents.length
    ? Math.round(
        (classStudents.reduce((acc, s) => acc + s.rerata_sosial, 0) / classStudents.length) * 20
      )
    : 90;

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Active Class Banner */}
        <View style={styles.activeBanner}>
          <View style={styles.bannerHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>SEDANG BERLANGSUNG</Text>
            </View>
            <Text style={styles.phaseBadge}>{currentClass.tingkat_fase}</Text>
          </View>

          <Text style={styles.className}>{currentClass.nama_kelas}</Text>
          <View style={styles.subjectRow}>
            <Ionicons name="book-outline" size={14} color={colors.teal[100]} />
            <Text style={styles.subjectText} numberOfLines={1}>
              {currentClass.materi_aktif}
            </Text>
          </View>

          <View style={styles.bannerStatsRow}>
            <View style={styles.bannerStatCol}>
              <Text style={styles.bannerStatValue}>{currentClass.siswa_hadir}</Text>
              <Text style={styles.bannerStatLabel}>Siswa Hadir</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerStatCol}>
              <Text style={[styles.bannerStatValue, { color: colors.amber[300] }]}>
                {currentClass.siswa_perlu_perhatian}
              </Text>
              <Text style={styles.bannerStatLabel}>Butuh Pendampingan</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerStatCol}>
              <Text style={styles.bannerStatValue}>{currentClass.total_siswa}</Text>
              <Text style={styles.bannerStatLabel}>Total Rombel</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Bar */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.quickActionPrimary]}
            onPress={() => navigation.navigate('QuickJournal')}
            activeOpacity={0.85}
          >
            <Ionicons name="create" size={18} color={colors.pureWhite} />
            <Text style={styles.quickActionTextPrimary}>Catat Jurnal Cepat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, styles.quickActionSecondary]}
            onPress={() => navigation.navigate('QuickJournal', { initialMode: 'voice' })}
            activeOpacity={0.85}
          >
            <Ionicons name="mic" size={18} color={colors.teal[700]} />
            <Text style={styles.quickActionTextSecondary}>Rekam Suara (AI)</Text>
          </TouchableOpacity>
        </View>

        {/* 3-Domain Class Performance Monitor */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Pantauan & Capaian Belajar Kelas</Text>
            <Ionicons name="analytics" size={18} color={colors.teal[600]} />
          </View>

          {/* Knowledge Progress */}
          <View style={styles.metricRow}>
            <View style={styles.metricTextRow}>
              <Text style={styles.metricLabel}>1. Pengetahuan (Teori & Logika)</Text>
              <Text style={styles.metricValue}>{avgKog}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${avgKog}%`, backgroundColor: colors.primary[500] }]} />
            </View>
          </View>

          {/* Skill / Coding Progress */}
          <View style={styles.metricRow}>
            <View style={styles.metricTextRow}>
              <Text style={styles.metricLabel}>2. Keterampilan (Praktikum Koding)</Text>
              <Text style={styles.metricValue}>{avgKet}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${avgKet}%`, backgroundColor: colors.teal[600] }]} />
            </View>
          </View>

          {/* Social & Attitude Progress */}
          <View style={styles.metricRow}>
            <View style={styles.metricTextRow}>
              <Text style={styles.metricLabel}>3. Sikap (Kolaborasi & Kedisiplinan)</Text>
              <Text style={styles.metricValue}>{avgSos}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${avgSos}%`, backgroundColor: colors.indigo[500] }]} />
            </View>
          </View>
        </View>

        {/* Smart AI Feature Tiles */}
        <Text style={styles.sectionHeading}>Fitur Cerdas PenaGuru</Text>
        <View style={styles.featureGrid}>
          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => navigation.navigate('QuickJournal')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIconBox, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="flash" size={20} color={colors.primary[600]} />
            </View>
            <Text style={styles.featureTitle}>Quick Journal</Text>
            <Text style={styles.featureDesc}>Observasi 2-tap chip tag & voice memo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => navigation.navigate('AIFeedback')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIconBox, { backgroundColor: colors.teal[50] }]}>
              <Ionicons name="sparkles" size={20} color={colors.teal[600]} />
            </View>
            <Text style={styles.featureTitle}>AI Rapor</Text>
            <Text style={styles.featureDesc}>Sintesis rapor personal siswa & ortu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => navigation.navigate('Classes', { openGrouping: true })}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIconBox, { backgroundColor: colors.indigo[50] }]}>
              <Ionicons name="people" size={20} color={colors.indigo[600]} />
            </View>
            <Text style={styles.featureTitle}>Balanced Group</Text>
            <Text style={styles.featureDesc}>Bagi kelompok heterogen anti-jompang</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureTile}
            onPress={() => navigation.navigate('Chatbot')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIconBox, { backgroundColor: colors.amber[50] }]}>
              <Ionicons name="chatbubbles" size={20} color={colors.amber[600]} />
            </View>
            <Text style={styles.featureTitle}>Asisten Pedagogik</Text>
            <Text style={styles.featureDesc}>Konsultasi kurikulum & strategi koding</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Observational Activity Feed */}
        <View style={styles.feedCard}>
          <View style={styles.feedHeaderRow}>
            <Text style={styles.cardTitle}>Catatan Jurnal Terkini</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Classes')}>
              <Text style={styles.viewAllText}>Lihat Semua Siswa</Text>
            </TouchableOpacity>
          </View>

          {journals.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.feedItem}>
              <View style={styles.feedItemHeader}>
                <View style={styles.feedStudentInfo}>
                  <View style={styles.feedAvatar}>
                    <Text style={styles.feedAvatarText}>{item.student_nama.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.feedStudentName}>{item.student_nama}</Text>
                    <Text style={styles.feedMetaText}>{item.tanggal_observasi}</Text>
                  </View>
                </View>
                <Badge
                  type={item.is_synced ? 'synced' : 'pending'}
                  label={item.is_synced ? 'Tersinkron' : 'Offline Cache'}
                  size="sm"
                />
              </View>

              <Text style={styles.feedNarrative} numberOfLines={2}>
                "{item.catatan_naratif}"
              </Text>

              <View style={styles.tagsRow}>
                {item.tags_observasi.map((tag, idx) => (
                  <View key={`tag-${idx}`} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.slate[50],
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  activeBanner: {
    backgroundColor: colors.teal[700],
    borderRadius: 18,
    padding: 18,
    shadowColor: colors.teal[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  liveText: {
    color: colors.pureWhite,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  phaseBadge: {
    color: colors.teal[100],
    fontSize: 11,
    fontWeight: '600',
  },
  className: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.pureWhite,
    marginTop: 2,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  subjectText: {
    color: colors.teal[100],
    fontSize: 13,
    flex: 1,
  },
  bannerStatsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerStatCol: {
    alignItems: 'center',
    flex: 1,
  },
  bannerStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.pureWhite,
  },
  bannerStatLabel: {
    fontSize: 10,
    color: colors.teal[100],
    marginTop: 2,
  },
  bannerDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  quickActionPrimary: {
    backgroundColor: colors.primary[600],
    shadowColor: colors.primary[700],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  quickActionTextPrimary: {
    color: colors.pureWhite,
    fontWeight: '700',
    fontSize: 13,
  },
  quickActionSecondary: {
    backgroundColor: colors.pureWhite,
    borderWidth: 1.5,
    borderColor: colors.teal[600],
  },
  quickActionTextSecondary: {
    color: colors.teal[700],
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.pureWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate[900],
  },
  metricRow: {
    marginBottom: 12,
  },
  metricTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.slate[600],
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate[800],
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate[100],
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate[900],
    marginTop: 4,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureTile: {
    width: '48%',
    backgroundColor: colors.pureWhite,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate[900],
  },
  featureDesc: {
    fontSize: 11,
    color: colors.slate[500],
    marginTop: 3,
    lineHeight: 15,
  },
  feedCard: {
    backgroundColor: colors.pureWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.teal[700],
  },
  feedItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  feedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  feedStudentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.teal[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.teal[800],
  },
  feedStudentName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate[800],
  },
  feedMetaText: {
    fontSize: 10,
    color: colors.slate[400],
  },
  feedNarrative: {
    fontSize: 12,
    color: colors.slate[600],
    lineHeight: 17,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: colors.slate[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate[600],
  },
});
