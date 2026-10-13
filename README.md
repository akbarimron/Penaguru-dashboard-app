# PenaGuru

Aplikasi pencatatan jurnal kelas dan rapor untuk guru SMA/SMK.
Tugas Besar Pengganti UTS IK300 Mobile Programming, Pendidikan Ilmu Komputer UPI 2026.

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
  api/supabase.ts          klien Supabase (dibuat hanya bila .env terisi)
  data/                    repository: demo (lokal) & Supabase, seed demo, aturan akses
  lib/                     analitik status siswa, penyusun draf rapor, jadwal, kelompok, gerak, layout
  store/                   Zustand: sesi, data ruang kerja, antrean luring, toast & dialog
  navigation/              stack auth/setup/main + tab bar (pil melayang / sidebar)
  components/              komponen UI dasar, kartu mapel, input skor, radar
  screens/                 semua layar
supabase-schema.sql        skema, trigger, RPC, RLS
legacy-ui-lama/            kode UI versi sebelumnya (tidak dipakai, boleh dihapus)
```

## Keputusan desain

- **Warna brand teal `#0F766E`**: dari proposal Bab 4.4, satu tingkat lebih gelap dari `#0D9488` karena teks putih di `#0D9488` hanya 3.74:1 (gagal WCAG AA).
- **Warna per mapel**: penanda kategori agar konteks mapel x kelas langsung dikenali. Teal tidak dipakai sebagai warna mapel supaya tetap milik brand dan perwalian.
- **Amber**: satu-satunya aksen, khusus sinyal "perlu perhatian".
- **Kartu mapel bertakik**: motif dari gambar referensi. Takik di kanan menampung penanda buka.
- **Plus Jakarta Sans**: ditetapkan di proposal dan dirancang untuk konteks Indonesia.
- **Tata letak**: tiga keadaan. Di bawah 640px satu kolom dengan nav bawah melayang. Di 640-1023px konten dibatasi 760px. Di 1024px ke atas nav pindah ke sidebar, dan konten dibagi dua kolom mulai 1200px.
- **Gerak**: tekan (skala 0.97, 120ms), kartu masuk bertahap (260ms, maksimal 240ms stagger), penanda tab/segmen bergeser, bilah progres terisi, getar saat form salah. Tidak ada animasi berulang, dan semuanya mati bila "kurangi gerakan" aktif.
- Semua pasangan teks lolos WCAG AA (dicek dengan skrip kontras). Fokus keyboard terlihat, dan dialog bisa ditutup dengan Escape.

## Belum dikerjakan

- **Rekam suara ke teks**: versi sebelumnya membuat transkrip palsu, jadi fitur itu dihapus. Saat ini guru dapat memakai tombol dikte di keyboard ponsel. Rekaman asli butuh `expo-audio` + Edge Function transkripsi.
- **Edge Function Gemini** (`generate-feedback`, `pedagogy-assistant`): pemanggilnya sudah ada di `supabaseRepository.ts` dan aktif bila `EXPO_PUBLIC_AI_EDGE_FUNCTIONS=true`, tetapi kode fungsinya belum ditulis.
- Logo: belum ditetapkan, jadi untuk sementara dipakai wordmark teks "PenaGuru".
