import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AppText } from '../ui';

export interface TeacherGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

interface GuideItem {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  title: string;
  desc: string;
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    icon: 'calendar-outline',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    title: 'Jurnal & Presensi Kelas',
    desc: 'Catat absensi siswa (Hadir, Sakit, Izin, Alpa) dan resume kegiatan belajar mengajar harian secara instan.',
  },
  {
    icon: 'ribbon-outline',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    title: 'Penilaian & Leger Otomatis',
    desc: 'Kelola nilai tugas, formatif, sumatif, dan PTS/PAS dengan kalkulasi rata-rata otomatis tanpa rumus manual.',
  },
  {
    icon: 'sparkles-outline',
    color: '#D97706',
    bgColor: '#FEF3C7',
    title: 'Asisten AI PenaGuru',
    desc: 'Buat draf Modul Ajar (RPP), bank soal latihan, dan rekomendasi remedial siswa dalam hitungan detik.',
  },
  {
    icon: 'people-outline',
    color: '#059669',
    bgColor: '#ECFDF5',
    title: 'Data Siswa & Perwalian',
    desc: 'Pantau catatan karakter, riwayat konseling, dan portofolio prestasi setiap peserta didik di kelas Anda.',
  },
  {
    icon: 'document-text-outline',
    color: '#E11D48',
    bgColor: '#FFF1F2',
    title: 'Ekspor Rapor & Rekap',
    desc: 'Cetak dan unduh rekap presensi serta lembar nilai ke format PDF dan Excel rapi siap cetak kapan saja.',
  },
];

export function TeacherGuideModal({ visible, onClose }: TeacherGuideModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Click outside to close */}
        <Pressable style={styles.backdropDismiss} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <AppText variant="title" weight="extrabold" tone="#0F172A" style={styles.modalTitle}>
                Fitur Utama PenaGuru
              </AppText>
              <AppText variant="small" tone="#64748B" style={styles.modalSubtitle}>
                Ringkasan alat kerja cerdas untuk mendampingi kegiatan mengajar & administrasi kelas Anda.
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Tutup panduan"
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </Pressable>
          </View>

          {/* Guide Items List */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {GUIDE_ITEMS.map((item, idx) => (
              <View key={idx} style={styles.guideCard}>
                <View style={styles.guideIconWrap}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.guideTextWrap}>
                  <AppText variant="body" weight="bold" tone="#1E293B">
                    {item.title}
                  </AppText>
                  <AppText variant="caption" tone="#64748B" style={styles.guideDesc}>
                    {item.desc}
                  </AppText>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footerWrap}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Saya mengerti, tutup panduan"
            >
              <AppText variant="small" weight="bold" tone="#FFFFFF">
                Saya Mengerti, Mulai Mengajar
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 9999,
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 12,
    zIndex: 10000,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  modalTitle: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    marginTop: 4,
    lineHeight: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    maxHeight: 360,
  },
  scrollContent: {
    gap: 12,
    paddingVertical: 4,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  guideIconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  guideTextWrap: {
    flex: 1,
  },
  guideDesc: {
    marginTop: 3,
    lineHeight: 18,
  },
  footerWrap: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
});
