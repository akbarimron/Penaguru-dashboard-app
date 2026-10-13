import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, EmptyState, IconButton, TextField } from '../../components/ui';
import { useAppStore } from '../../store/useAppStore';
import { color, radius } from '../../theme/tokens';
import { AuthLayout } from './AuthLayout';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen({ navigation }: any) {
  const request = useAppStore((s) => s.requestPasswordReset);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
      setFormError(e?.message || 'Gagal mengirim tautan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Atur ulang kata sandi"
      subtitle="Masukkan email akun Anda. Kami kirim tautan untuk membuat kata sandi baru."
      top={<IconButton icon="arrow-back" label="Kembali ke halaman masuk" onPress={() => navigation.goBack()} />}
    >
      {sent ? (
        <EmptyState
          icon="mail-outline"
          title="Tautan sudah dikirim"
          message={`Cek kotak masuk ${email.trim()}. Tautan berlaku sementara, jadi segera buka.`}
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
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(null);
            }}
            error={error}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={submit}
          />
          <Button label="Kirim tautan reset" onPress={submit} loading={loading} fullWidth />
        </View>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: color.infoSoft },
});
