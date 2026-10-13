import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';
import { AppText, Avatar, Button, PressableScale, TextField } from '../../components/ui';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../data/seed';
import { shake } from '../../lib/motion';
import { useAppStore } from '../../store/useAppStore';
import { color, radius } from '../../theme/tokens';
import { AuthLayout } from './AuthLayout';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation }: any) {
  const signIn = useAppStore((s) => s.signIn);
  const mode = useAppStore((s) => s.mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState<string | null>(null);
  const shakeX = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput>(null);

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
    <AuthLayout
      title="Masuk"
      subtitle="Lanjutkan pencatatan jurnal dan tinjauan rapor kelas Anda."
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
          label="Email"
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
        <TextField
          ref={passwordRef}
          label="Kata sandi"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password || errors.form) setErrors({ ...errors, password: undefined, form: undefined });
          }}
          error={errors.password}
          leftIcon="lock-closed-outline"
          secureToggle
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => submit()}
        />
        <Button label="Lupa kata sandi?" variant="ghost" size="sm" onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginTop: -8 }} />
        <Button label="Masuk" onPress={() => submit()} loading={loading === 'form'} fullWidth />
      </Animated.View>

      <View style={styles.registerRow}>
        <AppText variant="small" tone={color.muted}>
          Belum punya akun?
        </AppText>
        <Button label="Daftar sebagai guru" variant="ghost" size="sm" onPress={() => navigation.navigate('Register')} />
      </View>

      {mode === 'demo' ? (
        <View style={styles.demoBox}>
          <View style={{ gap: 2 }}>
            <AppText variant="body" weight="bold">
              Coba dengan akun demo
            </AppText>
            <AppText variant="small" tone={color.mutedOnWhite}>
              Supabase belum dihubungkan, jadi data contoh disimpan di perangkat ini. Pilih peran untuk melihat bedanya.
            </AppText>
          </View>
          {DEMO_ACCOUNTS.map((acc) => (
            <PressableScale
              key={acc.email}
              onPress={() => submit(acc.email, DEMO_PASSWORD)}
              disabled={Boolean(loading)}
              accessibilityLabel={`Masuk sebagai ${acc.label}, ${acc.role}`}
              scaleTo={0.98}
              style={styles.demoRow}
            >
              <Avatar name={acc.label.replace(/^(Pak|Bu)\s/, '')} size={40} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText variant="small" weight="bold">
                  {acc.label}
                </AppText>
                <AppText variant="caption" tone={color.mutedOnWhite}>
                  {acc.role}
                </AppText>
              </View>
              {loading === acc.email ? (
                <AppText variant="caption" tone={color.brand} weight="bold">
                  Masuk...
                </AppText>
              ) : (
                <Ionicons name="log-in-outline" size={20} color={color.brand} />
              )}
            </PressableScale>
          ))}
        </View>
      ) : (
        <AppText variant="caption" tone={color.muted} align="center">
          Terhubung ke Supabase. Data Anda disimpan di server sekolah.
        </AppText>
      )}
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
  registerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 2 },
  demoBox: { gap: 10, padding: 16, borderRadius: radius.lg, backgroundColor: color.surface, borderWidth: 1, borderColor: color.line },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
    borderWidth: 1,
    borderColor: color.line,
  },
});

