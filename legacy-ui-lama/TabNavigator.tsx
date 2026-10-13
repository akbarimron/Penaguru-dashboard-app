// src/navigation/TabNavigator.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AIFeedbackScreen } from '../screens/AIFeedbackScreen';
import { ChatbotAssistantScreen } from '../screens/ChatbotAssistantScreen';
import { ClassesScreen } from '../screens/ClassesScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { QuickJournalScreen } from '../screens/QuickJournalScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      id="main-tab-navigator"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.teal[700],
        tabBarInactiveTintColor: colors.slate[400],
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Classes"
        component={ClassesScreen}
        options={{
          tabBarLabel: 'Kelas & Siswa',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="QuickJournal"
        component={QuickJournalScreen}
        options={{
          tabBarLabel: 'Catat Jurnal',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.centerTabIcon, focused && styles.centerTabIconActive]}>
              <Ionicons name="add" size={26} color={colors.pureWhite} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="AIFeedback"
        component={AIFeedbackScreen}
        options={{
          tabBarLabel: 'AI Rapor',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Chatbot"
        component={ChatbotAssistantScreen}
        options={{
          tabBarLabel: 'Asisten Guru',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.pureWhite,
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  centerTabIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.teal[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: colors.teal[800],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  centerTabIconActive: {
    backgroundColor: colors.teal[800],
  },
});
