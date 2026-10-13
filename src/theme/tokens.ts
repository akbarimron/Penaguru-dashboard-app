// Design tokens PenaGuru.
// Arah: proposal Bab 4.4 (Emerald/Teal + Amber, Slate, Plus Jakarta Sans)
// digabung dengan tata letak referensi (kartu mapel berwarna, nav melayang).
// Dial: ENERGY 2 / RHYTHM 2 / MOTION 2.
//
// Alasan per keputusan (R-31):
// - Teal #0F766E: warna brand dari proposal, digeser satu tingkat lebih gelap
//   dari #0D9488 karena teks putih di #0D9488 hanya 3.74:1 (gagal AA).
// - Amber: satu-satunya aksen, khusus sinyal "perlu perhatian" / peringatan dini.
// - Warna mapel: penanda kategori supaya guru langsung mengenali konteks
//   mapel x kelas. Teal sengaja tidak dipakai sebagai warna mapel agar tetap
//   milik brand dan dashboard perwalian.
// - Tema terang tetap: aplikasi dipakai di kelas/lab yang terang dan proposal
//   menetapkan latar Slate terang.
// Semua pasangan teks di bawah sudah dicek dengan contrast-check (WCAG AA).

import { SubjectColor } from '../types';

export const color = {
  bg: '#F1F5F9', // slate-100, latar aplikasi
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  ink: '#0F172A', // 16.3:1 di bg
  inkSoft: '#334155',
  muted: '#475569', // 6.92:1 di bg, 7.58:1 di putih
  mutedOnWhite: '#64748B', // 4.76:1, hanya di atas putih
  line: '#E2E8F0', // pemisah dekoratif kartu
  lineStrong: '#7B8798', // batas input, 3.65:1 (non-text contrast)

  brand: '#0F766E', // teks putih 5.47:1
  brandDeep: '#115E59',
  brandSoft: '#CCFBF1', // teks brand di atasnya 4.86:1
  brandTint: '#F0FDFA',
  onBrand: '#FFFFFF',
  onBrandSoft: '#CCFBF1', // teks sekunder di atas brand, 4.86:1

  accent: '#F59E0B', // amber, non-teks
  accentSoft: '#FEF3C7',
  accentInk: '#92400E', // 6.37:1 di accentSoft

  success: '#166534',
  successSoft: '#DCFCE7',
  danger: '#B91C1C',
  dangerSoft: '#FEF2F2',
  critical: '#9F1239',
  criticalSoft: '#FFE4E6',
  info: '#1E40AF',
  infoSoft: '#DBEAFE',

  scrim: 'rgba(15, 23, 42, 0.45)',
};

export interface SubjectPalette {
  bg: string;
  fg: string;
  iconBox: string;
  soft: string;
  ink: string;
}

export const subjectPalette: Record<SubjectColor, SubjectPalette> = {
  violet: { bg: '#5B3FD0', fg: '#FFFFFF', iconBox: 'rgba(255,255,255,0.2)', soft: '#EDE9FE', ink: '#5B21B6' },
  coral: { bg: '#C2412D', fg: '#FFFFFF', iconBox: 'rgba(255,255,255,0.2)', soft: '#FFE4DE', ink: '#9A3412' },
  yellow: { bg: '#F6C445', fg: '#3D2E00', iconBox: 'rgba(61,46,0,0.12)', soft: '#FEF3C7', ink: '#78350F' },
  green: { bg: '#237A3B', fg: '#FFFFFF', iconBox: 'rgba(255,255,255,0.2)', soft: '#DCFCE7', ink: '#166534' },
  blue: { bg: '#2563EB', fg: '#FFFFFF', iconBox: 'rgba(255,255,255,0.2)', soft: '#DBEAFE', ink: '#1E40AF' },
  pink: { bg: '#BE185D', fg: '#FFFFFF', iconBox: 'rgba(255,255,255,0.2)', soft: '#FCE7F3', ink: '#9D174D' },
};

export const subjectColorOrder: SubjectColor[] = ['violet', 'coral', 'yellow', 'green', 'blue', 'pink'];

// Radius dipakai bertingkat sebagai hierarki, bukan semua pil (R-11).
export const radius = {
  sm: 8, // chip, badge
  md: 12, // tombol, input
  lg: 18, // kartu konten
  xl: 26, // kartu mapel & bar navigasi
  full: 999, // avatar saja
};

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
};

// Bayangan hanya untuk elemen yang benar-benar melayang di atas konten:
// bar navigasi, dialog, dan toast (R-12).
export const elevation = {
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
  dialog: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 16,
  },
};

// Plus Jakarta Sans: ditetapkan di proposal 4.4 dan dirancang di Jakarta,
// cocok untuk produk pendidikan berbahasa Indonesia.
export const font = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export type FontWeightKey = keyof typeof font;

// Skala tipe dua register: ponsel dan layar lebar.
export const typeScale = {
  compact: { display: 26, title: 20, heading: 17, body: 15, small: 13, caption: 12 },
  wide: { display: 30, title: 22, heading: 18, body: 15, small: 13, caption: 12 },
};

export type TypeVariant = keyof typeof typeScale.compact;

export const minTap = 44;
