import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Button, TextField } from '../../components/ui';
import { shake } from '../../lib/motion';
import { useAppStore } from '../../store/useAppStore';
import { color, radius } from '../../theme/tokens';
import { AuthLayout } from './AuthLayout';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation }: any) {
  const signIn = useAppStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState<string | null>(null);
  const shakeX = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput>(null);

  const brandActionColor = '#4F46E5'; // Vibrant Brand Indigo

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
      setErrors({ form: err?.message || 'Email atau kata sandi tidak cocok.' });
      shake(shakeX);
    } finally {
      setLoading(null);
    }
  };

  return (
    <AuthLayout mode="login">
      <Animated.View style={{ gap: 12, transform: [{ translateX: shakeX }] }}>
        {errors.form ? (
          <View style={styles.formError} accessibilityRole="alert">
            <Ionicons name="alert-circle" size={18} color={color.danger} />
            <AppText variant="small" weight="semibold" tone={color.danger} style={{ flex: 1 }}>
              {errors.form}
            </AppText>
          </View>
        ) : null}

        {/* Email Input */}
        <TextField
          label="Email Guru"
          round
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email || errors.form) setErrors({ ...errors, email: undefined, form: undefined });
          }}
          error={errors.email}
          leftIcon="mail-outline"
          placeholder="nama@sekolah.sch.id"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        {/* Password Input */}
        <TextField
          ref={passwordRef}
          label="Kata Sandi"
          round
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password || errors.form) setErrors({ ...errors, password: undefined, form: undefined });
          }}
          error={errors.password}
          leftIcon="lock-closed-outline"
          placeholder="Masukkan kata sandi"
          secureToggle
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => submit()}
        />

        {/* Options Row: Remember Me & Forgot Password */}
        <View style={styles.optionsRow}>
          <Pressable
            onPress={() => setRememberMe(!rememberMe)}
            style={styles.rememberBox}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
          >
            <Ionicons
              name={rememberMe ? 'checkbox' : 'square-outline'}
              size={18}
              color={rememberMe ? '#4F46E5' : '#94A3B8'}
            />
            <AppText variant="small" tone="#475569">
              Ingat saya
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
            accessibilityRole="button"
            accessibilityLabel="Lupa kata sandi"
          >
            <AppText
              variant="small"
              weight="semibold"
              tone="#4F46E5"
            >
              Lupa kata sandi?
            </AppText>
          </Pressable>
        </View>

        {/* Action Button */}
        <Button
          label="Masuk Sekarang"
          round
          onPress={() => submit()}
          loading={loading === 'form'}
          fullWidth
          style={[
            styles.submitButton,
            { backgroundColor: brandActionColor },
            styles.glowShadow,
          ]}
        />
      </Animated.View>

      {/* Sign Up Footer (Bahasa Indonesia) */}
      <View style={styles.footerRow}>
        <AppText variant="small" tone="#64748B">
          Belum punya akun?
        </AppText>
        <Pressable
          onPress={() => navigation.navigate('Register')}
          accessibilityRole="button"
          accessibilityLabel="Daftar sebagai guru baru"
        >
          <AppText
            variant="small"
            weight="bold"
            tone="#4F46E5"
          >
            {' '}Daftar sebagai guru
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
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -2,
  },
  rememberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  forgotBtn: {
    paddingVertical: 2,
  },
  submitButton: {
    minHeight: 50,
    borderWidth: 0,
    marginTop: 2,
  },
  glowShadow: Platform.select({
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});
