-- =====================================================================
-- SKEMA SUPABASE POSTGRESQL - PENAGURU (versi 2: peran wali kelas & guru mapel)
-- IK300 Mobile Programming - Universitas Pendidikan Indonesia 2026
--
-- File ini IDEMPOTENT (aman dijalankan berulang kali tanpa error duplikasi).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. TABEL
-- ---------------------------------------------------------------------

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  nama varchar(150) not null,
  npsn varchar(8) unique,
  kode_gabung varchar(8) not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 6)),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  nama_lengkap varchar(150) not null,
  nip varchar(30),
  email varchar(120) not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  nama_kelas varchar(50) not null,
  tingkat varchar(3) not null check (tingkat in ('X', 'XI', 'XII')),
  tahun_ajaran varchar(9) not null,
  semester varchar(6) not null check (semester in ('Ganjil', 'Genap')),
  homeroom_teacher_id uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (school_id, nama_kelas, tahun_ajaran)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  nama varchar(80) not null,
  warna varchar(10) not null default 'violet' check (warna in ('violet', 'coral', 'yellow', 'green', 'blue', 'pink')),
  created_at timestamptz not null default now(),
  unique (school_id, nama)
);

create table if not exists public.teaching_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  materi_aktif varchar(150) not null default '',
  jadwal jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (class_id, subject_id)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  nisn varchar(10) not null unique,
  nama_lengkap varchar(150) not null,
  jenis_kelamin char(1) not null check (jenis_kelamin in ('L', 'P')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_contacts (
  student_id uuid primary key references public.students(id) on delete cascade,
  nama_wali varchar(150),
  no_whatsapp_wali varchar(20)
);

create table if not exists public.daily_journals (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  tanggal date not null default current_date,
  materi varchar(150) not null,
  nilai_kognitif smallint not null check (nilai_kognitif between 1 and 5),
  nilai_keterampilan smallint not null check (nilai_keterampilan between 1 and 5),
  skor_sikap smallint not null check (skor_sikap between 1 and 5),
  tags jsonb not null default '[]'::jsonb,
  catatan text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.subject_reports (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  periode varchar(40) not null,
  keunggulan text not null default '',
  rekomendasi text not null default '',
  narasi text not null default '',
  pesan_wali text not null default '',
  status varchar(10) not null default 'Draft' check (status in ('Draft', 'Diajukan', 'Revisi', 'Disetujui')),
  catatan_wali_kelas text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.teachers(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id, periode)
);

create table if not exists public.homeroom_reports (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  periode varchar(40) not null,
  catatan text not null default '',
  status varchar(6) not null default 'Draft' check (status in ('Draft', 'Final')),
  updated_at timestamptz not null default now(),
  unique (student_id, periode)
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  judul varchar(120) not null,
  jenis varchar(10) not null check (jenis in ('Ulangan', 'Praktikum', 'Tugas', 'PTS', 'PAS', 'Proyek')),
  tanggal date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
  nama_kelompok varchar(50) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.study_groups(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  peran varchar(15) not null default 'Anggota' check (peran in ('Ketua', 'Anggota', 'Mentor Sebaya')),
  primary key (group_id, student_id)
);

-- ---------------------------------------------------------------------
-- 2. INDEKS
-- ---------------------------------------------------------------------
create index if not exists idx_teachers_school on public.teachers (school_id);
create index if not exists idx_classes_school on public.classes (school_id);
create index if not exists idx_classes_homeroom on public.classes (homeroom_teacher_id);
create index if not exists idx_assignments_teacher on public.teaching_assignments (teacher_id);
create index if not exists idx_students_class on public.students (class_id);
create index if not exists idx_journals_class_date on public.daily_journals (class_id, tanggal desc);
create index if not exists idx_journals_assignment_student on public.daily_journals (assignment_id, student_id);
create index if not exists idx_reports_class_status on public.subject_reports (class_id, status);
create index if not exists idx_assessments_class_date on public.assessments (class_id, tanggal);

-- ---------------------------------------------------------------------
-- 3. HELPER FUNCTIONS
-- ---------------------------------------------------------------------
create or replace function public.my_school_id() returns uuid
language sql stable security definer set search_path = public as $$
  select school_id from public.teachers where id = auth.uid();
$$;

create or replace function public.is_homeroom(p_class_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.classes where id = p_class_id and homeroom_teacher_id = auth.uid());
$$;

create or replace function public.teaches_class(p_class_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.teaching_assignments where class_id = p_class_id and teacher_id = auth.uid());
$$;

create or replace function public.owns_assignment(p_assignment_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.teaching_assignments where id = p_assignment_id and teacher_id = auth.uid());
$$;

create or replace function public.can_view_class(p_class_id uuid) returns boolean
language sql stable as $$
  select public.is_homeroom(p_class_id) or public.teaches_class(p_class_id);
$$;

-- ---------------------------------------------------------------------
-- 4. TRIGGER
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.teachers (id, nama_lengkap, nip, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama_lengkap', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'nip', ''),
    new.email
  )
  on conflict (id) do update set
    nama_lengkap = excluded.nama_lengkap,
    nip = excluded.nip;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.fill_from_assignment() returns trigger
language plpgsql security definer set search_path = public as $$
declare a public.teaching_assignments;
begin
  select * into a from public.teaching_assignments where id = new.assignment_id;
  if a.id is null then raise exception 'Penugasan tidak ditemukan'; end if;
  new.class_id := a.class_id;
  new.subject_id := a.subject_id;
  if tg_table_name in ('daily_journals', 'subject_reports') then
    new.teacher_id := a.teacher_id;
    if not exists (select 1 from public.students where id = new.student_id and class_id = a.class_id) then
      raise exception 'Siswa bukan anggota kelas ini';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists journals_fill on public.daily_journals;
create trigger journals_fill before insert on public.daily_journals
for each row execute function public.fill_from_assignment();

drop trigger if exists reports_fill on public.subject_reports;
create trigger reports_fill before insert on public.subject_reports
for each row execute function public.fill_from_assignment();

drop trigger if exists assessments_fill on public.assessments;
create trigger assessments_fill before insert on public.assessments
for each row execute function public.fill_from_assignment();

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at := now(); return new; end $$;

drop trigger if exists reports_touch on public.subject_reports;
create trigger reports_touch before update on public.subject_reports
for each row execute function public.touch_updated_at();

drop trigger if exists homeroom_touch on public.homeroom_reports;
create trigger homeroom_touch before update on public.homeroom_reports
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 5. RPC (Stored Procedures)
-- ---------------------------------------------------------------------
create or replace function public.create_school(p_nama text, p_npsn text default null)
returns public.schools language plpgsql security definer set search_path = public as $$
declare s public.schools;
begin
  insert into public.schools (nama, npsn, created_by) values (p_nama, nullif(p_npsn, ''), auth.uid()) returning * into s;
  update public.teachers set school_id = s.id where id = auth.uid();
  return s;
end $$;

create or replace function public.join_school(p_kode text)
returns public.schools language plpgsql security definer set search_path = public as $$
declare s public.schools;
begin
  select * into s from public.schools where kode_gabung = upper(p_kode);
  if s.id is null then raise exception 'Kode sekolah tidak ditemukan'; end if;
  update public.teachers set school_id = s.id where id = auth.uid();
  return s;
end $$;

create or replace function public.set_homeroom(p_class_id uuid, p_claim boolean)
returns void language plpgsql security definer set search_path = public as $$
declare c public.classes;
begin
  select * into c from public.classes where id = p_class_id and school_id = public.my_school_id();
  if c.id is null then raise exception 'Kelas tidak ditemukan'; end if;
  if p_claim then
    if c.homeroom_teacher_id is not null and c.homeroom_teacher_id <> auth.uid() then
      raise exception 'Kelas ini sudah punya wali kelas';
    end if;
    update public.classes set homeroom_teacher_id = auth.uid() where id = p_class_id;
  else
    update public.classes set homeroom_teacher_id = null where id = p_class_id and homeroom_teacher_id = auth.uid();
  end if;
end $$;

create or replace function public.set_subject_report_status(p_report_id uuid, p_status text)
returns public.subject_reports language plpgsql security definer set search_path = public as $$
declare r public.subject_reports;
begin
  select * into r from public.subject_reports where id = p_report_id and teacher_id = auth.uid();
  if r.id is null then raise exception 'Rapor tidak ditemukan'; end if;
  if p_status = 'Diajukan' and r.status in ('Draft', 'Revisi') then
    update public.subject_reports set status = 'Diajukan', submitted_at = now() where id = r.id returning * into r;
  elsif p_status = 'Draft' and r.status = 'Diajukan' then
    update public.subject_reports set status = 'Draft', submitted_at = null where id = r.id returning * into r;
  else
    raise exception 'Perubahan status tidak diizinkan';
  end if;
  return r;
end $$;

create or replace function public.review_subject_report(p_report_id uuid, p_decision text, p_note text default null)
returns public.subject_reports language plpgsql security definer set search_path = public as $$
declare r public.subject_reports;
begin
  select * into r from public.subject_reports where id = p_report_id;
  if r.id is null or not public.is_homeroom(r.class_id) then raise exception 'Hanya wali kelas yang dapat meninjau rapor ini'; end if;
  if r.status <> 'Diajukan' then raise exception 'Rapor tidak sedang menunggu tinjauan'; end if;
  if p_decision not in ('Disetujui', 'Revisi') then raise exception 'Keputusan tidak valid'; end if;
  if p_decision = 'Revisi' and coalesce(trim(p_note), '') = '' then raise exception 'Catatan revisi wajib diisi'; end if;
  update public.subject_reports
     set status = p_decision, catatan_wali_kelas = p_note, reviewed_at = now(), reviewed_by = auth.uid()
   where id = r.id returning * into r;
  return r;
end $$;

create or replace function public.replace_study_groups(p_assignment_id uuid, p_groups jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g jsonb; m jsonb; gid uuid; result jsonb := '[]'::jsonb;
begin
  if not public.owns_assignment(p_assignment_id) then raise exception 'Anda tidak mengampu mapel ini'; end if;
  delete from public.study_groups where assignment_id = p_assignment_id;
  for g in select * from jsonb_array_elements(p_groups) loop
    insert into public.study_groups (assignment_id, nama_kelompok) values (p_assignment_id, g ->> 'nama_kelompok') returning id into gid;
    for m in select * from jsonb_array_elements(g -> 'members') loop
      insert into public.group_members (group_id, student_id, peran) values (gid, (m ->> 'student_id')::uuid, m ->> 'peran');
    end loop;
    result := result || jsonb_build_object('id', gid, 'assignment_id', p_assignment_id, 'nama_kelompok', g ->> 'nama_kelompok', 'members', g -> 'members', 'created_at', now());
  end loop;
  return result;
end $$;

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------
alter table public.schools enable row level security;
alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.teaching_assignments enable row level security;
alter table public.students enable row level security;
alter table public.student_contacts enable row level security;
alter table public.daily_journals enable row level security;
alter table public.subject_reports enable row level security;
alter table public.homeroom_reports enable row level security;
alter table public.assessments enable row level security;
alter table public.study_groups enable row level security;
alter table public.group_members enable row level security;

-- Drop existing policies if any before re-creating
drop policy if exists schools_select on public.schools;
create policy schools_select on public.schools for select using (id = public.my_school_id());

drop policy if exists teachers_select on public.teachers;
create policy teachers_select on public.teachers for select using (id = auth.uid() or school_id = public.my_school_id());

drop policy if exists teachers_update on public.teachers;
create policy teachers_update on public.teachers for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists classes_select on public.classes;
create policy classes_select on public.classes for select using (school_id = public.my_school_id());

drop policy if exists classes_insert on public.classes;
create policy classes_insert on public.classes for insert with check (school_id = public.my_school_id() and homeroom_teacher_id is null);

drop policy if exists subjects_select on public.subjects;
create policy subjects_select on public.subjects for select using (school_id = public.my_school_id());

drop policy if exists subjects_insert on public.subjects;
create policy subjects_insert on public.subjects for insert with check (school_id = public.my_school_id());

drop policy if exists assignments_select on public.teaching_assignments;
create policy assignments_select on public.teaching_assignments for select
  using (exists (select 1 from public.classes c where c.id = class_id and c.school_id = public.my_school_id()));

drop policy if exists assignments_insert on public.teaching_assignments;
create policy assignments_insert on public.teaching_assignments for insert
  with check (teacher_id = auth.uid() and exists (select 1 from public.classes c where c.id = class_id and c.school_id = public.my_school_id()));

drop policy if exists assignments_update on public.teaching_assignments;
create policy assignments_update on public.teaching_assignments for update
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

drop policy if exists assignments_delete on public.teaching_assignments;
create policy assignments_delete on public.teaching_assignments for delete using (teacher_id = auth.uid());

drop policy if exists students_select on public.students;
create policy students_select on public.students for select using (public.can_view_class(class_id));

drop policy if exists students_insert on public.students;
create policy students_insert on public.students for insert with check (public.is_homeroom(class_id));

drop policy if exists students_update on public.students;
create policy students_update on public.students for update using (public.is_homeroom(class_id)) with check (public.is_homeroom(class_id));

drop policy if exists students_delete on public.students;
create policy students_delete on public.students for delete using (public.is_homeroom(class_id));

drop policy if exists contacts_all on public.student_contacts;
create policy contacts_all on public.student_contacts for all
  using (exists (select 1 from public.students s where s.id = student_id and public.is_homeroom(s.class_id)))
  with check (exists (select 1 from public.students s where s.id = student_id and public.is_homeroom(s.class_id)));

drop policy if exists journals_select on public.daily_journals;
create policy journals_select on public.daily_journals for select
  using (teacher_id = auth.uid() or public.is_homeroom(class_id));

drop policy if exists journals_insert on public.daily_journals;
create policy journals_insert on public.daily_journals for insert
  with check (public.owns_assignment(assignment_id));

drop policy if exists journals_update on public.daily_journals;
create policy journals_update on public.daily_journals for update
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

drop policy if exists journals_delete on public.daily_journals;
create policy journals_delete on public.daily_journals for delete using (teacher_id = auth.uid());

drop policy if exists reports_select on public.subject_reports;
create policy reports_select on public.subject_reports for select
  using (teacher_id = auth.uid() or public.is_homeroom(class_id));

drop policy if exists reports_insert on public.subject_reports;
create policy reports_insert on public.subject_reports for insert
  with check (public.owns_assignment(assignment_id) and status = 'Draft');

drop policy if exists reports_update on public.subject_reports;
create policy reports_update on public.subject_reports for update
  using (teacher_id = auth.uid() and status in ('Draft', 'Revisi'))
  with check (teacher_id = auth.uid() and status in ('Draft', 'Revisi'));

drop policy if exists homeroom_reports_all on public.homeroom_reports;
create policy homeroom_reports_all on public.homeroom_reports for all
  using (public.is_homeroom(class_id)) with check (public.is_homeroom(class_id));

drop policy if exists assessments_select on public.assessments;
create policy assessments_select on public.assessments for select using (public.can_view_class(class_id));

drop policy if exists assessments_write on public.assessments;
create policy assessments_write on public.assessments for insert with check (public.owns_assignment(assignment_id));

drop policy if exists assessments_delete on public.assessments;
create policy assessments_delete on public.assessments for delete using (public.owns_assignment(assignment_id));

drop policy if exists groups_select on public.study_groups;
create policy groups_select on public.study_groups for select
  using (public.owns_assignment(assignment_id)
         or exists (select 1 from public.teaching_assignments a where a.id = assignment_id and public.is_homeroom(a.class_id)));

drop policy if exists group_members_select on public.group_members;
create policy group_members_select on public.group_members for select
  using (exists (select 1 from public.study_groups g where g.id = group_id));

-- ---------------------------------------------------------------------
-- 7. VIEW RINGKASAN
-- ---------------------------------------------------------------------
create or replace view public.v_report_progress with (security_invoker = true) as
select r.class_id, r.subject_id, r.periode,
       count(*) filter (where r.status = 'Draft') as draft,
       count(*) filter (where r.status = 'Diajukan') as diajukan,
       count(*) filter (where r.status = 'Revisi') as revisi,
       count(*) filter (where r.status = 'Disetujui') as disetujui
from public.subject_reports r
group by r.class_id, r.subject_id, r.periode;

-- ---------------------------------------------------------------------
-- 8. FITUR PENILAIAN MAPEL & PENGAJUAN RAPOR KE WALI KELAS
-- ---------------------------------------------------------------------
alter table public.teachers add column if not exists role varchar(20) not null default 'guru';

create table if not exists public.grade_items (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
  periode varchar(50) not null,
  judul varchar(100) not null,
  kategori varchar(40) not null check (kategori in ('Ulangan Harian', 'Tugas Individu', 'Tugas Kelompok', 'Praktikum', 'Proyek', 'Lainnya')),
  bobot smallint not null default 1 check (bobot between 1 and 20),
  deskripsi text not null default '',
  tanggal date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.student_grades (
  id uuid primary key default gen_random_uuid(),
  grade_item_id uuid not null references public.grade_items(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  nilai smallint not null check (nilai between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (grade_item_id, student_id)
);

create table if not exists public.grade_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
  periode varchar(50) not null,
  status varchar(20) not null default 'Draft' check (status in ('Draft', 'Diajukan', 'Disetujui')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  catatan text,
  created_at timestamptz not null default now(),
  unique (assignment_id, periode)
);

create index if not exists idx_grade_items_assignment_periode on public.grade_items(assignment_id, periode);
create index if not exists idx_student_grades_item on public.student_grades(grade_item_id);
create index if not exists idx_student_grades_student on public.student_grades(student_id);
create index if not exists idx_grade_submissions_assignment_periode on public.grade_submissions(assignment_id, periode);

alter table public.grade_items enable row level security;
alter table public.student_grades enable row level security;
alter table public.grade_submissions enable row level security;

drop policy if exists grade_items_select on public.grade_items;
create policy grade_items_select on public.grade_items for select
  using (
    public.owns_assignment(assignment_id)
    or exists (
      select 1 from public.teaching_assignments a
      where a.id = assignment_id and public.is_homeroom(a.class_id)
    )
  );

drop policy if exists grade_items_insert on public.grade_items;
create policy grade_items_insert on public.grade_items for insert
  with check (public.owns_assignment(assignment_id));

drop policy if exists grade_items_update on public.grade_items;
create policy grade_items_update on public.grade_items for update
  using (public.owns_assignment(assignment_id))
  with check (public.owns_assignment(assignment_id));

drop policy if exists grade_items_delete on public.grade_items;
create policy grade_items_delete on public.grade_items for delete
  using (public.owns_assignment(assignment_id));

drop policy if exists student_grades_select on public.student_grades;
create policy student_grades_select on public.student_grades for select
  using (
    exists (
      select 1 from public.grade_items gi
      where gi.id = grade_item_id
        and (
          public.owns_assignment(gi.assignment_id)
          or exists (
            select 1 from public.teaching_assignments a
            where a.id = gi.assignment_id and public.is_homeroom(a.class_id)
          )
        )
    )
  );

drop policy if exists student_grades_insert on public.student_grades;
create policy student_grades_insert on public.student_grades for insert
  with check (
    exists (
      select 1 from public.grade_items gi
      where gi.id = grade_item_id and public.owns_assignment(gi.assignment_id)
    )
  );

drop policy if exists student_grades_update on public.student_grades;
create policy student_grades_update on public.student_grades for update
  using (
    exists (
      select 1 from public.grade_items gi
      where gi.id = grade_item_id and public.owns_assignment(gi.assignment_id)
    )
  )
  with check (
    exists (
      select 1 from public.grade_items gi
      where gi.id = grade_item_id and public.owns_assignment(gi.assignment_id)
    )
  );

drop policy if exists student_grades_delete on public.student_grades;
create policy student_grades_delete on public.student_grades for delete
  using (
    exists (
      select 1 from public.grade_items gi
      where gi.id = grade_item_id and public.owns_assignment(gi.assignment_id)
    )
  );

drop policy if exists grade_submissions_select on public.grade_submissions;
create policy grade_submissions_select on public.grade_submissions for select
  using (
    public.owns_assignment(assignment_id)
    or exists (
      select 1 from public.teaching_assignments a
      where a.id = assignment_id and public.is_homeroom(a.class_id)
    )
  );

drop policy if exists grade_submissions_insert on public.grade_submissions;
create policy grade_submissions_insert on public.grade_submissions for insert
  with check (
    public.owns_assignment(assignment_id)
    or exists (
      select 1 from public.teaching_assignments a
      where a.id = assignment_id and public.is_homeroom(a.class_id)
    )
  );

drop policy if exists grade_submissions_update on public.grade_submissions;
create policy grade_submissions_update on public.grade_submissions for update
  using (
    public.owns_assignment(assignment_id)
    or exists (
      select 1 from public.teaching_assignments a
      where a.id = assignment_id and public.is_homeroom(a.class_id)
    )
  )
  with check (
    public.owns_assignment(assignment_id)
    or exists (
      select 1 from public.teaching_assignments a
      where a.id = assignment_id and public.is_homeroom(a.class_id)
    )
  );
