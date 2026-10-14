import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Heuristik :focus-visible untuk web: cincin fokus hanya tampil bila
// pengguna bernavigasi dengan keyboard, tidak saat mengklik dengan mouse.
// Di native, cincin selalu tampil saat elemen terfokus (keyboard eksternal / TV).
let keyboardMode = Platform.OS !== 'web';
const listeners = new Set<(v: boolean) => void>();

const doc = (globalThis as any).document;
if (Platform.OS === 'web' && doc) {
  const setMode = (v: boolean) => {
    if (keyboardMode === v) return;
    keyboardMode = v;
    listeners.forEach((l) => l(v));
  };
  doc.addEventListener('keydown', (e: any) => {
    if (e?.key && (e.key === 'Tab' || e.key.startsWith('Arrow') || e.key === 'Enter' || e.key === ' ')) setMode(true);
  }, true);
  doc.addEventListener('pointerdown', () => setMode(false), true);
}

export function useKeyboardMode() {
  const [mode, setMode] = useState(keyboardMode);
  useEffect(() => {
    listeners.add(setMode);
    return () => {
      listeners.delete(setMode);
    };
  }, []);
  return mode;
}
