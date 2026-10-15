import { Platform } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';

declare const window: any;
declare const navigator: any;
type AudioContext = any;

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {}
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Memainkan efek suara 'pop' gelembung yang renyah dan interaktif saat elemen ditekan.
 * Menghormati pengaturan muteSound dari useSettingsStore.
 */
export function playPopSound(pitchMultiplier = 1) {
  try {
    const isMuted = useSettingsStore.getState().muteSound;
    if (isMuted) return;

    // Haptic feedback ringan jika didukung browser mobile
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.vibrate) {
      const hapticOn = useSettingsStore.getState().hapticFeedback;
      if (hapticOn) {
        navigator.vibrate(10);
      }
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Nada pop gelembung: lompatan frekuensi cepat dengan decay eksponensial (bubble pop)
    const baseFreq = 480 * Math.max(0.6, Math.min(2.4, pitchMultiplier));
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.85, now + 0.022);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, now + 0.075);

    // Dynamic gain envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  } catch {
    // Fail-safe jika audio context diblokir browser
  }
}

/**
 * Memainkan suara pop dengan variasi nada berdasarkan indeks item (skala pentatonik harmonis).
 * Membuat interaksi menekan berulang terasa menyenangkan seperti memainkan tuts pop gelembung.
 */
export function playIndexedPop(index: number) {
  const scale = [1.0, 1.12, 1.25, 1.5, 1.68, 2.0];
  const pitch = scale[index % scale.length] || 1.0;
  playPopSound(pitch);
}
