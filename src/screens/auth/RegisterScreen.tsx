import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Button, EmptyState, IconButton, TextField } from '../../components/ui';
import { shake } from '../../lib/motion';
import { useAppStore } from '../../store/useAppStore';
import { color, radius } from '../../theme/tokens';
import { AuthLayout } from './AuthLayout';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = 'nama' | 'nip' | 'email' | 'password' | 'confirm';

export function RegisterScreen({ navigation }: any) {
  const signUp = useAppStore((s) => s.signUp);
  const [values, setValues] = useState<Record<Field, string>>({ nama: '', nip: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<Record<Field | 'form', string>>>({});
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState<string | null>(null);
  const shakeX = useRef(new Animated.Value(0)).current;
  const refs = { nip: useRef<TextInput>(null), email: useRef<TextInput>(null), password: useRef<TextInput>(null), confirm: useRef<TextInput>(null) };

  const set = (k: Field) => (t: string) => {
    setValues((v) => ({ ...v, [k]: t }));
    if (errors[k] || errors.form) setErrors((e) => ({ ...e, [k]: undefined, form: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (values.nama.trim().length < 3) e.nama = 'Tulis nama lengkap, minimal 3 huruf.';
    if (values.nip && !/^\d{18}$/.test(values.nip.replace(/\s/g, ''))) e.nip = 'NIP terdiri dari 18 angka. Kosongkan bila belum punya.';
    if (!EMAIL_RE.test(values.email.trim())) e.email = 'Masukkan alamat email yang valid.';
    if (values.password.length < 8) e.password = 'Minimal 8 karakter.';
    else if (!/\d/.test(values.password) || !/[A-Za-z]/.test(values.password)) e.password = 'Gabungkan huruf dan angka.';
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
      <AuthLayout title="Cek email Anda" subtitle={`Kami mengirim tautan konfirmasi ke ${confirmSent}.`}>
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
      title="Daftar akun guru"
      subtitle="Setelah mendaftar, Anda akan memilih sekolah, kelas perwalian, dan mapel yang Anda ajar."
      top={<IconButton icon="arrow-back" label="Kembali ke halaman masuk" onPress={() => navigation.goBack()} />}
    >
      <Animated.View style={{ gap: 16, transform: [{ translateX: shakeX }] }}>
        {errors.form ? (
          <View style={styles.formError} accessibilityRole="alert">
            <Ionicons name="alert-circle" size={18} color={color.danger} />
            <AppText variant="small" weight="semibold" tone={color.danger} style={{ flex: 1 }}>
              {errors.form}
            </AppText>
          </View>
        ) : null}
        <TextField
          label="Nama lengkap dan gelar"
          value={values.nama}
          onChangeText={set('nama')}
          error={errors.nama}
          placeholder="Nama Anda, S.Pd."
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => refs.nip.current?.focus()}
        />
        <TextField
          ref={refs.nip}
          label="NIP"
          optional
          value={values.nip}
          onChangeText={set('nip')}
          error={errors.nip}
          hint="18 angka. Bisa diisi nanti."
          keyboardType="number-pad"
          maxLength={22}
          returnKeyType="next"
          onSubmitEditing={() => refs.email.current?.focus()}
        />
        <TextField
          ref={refs.email}
          label="Email"
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
        <TextField
          ref={refs.password}
          label="Kata sandi"
          value={values.password}
          onChangeText={set('password')}
          error={errors.password}
          hint="Minimal 8 karakter, gabungan huruf dan angka."
          leftIcon="lock-closed-outline"
          secureToggle
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => refs.confirm.current?.focus()}
        />
        <TextField
          ref={refs.confirm}
          label="Ulangi kata sandi"
          value={values.confirm}
          onChangeText={set('confirm')}
          error={errors.confirm}
          leftIcon="lock-closed-outline"
          secureToggle
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <View style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={18} color={color.brand} />
          <AppText variant="caption" tone={color.inkSoft} style={{ flex: 1 }}>
            Data siswa hanya terlihat oleh guru yang mengajar di kelas tersebut dan wali kelasnya.
          </AppText>
        </View>
        <Button label="Buat akun" onPress={submit} loading={loading} fullWidth />
      </Animated.View>
      <View style={styles.row}>
        <AppText variant="small" tone={color.muted}>
          Sudah punya akun?
        </AppText>
        <Button label="Masuk" variant="ghost" size="sm" onPress={() => navigation.navigate('Login')} />
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
  note: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, borderRadius: radius.md, backgroundColor: color.brandTint },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
});
