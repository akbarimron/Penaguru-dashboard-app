-- =====================================================================
-- SEED DATA CONTOH PENAGURU (Kelas, Siswa, Kontak Wali, & Mapel)
-- Jalankan skrip ini di SQL Editor Supabase agar database langsung
-- terisi data sekolah, kelas, siswa, dan wali murid!
-- =====================================================================

do $$
declare
  v_school_id uuid;
  v_class_x1 uuid;
  v_class_x2 uuid;
  v_subj_it uuid;
  v_subj_web uuid;
  v_subj_db uuid;
  v_s1 uuid; v_s2 uuid; v_s3 uuid; v_s4 uuid;
  v_s5 uuid; v_s6 uuid; v_s7 uuid; v_s8 uuid;
  v_s9 uuid; v_s10 uuid; v_s11 uuid; v_s12 uuid;
begin
  -- 1. Buat Sekolah jika belum ada
  select id into v_school_id from public.schools limit 1;
  if v_school_id is null then
    insert into public.schools (nama, npsn, kode_gabung)
    values ('SMK Negeri 1 Bandung', '20219876', 'SMKBDG1')
    returning id into v_school_id;
  end if;

  -- 2. Buat Kelas X PPLG 1 & X PPLG 2
  select id into v_class_x1 from public.classes where school_id = v_school_id and nama_kelas = 'X PPLG 1';
  if v_class_x1 is null then
    insert into public.classes (school_id, nama_kelas, tingkat, tahun_ajaran, semester)
    values (v_school_id, 'X PPLG 1', 'X', '2026/2027', 'Ganjil')
    returning id into v_class_x1;
  end if;

  select id into v_class_x2 from public.classes where school_id = v_school_id and nama_kelas = 'X PPLG 2';
  if v_class_x2 is null then
    insert into public.classes (school_id, nama_kelas, tingkat, tahun_ajaran, semester)
    values (v_school_id, 'X PPLG 2', 'X', '2026/2027', 'Ganjil')
    returning id into v_class_x2;
  end if;

  -- Jika ada guru yang terdaftar, otomatis jadikan wali kelas X PPLG 1
  update public.classes
  set homeroom_teacher_id = (select id from public.teachers limit 1)
  where id = v_class_x1 and homeroom_teacher_id is null;

  -- 3. Buat Mata Pelajaran
  insert into public.subjects (school_id, nama, warna)
  values
    (v_school_id, 'Informatika', 'violet'),
    (v_school_id, 'Pemrograman Web', 'blue'),
    (v_school_id, 'Basis Data', 'green'),
    (v_school_id, 'Bahasa Indonesia', 'coral')
  on conflict (school_id, nama) do nothing;

  -- 4. Masukkan Siswa ke Kelas X PPLG 1 (12 Siswa Contoh)
  -- Siswa 1
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234001', 'Ahmad Rizki Pratama', 'L')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s1;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s1, 'Bambang Pratama', '081234567890') on conflict do nothing;

  -- Siswa 2
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234002', 'Budi Santoso', 'L')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s2;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s2, 'Suryo Santoso', '081234567891') on conflict do nothing;

  -- Siswa 3
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234003', 'Citra Dewi Lestari', 'P')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s3;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s3, 'Dewi Sartika', '081234567892') on conflict do nothing;

  -- Siswa 4
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234004', 'Dika Arya Saputra', 'L')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s4;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s4, 'Arya Saputra', '081234567893') on conflict do nothing;

  -- Siswa 5
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234005', 'Eka Rahmawati', 'P')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s5;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s5, 'Rahmawati', '081234567894') on conflict do nothing;

  -- Siswa 6
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234006', 'Farhan Hidayat', 'L')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s6;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s6, 'Hidayatullah', '081234567895') on conflict do nothing;

  -- Siswa 7
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234007', 'Gita Nurul Aini', 'P')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s7;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s7, 'Nurul Huda', '081234567896') on conflict do nothing;

  -- Siswa 8
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234008', 'Hendra Wijaya', 'L')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s8;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s8, 'Wijaya Kusuma', '081234567897') on conflict do nothing;

  -- Siswa 9
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234009', 'Intan Permata Sari', 'P')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s9;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s9, 'Permata Sari', '081234567898') on conflict do nothing;

  -- Siswa 10
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234010', 'Joko Prasetyo', 'L')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s10;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s10, 'Prasetyo Utomo', '081234567899') on conflict do nothing;

  -- Siswa 11
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234011', 'Kartika Ayu Maharani', 'P')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s11;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s11, 'Maharani', '081234567800') on conflict do nothing;

  -- Siswa 12
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin)
  values (v_class_x1, '0081234012', 'Luthfi Fauzan Hakim', 'L')
  on conflict (nisn) do update set nama_lengkap = excluded.nama_lengkap returning id into v_s12;
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  values (v_s12, 'Lukman Hakim', '081234567801') on conflict do nothing;

  raise notice 'Seed data berhasil dimasukkan untuk SMK Negeri 1 Bandung (Kelas X PPLG 1 & 12 Siswa)!';
end $$;
