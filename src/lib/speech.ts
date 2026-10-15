import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { transcribeAudioWithGemini } from '../api/gemini';

declare const window: any;
declare const navigator: any;

// Deteksi dukungan Web Speech API (Chrome, Edge, Safari, Android Chrome)
export function isWebSpeechSupported(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export interface VoiceListener {
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (err: string) => void;
  onStatusChange?: (isListening: boolean) => void;
}

class SpeechManager {
  private webRecognition: any = null;
  private expoRecording: Audio.Recording | null = null;
  private isListening: boolean = false;
  private mediaRecorder: any = null;
  private audioChunks: any[] = [];

  /**
   * Mulai mendengarkan suara guru melalui mikrofon.
   */
  async startListening(listener: VoiceListener): Promise<void> {
    if (this.isListening) {
      await this.stopListening();
    }

    this.isListening = true;
    listener.onStatusChange?.(true);

    // 1. Prioritaskan Web Speech API jika tersedia (transkripsi instan real-time tanpa latensi)
    if (isWebSpeechSupported()) {
      try {
        const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.webRecognition = new SpeechClass();
        this.webRecognition.lang = 'id-ID';
        this.webRecognition.continuous = true;
        this.webRecognition.interimResults = true;

        let accumulated = '';

        this.webRecognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulated += (accumulated ? ' ' : '') + transcript;
              listener.onFinal(accumulated);
            } else {
              interim += transcript;
              listener.onInterim?.(accumulated ? `${accumulated} ${interim}` : interim);
            }
          }
        };

        this.webRecognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
          if (event.error !== 'no-speech') {
            listener.onError?.(`Mikrofon: ${event.error}`);
          }
        };

        this.webRecognition.onend = () => {
          if (this.isListening) {
            this.isListening = false;
            listener.onStatusChange?.(false);
          }
        };

        this.webRecognition.start();
        return;
      } catch (err: any) {
        console.warn('Gagal memulai WebSpeechRecognition, beralih ke perekam audio:', err);
      }
    }

    // 2. Fallback: Rekam audio lewat MediaRecorder (Web) atau expo-av (Native)
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioChunks = [];
        this.mediaRecorder = new (window as any).MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };

        this.mediaRecorder.start(250);
        listener.onInterim?.('Mendengarkan... Silakan berbicara');
        return;
      } catch (err: any) {
        this.isListening = false;
        listener.onStatusChange?.(false);
        listener.onError?.('Izin mikrofon ditolak atau tidak tersedia di peramban ini.');
        return;
      }
    }

    // 3. Fallback Native Mobile (Android / iOS via expo-av)
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        this.isListening = false;
        listener.onStatusChange?.(false);
        listener.onError?.('Izin akses mikrofon belum diizinkan pada perangkat.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.expoRecording = recording;
      listener.onInterim?.('Merekam suara... Silakan berbicara');
    } catch (err: any) {
      this.isListening = false;
      listener.onStatusChange?.(false);
      listener.onError?.(err?.message || 'Gagal memulai perekam audio.');
    }
  }

  /**
   * Berhenti mendengarkan dan selesaikan transkripsi teks.
   */
  async stopListening(): Promise<string> {
    if (!this.isListening) return '';
    this.isListening = false;

    // Jika menggunakan Web Speech API
    if (this.webRecognition) {
      try {
        this.webRecognition.stop();
      } catch {}
      this.webRecognition = null;
      return '';
    }

    // Jika menggunakan Web MediaRecorder
    if (this.mediaRecorder) {
      return new Promise<string>((resolve) => {
        const rec = this.mediaRecorder;
        rec.onstop = async () => {
          try {
            const blob = new (globalThis as any).Blob(this.audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
              const base64Data = (reader.result as string)?.split(',')[1];
              if (base64Data) {
                const text = await transcribeAudioWithGemini(base64Data, 'audio/webm');
                resolve(text);
              } else {
                resolve('');
              }
            };
          } catch (e) {
            console.warn('Gagal mentranskripsikan web audio:', e);
            resolve('');
          } finally {
            try {
              rec.stream?.getTracks?.().forEach((t: any) => t.stop());
            } catch {}
            this.mediaRecorder = null;
            this.audioChunks = [];
          }
        };
        try {
          rec.stop();
        } catch {
          resolve('');
        }
      });
    }

    // Jika menggunakan expo-av (Native)
    if (this.expoRecording) {
      try {
        await this.expoRecording.stopAndUnloadAsync();
        const uri = this.expoRecording.getURI();
        this.expoRecording = null;

        if (uri) {
          // Baca file rekaman sebagai base64
          const response = await fetch(uri);
          const blob = await response.blob();
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
              const base64Data = (reader.result as string)?.split(',')[1];
              if (base64Data) {
                const text = await transcribeAudioWithGemini(base64Data, 'audio/m4a');
                resolve(text);
              } else {
                resolve('');
              }
            };
          });
        }
      } catch (err) {
        console.warn('Gagal menghentikan expo-av recording:', err);
      }
    }

    return '';
  }

  getActiveStatus(): boolean {
    return this.isListening;
  }
}

export const speechManager = new SpeechManager();
