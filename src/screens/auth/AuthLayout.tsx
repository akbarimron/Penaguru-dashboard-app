import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
import { AnimatedDoodleCharacters } from '../../components/auth/AnimatedDoodleCharacters';
import { TeacherGuideModal } from '../../components/auth/TeacherGuideModal';
import { AppText, EnterView } from '../../components/ui';
import { useLayout } from '../../lib/layout';
import { color } from '../../theme/tokens';

// Logos: pure icon marks without background squircle boxes
const LogoColorMark = require('../../assets/logo/penaguru-mark-color.png');
const LogoWhiteMark = require('../../assets/logo/penaguru-mark-white.png');

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
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Mobile Copy & Theming (All in Bahasa Indonesia & Soft Modern Blue)
  const mobileGreeting =
    mode === 'login'
      ? { title: 'Selamat Datang', subtitle: 'Akses catatan kelas, presensi, dan rapor siswa.' }
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

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP FULL-WIDTH SPLIT SCREEN LAYOUT (50% Form White | 50% Characters) */}
      {/* ========================================================================= */}
      {isWide ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.desktopFullWidth}
        >
          {/* LEFT COLUMN: Clean Airy Form Area (50% Width) */}
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

                {/* PenaGuru Brand Logo: Pure Mark Icon without background box */}
                <View style={styles.desktopLogoRow}>
                  <Image
                    source={LogoColorMark}
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

          {/* RIGHT COLUMN: Soft Blue Gradient Showcase with Animated Doodle Characters (50% Width) */}
          <View style={[styles.desktopRightCol, sharedBrandBlueGradient]}>
            {/* Ambient decorative radial glow bubbles */}
            <View style={styles.ambientGlowTopRight} />
            <View style={styles.ambientGlowBottomLeft} />

            {/* Top-Right Info Badge */}
            <View style={styles.desktopRightTopBadge}>
              <View style={styles.badgeHeaderRow}>
                <Ionicons name="school" size={20} color="#93C5FD" />
                <AppText variant="body" weight="extrabold" tone="#FFFFFF">
                  PenaGuru
                </AppText>
              </View>
              <AppText variant="caption" tone="rgba(255, 255, 255, 0.88)" style={styles.badgeSubtext}>
                Aplikasi ruang kerja cerdas untuk mengelola presensi, penilaian, dan administrasi kelas Anda.
              </AppText>
              <Pressable
                onPress={() => setShowGuideModal(true)}
                style={({ pressed }) => [
                  styles.guideTextBtn,
                  pressed && { opacity: 0.6 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Buka panduan guru"
              >
                <AppText variant="caption" weight="bold" tone="#FFFFFF" style={styles.guideText}>
                  Panduan
                </AppText>
              </Pressable>
            </View>

            {/* Centered Animated Doodle Characters Showcase */}
            <View style={styles.desktopIllustrationCenter}>
              <AnimatedDoodleCharacters width="100%" height={280} isDarkBg={true} />
            </View>

            {/* Bottom Footer Note */}
            <View style={styles.desktopRightBottom}>
              <AppText variant="caption" tone="rgba(255, 255, 255, 0.75)">
                PenaGuru | Ruang Kerja Cerdas Guru Indonesia
              </AppText>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* ========================================================================= */
        /* MOBILE / APP LAYOUT (Fixed Single-Screen, Non-Scrollable, Zero Cutoff)    */
        /* ========================================================================= */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.mobileCanvas, mobileCanvasBgStyle]}
        >
          <View style={[styles.mobileContainerFixed, { paddingTop: insets.top }]}>
            {/* Top Soft Gradient Banner (Compact) */}
            <View style={[styles.mobileTopBanner, sharedBrandBlueGradient]}>
              {/* Top Brand Logo & Guide Button Row */}
              <View style={styles.mobileTopBar}>
                <View style={styles.mobileLogoRow}>
                  <Image
                    source={LogoWhiteMark}
                    style={styles.mobileTopLogo}
                    resizeMode="contain"
                  />
                  <AppText variant="title" weight="extrabold" tone="#FFFFFF" style={{ fontSize: 18, letterSpacing: -0.4 }}>
                    Pena<AppText variant="title" weight="extrabold" tone="#93C5FD">Guru</AppText>
                  </AppText>
                </View>

                {/* Quick Guide Trigger on Mobile: Pure text, zero background, zero border */}
                <Pressable
                  onPress={() => setShowGuideModal(true)}
                  style={({ pressed }) => [
                    styles.guideTextBtn,
                    pressed && { opacity: 0.6 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Buka panduan guru"
                >
                  <AppText variant="caption" weight="bold" tone="#FFFFFF" style={styles.guideText}>
                    Panduan
                  </AppText>
                </Pressable>
              </View>

              {/* Greeting Typography */}
              <View style={styles.mobileGreetingBox}>
                <AppText
                  variant="title"
                  weight="extrabold"
                  tone="#FFFFFF"
                  style={styles.mobileGreetingTitle}
                >
                  {mobileGreeting.title}
                </AppText>
                <AppText
                  variant="caption"
                  weight="medium"
                  tone="rgba(255, 255, 255, 0.92)"
                  style={styles.mobileGreetingSub}
                >
                  {mobileGreeting.subtitle}
                </AppText>
              </View>
            </View>

            {/* White Rounded Bottom Sheet Card - Fills remaining height, non-scrollable, zero cutoff */}
            <View style={[styles.mobileWhiteCard, { paddingBottom: Math.max(6, insets.bottom) }]}>
              <View style={styles.mobileCardTopSection}>
                {onBack ? (
                  <Pressable
                    onPress={onBack}
                    style={styles.backRowMobile}
                    accessibilityRole="button"
                    accessibilityLabel="Kembali ke halaman masuk"
                  >
                    <Ionicons name="arrow-back" size={16} color="#4F46E5" />
                    <AppText variant="small" weight="bold" tone="#4F46E5">
                      Kembali ke halaman masuk
                    </AppText>
                  </Pressable>
                ) : (
                  /* Pure Mark Icon without background box */
                  <View style={styles.mobileCardLogoMark}>
                    <Image
                      source={LogoColorMark}
                      style={styles.mobileCardLogo}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View style={styles.mobileCardHeader}>
                  <AppText
                    variant="title"
                    weight="extrabold"
                    tone="#0F172A"
                    accessibilityRole="header"
                    style={{ fontSize: 20, letterSpacing: -0.3 }}
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

              {/* Animated Cute Teacher & Student Doodle Characters at bottom of Mobile Page - 100% visible, never cut off! */}
              <View style={styles.mobileMascotContainer}>
                <AnimatedDoodleCharacters width="100%" height={140} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Teacher Guide Highlight Modal */}
      <TeacherGuideModal
        visible={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </>
  );
}

// -------------------------------------------------------------
// GRADIENTS & STYLES (Soft, Luminous, Modern)
// Shared Brand Blue Gradient (Identical between Desktop Right Showcase & Mobile Banner)
const sharedBrandBlueGradient: ViewStyle = Platform.select({
  web: {
    background:
      'radial-gradient(circle at 15% 15%, rgba(147, 197, 253, 0.45) 0%, transparent 40%), ' +
      'radial-gradient(circle at 85% 20%, rgba(216, 180, 254, 0.35) 0%, transparent 45%), ' +
      'radial-gradient(circle at 50% 85%, rgba(99, 102, 241, 0.4) 0%, transparent 50%), ' +
      'linear-gradient(145deg, #1E40AF 0%, #2563EB 30%, #4F46E5 65%, #6366F1 100%)',
  } as any,
  default: {
    backgroundColor: '#2563EB',
  },
})!;

const mobileCanvasBgStyle: ViewStyle = Platform.select({
  web: {
    backgroundColor: '#F8FAFC',
  } as any,
  default: {
    backgroundColor: '#4F46E5',
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
    paddingHorizontal: 40,
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
    gap: 12,
    marginBottom: 8,
  },
  desktopLogoIcon: {
    width: 38,
    height: 38,
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

  // Desktop Right Column (Soft Pastel Showcase with Animated Doodles)
  desktopRightCol: {
    flex: 1,
    width: '50%',
    paddingHorizontal: 48,
    paddingVertical: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlowTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  ambientGlowBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  desktopRightTopBadge: {
    alignSelf: 'flex-end',
    maxWidth: 320,
    alignItems: 'flex-end',
    gap: 6,
    zIndex: 10,
  },
  badgeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeSubtext: {
    textAlign: 'right',
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.88)',
  },
  guideTextBtn: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: 'transparent',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  desktopIllustrationCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    width: '100%',
    zIndex: 10,
  },
  desktopRightBottom: {
    alignSelf: 'center',
    zIndex: 10,
  },

  // ==========================================
  // Mobile Styles (Soft Modern Gradient - Fixed Non-Scrollable)
  // ==========================================
  mobileCanvas: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    maxHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    overflow: 'hidden',
  },
  mobileContainerFixed: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-between',
  },
  mobileTopBanner: {
    height: 125,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 22,
    justifyContent: 'space-between',
  },
  mobileTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  mobileLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileTopLogo: {
    width: 26,
    height: 26,
  },
  mobileGreetingBox: {
    marginTop: 4,
  },
  mobileGreetingTitle: {
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  mobileGreetingSub: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 1,
  },
  mobileWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 16,
    marginTop: -16, // Smooth overlap
    flex: 1,
    zIndex: 20,
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  mobileCardTopSection: {
    width: '100%',
    gap: 8,
  },
  mobileCardLogoMark: {
    marginBottom: -4,
  },
  mobileCardLogo: {
    width: 32,
    height: 32,
  },
  mobileCardHeader: {
    marginBottom: 2,
  },
  mobileMascotContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    height: 140,
    overflow: 'hidden',
    marginTop: 2,
    marginBottom: 0,
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
