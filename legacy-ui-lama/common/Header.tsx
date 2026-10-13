// src/components/common/Header.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePenaGuruStore } from '../../store/usePenaGuruStore';
import { colors } from '../../theme/colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { teacher, isOfflineMode, toggleOfflineMode, syncPendingJournals, journals } = usePenaGuruStore();
  const pendingCount = journals.filter((j) => !j.is_synced).length;

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>PG</Text>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.greeting}>{title || `Selamat Pagi, ${teacher.nama_lengkap.split(' ')[0]}`}</Text>
          <Text style={styles.subtext}>{subtitle || `${teacher.asal_sekolah}`}</Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        {/* Offline / Online Sync Toggle Pill */}
        <TouchableOpacity
          style={[styles.syncBadge, isOfflineMode ? styles.offlineBadge : styles.onlineBadge]}
          onPress={async () => {
            if (isOfflineMode && pendingCount > 0) {
              await syncPendingJournals();
            } else {
              toggleOfflineMode();
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isOfflineMode ? 'cloud-offline' : 'cloud-done'}
            size={14}
            color={isOfflineMode ? colors.amber[700] : colors.primary[700]}
          />
          <Text style={[styles.syncText, isOfflineMode ? styles.offlineText : styles.onlineText]}>
            {isOfflineMode
              ? pendingCount > 0
                ? `Sync (${pendingCount})`
                : 'Offline'
              : 'Supabase Cloud'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.teal[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.teal[100],
  },
  avatarText: {
    color: colors.pureWhite,
    fontWeight: '800',
    fontSize: 16,
  },
  textCol: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate[900],
  },
  subtext: {
    fontSize: 12,
    color: colors.slate[500],
    marginTop: 1,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  onlineBadge: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  offlineBadge: {
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[200],
  },
  syncText: {
    fontSize: 11,
    fontWeight: '700',
  },
  onlineText: {
    color: colors.primary[700],
  },
  offlineText: {
    color: colors.amber[800],
  },
});
