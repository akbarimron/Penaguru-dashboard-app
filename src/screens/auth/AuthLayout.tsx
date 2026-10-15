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
import { OrganicBlueBlob } from '../../components/auth/AuthVisuals';
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
  const isWide = layout.width >= 850;

  // Mobile Copy & Theming (All in Bahasa Indonesia & Blue Theme)
  const mobileGreeting =
    mode === 'login'
      ? { title: 'Selamat Datang!', subtitle: 'di PenaGuru' }
      : mode === 'register'
      ? { title: 'Halo, Guru!', subtitle: 'Mulai langkah mengajar Anda' }
      : { title: 'Lupa Sandi?', subtitle: 'Pulihkan akses akun Anda' };

  const mobileCardTitle =
    title || (mode === 'login' ? 'Masuk ke Akun Anda' : mode === 'register' ? 'Daftar Akun Guru' : 'Atur Ulang Kata Sandi');

  // Desktop Copy & Theming (All in Bahasa Indonesia)
  const desktopLeftCopy =
    mode === 'login'
      ? {
          tag: 'RUANG KERJA GURU',
          headline: 'Selamat Datang di PenaGuru',
          sub: 'Akses ruang kerja cerdas untuk catatan jurnal, perwalian, dan rapor siswa.',
        }
      : mode === 'register'
      ? {
          tag: 'BERGABUNG BERSAMA KAMI',
          headline: 'Selamat Datang di PenaGuru',
          sub: 'Mulai kelola kelas dan perwalian dengan lebih rapi, terstruktur, dan cepat.',
        }
      : {
          tag: 'KEAMANAN AKUN',
          headline: 'Selamat Datang di PenaGuru',
          sub: 'Keamanan akun dan data siswa Anda adalah prioritas utama kami.',
        };

  const desktopRightTitle =
    title || (mode === 'login' ? 'Masuk ke Akun Anda' : mode === 'register' ? 'Daftar Akun Guru' : 'Atur Ulang Kata Sandi');

  const desktopRightSubtitle =
    subtitle ||
    (mode === 'login'
      ? 'Akses semua catatan kelas, jurnal harian, dan rapor siswa dalam satu tempat.'
      : mode === 'register'
      ? 'Atur sekolah, kelas perwalian, dan mapel yang Anda ajar dengan mudah.'
      : 'Masukkan email Anda untuk menerima instruksi pemulihan kata sandi.');

  // ==========================================
  // DESKTOP / WEB LAYOUT (Windows Layout)
  // ==========================================
  if (isWide) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.desktopCanvas}
      >
        <ScrollView
          contentContainerStyle={[
            styles.desktopScrollContent,
            { paddingTop: Math.max(32, insets.top + 24), paddingBottom: Math.max(32, insets.bottom + 24) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <EnterView>
            <View style={[styles.desktopCard, desktopCardShadow]}>
              {/* Left Column: Vibrant Mesh Gradient Hero Card with Logo & Illustration */}
              <View style={[styles.desktopHeroCard, desktopHeroGradientStyle]}>
                {/* Top: Official PenaGuru Brand Mark in Crisp White */}
                <View style={styles.desktopHeroTop}>
                  <Image
                    source={LogoWhite}
                    style={styles.desktopLogoWhite}
                    resizeMode="contain"
                  />
                  <View style={{ marginLeft: 12 }}>
                    <AppText variant="title" weight="extrabold" tone="#FFFFFF" style={{ letterSpacing: -0.6 }}>
                      Pena<AppText variant="title" weight="extrabold" tone="#38BDF8">Guru</AppText>
                    </AppText>
                  </View>
                </View>

                {/* Center: Educational Illustration (Apple, Pencil, Open Book) */}
                <View style={styles.desktopIllustrationWrap}>
                  <Image
                    source={SchoolIllustration}
                    style={styles.desktopIllustration}
                    resizeMode="contain"
                  />
                </View>

                {/* Bottom: Caption & Large Headline */}
                <View style={styles.desktopHeroBottom}>
                  <AppText
                    variant="caption"
                    weight="bold"
                    tone="rgba(255, 255, 255, 0.85)"
                    style={styles.desktopHeroTag}
                  >
                    {desktopLeftCopy.tag}
                  </AppText>
                  <AppText
                    variant="display"
                    weight="extrabold"
                    tone="#FFFFFF"
                    style={styles.desktopHeroHeadline}
                  >
                    {desktopLeftCopy.headline}
                  </AppText>
                  <AppText
                    variant="small"
                    weight="medium"
                    tone="rgba(255, 255, 255, 0.88)"
                    style={{ marginTop: 4, lineHeight: 20 }}
                  >
                    {desktopLeftCopy.sub}
                  </AppText>
                </View>
              </View>

              {/* Right Column: Clean Form Container */}
              <View style={styles.desktopFormColumn}>
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
                ) : (
                  <View style={styles.desktopFormMark}>
                    {/* Official PenaGuru App Icon Badge above Form */}
                    <Image
                      source={LogoSquircle}
                      style={styles.desktopFormLogo}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View style={styles.desktopHeaderBox}>
                  <AppText
                    variant="display"
                    weight="extrabold"
                    tone={color.ink}
                    accessibilityRole="header"
                    style={{ fontSize: 26, lineHeight: 32 }}
                  >
                    {desktopRightTitle}
                  </AppText>
                  <AppText variant="small" tone="#64748B" style={{ marginTop: 4, lineHeight: 20 }}>
                    {desktopRightSubtitle}
                  </AppText>
                </View>

                {top}
                {children}
              </View>
            </View>
          </EnterView>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ==========================================
  // MOBILE / APP LAYOUT (Seamless Blue Gradient, Zero Gaps)
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

// Visual Drop Shadow for Desktop Floating Card
const desktopCardShadow: ViewStyle = Platform.select({
  web: {
    boxShadow: '0 24px 64px -12px rgba(99, 102, 241, 0.16), 0 8px 24px -4px rgba(15, 23, 42, 0.06)',
  } as any,
  default: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 12,
  },
})!;

// Rich Vibrant Mesh Gradient Style for Desktop Left Card
const desktopHeroGradientStyle: ViewStyle = Platform.select({
  web: {
    background:
      'radial-gradient(circle at 10% 12%, rgba(56, 189, 248, 0.95) 0%, transparent 40%), ' +
      'radial-gradient(circle at 88% 18%, rgba(192, 132, 252, 0.92) 0%, transparent 45%), ' +
      'radial-gradient(circle at 35% 85%, rgba(99, 102, 241, 0.85) 0%, transparent 55%), ' +
      'linear-gradient(145deg, #1E3A8A 0%, #2563EB 30%, #4F46E5 65%, #7C3AED 100%)',
    boxShadow: '0 16px 40px -8px rgba(79, 70, 229, 0.32)',
  } as any,
  default: {
    backgroundColor: '#2563EB',
  },
})!;

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
  // Desktop Web Styles
  desktopCanvas: {
    flex: 1,
    backgroundColor: '#EEF0F8', // Subtle modern lilac-gray canvas
  },
  desktopScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  desktopCard: {
    width: '100%',
    maxWidth: 960,
    minHeight: 580,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EBF3',
  },
  desktopHeroCard: {
    width: '46%',
    borderRadius: 22,
    padding: 32,
    justifyContent: 'space-between',
    minHeight: 540,
    position: 'relative',
    overflow: 'hidden',
  },
  desktopHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopLogoWhite: {
    width: 42,
    height: 42,
  },
  desktopIllustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  desktopIllustration: {
    width: 175,
    height: 195,
  },
  desktopHeroBottom: {
    gap: 6,
  },
  desktopHeroTag: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 11,
  },
  desktopHeroHeadline: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  desktopFormColumn: {
    width: '54%',
    paddingHorizontal: 38,
    paddingVertical: 24,
    justifyContent: 'center',
    gap: 16,
  },
  desktopFormMark: {
    marginBottom: 4,
  },
  desktopFormLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  desktopHeaderBox: {
    marginBottom: 6,
  },

  // Mobile Styles (Unified Seamless Blue Gradient, Zero Gaps)
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
