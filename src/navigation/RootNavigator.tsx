import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppText, Button } from '../components/ui';
import { useLayout } from '../lib/layout';
import { AgendaScreen } from '../screens/AgendaScreen';
import { AssistantScreen } from '../screens/AssistantScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeroomScreen } from '../screens/HomeroomScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { StudentFormScreen } from '../screens/StudentFormScreen';
import { StudentScreen } from '../screens/StudentScreen';
import { SubjectClassScreen } from '../screens/SubjectClassScreen';
import { useAppStore } from '../store/useAppStore';
import { color } from '../theme/tokens';
import { TabBar } from './TabBar';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const layout = useLayout();
  return (
    <Tab.Navigator
      id="main-tabs"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarPosition: layout.isExpanded ? 'left' : 'bottom', sceneStyle: { backgroundColor: color.bg } }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Beranda' }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ title: 'Catat jurnal' }} />
      <Tab.Screen name="Agenda" component={AgendaScreen} options={{ title: 'Agenda' }} />
      <Tab.Screen name="Assistant" component={AssistantScreen} options={{ title: 'Asisten' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

function BootScreen() {
  const bootError = useAppStore((s) => s.bootError);
  const boot = useAppStore((s) => s.boot);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: color.bg, padding: 24 }}>
      <AppText variant="display" tone={color.brandDeep}>
        PenaGuru
      </AppText>
      {bootError ? (
        <>
          <AppText tone={color.danger} align="center">
            {bootError}
          </AppText>
          <Button label="Coba lagi" icon="refresh" onPress={boot} />
        </>
      ) : (
        <>
          <ActivityIndicator color={color.brand} />
          <AppText variant="small" tone={color.muted}>
            Memuat ruang kerja Anda
          </AppText>
        </>
      )}
    </View>
  );
}

export function RootNavigator() {
  const status = useAppStore((s) => s.status);
  if (status === 'booting') return <BootScreen />;
  return (
    <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: color.bg } }}>
      {status === 'signedOut' ? (
        <Stack.Group screenOptions={{ animation: 'fade' }}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Masuk' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Daftar akun guru', animation: 'slide_from_right' }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Lupa kata sandi', animation: 'slide_from_right' }} />
        </Stack.Group>
      ) : status === 'setup' ? (
        <Stack.Screen name="Setup" component={SetupScreen} options={{ title: 'Atur peran mengajar' }} />
      ) : (
        <Stack.Group>
          <Stack.Screen name="Main" component={MainTabs} options={{ title: 'PenaGuru' }} />
          <Stack.Screen name="SubjectClass" component={SubjectClassScreen} options={{ title: 'Dashboard mapel' }} />
          <Stack.Screen name="Homeroom" component={HomeroomScreen} options={{ title: 'Dashboard wali kelas' }} />
          <Stack.Screen name="Student" component={StudentScreen} options={{ title: 'Detail siswa' }} />
          <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Rapor mapel' }} />
          <Stack.Screen name="StudentForm" component={StudentFormScreen} options={{ title: 'Data siswa', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="ManageRoles" component={SetupScreen} options={{ title: 'Kelola peran mengajar' }} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
