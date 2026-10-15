import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Button, EmptyState, TextField } from '../../components/ui';
import { useLayout } from '../../lib/layout';
import { shake } from '../../lib/motion';
import { useAppStore } from '../../store/useAppStore';
import { color, radius } from '../../theme/tokens';
import { AuthLayout } from './AuthLayout';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = 'nama' | 'nip' | 'email' | 'password' | 'confirm';

export function RegisterScreen({ navigation }: any) {
  const layout = useLayout();
  const isWide = layout.width >= 850;
  const signUp = useAppStore((s) => s.signUp);

  const [values, setValues] = useState<Record<Field, string>>({
    nama: '',
    nip: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Partial<Record<Field | 'form', string>>>({});
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState<string | null>(null);
  const shakeX = useRef(new Animated.Value(0)).current;

  const refs = {
    nip: useRef<TextInput>(null),
    email: useRef<TextInput>(null),
    password: useRef<TextInput>(null),
    confirm: useRef<TextInput>(null),
  };

  const brandActionColor = isWide ? '#4F46E5' : '#076356';

  const set = (k: Field) => (t: string) => {
    setValues((v) => ({ ...v, [k]: t }));
    if (errors[k] || errors.form) setErrors((e) => ({ ...e, [k]: undefined, form: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (values.nama.trim().length < 3) e.nama = 'Tulis nama lengkap, minimal 3 huruf.';
    if (values.nip && !/^\d{18}$/.test(values.nip.replace(/\s/g, '')))
      e.nip = 'NIP terdiri dari 18 angka. Kosongkan bila belum punya.';
    if (!EMAIL_RE.test(values.email.trim())) e.email = 'Masukkan alamat email yang valid.';
    if (values.password.length < 8) e.password = 'Minimal 8 karakter.';
    else if (!/\d/.test(values.password) || !/[A-Za-z]/.test(values.password))
      e.password = 'Gabungkan huruf dan angka.';
    if (values.confirm !== values.password) e.confirm = 'Kata sandi tidak sama.';
    return e;
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      shake(shakeX);
      return;
    }
    setLoading(true);
    try {
      const { needsEmailConfirm } = await signUp({
        nama_lengkap: values.nama.trim(),
        nip: values.nip ? values.nip.replace(/\s/g, '') : null,
        email: values.email.trim(),
        password: values.password,
      });
      if (needsEmailConfirm) setConfirmSent(values.email.trim());
    } catch (err: any) {
      setErrors({ form: err?.message || 'Pendaftaran gagal. Coba lagi.' });
      shake(shakeX);
    } finally {
      setLoading(false);
    }
  };

  if (confirmSent) {
    return (
      <AuthLayout
        mode="register"
        title="Cek Email Anda"
        subtitle={`Kami mengirim tautan konfirmasi ke ${confirmSent}.`}
        onBack={() => navigation.navigate('Login')}
      >
        <EmptyState
          icon="mail-unread-outline"
          title="Konfirmasi dulu, lalu masuk"
          message="Buka tautan di email tersebut. Setelah itu kembali ke sini dan masuk untuk mengatur sekolah serta kelas yang Anda ajar."
          action={{ label: 'Kembali ke halaman masuk', onPress: () => navigation.navigate('Login') }}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      mode="register"
      onBack={() => navigation.navigate('Login')}
    >
      <Animated.View style={{ gap: 12, transform: [{ translateX: shakeX }] }}>
        {errors.form ? (
          <View style={styles.formError} accessibilityRole="alert">
            <Ionicons name="alert-circle" size={18} color={color.danger} />
            <AppText variant="small" weight="semibold" tone={color.danger} style={{ flex: 1 }}>
              {errors.form}
            </AppText>
          </View>
        ) : null}

        {/* Nama Lengkap */}
        <TextField
          label={isWide ? 'Nama Lengkap dan Gelar' : 'Nama Lengkap'}
          hideLabel={!isWide}
          round
          value={values.nama}
          onChangeText={set('nama')}
          error={errors.nama}
          placeholder="Nama Lengkap & Gelar (misal: Budi Santoso, S.Kom.)"
          leftIcon="person-outline"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => refs.nip.current?.focus()}
        />

        {/* NIP (Opsional) */}
        <TextField
          ref={refs.nip}
          label={isWide ? 'NIP (opsional)' : 'NIP'}
          hideLabel={!isWide}
          round
          optional
          value={values.nip}
          onChangeText={set('nip')}
          error={errors.nip}
          placeholder="NIP (18 angka, opsional)"
          leftIcon="card-outline"
          keyboardType="number-pad"
          maxLength={22}
          returnKeyType="next"
          onSubmitEditing={() => refs.email.current?.focus()}
        />

        {/* Email */}
        <TextField
          ref={refs.email}
          label={isWide ? 'Email Guru' : 'Email'}
          hideLabel={!isWide}
          round
          value={values.email}
          onChangeText={set('email')}
          error={errors.email}
          leftIcon="mail-outline"
          placeholder="nama@sekolah.sch.id"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => refs.password.current?.focus()}
        />

        {/* Password */}
        <TextField
          ref={refs.password}
          label={isWide ? 'Kata Sandi' : 'Password'}
          hideLabel={!isWide}
          round
          value={values.password}
          onChangeText={set('password')}
          error={errors.password}
          placeholder="Kata Sandi (min. 8 karakter)"
          leftIcon="lock-closed-outline"
          secureToggle
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => refs.confirm.current?.focus()}
        />

        {/* Confirm Password */}
        <TextField
          ref={refs.confirm}
          label={isWide ? 'Ulangi Kata Sandi' : 'Confirm Password'}
          hideLabel={!isWide}
          round
          value={values.confirm}
          onChangeText={set('confirm')}
          error={errors.confirm}
          placeholder="Ulangi Kata Sandi"
          leftIcon="lock-closed-outline"
          secureToggle
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        {/* Action Button */}
        <Button
          label={isWide ? 'Daftar Sekarang' : 'Sign Up'}
          round
          onPress={submit}
          loading={loading}
          fullWidth
          style={[
            styles.submitButton,
            { backgroundColor: brandActionColor },
            isWide && styles.desktopGlow,
          ]}
        />
      </Animated.View>

      {/* Footer Link */}
      <View style={styles.footerRow}>
        <AppText variant="small" tone="#64748B">
          Sudah punya akun?
        </AppText>
        <Pressable
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="button"
          accessibilityLabel="Masuk ke akun yang sudah ada"
        >
          <AppText
            variant="small"
            weight="bold"
            tone={isWide ? '#4F46E5' : '#076356'}
          >
            {' '}Masuk
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
  submitButton: {
    minHeight: 50,
    borderWidth: 0,
    marginTop: 4,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
