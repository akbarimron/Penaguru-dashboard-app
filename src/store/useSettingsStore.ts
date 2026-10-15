import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const SETTINGS_KEY = '@penaguru/user-settings';

export interface AppSettings {
  muteSound: boolean;
  hapticFeedback: boolean;
  scheduleReminder: boolean;
  compactMode: boolean;
}

interface SettingsState extends AppSettings {
  setMuteSound: (val: boolean) => void;
  setHapticFeedback: (val: boolean) => void;
  setScheduleReminder: (val: boolean) => void;
  setCompactMode: (val: boolean) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  muteSound: false,
  hapticFeedback: true,
  scheduleReminder: true,
  compactMode: false,

  setMuteSound: (val) => {
    set({ muteSound: val });
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), muteSound: val })).catch(() => {});
  },
  setHapticFeedback: (val) => {
    set({ hapticFeedback: val });
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), hapticFeedback: val })).catch(() => {});
  },
  setScheduleReminder: (val) => {
    set({ scheduleReminder: val });
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), scheduleReminder: val })).catch(() => {});
  },
  setCompactMode: (val) => {
    set({ compactMode: val });
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), compactMode: val })).catch(() => {});
  },
  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          muteSound: Boolean(parsed.muteSound),
          hapticFeedback: parsed.hapticFeedback ?? true,
          scheduleReminder: parsed.scheduleReminder ?? true,
          compactMode: Boolean(parsed.compactMode),
        });
      }
    } catch {}
  },
}));

// Initialize settings from AsyncStorage
useSettingsStore.getState().loadSettings();
