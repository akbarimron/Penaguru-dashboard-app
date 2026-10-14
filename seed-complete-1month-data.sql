-- =====================================================================
-- SKRIP RESET DAN SEED LENGKAP PENAGURU (30 HARI HISTORI JURNAL)
-- Versi: 2026 - Lengkap Admin Dashboard, Guru, Kelas, Siswa, & Jurnal
-- 
-- Akun yang dibuat:
-- 1. Admin: admin@penaguru.sch.id        | Sandi: AdminPenaGuru2026!
-- 2. Guru 1: budi.santoso@penaguru.sch.id  | Sandi: GuruPena2026! (Wali X PPLG 1 & Guru Informatika)
-- 3. Guru 2: siti.aminah@penaguru.sch.id   | Sandi: GuruPena2026! (Wali X PPLG 2 & Guru Pemrograman Web)
-- 4. Guru 3: dewi.lestari@penaguru.sch.id  | Sandi: GuruPena2026! (Guru Basis Data & Matematika)
-- =====================================================================

create extension if not exists "pgcrypto";

-- 1. Pastikan kolom role ada pada public.teachers
alter table public.teachers add column if not exists role varchar(20) not null default 'guru';

-- 2. Fungsi helper keamanan untuk mendeteksi hak admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.teachers
    where id = auth.uid() and (role = 'admin' or email like '%admin%')
  );
end;
$$ language plpgsql security definer;

-- Kebijakan RLS Super Admin (Admin bebas mengelola seluruh tabel)
drop policy if exists "admin_manage_schools" on public.schools;
create policy "admin_manage_schools" on public.schools for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_manage_teachers" on public.teachers;
create policy "admin_manage_teachers" on public.teachers for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_manage_classes" on public.classes;
create policy "admin_manage_classes" on public.classes for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_manage_subjects" on public.subjects;
create policy "admin_manage_subjects" on public.subjects for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_manage_assignments" on public.teaching_assignments;
create policy "admin_manage_assignments" on public.teaching_assignments for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_manage_students" on public.students;
create policy "admin_manage_students" on public.students for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_manage_contacts" on public.student_contacts;
create policy "admin_manage_contacts" on public.student_contacts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_manage_journals" on public.daily_journals;
create policy "admin_manage_journals" on public.daily_journals for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_manage_reports" on public.subject_reports;
create policy "admin_manage_reports" on public.subject_reports for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_manage_homeroom_reports" on public.homeroom_reports;
create policy "admin_manage_homeroom_reports" on public.homeroom_reports for all using (public.is_admin()) with check (public.is_admin());

-- 3. Eksekusi Reset Data & Pengisian Ulang Data Baru
do $$
declare
  v_admin_id uuid := '00000000-0000-0000-0000-000000000001';
  v_budi_id  uuid := '00000000-0000-0000-0000-000000000002';
  v_siti_id  uuid := '00000000-0000-0000-0000-000000000003';
  v_dewi_id  uuid := '00000000-0000-0000-0000-000000000004';
  
  v_school_id uuid;
  v_class_x1  uuid;
  v_class_x2  uuid;
  
  v_sub_inf  uuid;
  v_sub_web  uuid;
  v_sub_db   uuid;
  v_sub_mat  uuid;

  v_asg_inf_x1 uuid;
  v_asg_inf_x2 uuid;
  v_asg_web_x1 uuid;
  v_asg_web_x2 uuid;
  v_asg_db_x1  uuid;
  v_asg_db_x2  uuid;
  v_asg_mat_x1 uuid;

  v_s_ids uuid[] := array[]::uuid[];
  v_curr_sid uuid;
  v_day_offset int;
  v_tgl date;
  v_dow int;
  v_idx int;
  v_base_date date := current_date;
begin
  -- Hapus data operasional lama secara berurutan
  delete from public.homeroom_reports;
  delete from public.subject_reports;
  delete from public.daily_journals;
  delete from public.assessments;
  delete from public.study_groups;
  delete from public.student_contacts;
  delete from public.students;
  delete from public.teaching_assignments;
  delete from public.subjects;
  delete from public.classes;
  delete from public.teachers;

  -- Bersihkan akun auth lama jika ada
  delete from auth.users where email in (
    'admin@penaguru.sch.id',
    'budi.santoso@penaguru.sch.id',
    'siti.aminah@penaguru.sch.id',
    'dewi.lestari@penaguru.sch.id'
  ) or id in (v_admin_id, v_budi_id, v_siti_id, v_dewi_id);

  -- Buat Akun Auth Baru
  insert into auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  )
  values
    (
      v_admin_id, '00000000-0000-0000-0000-000000000000',
      'admin@penaguru.sch.id', crypt('AdminPenaGuru2026!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nama_lengkap":"Drs. H. Mulyadi, M.Pd."}'::jsonb,
      'authenticated', 'authenticated', now(), now()
    ),
    (
      v_budi_id, '00000000-0000-0000-0000-000000000000',
      'budi.santoso@penaguru.sch.id', crypt('GuruPena2026!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nama_lengkap":"Budi Santoso, S.Kom."}'::jsonb,
      'authenticated', 'authenticated', now(), now()
    ),
    (
      v_siti_id, '00000000-0000-0000-0000-000000000000',
      'siti.aminah@penaguru.sch.id', crypt('GuruPena2026!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nama_lengkap":"Siti Aminah, S.Pd."}'::jsonb,
      'authenticated', 'authenticated', now(), now()
    ),
    (
      v_dewi_id, '00000000-0000-0000-0000-000000000000',
      'dewi.lestari@penaguru.sch.id', crypt('GuruPena2026!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nama_lengkap":"Dewi Lestari, M.Kom."}'::jsonb,
      'authenticated', 'authenticated', now(), now()
    );

  -- Buat / Perbarui Profil Sekolah
  select id into v_school_id from public.schools limit 1;
  if v_school_id is null then
    insert into public.schools (nama, npsn, kode_gabung)
    values ('SMK Negeri 1 Bandung', '20219876', 'SMKBDG1')
    returning id into v_school_id;
  else
    update public.schools
    set nama = 'SMK Negeri 1 Bandung', npsn = '20219876', kode_gabung = 'SMKBDG1'
    where id = v_school_id;
  end if;

  -- Buat Profil Guru di public.teachers
  insert into public.teachers (id, school_id, nama_lengkap, nip, email, role)
  values
    (v_admin_id, v_school_id, 'Drs. H. Mulyadi, M.Pd.', '197204121998021001', 'admin@penaguru.sch.id', 'admin'),
    (v_budi_id,  v_school_id, 'Budi Santoso, S.Kom.',  '198503152010011012', 'budi.santoso@penaguru.sch.id', 'guru'),
    (v_siti_id,  v_school_id, 'Siti Aminah, S.Pd.',   '198907222014022005', 'siti.aminah@penaguru.sch.id',  'guru'),
    (v_dewi_id,  v_school_id, 'Dewi Lestari, M.Kom.',  '199211052019032018', 'dewi.lestari@penaguru.sch.id',  'guru');

  -- Buat Kelas X PPLG 1 & X PPLG 2
  insert into public.classes (school_id, nama_kelas, tingkat, tahun_ajaran, semester, homeroom_teacher_id)
  values (v_school_id, 'X PPLG 1', 'X', '2026/2027', 'Ganjil', v_budi_id)
  returning id into v_class_x1;

  insert into public.classes (school_id, nama_kelas, tingkat, tahun_ajaran, semester, homeroom_teacher_id)
  values (v_school_id, 'X PPLG 2', 'X', '2026/2027', 'Ganjil', v_siti_id)
  returning id into v_class_x2;

  -- Buat Mata Pelajaran
  insert into public.subjects (school_id, nama, warna)
  values (v_school_id, 'Informatika', 'violet')
  returning id into v_sub_inf;

  insert into public.subjects (school_id, nama, warna)
  values (v_school_id, 'Pemrograman Web', 'blue')
  returning id into v_sub_web;

  insert into public.subjects (school_id, nama, warna)
  values (v_school_id, 'Basis Data', 'green')
  returning id into v_sub_db;

  insert into public.subjects (school_id, nama, warna)
  values (v_school_id, 'Matematika Terapan', 'yellow')
  returning id into v_sub_mat;

  -- Buat Pembagian Jam Mengajar (Teaching Assignments)
  insert into public.teaching_assignments (teacher_id, class_id, subject_id, materi_aktif, jadwal)
  values
    (v_budi_id, v_class_x1, v_sub_inf, 'Struktur Percabangan dan Perulangan Algoritma',
     '[{"hari":2,"jam_mulai":"07:00","jam_selesai":"09:15"},{"hari":4,"jam_mulai":"09:30","jam_selesai":"11:00"}]'::jsonb)
  returning id into v_asg_inf_x1;

  insert into public.teaching_assignments (teacher_id, class_id, subject_id, materi_aktif, jadwal)
  values
    (v_budi_id, v_class_x2, v_sub_inf, 'Algoritma Pencarian Linear & Binary Search',
     '[{"hari":3,"jam_mulai":"07:00","jam_selesai":"08:30"},{"hari":5,"jam_mulai":"08:30","jam_selesai":"10:00"}]'::jsonb)
  returning id into v_asg_inf_x2;

  insert into public.teaching_assignments (teacher_id, class_id, subject_id, materi_aktif, jadwal)
  values
    (v_siti_id, v_class_x1, v_sub_web, 'Modern CSS Layout (Flexbox, Grid) & DOM Logic',
     '[{"hari":1,"jam_mulai":"07:00","jam_selesai":"09:15"},{"hari":5,"jam_mulai":"07:00","jam_selesai":"08:30"}]'::jsonb)
  returning id into v_asg_web_x1;

  insert into public.teaching_assignments (teacher_id, class_id, subject_id, materi_aktif, jadwal)
  values
    (v_siti_id, v_class_x2, v_sub_web, 'Desain Web Responsif & JavaScript Form Events',
     '[{"hari":2,"jam_mulai":"09:30","jam_selesai":"11:45"},{"hari":4,"jam_mulai":"07:00","jam_selesai":"08:30"}]'::jsonb)
  returning id into v_asg_web_x2;

  insert into public.teaching_assignments (teacher_id, class_id, subject_id, materi_aktif, jadwal)
  values
    (v_dewi_id, v_class_x1, v_sub_db, 'Perancangan ERD, Normalisasi, & Relasi SQL',
     '[{"hari":3,"jam_mulai":"09:30","jam_selesai":"11:45"}]'::jsonb)
  returning id into v_asg_db_x1;

  insert into public.teaching_assignments (teacher_id, class_id, subject_id, materi_aktif, jadwal)
  values
    (v_dewi_id, v_class_x2, v_sub_db, 'Query SELECT JOIN, GROUP BY, & Agregasi SQL',
     '[{"hari":1,"jam_mulai":"09:30","jam_selesai":"11:45"}]'::jsonb)
  returning id into v_asg_db_x2;

  insert into public.teaching_assignments (teacher_id, class_id, subject_id, materi_aktif, jadwal)
  values
    (v_dewi_id, v_class_x1, v_sub_mat, 'Aljabar Boolean, Logika Proposisi, & Gerbang Logika',
     '[{"hari":4,"jam_mulai":"11:00","jam_selesai":"12:30"}]'::jsonb)
  returning id into v_asg_mat_x1;

  -- 4. Masukkan 24 Siswa Beserta Data Kontak Wali Murid
  -- =================== KELAS X PPLG 1 (12 Siswa) ===================
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin) values
    (v_class_x1, '0081234001', 'Ahmad Rizki Pratama', 'L'),
    (v_class_x1, '0081234002', 'Budi Santoso Putra', 'L'),
    (v_class_x1, '0081234003', 'Citra Dewi Lestari', 'P'),
    (v_class_x1, '0081234004', 'Dika Arya Saputra', 'L'),
    (v_class_x1, '0081234005', 'Eka Rahmawati', 'P'),
    (v_class_x1, '0081234006', 'Farhan Hidayat', 'L'),
    (v_class_x1, '0081234007', 'Gita Amalia Wardani', 'P'),
    (v_class_x1, '0081234008', 'Hafiz Nur Rahman', 'L'),
    (v_class_x1, '0081234009', 'Indah Permatasari', 'P'),
    (v_class_x1, '0081234010', 'Jovan Kevin Ardiansyah', 'L'),
    (v_class_x1, '0081234011', 'Kurnia Mega Sasmita', 'P'),
    (v_class_x1, '0081234012', 'Lukman Hakim', 'L');

  -- Kontak Wali X PPLG 1
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Bambang Pratama', '081234567890' from public.students where nisn = '0081234001';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Suryo Santoso', '081234567891' from public.students where nisn = '0081234002';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Dewi Sartika', '081234567892' from public.students where nisn = '0081234003';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Arya Saputra', '081234567893' from public.students where nisn = '0081234004';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Rahmawati Utami', '081234567894' from public.students where nisn = '0081234005';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Hidayatullah', '081234567895' from public.students where nisn = '0081234006';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Nurul Hidayah', '081234567896' from public.students where nisn = '0081234007';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Rahman Hakim', '081234567897' from public.students where nisn = '0081234008';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Joko Wahyudi', '081234567898' from public.students where nisn = '0081234009';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Ardiansyah', '081234567899' from public.students where nisn = '0081234010';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Sasmita Hadi', '081234567800' from public.students where nisn = '0081234011';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Hasan Basri', '081234567801' from public.students where nisn = '0081234012';

  -- =================== KELAS X PPLG 2 (12 Siswa) ===================
  insert into public.students (class_id, nisn, nama_lengkap, jenis_kelamin) values
    (v_class_x2, '0081234013', 'Muhammad Alif Fikri', 'L'),
    (v_class_x2, '0081234014', 'Nabila Putri Lestari', 'P'),
    (v_class_x2, '0081234015', 'Oki Setiawan', 'L'),
    (v_class_x2, '0081234016', 'Putri Maharani', 'P'),
    (v_class_x2, '0081234017', 'Raka Aditya Pratama', 'L'),
    (v_class_x2, '0081234018', 'Siti Zahra Maulida', 'P'),
    (v_class_x2, '0081234019', 'Taufik Hidayatullah', 'L'),
    (v_class_x2, '0081234020', 'Ulya Nafisah', 'P'),
    (v_class_x2, '0081234021', 'Vino Bastian Akbar', 'L'),
    (v_class_x2, '0081234022', 'Wulan Dari Saputri', 'P'),
    (v_class_x2, '0081234023', 'Yusuf Habibie', 'L'),
    (v_class_x2, '0081234024', 'Zahra Nadira', 'P');

  -- Kontak Wali X PPLG 2
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Fikri Ramadhan', '081234567802' from public.students where nisn = '0081234013';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Endang Susilawati', '081234567803' from public.students where nisn = '0081234014';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Setiawan Budi', '081234567804' from public.students where nisn = '0081234015';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Hendra Gunawan', '081234567805' from public.students where nisn = '0081234016';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Yusuf Hidayat', '081234567806' from public.students where nisn = '0081234017';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Ahmad Fauzi', '081234567807' from public.students where nisn = '0081234018';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Mansyur Hidayat', '081234567808' from public.students where nisn = '0081234019';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Zainal Abidin', '081234567809' from public.students where nisn = '0081234020';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Bastian Gunawan', '081234567810' from public.students where nisn = '0081234021';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Agus Saputra', '081234567811' from public.students where nisn = '0081234022';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Ilham Habibie', '081234567812' from public.students where nisn = '0081234023';
  insert into public.student_contacts (student_id, nama_wali, no_whatsapp_wali)
  select id, 'Irfan Nadira', '081234567813' from public.students where nisn = '0081234024';

  -- 5. Buat 1 BULAN HISTORI JURNAL HARIAN (30 Hari ke Belakang)
  -- Loop dari hari ke-30 mundur sampai hari ini
  for v_day_offset in reverse 30..1 loop
    v_tgl := v_base_date - v_day_offset;
    -- Dapatkan hari dalam minggu: 0=Minggu, 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu
    v_dow := extract(dow from v_tgl);

    -- Hanya catat di hari sekolah (Senin - Jumat)
    if v_dow between 1 and 5 then

      -- SENIN:
      -- X PPLG 1: Pemrograman Web (Bu Siti)
      -- X PPLG 2: Basis Data (Bu Dewi)
      if v_dow = 1 then
        insert into public.daily_journals (
          assignment_id, class_id, subject_id, teacher_id, student_id,
          tanggal, materi, nilai_kognitif, nilai_keterampilan, skor_sikap, tags, catatan, created_at
        )
        select
          v_asg_web_x1, v_class_x1, v_sub_web, v_siti_id, s.id,
          v_tgl,
          case (v_day_offset / 7) % 4
            when 0 then 'Modern CSS Flexbox & Alignment'
            when 1 then 'CSS Grid Layout 2 Dimensi'
            when 2 then 'DOM Manipulation Dasar JavaScript'
            else 'Event Listener & Dynamic Styling'
          end,
          (3 + ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 3)),
          (3 + ((ascii(substr(s.nama_lengkap, 2, 1)) + v_day_offset) % 3)),
          4,
          '["#tuntas_tugas", "#kreatif_desain"]'::jsonb,
          case ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 4)
            when 0 then 'Mampu menyusun tata letak secara responsif dan rapi sesuai instruksi kerja.'
            when 1 then 'Aktif berdiskusi mengenai hierarki elemen visual dan fungsi flex item.'
            when 2 then 'Menyelesaikan modul praktikum mandiri dengan inisiatif dan struktur CSS teratur.'
            else 'Membutuhkan sedikit bimbingan pada properti align-items, namun berhasil menyelesaikan tugas.'
          end,
          v_tgl + time '08:30:00'
        from public.students s where s.class_id = v_class_x1;

        insert into public.daily_journals (
          assignment_id, class_id, subject_id, teacher_id, student_id,
          tanggal, materi, nilai_kognitif, nilai_keterampilan, skor_sikap, tags, catatan, created_at
        )
        select
          v_asg_db_x2, v_class_x2, v_sub_db, v_dewi_id, s.id,
          v_tgl,
          case (v_day_offset / 7) % 4
            when 0 then 'Pengenalan RDBMS & Skema Relasional'
            when 1 then 'DDL: CREATE TABLE & Tipe Data SQL'
            when 2 then 'DML: INSERT & UPDATE Multi Data'
            else 'Query SELECT WHERE & ORDER BY'
          end,
          (3 + ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 3)),
          (3 + ((ascii(substr(s.nama_lengkap, 3, 1)) + v_day_offset) % 3)),
          (4 + (v_day_offset % 2)),
          '["#paham_konsep", "#teliti"]'::jsonb,
          'Pemahaman sintaks query berjalan sangat baik, penulisan tipe data kolom tepat.',
          v_tgl + time '10:45:00'
        from public.students s where s.class_id = v_class_x2;
      end if;

      -- SELASA:
      -- X PPLG 1: Informatika (Pak Budi)
      -- X PPLG 2: Pemrograman Web (Bu Siti)
      if v_dow = 2 then
        insert into public.daily_journals (
          assignment_id, class_id, subject_id, teacher_id, student_id,
          tanggal, materi, nilai_kognitif, nilai_keterampilan, skor_sikap, tags, catatan, created_at
        )
        select
          v_asg_inf_x1, v_class_x1, v_sub_inf, v_budi_id, s.id,
          v_tgl,
          case (v_day_offset / 7) % 4
            when 0 then 'Logika Percabangan If-Else Bertingkat'
            when 1 then 'Struktur Switch-Case & Studi Kasus Menu'
            when 2 then 'Perulangan For Loop & Pola Bintang'
            else 'Perulangan While & Validasi Input'
          end,
          (3 + ((ascii(substr(s.nama_lengkap, 2, 1)) + v_day_offset) % 3)),
          (3 + ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 3)),
          5,
          '["#logika_kuat", "#aktif_bertanya"]'::jsonb,
          'Daya analisis algoritma berkembang pesat, mampu menuntaskan soal tantangan tanpa kendala.',
          v_tgl + time '08:15:00'
        from public.students s where s.class_id = v_class_x1;

        insert into public.daily_journals (
          assignment_id, class_id, subject_id, teacher_id, student_id,
          tanggal, materi, nilai_kognitif, nilai_keterampilan, skor_sikap, tags, catatan, created_at
        )
        select
          v_asg_web_x2, v_class_x2, v_sub_web, v_siti_id, s.id,
          v_tgl,
          'Form Validation & Event Handling Web',
          (3 + ((ascii(substr(s.nama_lengkap, 2, 1)) + v_day_offset) % 3)),
          (3 + ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 3)),
          4,
          '["#mandiri", "#tuntas_tugas"]'::jsonb,
          'Memvalidasi data input pengguna menggunakan JavaScript dengan baik dan memberikan pesan error jelas.',
          v_tgl + time '10:30:00'
        from public.students s where s.class_id = v_class_x2;
      end if;

      -- RABU:
      -- X PPLG 1: Basis Data (Bu Dewi)
      -- X PPLG 2: Informatika (Pak Budi)
      if v_dow = 3 then
        insert into public.daily_journals (
          assignment_id, class_id, subject_id, teacher_id, student_id,
          tanggal, materi, nilai_kognitif, nilai_keterampilan, skor_sikap, tags, catatan, created_at
        )
        select
          v_asg_db_x1, v_class_x1, v_sub_db, v_dewi_id, s.id,
          v_tgl,
          'Relasi Tabel, Primary Key, & Foreign Key',
          (3 + ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 3)),
          (3 + ((ascii(substr(s.nama_lengkap, 3, 1)) + v_day_offset) % 3)),
          4,
          '["#kolaboratif", "#paham_konsep"]'::jsonb,
          'Mampu memetakan entitas dunia nyata ke skema database secara akurat dan konsisten.',
          v_tgl + time '10:15:00'
        from public.students s where s.class_id = v_class_x1;

        insert into public.daily_journals (
          assignment_id, class_id, subject_id, teacher_id, student_id,
          tanggal, materi, nilai_kognitif, nilai_keterampilan, skor_sikap, tags, catatan, created_at
        )
        select
          v_asg_inf_x2, v_class_x2, v_sub_inf, v_budi_id, s.id,
          v_tgl,
          'Algoritma Pencarian & Analisis Kompleksitas',
          (3 + ((ascii(substr(s.nama_lengkap, 2, 1)) + v_day_offset) % 3)),
          (3 + ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 3)),
          4,
          '["#inisiatif", "#tuntas_tugas"]'::jsonb,
          'Menjelaskan perbedaan Linear Search dan Binary Search dengan contoh konkrit saat presentasi.',
          v_tgl + time '08:00:00'
        from public.students s where s.class_id = v_class_x2;
      end if;

      -- KAMIS:
      -- X PPLG 1: Informatika & Matematika Terapan
      -- X PPLG 2: Pemrograman Web (Bu Siti)
      if v_dow = 4 then
        insert into public.daily_journals (
          assignment_id, class_id, subject_id, teacher_id, student_id,
          tanggal, materi, nilai_kognitif, nilai_keterampilan, skor_sikap, tags, catatan, created_at
        )
        select
          v_asg_inf_x1, v_class_x1, v_sub_inf, v_budi_id, s.id,
          v_tgl,
          'Praktikum Modular Coding & Fungsi Rekursif',
          (4 - ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 2)),
          (4 + ((ascii(substr(s.nama_lengkap, 2, 1)) + v_day_offset) % 2)),
          5,
          '["#problem_solving", "#fokus"]'::jsonb,
          'Sangat tekun melakukan debugging error sintaks hingga seluruh test case lulus sempurna.',
          v_tgl + time '10:00:00'
        from public.students s where s.class_id = v_class_x1;

        insert into public.daily_journals (
          assignment_id, class_id, subject_id, teacher_id, student_id,
          tanggal, materi, nilai_kognitif, nilai_keterampilan, skor_sikap, tags, catatan, created_at
        )
        select
          v_asg_web_x2, v_class_x2, v_sub_web, v_siti_id, s.id,
          v_tgl,
          'Proyek Antarmuka Responsif Mobile-First',
          (3 + ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 3)),
          (4 - ((ascii(substr(s.nama_lengkap, 2, 1)) + v_day_offset) % 2)),
          4,
          '["#kreatif", "#kolaboratif"]'::jsonb,
          'Tampilan halaman web yang dibuat sangat rapi dan enak dibaca di berbagai ukuran layar smartphone.',
          v_tgl + time '08:00:00'
        from public.students s where s.class_id = v_class_x2;
      end if;

      -- JUMAT:
      -- X PPLG 1: Pemrograman Web (Bu Siti)
      -- X PPLG 2: Informatika (Pak Budi)
      if v_dow = 5 then
        insert into public.daily_journals (
          assignment_id, class_id, subject_id, teacher_id, student_id,
          tanggal, materi, nilai_kognitif, nilai_keterampilan, skor_sikap, tags, catatan, created_at
        )
        select
          v_asg_web_x1, v_class_x1, v_sub_web, v_siti_id, s.id,
          v_tgl,
          'Integrasi Komponen UI & Navigasi Interaktif',
          (3 + ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 3)),
          (3 + ((ascii(substr(s.nama_lengkap, 2, 1)) + v_day_offset) % 3)),
          5,
          '["#tuntas_tugas", "#inisiatif"]'::jsonb,
          'Mampu menghubungkan navigasi tombol dengan manipulasi class CSS secara mulus.',
          v_tgl + time '07:45:00'
        from public.students s where s.class_id = v_class_x1;

        insert into public.daily_journals (
          assignment_id, class_id, subject_id, teacher_id, student_id,
          tanggal, materi, nilai_kognitif, nilai_keterampilan, skor_sikap, tags, catatan, created_at
        )
        select
          v_asg_inf_x2, v_class_x2, v_sub_inf, v_budi_id, s.id,
          v_tgl,
          'Evaluasi Praktikum Algoritma Mingguan',
          (3 + ((ascii(substr(s.nama_lengkap, 2, 1)) + v_day_offset) % 3)),
          (3 + ((ascii(substr(s.nama_lengkap, 1, 1)) + v_day_offset) % 3)),
          4,
          '["#mandiri", "#evaluasi"]'::jsonb,
          'Evaluasi kode berjalan lancar, pemahaman konsep dasar algoritma sudah sangat kokoh.',
          v_tgl + time '09:00:00'
        from public.students s where s.class_id = v_class_x2;
      end if;

    end if;
  end loop;

  -- 6. Masukkan Rapor & Catatan Wali Kelas (Status Beragam: Draft, Diajukan, Disetujui, Revisi)
  insert into public.subject_reports (
    assignment_id, class_id, subject_id, teacher_id, student_id, periode,
    keunggulan, rekomendasi, narasi, pesan_wali, status, catatan_wali_kelas,
    submitted_at, reviewed_at, reviewed_by, updated_at
  )
  select
    v_asg_inf_x1, v_class_x1, v_sub_inf, v_budi_id, s.id, 'PTS Ganjil 2026/2027',
    'Sangat kuat dalam pemahaman konsep logika percabangan dan penyelesaian studi kasus komputasional.',
    'Pertahankan ketekunan latihan mandiri dan tingkatkan eksplorasi fungsi-fungsi algoritma lanjutan.',
    'Menunjukkan antusiasme tinggi selama pembelajaran Informatika, selalu berpartisipasi aktif dalam sesi coding.',
    'Bapak/Ibu, ananda menunjukkan bakat istimewa di bidang pemrograman. Mohon terus didukung dengan waktu belajar di rumah.',
    case (row_number() over (order by s.id)) % 4
      when 0 then 'Disetujui'
      when 1 then 'Diajukan'
      when 2 then 'Revisi'
      else 'Draft'
    end,
    case (row_number() over (order by s.id)) % 4
      when 2 then 'Mohon lengkapi catatan proyek mandiri siswa.'
      else null
    end,
    now() - interval '2 days',
    case when (row_number() over (order by s.id)) % 4 = 0 then now() - interval '1 day' else null end,
    case when (row_number() over (order by s.id)) % 4 = 0 then v_budi_id else null end,
    now()
  from public.students s where s.class_id = v_class_x1 limit 8;

  -- Catatan Wali Kelas (Homeroom Reports)
  insert into public.homeroom_reports (class_id, student_id, periode, catatan, status, updated_at)
  select
    v_class_x1, s.id, 'PTS Ganjil 2026/2027',
    'Menunjukkan perkembangan karakter yang sangat positif, aktif dalam kegiatan kelas, dan menjaga hubungan pertemanan yang harmonis.',
    'Final',
    now()
  from public.students s where s.class_id = v_class_x1 limit 6;

end $$;
