import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { AppText, Button, EmptyState, TextField } from '../../components/ui';
import { useLayout } from '../../lib/layout';
import { useAppStore } from '../../store/useAppStore';
import { color, radius } from '../../theme/tokens';
import { AuthLayout } from './AuthLayout';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen({ navigation }: any) {
  const layout = useLayout();
  const isWide = layout.width >= 850;
  const request = useAppStore((s) => s.requestPasswordReset);

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const brandActionColor = isWide ? '#4F46E5' : '#076356';

  const submit = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    setLoading(true);
    setFormError(null);
    try {
      await request(email);
      setSent(true);
    } catch (e: any) {
      setFormError(e?.message || 'Gagal mengirim tautan reset kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="forgot"
      title={isWide ? 'Atur Ulang Kata Sandi' : 'Reset Password'}
      subtitle="Masukkan email akun Anda. Kami kirimkan tautan untuk membuat kata sandi baru."
      onBack={() => navigation.navigate('Login')}
    >
      {sent ? (
        <EmptyState
          icon="mail-outline"
          title="Tautan Terkirim"
          message={`Cek kotak masuk ${email.trim()}. Tautan berlaku sementara, silakan buka email tersebut.`}
          action={{ label: 'Kembali ke halaman masuk', onPress: () => navigation.navigate('Login') }}
        />
      ) : (
        <View style={{ gap: 16 }}>
          {formError ? (
            <View style={styles.info} accessibilityRole="alert">
              <Ionicons name="information-circle" size={18} color={color.info} />
              <AppText variant="small" weight="semibold" tone={color.info} style={{ flex: 1 }}>
                {formError}
              </AppText>
            </View>
          ) : null}

          <TextField
            label={isWide ? 'Your email' : 'Email'}
            hideLabel={!isWide}
            round
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(null);
            }}
            error={error}
            leftIcon="mail-outline"
            placeholder={isWide ? 'nama@sekolah.sch.id' : 'Email'}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={submit}
          />

          <Button
            label={isWide ? 'Kirim Tautan Reset' : 'Send Reset Link'}
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
        </View>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: color.infoSoft,
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
});
