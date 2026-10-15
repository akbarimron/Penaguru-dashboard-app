import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Button, PressableScale, TextField } from '../../components/ui';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../data/seed';
import { useLayout } from '../../lib/layout';
import { shake } from '../../lib/motion';
import { useAppStore } from '../../store/useAppStore';
import { color, radius } from '../../theme/tokens';
import { AuthLayout } from './AuthLayout';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation }: any) {
  const layout = useLayout();
  const isWide = layout.width >= 850;
  const signIn = useAppStore((s) => s.signIn);
  const mode = useAppStore((s) => s.mode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState<string | null>(null);
  const shakeX = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput>(null);

  const brandActionColor = isWide ? '#4F46E5' : '#076356';

  const submit = async (overrideEmail?: string, overridePassword?: string) => {
    const e = (overrideEmail ?? email).trim();
    const p = overridePassword ?? password;
    const next: typeof errors = {};
    if (!EMAIL_RE.test(e)) next.email = 'Masukkan alamat email yang valid.';
    if (!p) next.password = 'Kata sandi wajib diisi.';
    setErrors(next);
    if (next.email || next.password) {
      shake(shakeX);
      return;
    }
    setLoading(overrideEmail || 'form');
    try {
      await signIn(e, p);
    } catch (err: any) {
      setErrors({ form: err?.message || 'Gagal masuk. Coba lagi.' });
      shake(shakeX);
    } finally {
      setLoading(null);
    }
  };

  return (
    <AuthLayout mode="login">
      <Animated.View style={{ gap: 14, transform: [{ translateX: shakeX }] }}>
        {errors.form ? (
          <View style={styles.formError} accessibilityRole="alert">
            <Ionicons name="alert-circle" size={18} color={color.danger} />
            <AppText variant="small" weight="semibold" tone={color.danger} style={{ flex: 1 }}>
              {errors.form}
            </AppText>
          </View>
        ) : null}

        {/* Email Pill Input */}
        <TextField
          label={isWide ? 'Your email' : 'Email'}
          hideLabel={!isWide}
          round
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email || errors.form) setErrors({ ...errors, email: undefined, form: undefined });
          }}
          error={errors.email}
          leftIcon="mail-outline"
          placeholder={isWide ? 'farazhaidet786@gmail.com' : 'Email'}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        {/* Password Pill Input */}
        <TextField
          ref={passwordRef}
          label={isWide ? 'Password' : 'Password'}
          hideLabel={!isWide}
          round
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password || errors.form) setErrors({ ...errors, password: undefined, form: undefined });
          }}
          error={errors.password}
          leftIcon="lock-closed-outline"
          placeholder="Password"
          secureToggle
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => submit()}
        />

        {/* Forgot Password Link */}
        <Pressable
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotBtn}
          accessibilityRole="button"
          accessibilityLabel="Lupa kata sandi"
        >
          <AppText
            variant="small"
            weight="medium"
            tone={isWide ? '#4F46E5' : '#076356'}
          >
            {isWide ? 'Lupa kata sandi?' : 'Forgot Password'}
          </AppText>
        </Pressable>

        {/* Action Button */}
        <Button
          label={isWide ? 'Masuk Sekarang' : 'Login'}
          round
          onPress={() => submit()}
          loading={loading === 'form'}
          fullWidth
          style={[
            styles.submitButton,
            { backgroundColor: brandActionColor },
            isWide && styles.desktopGlow,
          ]}
        />
      </Animated.View>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <AppText variant="caption" tone="#94A3B8" style={{ paddingHorizontal: 12 }}>
          {isWide ? 'or continue with' : 'Or login with'}
        </AppText>
        <View style={styles.dividerLine} />
      </View>

      {/* Quick Demo Access Pills */}
      <View style={styles.demoSection}>
        <View style={styles.demoPillsWrap}>
          {DEMO_ACCOUNTS.map((acc) => {
            const isSelectedLoading = loading === acc.email;
            const isAccountAdmin = acc.email.includes('admin');
            return (
              <PressableScale
                key={acc.email}
                onPress={() => submit(acc.email, DEMO_PASSWORD)}
                disabled={Boolean(loading)}
                accessibilityLabel={`Masuk sebagai ${acc.label}`}
                scaleTo={0.96}
                style={[
                  styles.demoPill,
                  isAccountAdmin && styles.demoPillAdmin,
                ]}
              >
                <Ionicons
                  name={isAccountAdmin ? 'shield-checkmark' : 'person-circle-outline'}
                  size={16}
                  color={isAccountAdmin ? '#DC2626' : brandActionColor}
                />
                <AppText
                  variant="caption"
                  weight="bold"
                  tone={isAccountAdmin ? '#991B1B' : color.ink}
                  numberOfLines={1}
                >
                  {isSelectedLoading ? 'Masuk...' : acc.label}
                </AppText>
              </PressableScale>
            );
          })}
        </View>
      </View>

      {/* Sign Up Footer */}
      <View style={styles.footerRow}>
        <AppText variant="small" tone="#64748B">
          {isWide ? "Don't have an account?" : "Don't have account?"}
        </AppText>
        <Pressable
          onPress={() => navigation.navigate('Register')}
          accessibilityRole="button"
          accessibilityLabel="Daftar sebagai guru baru"
        >
          <AppText
            variant="small"
            weight="bold"
            tone={isWide ? '#4F46E5' : '#076356'}
          >
            {' '}{isWide ? 'Sign up' : 'Sign Up'}
          </AppText>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: color.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
    marginTop: -4,
  },
  submitButton: {
    minHeight: 50,
    borderWidth: 0,
  },
  desktopGlow: Platform.select({
    web: {
      boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)',
    } as any,
    default: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 6,
    },
  })!,
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  demoSection: {
    gap: 8,
  },
  demoPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoPillAdmin: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
});
