import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrganicBlueBlob, TeacherWorkspaceIllustration } from '../../components/auth/AuthVisuals';
import { AppText, EnterView } from '../../components/ui';
import { useLayout } from '../../lib/layout';
import { color } from '../../theme/tokens';

const SchoolIllustration = require('../../assets/school-illustration.png');
const LogoWhite = require('../../assets/logo/penaguru-mark-white.png');
const LogoSquircle = require('../../assets/logo/penaguru-mark-squircle.png');

export interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  top?: React.ReactNode;
  mode?: 'login' | 'register' | 'forgot';
  onBack?: () => void;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  top,
  mode = 'login',
  onBack,
}: AuthLayoutProps) {
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const isWide = layout.width >= 900;

  // Mobile Copy & Theming (All in Bahasa Indonesia & Blue Theme)
  const mobileGreeting =
    mode === 'login'
      ? { title: 'Selamat Datang!', subtitle: 'di PenaGuru' }
      : mode === 'register'
      ? { title: 'Halo, Guru!', subtitle: 'Mulai langkah mengajar Anda' }
      : { title: 'Lupa Sandi?', subtitle: 'Pulihkan akses akun Anda' };

  const mobileCardTitle =
    title || (mode === 'login' ? 'Masuk ke Akun Anda' : mode === 'register' ? 'Daftar Akun Guru' : 'Atur Ulang Kata Sandi');

  // Desktop Titles
  const desktopTitle =
    title || (mode === 'login' ? 'Selamat Datang' : mode === 'register' ? 'Daftar Akun Guru' : 'Atur Ulang Kata Sandi');

  const desktopSubtitle =
    subtitle ||
    (mode === 'login'
      ? 'Akses semua catatan kelas, jurnal harian, dan rapor siswa dalam satu tempat.'
      : mode === 'register'
      ? 'Atur sekolah, kelas perwalian, dan mapel yang Anda ajar dengan mudah.'
      : 'Masukkan email Anda untuk menerima instruksi pemulihan kata sandi.');

  // =========================================================================
  // DESKTOP FULL-WIDTH SPLIT SCREEN LAYOUT (50% Form White | 50% Illustration)
  // Matching reference layout in Sleeknote style
  // =========================================================================
  if (isWide) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.desktopFullWidth}
      >
        {/* LEFT COLUMN: Clean White Form Area (50% Width) */}
        <View style={styles.desktopLeftCol}>
          <ScrollView
            style={{ width: '100%' }}
            contentContainerStyle={styles.desktopFormScroll}
            keyboardShouldPersistTaps="handled"
          >
            <EnterView style={styles.desktopFormBox}>
              {/* Back navigation if available */}
              {onBack ? (
                <Pressable
                  onPress={onBack}
                  style={styles.backRow}
                  accessibilityRole="button"
                  accessibilityLabel="Kembali ke halaman masuk"
                >
                  <Ionicons name="arrow-back" size={18} color="#4F46E5" />
                  <AppText variant="small" weight="bold" tone="#4F46E5">
                    Kembali ke halaman masuk
                  </AppText>
                </Pressable>
              ) : null}

              {/* PenaGuru Brand Logo Lockup */}
              <View style={styles.desktopLogoRow}>
                <Image
                  source={LogoSquircle}
                  style={styles.desktopLogoIcon}
                  resizeMode="contain"
                />
                <AppText
                  variant="title"
                  weight="extrabold"
                  tone="#0F172A"
                  style={{ fontSize: 24, letterSpacing: -0.6 }}
                >
                  Pena<AppText variant="title" weight="extrabold" tone="#4F46E5">Guru</AppText>
                </AppText>
              </View>

              {/* Big Headline */}
              <View style={styles.desktopHeaderBox}>
                <AppText
                  variant="display"
                  weight="extrabold"
                  tone="#0F172A"
                  accessibilityRole="header"
                  style={styles.desktopMainHeading}
                >
                  {desktopTitle}
                </AppText>
                <AppText variant="small" tone="#64748B" style={styles.desktopSubHeading}>
                  {desktopSubtitle}
                </AppText>
              </View>

              {top}
              {children}
            </EnterView>
          </ScrollView>
        </View>

        {/* RIGHT COLUMN: Soft Pastel Workspace Showcase (50% Width) */}
        <View style={styles.desktopRightCol}>
          {/* Top-Right Info Badge */}
          <View style={styles.desktopRightTopBadge}>
            <View style={styles.badgeHeaderRow}>
              <Ionicons name="school-outline" size={20} color="#0F172A" />
              <AppText variant="body" weight="extrabold" tone="#0F172A">
                PenaGuru Edukasi
              </AppText>
            </View>
            <AppText variant="caption" tone="#64748B" style={styles.badgeSubtext}>
              Kumpulan tips dan alat cerdas untuk mendampingi pencatatan kelas Anda.
            </AppText>
            <View style={styles.badgeBtn}>
              <AppText variant="caption" weight="bold" tone="#0F172A" style={{ letterSpacing: 0.8 }}>
                PANDUAN GURU
              </AppText>
            </View>
          </View>

          {/* Centered Modern Vector Illustration of Educator at Desk */}
          <View style={styles.desktopIllustrationCenter}>
            <TeacherWorkspaceIllustration width={480} height={370} />
          </View>

          {/* Bottom Footer Note */}
          <View style={styles.desktopRightBottom}>
            <AppText variant="caption" tone="#94A3B8">
              PenaGuru • Ruang Kerja Cerdas Guru Indonesia
            </AppText>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ==========================================
  // MOBILE / APP LAYOUT (Seamless Blue Gradient)
  // ==========================================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.mobileCanvas, mobileBgGradientStyle]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.mobileScrollContent, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Top Blue Banner with Organic Shapes, Logo & School Illustration */}
        <View style={styles.mobileTopBanner}>
          {/* Top-Left Organic Shape */}
          <View style={styles.mobileBlobPosition}>
            <OrganicBlueBlob width={130} height={120} />
          </View>

          {/* Top Brand Logo Row on Mobile */}
          <View style={styles.mobileLogoRow}>
            <Image
              source={LogoWhite}
              style={styles.mobileTopLogo}
              resizeMode="contain"
            />
            <AppText variant="title" weight="extrabold" tone="#FFFFFF" style={{ letterSpacing: -0.5 }}>
              Pena<AppText variant="title" weight="extrabold" tone="#38BDF8">Guru</AppText>
            </AppText>
          </View>

          {/* School Illustration on Mobile (Overlapping card line) */}
          <View style={styles.mobileIllustrationPosition}>
            <Image
              source={SchoolIllustration}
              style={styles.mobileIllustration}
              resizeMode="contain"
            />
          </View>

          {/* Greeting Typography */}
          <View style={styles.mobileGreetingBox}>
            <AppText
              variant="display"
              weight="extrabold"
              tone="#FFFFFF"
              style={styles.mobileGreetingTitle}
            >
              {mobileGreeting.title}
            </AppText>
            <AppText
              variant="body"
              weight="medium"
              tone="rgba(255, 255, 255, 0.92)"
              style={styles.mobileGreetingSub}
            >
              {mobileGreeting.subtitle}
            </AppText>
          </View>
        </View>

        {/* White Rounded Bottom Sheet Card with negative margin to completely seal corners */}
        <View style={[styles.mobileWhiteCard, { paddingBottom: Math.max(36, insets.bottom + 24) }]}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={styles.backRowMobile}
              accessibilityRole="button"
              accessibilityLabel="Kembali ke halaman masuk"
            >
              <Ionicons name="arrow-back" size={18} color="#4F46E5" />
              <AppText variant="small" weight="bold" tone="#4F46E5">
                Kembali ke halaman masuk
              </AppText>
            </Pressable>
          ) : (
            <View style={styles.mobileCardLogoMark}>
              <Image
                source={LogoSquircle}
                style={styles.mobileCardLogo}
                resizeMode="contain"
              />
            </View>
          )}

          <View style={styles.mobileCardHeader}>
            <AppText
              variant="display"
              weight="extrabold"
              tone="#1E3A8A"
              accessibilityRole="header"
              style={{ fontSize: 24, letterSpacing: -0.3 }}
            >
              {mobileCardTitle}
            </AppText>
            {subtitle && mode !== 'login' ? (
              <AppText variant="small" tone={color.muted} style={{ marginTop: 2 }}>
                {subtitle}
              </AppText>
            ) : null}
          </View>

          {top}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Seamless Gradient Style for Mobile View (No dark cuts or harsh seams)
const mobileBgGradientStyle: ViewStyle = Platform.select({
  web: {
    background:
      'radial-gradient(circle at 10% 12%, rgba(56, 189, 248, 0.95) 0%, transparent 40%), ' +
      'radial-gradient(circle at 88% 18%, rgba(192, 132, 252, 0.92) 0%, transparent 45%), ' +
      'radial-gradient(circle at 35% 85%, rgba(99, 102, 241, 0.85) 0%, transparent 55%), ' +
      'linear-gradient(145deg, #1E3A8A 0%, #2563EB 30%, #4F46E5 65%, #7C3AED 100%)',
  } as any,
  default: {
    backgroundColor: '#2563EB',
  },
})!;

const styles = StyleSheet.create({
  // ==========================================
  // Desktop Full-Width 50/50 Split Screen
  // ==========================================
  desktopFullWidth: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    backgroundColor: '#FFFFFF',
  },
  desktopLeftCol: {
    flex: 1,
    width: '50%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopFormScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 48,
  },
  desktopFormBox: {
    width: '100%',
    maxWidth: 420,
    gap: 16,
  },
  desktopLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  desktopLogoIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
  },
  desktopHeaderBox: {
    marginBottom: 8,
    gap: 6,
  },
  desktopMainHeading: {
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.7,
  },
  desktopSubHeading: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
  },

  // Desktop Right Column (Pastel Workspace Showcase)
  desktopRightCol: {
    flex: 1,
    width: '50%',
    backgroundColor: '#F0F4FA', // Soft pastel blue/lavender tint matching reference
    paddingHorizontal: 48,
    paddingVertical: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  desktopRightTopBadge: {
    alignSelf: 'flex-end',
    maxWidth: 320,
    alignItems: 'flex-end',
    gap: 6,
  },
  badgeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeSubtext: {
    textAlign: 'right',
    lineHeight: 18,
    color: '#64748B',
  },
  badgeBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#0F172A',
    backgroundColor: 'transparent',
  },
  desktopIllustrationCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  desktopRightBottom: {
    alignSelf: 'center',
  },

  // ==========================================
  // Mobile Styles (Unified Seamless Blue Gradient)
  // ==========================================
  mobileCanvas: {
    flex: 1,
  },
  mobileScrollContent: {
    flexGrow: 1,
  },
  mobileTopBanner: {
    minHeight: 230,
    paddingHorizontal: 26,
    paddingTop: 20,
    paddingBottom: 48,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  mobileBlobPosition: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  mobileLogoRow: {
    position: 'absolute',
    top: 20,
    left: 26,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileTopLogo: {
    width: 32,
    height: 32,
  },
  mobileIllustrationPosition: {
    position: 'absolute',
    bottom: 12,
    right: 18,
    zIndex: 30,
  },
  mobileIllustration: {
    width: 110,
    height: 130,
  },
  mobileGreetingBox: {
    zIndex: 5,
    maxWidth: '65%',
    marginBottom: 8,
  },
  mobileGreetingTitle: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  mobileGreetingSub: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 2,
  },
  mobileWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 26,
    paddingTop: 28,
    marginTop: -24, // Overlap banner smoothly so rounded corners have 100% gradient behind them
    gap: 14,
    flexGrow: 1,
    zIndex: 20,
  },
  mobileCardLogoMark: {
    marginBottom: -4,
  },
  mobileCardLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  mobileCardHeader: {
    marginBottom: 4,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backRowMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
});
