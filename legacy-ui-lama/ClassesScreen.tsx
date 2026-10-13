// src/screens/ClassesScreen.tsx
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../components/common/Badge';
import { Header } from '../components/common/Header';
import { BalancedGroupingModal } from '../components/modals/BalancedGroupingModal';
import { StudentDetailModal } from '../components/modals/StudentDetailModal';
import { usePenaGuruStore } from '../store/usePenaGuruStore';
import { colors } from '../theme/colors';
import { AcademicStatus, Student } from '../types';

interface ClassesScreenProps {
  navigation: any;
  route?: any;
}

export const ClassesScreen: React.FC<ClassesScreenProps> = ({ navigation, route }) => {
  const { classes, selectedClassId, setSelectedClassId, students } = usePenaGuruStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'Semua' | AcademicStatus>('Semua');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showGroupingModal, setShowGroupingModal] = useState<boolean>(
    Boolean(route?.params?.openGrouping)
  );

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Filter students based on active class, search, and status
  const filteredStudents = students.filter((s) => {
    if (s.class_id !== currentClass.id) return false;
    if (selectedFilter !== 'Semua' && s.status_akademik !== selectedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.nama_lengkap.toLowerCase().includes(q) || s.nisn.includes(q);
    }
    return true;
  });

  return (
    <View style={styles.screen}>
      <Header />

      {/* Class Switcher Tabs */}
      <View style={styles.classTabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={classes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.classTabsContent}
          renderItem={({ item }) => {
            const isActive = item.id === currentClass.id;
            return (
              <TouchableOpacity
                style={[styles.classTab, isActive && styles.classTabActive]}
                onPress={() => setSelectedClassId(item.id)}
              >
                <Text style={[styles.classTabText, isActive && styles.classTabTextActive]}>
                  {item.nama_kelas.split(' ')[0]} {item.nama_kelas.split(' ')[1]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Top Banner Action: Balanced Grouping */}
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.slate[400]} />
          <TextInput
            placeholder="Cari nama atau NISN siswa..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor={colors.slate[400]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.slate[400]} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.groupingBtn}
          onPress={() => setShowGroupingModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={16} color={colors.pureWhite} />
          <Text style={styles.groupingBtnText}>Balanced Grouping</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterRow}>
        {(['Semua', 'Aman', 'Perhatian', 'Kritis'] as const).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={`filter-${filter}`}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
        <Text style={styles.countText}>({filteredStudents.length} Siswa)</Text>
      </View>

      {/* Student List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.studentCard}
            onPress={() => setSelectedStudent(item)}
            activeOpacity={0.75}
          >
            <View style={styles.cardMain}>
              <View style={[styles.avatar, { backgroundColor: item.avatar_color || colors.teal[600] }]}>
                <Text style={styles.avatarText}>{item.nama_lengkap.charAt(0)}</Text>
              </View>

              <View style={styles.studentInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {item.nama_lengkap}
                  </Text>
                  <Badge type={item.status_akademik} size="sm" />
                </View>
                <Text style={styles.studentNisn}>NISN: {item.nisn} • Gender: {item.jenis_kelamin}</Text>

                {/* Score Pills */}
                <View style={styles.scoresRow}>
                  <View style={styles.scorePill}>
                    <Text style={styles.scoreLabel}>Kognitif</Text>
                    <Text style={styles.scoreNumber}>{item.rerata_kognitif}</Text>
                  </View>
                  <View style={styles.scorePill}>
                    <Text style={styles.scoreLabel}>Koding</Text>
                    <Text style={styles.scoreNumber}>{item.rerata_keterampilan}</Text>
                  </View>
                  <View style={styles.scorePill}>
                    <Text style={styles.scoreLabel}>Sikap</Text>
                    <Text style={styles.scoreNumber}>{item.rerata_sosial}★</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.chevronCol}>
              <Ionicons name="chevron-forward" size={18} color={colors.slate[400]} />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        visible={Boolean(selectedStudent)}
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onNavigateToFeedback={(studentId) => {
          navigation.navigate('AIFeedback', { initialStudentId: studentId });
        }}
      />

      {/* Balanced Grouping Modal */}
      <BalancedGroupingModal
        visible={showGroupingModal}
        onClose={() => setShowGroupingModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.slate[50],
  },
  classTabsContainer: {
    backgroundColor: colors.pureWhite,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  classTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  classTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.slate[100],
  },
  classTabActive: {
    backgroundColor: colors.teal[700],
  },
  classTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate[600],
  },
  classTabTextActive: {
    color: colors.pureWhite,
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pureWhite,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.slate[800],
  },
  groupingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.indigo[600],
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
    height: 42,
  },
  groupingBtnText: {
    color: colors.pureWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: colors.pureWhite,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  filterChipActive: {
    backgroundColor: colors.teal[50],
    borderColor: colors.teal[600],
  },
  filterChipText: {
    fontSize: 11,
    color: colors.slate[600],
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.teal[700],
    fontWeight: '700',
  },
  countText: {
    fontSize: 11,
    color: colors.slate[400],
    marginLeft: 'auto',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.pureWhite,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.slate[200],
    shadowColor: colors.slate[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
    fontSize: 17,
    fontWeight: '800',
  },
  studentInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingRight: 6,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate[900],
    flex: 1,
  },
  studentNisn: {
    fontSize: 10,
    color: colors.slate[400],
    marginBottom: 6,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scorePill: {
    flexDirection: 'row',
    backgroundColor: colors.slate[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  scoreLabel: {
    fontSize: 9,
    color: colors.slate[500],
    fontWeight: '600',
  },
  scoreNumber: {
    fontSize: 10,
    color: colors.teal[700],
    fontWeight: '800',
  },
  chevronCol: {
    paddingLeft: 4,
  },
});
