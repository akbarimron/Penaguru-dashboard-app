import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplashScreen } from './src/components/AnimatedSplashScreen';
import { ConfirmHost, ToastHost } from './src/components/ui';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/useAppStore';
import { color } from './src/theme/tokens';

// Tahan native splash sesaat sampai komponen React siap mengambil alih animasi
SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
  const status = useAppStore((s) => s.status);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    boot();
  }, [boot]);

  const fontsReady = Boolean(fontsLoaded || fontError);
  const appReady = fontsReady && status !== 'booting';

  useEffect(() => {
    if (fontsReady) {
      // Sembunyikan native splash begitu font siap agar AnimatedSplashScreen langsung tampil mulus
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <NavigationContainer
          theme={navTheme}
          documentTitle={{ formatter: (options) => (options?.title && options.title !== 'PenaGuru' ? `${options.title} · PenaGuru` : 'PenaGuru') }}
        >
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
        <ToastHost />
        <ConfirmHost />
        {showSplash ? (
          <AnimatedSplashScreen
            isReady={appReady}
            onFinish={() => setShowSplash(false)}
          />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}
