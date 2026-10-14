import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare const process: { env: Record<string, string | undefined> };

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('your-project') && !anonKey.includes('your-anon')
);

// Edge Function Gemini (generate-feedback, pedagogy-assistant) baru dipanggil
// bila diaktifkan, agar aplikasi tidak menunggu fungsi yang belum di-deploy.
export const aiFunctionsEnabled = process.env.EXPO_PUBLIC_AI_EDGE_FUNCTIONS === 'true';

// Klien hanya dibuat bila .env terisi. Tanpa ini, supabase-js tetap mencoba
// refresh token di latar belakang dan memenuhi log dengan error.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
