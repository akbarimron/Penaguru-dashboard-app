import { useWindowDimensions } from 'react-native';

// Tiga keadaan tata letak. Batasnya diambil dari titik di mana konten mulai
// tidak nyaman, bukan dari daftar ukuran perangkat:
// - compact  (< 640): satu kolom, nav bawah melayang. Kartu mapel 2 kolom
//   masih muat karena isinya pendek.
// - medium   (640 - 1023): konten dibatasi 760px agar baris teks tidak terlalu
//   panjang, grid kartu jadi 3 kolom, nav tetap di bawah.
// - expanded (>= 1024): nav pindah ke sisi kiri. Konten baru dibagi 2 kolom
//   di >= 1200 (twoPane), karena di 1024-1199 kolom kanan terlalu sempit.
export type LayoutSize = 'compact' | 'medium' | 'expanded';

export interface LayoutInfo {
  width: number;
  height: number;
  size: LayoutSize;
  isCompact: boolean;
  isExpanded: boolean;
  twoPane: boolean; // konten dibagi dua kolom hanya bila benar-benar muat
  gutter: number;
  contentMaxWidth: number;
  subjectColumns: number;
}

export function getLayout(width: number, height: number): LayoutInfo {
  const size: LayoutSize = width >= 1024 ? 'expanded' : width >= 640 ? 'medium' : 'compact';
  return {
    width,
    height,
    size,
    isCompact: size === 'compact',
    isExpanded: size === 'expanded',
    // Dengan sidebar 256px, dua kolom baru nyaman di >= 1200px.
    twoPane: width >= 1200,
    gutter: size === 'compact' ? 16 : 24,
    contentMaxWidth: size === 'compact' ? width : size === 'medium' ? 760 : 1180,
    subjectColumns: size === 'compact' ? (width < 360 ? 1 : 2) : size === 'medium' ? 3 : 4,
  };
}

export function useLayout(): LayoutInfo {
  const { width, height } = useWindowDimensions();
  return getLayout(width, height);
}
