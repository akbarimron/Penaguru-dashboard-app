import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConfirmHost, ToastHost } from './src/components/ui';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/useAppStore';
import { color } from './src/theme/tokens';

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: color.bg, primary: color.brand, card: color.surface, text: color.ink, border: color.line },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const boot = useAppStore((s) => s.boot);

  useEffect(() => {
    boot();
  }, [boot]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg }}>
        <ActivityIndicator color={color.brand} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={navTheme}
        documentTitle={{ formatter: (options) => (options?.title && options.title !== 'PenaGuru' ? `${options.title} · PenaGuru` : 'PenaGuru') }}
      >
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
      <ToastHost />
      <ConfirmHost />
    </SafeAreaProvider>
  );
}
