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
      ? { title: 'Selamat Datang', subtitle: 'di PenaGuru' }
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

          {/* RIGHT COLUMN: Soft Pastel Gradient Showcase with Animated Doodle Characters (50% Width) */}
          <View style={[styles.desktopRightCol, desktopRightBgGradient]}>
            {/* Ambient decorative radial glow bubbles */}
            <View style={styles.ambientGlowTopRight} />
            <View style={styles.ambientGlowBottomLeft} />

            {/* Top-Right Info Badge */}
            <View style={styles.desktopRightTopBadge}>
              <View style={styles.badgeHeaderRow}>
                <Ionicons name="school" size={20} color="#4F46E5" />
                <AppText variant="body" weight="extrabold" tone="#0F172A">
                  PenaGuru
                </AppText>
              </View>
              <AppText variant="caption" tone="#64748B" style={styles.badgeSubtext}>
                Kumpulan tips dan alat cerdas untuk mendampingi pencatatan kelas Anda.
              </AppText>
              <Pressable
                onPress={() => setShowGuideModal(true)}
                style={({ pressed }) => [
                  styles.badgeBtn,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Buka panduan guru"
              >
                <AppText variant="caption" weight="bold" tone="#4F46E5" style={{ letterSpacing: 0.8 }}>
                  PANDUAN GURU
                </AppText>
              </Pressable>
            </View>

            {/* Centered Animated Doodle Characters Showcase */}
            <View style={styles.desktopIllustrationCenter}>
              <AnimatedDoodleCharacters width="100%" height={280} />
            </View>

            {/* Bottom Footer Note */}
            <View style={styles.desktopRightBottom}>
              <AppText variant="caption" tone="#94A3B8">
                PenaGuru • Ruang Kerja Cerdas Guru Indonesia
              </AppText>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* ========================================================================= */
        /* MOBILE / APP LAYOUT (Soft Modern Gradient + Mascot Troupe at Bottom)      */
        /* ========================================================================= */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.mobileCanvas, mobileCanvasBgStyle]}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.mobileScrollContent, { paddingTop: insets.top }]}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Top Soft Gradient Banner */}
            <View style={[styles.mobileTopBanner, mobileBannerGradient]}>
              {/* Top Brand Logo & Guide Button Row */}
              <View style={styles.mobileTopBar}>
                <View style={styles.mobileLogoRow}>
                  <Image
                    source={LogoWhiteMark}
                    style={styles.mobileTopLogo}
                    resizeMode="contain"
                  />
                  <AppText variant="title" weight="extrabold" tone="#FFFFFF" style={{ letterSpacing: -0.5 }}>
                    Pena<AppText variant="title" weight="extrabold" tone="#93C5FD">Guru</AppText>
                  </AppText>
                </View>

                {/* Quick Guide Trigger on Mobile */}
                <Pressable
                  onPress={() => setShowGuideModal(true)}
                  style={({ pressed }) => [
                    styles.mobileGuidePill,
                    pressed && { opacity: 0.8 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Buka panduan guru"
                >
                  <Ionicons name="sparkles" size={13} color="#FFFFFF" />
                  <AppText variant="caption" weight="bold" tone="#FFFFFF" style={{ fontSize: 11 }}>
                    Panduan
                  </AppText>
                </Pressable>
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
                  weight="semibold"
                  tone="rgba(255, 255, 255, 0.95)"
                  style={styles.mobileGreetingSub}
                >
                  {mobileGreeting.subtitle}
                </AppText>
              </View>
            </View>

            {/* White Rounded Bottom Sheet Card with negative margin to completely seal corners */}
            <View style={[styles.mobileWhiteCard, { paddingBottom: Math.max(32, insets.bottom + 20) }]}>
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
                  variant="display"
                  weight="extrabold"
                  tone="#0F172A"
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

              {/* Animated Cute Teacher & Student Doodle Characters at bottom of Mobile Page */}
              <View style={styles.mobileMascotContainer}>
                <AnimatedDoodleCharacters width="100%" height={210} />
              </View>
            </View>
          </ScrollView>
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
// -------------------------------------------------------------
const desktopRightBgGradient: ViewStyle = Platform.select({
  web: {
    background:
      'radial-gradient(circle at 85% 15%, rgba(224, 231, 255, 0.7) 0%, transparent 45%), ' +
      'radial-gradient(circle at 20% 85%, rgba(252, 231, 243, 0.6) 0%, transparent 50%), ' +
      'linear-gradient(135deg, #F0F7FF 0%, #EEF2FF 40%, #F5F3FF 70%, #FDF2F8 100%)',
  } as any,
  default: {
    backgroundColor: '#EEF2FF',
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

const mobileBannerGradient: ViewStyle = Platform.select({
  web: {
    background:
      'radial-gradient(circle at 15% 20%, rgba(147, 197, 253, 0.6) 0%, transparent 45%), ' +
      'radial-gradient(circle at 85% 25%, rgba(216, 180, 254, 0.5) 0%, transparent 45%), ' +
      'linear-gradient(145deg, #2563EB 0%, #4F46E5 55%, #6366F1 100%)',
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
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#E0E7FF',
    opacity: 0.5,
  },
  ambientGlowBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FCE7F3',
    opacity: 0.5,
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
    color: '#64748B',
  },
  badgeBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
  // Mobile Styles (Soft Modern Gradient)
  // ==========================================
  mobileCanvas: {
    flex: 1,
  },
  mobileScrollContent: {
    flexGrow: 1,
  },
  mobileTopBanner: {
    minHeight: 200,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 44,
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
    width: 30,
    height: 30,
  },
  mobileGuidePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  mobileGreetingBox: {
    marginTop: 18,
  },
  mobileGreetingTitle: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  mobileGreetingSub: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 2,
  },
  mobileWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 26,
    marginTop: -22, // Smooth overlap
    gap: 14,
    flexGrow: 1,
    zIndex: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  mobileCardLogoMark: {
    marginBottom: -4,
  },
  mobileCardLogo: {
    width: 38,
    height: 38,
  },
  mobileCardHeader: {
    marginBottom: 4,
  },
  mobileMascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 4,
    width: '100%',
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
