# PenaGuru

Aplikasi pencatatan jurnal kelas dan rapor untuk guru SMA/SMK.
Tugas Besar Pengganti UAS IK300 Mobile Programming, Pendidikan Ilmu Komputer UPI 2026 (Kelompok 3).

- **Web App Live:** https://penaguruku.vercel.app/
- **Website Showcase UAS:** https://penaguruku.vercel.app/showcase/
- **Video Demo (YouTube, 05:00):** https://youtu.be/i6YzKEwpZQ8
- **Android APK rilis (`v1.0.0`):** https://drive.google.com/file/d/1a269pUXx2eCLtVTUqA0P_I7GpR6nJ0wP/view

Dibangun dengan Expo SDK 57 (React Native 0.86, TypeScript), berjalan di Android, iOS, dan web.

## Peran pengguna

Satu akun guru bisa memegang beberapa peran sekaligus.

| Peran | Dari mana | Yang bisa dilakukan |
|---|---|---|
| Guru mapel | Setiap penugasan *mapel x kelas* (`teaching_assignments`) | Dashboard terpisah per mapel di tiap kelas: jurnal harian, status siswa, rapor mapel, kelompok belajar, agenda asesmen |
| Wali kelas | `classes.homeroom_teacher_id` | Melihat semua jurnal dan rapor mapel dari semua guru di kelas perwaliannya, menyetujui atau mengembalikan rapor dengan catatan, mengelola daftar siswa dan kontak orang tua, menulis catatan wali kelas |

Contoh: guru Informatika yang juga wali kelas X PPLG 1 mendapat tiga dashboard mapel (Informatika di X PPLG 1, X PPLG 2, XI RPL 1) dan satu dashboard perwalian X PPLG 1.

## Alur aplikasi

1. **Masuk / Daftar / Lupa kata sandi.**
2. **Atur peran mengajar** (setelah daftar): gabung sekolah dengan kode atau daftarkan sekolah baru, pilih kelas perwalian, tambahkan mapel x kelas beserta jadwal mingguan. Bisa diubah lagi dari Profil.
3. **Beranda**: sesi yang sedang berlangsung atau berikutnya (dihitung dari jadwal), kartu kelas perwalian, kartu mapel per kelas, jadwal hari ini, catatan terbaru, pencarian siswa, dan pemberitahuan (rapor menunggu tinjauan, rapor dikembalikan, catatan belum tersinkron, agenda 3 hari ke depan).
4. **Catat**: pilih mapel x kelas, satu atau beberapa siswa, tag pengamatan, skor 1-5 untuk pengetahuan, keterampilan, dan sikap. Bisa disimpan luring lalu disinkronkan.
5. **Rapor mapel**: draf disusun dari jurnal yang sudah dicatat, disunting guru, diajukan ke wali kelas. Wali kelas menyetujui atau mengembalikan dengan catatan. Setelah disetujui, pesan untuk orang tua bisa disalin atau dikirim lewat WhatsApp.
6. **Agenda**: kalender ulangan, praktikum, dan tugas. Terlihat oleh semua guru di kelas yang sama.
7. **Asisten**: saran strategi mengajar. Tanpa Gemini, jawabannya berasal dari bank saran lokal dan diberi label "Saran lokal".

## Menjalankan

```bash
npm install
npm run web      # buka di browser
npm start        # QR untuk Expo Go di ponsel
```

Tanpa file `.env`, aplikasi berjalan di **mode demo**. Data contoh disimpan di perangkat, dan halaman masuk menampilkan tiga akun demo:

- **Pak Hendra**: wali kelas X PPLG 1 dan guru Informatika di 3 kelas
- **Bu Ratih**: guru Matematika saja, di 2 kelas
- **Bu Sari**: wali kelas X PPLG 2 dan guru Bahasa Indonesia

Akun baru juga bisa didaftarkan di mode demo. Kode sekolah demo: `DEMO26`. Semua nama di data demo fiktif.

## Menghubungkan Supabase

1. Buat proyek Supabase kosong, lalu jalankan seluruh isi [`supabase-schema.sql`](supabase-schema.sql) di SQL Editor.
2. Salin `.env.example` menjadi `.env`, lalu isi `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Jalankan ulang aplikasi. Mode demo otomatis mati.

### Pemisahan data

Setiap baris siswa, jurnal, rapor, dan agenda membawa `class_id`, dan aksesnya dijaga Row Level Security:

| Tabel | Baca | Tulis |
|---|---|---|
| `students` | guru yang mengajar di kelas itu + wali kelas | wali kelas |
| `student_contacts` (kontak orang tua) | wali kelas | wali kelas |
| `daily_journals` | penulis + wali kelas | penulis (lewat penugasannya) |
| `subject_reports` | penulis + wali kelas | penulis selama Draft/Revisi; wali kelas lewat RPC `review_subject_report` |
| `homeroom_reports` | wali kelas | wali kelas |
| `assessments` | semua guru di kelas itu | guru pengampu |

Trigger `fill_from_assignment` selalu mengisi `class_id`, `subject_id`, dan `teacher_id` dari penugasan, sehingga guru tidak bisa menulis jurnal atas nama mapel atau kelas lain. Mode demo meniru aturan yang sama di [`src/data/visibility.ts`](src/data/visibility.ts).

## Struktur kode

```
src/
  api/
    supabase.ts            klien Supabase (dibuat hanya bila .env terisi)
    gemini.ts              integrasi Google Gemini REST API v1beta (retry, fallback multi-model, timeout 12 detik)
  data/                    repository: demo (lokal) & Supabase, seed demo, aturan akses
  lib/                     analitik status siswa, penyusun draf rapor, jadwal, kelompok, gerak, layout
  store/                   Zustand: sesi, data ruang kerja, ringkasan konteks AI, antrean luring, toast & dialog
  navigation/              stack auth/setup/main + tab bar (pil melayang / sidebar)
  components/              komponen UI dasar, kartu mapel, input skor, radar chart, voice journal modal
  screens/                 16 layar (Auth, Setup, Beranda, Catat, Agenda, Asisten, Profil, Mapel, Wali Kelas, Siswa, Rapor, Admin)
supabase/migrations/       skema PostgreSQL (16 tabel, 14 fungsi RPC/trigger, RLS)
showcase/                  halaman landing page showcase UAS IK300 (/showcase/)
```

## Daftar Dependency Utama

- **Core & Mobile:** `expo` (~57.0.30), `react` (19.2.3), `react-native` (0.86.3), `react-native-web` (^0.21.2), `typescript` (~6.0.3)
- **Navigasi:** `@react-navigation/native` (^7.5.0), `@react-navigation/bottom-tabs` (^7.20.0), `@react-navigation/native-stack` (^7.20.0), `react-native-screens` (~4.26.0), `react-native-safe-area-context` (~5.7.0)
- **State & Offline Storage:** `zustand` (^5.0.15), `@react-native-async-storage/async-storage` (2.2.0)
- **Backend & Media:** `@supabase/supabase-js` (^2.117.3), `expo-audio` (~57.0.5), `expo-image-picker` (~57.0.20), `expo-clipboard` (~57.0.2), `expo-crypto` (~57.0.4)
- **UI & Visualisasi:** `@expo/vector-icons` (^15.1.1), `@expo-google-fonts/plus-jakarta-sans` (^0.4.2), `react-native-svg` (15.15.4)

## Petunjuk Build (Web & Android APK)

1. Salin `.env.example` menjadi `.env`, isi `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (publishable key), dan `EXPO_PUBLIC_GEMINI_API_KEY` (jangan pernah commit `.env` ke Git).
2. Verifikasi tipe TypeScript:
   ```bash
   npx tsc --noEmit
   ```
3. Build Web produksi (termasuk halaman showcase `/showcase/`):
   ```bash
   npm run build
   ```
4. Build Android Release APK (`arm64-v8a`):
   ```bash
   npm run build:apk:release
   # Output: android/app/build/outputs/apk/release/app-release.apk
   ```

## Keputusan desain

- **Warna brand teal `#0F766E`**: dari proposal Bab 4.4, satu tingkat lebih gelap dari `#0D9488` karena teks putih di `#0D9488` hanya 3.74:1 (gagal WCAG AA).
- **Warna per mapel**: penanda kategori agar konteks mapel x kelas langsung dikenali. Teal tidak dipakai sebagai warna mapel supaya tetap milik brand dan perwalian.
- **Amber (`#F59E0B`)**: aksen khusus sinyal "perlu perhatian".
- **Plus Jakarta Sans**: ditetapkan di proposal dan dirancang untuk konteks Indonesia.
- **Tata letak adaptif**: di bawah 640px satu kolom dengan nav bawah melayang; di 640–1023px konten dibatasi 760px; di 1024px ke atas nav pindah ke sidebar kiri.
- Semua pasangan teks memenuhi kontras WCAG AA.

## Riwayat Versi

- **v1.0.0 (24 November 2026)** — Rilis Tugas Besar Pengganti UAS IK300 Mobile Programming (Kelompok 3, Pendidikan Ilmu Komputer 5A, FPMIPA UPI):
  - 16 layar lengkap untuk Guru Mapel, Wali Kelas, dan Admin Sekolah dengan isolasi Row Level Security (16 tabel & 14 RPC Supabase).
  - Quick Daily Journal dengan preset tag, skor 3 ranah, dikte suara AI (`expo-audio` + Gemini), dan antrean offline-first (`AsyncStorage`).
  - Sistem kriteria & nilai berbobot (`grade_items`, `student_grades`, `grade_submissions`), analitik capaian kelas, profil siswa, dan Balanced Grouping.
  - Asisten Pedagogik AI & Generator Rapor AI (Teacher-in-the-Loop) berbasis Google Gemini dengan fallback multi-model, kompresi konteks, dan timeout 12 detik.
  - Build Android Release APK (`com.penaguru.app`, `arm64-v8a`), deployment Web Vercel (`https://penaguruku.vercel.app/`), dan Website Showcase (`/showcase/`).
