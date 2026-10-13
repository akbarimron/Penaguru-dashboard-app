# Delivery Gate antislop: PenaGuru UI v2 (13 Oktober 2026)

Mode: **selama pengerjaan**. Arah desain: teal dari proposal 4.4 + gaya referensi (pilihan pemilik).
Design Read: aplikasi kerja guru (Expo: ponsel, tablet, web) untuk guru mapel & wali kelas SMA/SMK, gaya edukatif-terstruktur dengan kartu mapel berwarna, dial **ENERGY 2 / RHYTHM 2 / MOTION 2**.

## Blok 1: Hard Gate (semua harus "tidak")

| Aturan | Hasil | Bukti |
|---|---|---|
| R-02 em dash | PASS | Pencarian karakter em dash (U+2014) di src, README, SQL, .env: 0 hasil |
| R-03 mobile | PASS | 375px: `scrollWidth` = 375 di Beranda; luapan di Catat (chip panjang + "Pilih semua") ditemukan lalu diperbaiki, cek ulang 0 elemen meluap; target ketuk 44px (IconButton 44, rating 46, chip 38 + hitSlop) |
| R-17 angka tanpa sumber | PASS | Semua angka dihitung dari jurnal/rapor yang tersimpan; tidak ada statistik pemasaran |
| R-18 testimoni | PASS | Tidak ada testimoni |
| R-23 aset tanpa konfirmasi | PASS | Logo = wordmark teks "PenaGuru"; avatar = inisial; foto profil Unsplash versi lama dihapus |
| R-24 navigasi mati | PASS | 5 tab + sidebar menuju layar yang ada |
| R-25 kontras | PASS | `contrast-check.py` untuk 50+ pasangan, terendah 4.55:1 (teks), isian progres >= 3:1 |
| R-26 kontrol mati | PASS | Semua tombol diklik (daftar di bawah); tombol WA nonaktif disertai alasan "Nomor WhatsApp wali belum diisi" |
| R-27 empty/loading/error | PASS | EmptyState dengan aksi (mapel tanpa jurnal, kelas kosong, tanpa agenda), LoadingState saat boot, ErrorState + coba lagi, galat form inline |
| R-28 FAQ | PASS | Tidak ada FAQ |
| R-32 keyboard | PASS | Tab memindah fokus, cincin 2px teal (putih di permukaan berwarna), Enter mengaktifkan "Catat jurnal", Escape menutup dialog |
| R-33 patch skrip | PASS | Semua fitur ditulis di source |
| R-34 tema | PASS | Hanya tema terang (alasan: dipakai di kelas/lab terang, sesuai proposal); tidak ada toggle |
| R-35 dijalankan | PASS | `tsc` 0 error, web bundle OK, `expo export --platform android` OK, konsol & log Metro tanpa error baru |
| R-36 klaim palsu | PASS | Klaim "data per kelas" ditegakkan RLS + tabel `student_contacts` khusus wali kelas |
| R-37 arah desain | PASS | Arah dipilih pemilik lewat pertanyaan; dial dinyatakan |
| R-38 konten palsu | PASS | Data demo diberi label "Mode demo" di setiap beranda; transkrip suara palsu versi lama dihapus |

## Blok 2: Purpose-Gate

| Aturan | Hasil | Alasan tertulis |
|---|---|---|
| R-01 warna/gradien | PASS | Tanpa gradien; warna mapel = penanda kategori (tokens.ts) |
| R-04 ikon | PASS | Ionicons dipilih per makna (kalkulator = Matematika, kode = Informatika); ikon "sparkles" AI lama dihapus |
| R-06 tipografi | PASS | Plus Jakarta Sans dari proposal 4.4; tanpa label huruf besar ber-tracking lebar |
| R-07 latar pola | PASS | Tidak ada |
| R-08 panah | PASS | Hanya di takik kartu mapel (afordans "buka") |
| R-09 badge | PASS | Badge hanya untuk status nyata (Aman/Perhatian/Kritis, Draft/Diajukan/Revisi/Disetujui) |
| R-10 glass | PASS | Tidak dipakai |
| R-12 bayangan | PASS | Hanya bar navigasi, dialog, toast (elemen melayang) |
| R-13 glow | PASS | Tidak dipakai |
| R-14 kartu seragam | PASS | Hero sesi, kartu perwalian, grid kartu mapel, dan daftar punya bentuk berbeda sesuai bobot |
| R-19 animasi | PASS | Tujuan tiap animasi ditulis di `lib/motion.ts`; tidak ada loop; menghormati "kurangi gerakan" |
| R-22 ilustrasi | PASS | Tidak ada ilustrasi |

## Blok 3: Liveliness (semua "ya")

| Pertanyaan | Hasil |
|---|---|
| Dial dinyatakan | Ya: 2 / 2 / 2 |
| Konsisten dengan dial | Ya: komposisi bervariasi (hero, kartu lebar, grid, daftar), gerak hanya transisi bermakna |
| Satu fokus per layar | Ya: Beranda = kartu sesi berlangsung/berikutnya; Catat = tombol Simpan |
| Ruang kosong struktural | Ya: skala spasi 4-40, jarak antarsection 20 |
| Satu aksen | Ya: amber hanya untuk "perlu perhatian" |
| Motif identitas | Ya: kartu mapel bertakik + blok tanggal berwarna (dari referensi) |
| Design Read sebelum membangun | Ya |

## Blok 4: Craftsmanship & Quality Locks

| Aturan | Hasil |
|---|---|
| C-1 intensionalitas | PASS: alasan ditulis di tokens.ts, layout.ts, motion.ts, README |
| C-2 fungsional | PASS |
| C-3 komposisi berbasis konten | PASS: dashboard dibangun dari keputusan guru (siapa yang perlu perhatian, rapor mana menunggu) |
| C-4 tahan banting | PASS: 375 / 768 / 1024 / 1440 diuji; luring + sinkron diuji |
| C-5 bukti | PASS |
| R-05 template | PASS |
| R-11 radius | PASS: 8 / 12 / 18 / 26, pil hanya avatar |
| R-15 CTA | PASS: "Catat jurnal", "Ajukan ke wali kelas", "Susun draf dari jurnal" |
| R-16 buzzword | PASS: grep 0 hasil |
| R-20 identitas | PASS |
| R-21 dark mode | PASS: tema terang dengan alasan tertulis |
| R-29 palet | PASS: teal + slate + amber; warna mapel sebagai sistem kategori |
| R-30 klon | PASS |
| R-31 alasan tertulis | PASS |

## Klik-tembus (R-35)

- Masuk kosong: galat per kolom + getar. Kata sandi salah: "Email atau kata sandi tidak cocok."
- Akun demo Pak Hendra: masuk ke Beranda, sesi XI RPL 1 "sedang berlangsung" dari jadwal Selasa 12:30-14:00.
- Kartu mapel: membuka dashboard mapel. Tab Ringkasan / Siswa (filter status) / Rapor / Kelompok berpindah dengan penanda bergeser.
- Rapor: "Susun 5 draf dari jurnal" membuat Draft 2 → 7. Membuka rapor → Ajukan → status Diajukan.
- Kembalikan dengan catatan kosong: galat; dengan catatan: status Revisi dan banner catatan tampil.
- Dashboard wali kelas → Tinjauan (8, dikelompokkan per mapel + nama guru) → rapor Matematika Bu Ratih → Setujui → Disetujui, tanggal tinjau tercatat, tab orang tua menampilkan tombol WA.
- Catat: simpan kosong menampilkan galat; 2 siswa + tag + skor → "2 catatan jurnal tersimpan".
- Agenda: pilih 22 Okt → Tambah → simpan → muncul di daftar dan penanda kalender.
- Asisten: topik cepat → jawaban berlabel "Saran lokal".
- Profil: mode luring ON → simpan jurnal → "disimpan di perangkat" + titik di tab Profil → Sinkronkan → "Semua catatan sudah tersinkron".
- Keluar: dialog, Escape menutup, Keluar kembali ke halaman Masuk.
- Daftar: sandi lemah ditolak → akun baru → kode salah ditolak → DEMO26 → klaim perwalian XI RPL 1 → tambah mapel (konflik "Sudah diampu Hendra Setiawan" terdeteksi) → Selesai.
- Akun guru mapel murni: dashboard mapel X PPLG 2 tanpa jurnal guru lain (pemisahan data terbukti).
- Bug yang ditemukan & diperbaiki saat klik-tembus: langkah setup melompat mundur setelah menyimpan mapel; chip & tombol meluap di 375px; label radar terpotong; kartu ketiga turun baris di 1440px; kolom kanan sempit di 1024px; cincin fokus tak terlihat di kartu teal.
