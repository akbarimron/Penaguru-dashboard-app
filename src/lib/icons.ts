import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface PresetIcon {
  name: IconName;
  label: string;
  category: 'akademik' | 'teknik_sains' | 'seni_olahraga' | 'umum';
}

export const PRESET_ICONS: PresetIcon[] = [
  // Akademik & Literasi
  { name: 'book', label: 'Buku / Bahasa', category: 'akademik' },
  { name: 'calculator', label: 'Matematika / Hitung', category: 'akademik' },
  { name: 'language', label: 'Bahasa Asing / Inggris', category: 'akademik' },
  { name: 'globe', label: 'Geografi / IPS', category: 'akademik' },
  { name: 'time', label: 'Sejarah / Waktu', category: 'akademik' },
  { name: 'business', label: 'Ekonomi / Bisnis', category: 'akademik' },
  { name: 'library', label: 'Perpustakaan / Riset', category: 'akademik' },
  { name: 'document-text', label: 'Literasi / Karya', category: 'akademik' },

  // Teknik & Sains
  { name: 'code-slash', label: 'Informatika / RPL', category: 'teknik_sains' },
  { name: 'terminal', label: 'Komputer / Jaringan', category: 'teknik_sains' },
  { name: 'desktop', label: 'Teknologi Informasi', category: 'teknik_sains' },
  { name: 'flask', label: 'IPA / Kimia / Fisika', category: 'teknik_sains' },
  { name: 'leaf', label: 'Biologi / Lingkungan', category: 'teknik_sains' },
  { name: 'planet', label: 'Astronomi / Kebumian', category: 'teknik_sains' },
  { name: 'construct', label: 'Teknik / Otomotif / Mesin', category: 'teknik_sains' },
  { name: 'hardware-chip', label: 'Elektronika / Robotik', category: 'teknik_sains' },

  // Seni, Olahraga & Karakter
  { name: 'color-palette', label: 'Seni Rupa / Desain', category: 'seni_olahraga' },
  { name: 'brush', label: 'Melukis / Ilustrasi', category: 'seni_olahraga' },
  { name: 'musical-notes', label: 'Seni Musik', category: 'seni_olahraga' },
  { name: 'football', label: 'PJOK / Olahraga', category: 'seni_olahraga' },
  { name: 'fitness', label: 'Kebugaran / Atletik', category: 'seni_olahraga' },
  { name: 'compass', label: 'Pramuka / Ekstra', category: 'seni_olahraga' },
  { name: 'heart', label: 'BK / Bimbingan Konseling', category: 'seni_olahraga' },
  { name: 'moon', label: 'Pendidikan Agama', category: 'seni_olahraga' },

  // Rombel & Umum
  { name: 'school', label: 'Sekolah / Kelas', category: 'umum' },
  { name: 'ribbon', label: 'Perwalian / Prestasi', category: 'umum' },
  { name: 'rocket', label: 'Inovasi / Unggulan', category: 'umum' },
  { name: 'sparkles', label: 'Kreativitas / Bakat', category: 'umum' },
  { name: 'trophy', label: 'Juara / Kompetisi', category: 'umum' },
  { name: 'people', label: 'Rombel / Kolaborasi', category: 'umum' },
  { name: 'briefcase', label: 'Magang / PKL / Karir', category: 'umum' },
  { name: 'bulb', label: 'Ide / Riset Siswa', category: 'umum' },
];

export function resolveSubjectIcon(nama: string, customIcon?: string | null): IconName {
  if (customIcon) return customIcon as IconName;
  const n = nama.toLowerCase();
  if (n.includes('informatika') || n.includes('program') || n.includes('rpl')) return 'code-slash';
  if (n.includes('matematika')) return 'calculator';
  if (n.includes('indonesia')) return 'book';
  if (n.includes('inggris')) return 'language';
  if (n.includes('ipa') || n.includes('fisika') || n.includes('kimia') || n.includes('biologi')) return 'flask';
  if (n.includes('sejarah')) return 'time';
  if (n.includes('agama')) return 'moon';
  if (n.includes('olahraga') || n.includes('pjok')) return 'football';
  if (n.includes('seni') || n.includes('budaya')) return 'color-palette';
  return 'school';
}

export function resolveClassIcon(namaKelas: string, customIcon?: string | null): IconName {
  if (customIcon) return customIcon as IconName;
  const n = namaKelas.toLowerCase();
  if (n.includes('pplg') || n.includes('rpl') || n.includes('tkj')) return 'code-slash';
  if (n.includes('dkv') || n.includes('animasi') || n.includes('seni')) return 'color-palette';
  if (n.includes('tkr') || n.includes('otomotif') || n.includes('mesin')) return 'construct';
  if (n.includes('mipa') || n.includes('ipa')) return 'flask';
  if (n.includes('ips') || n.includes('sosial')) return 'globe';
  return 'ribbon';
}
