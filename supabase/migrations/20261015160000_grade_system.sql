-- =====================================================================
-- SKEMA SUPABASE POSTGRESQL - PENAGURU
-- Fitur Penilaian Kustom Guru Mapel & Pengajuan Rapor Semester ke Wali Kelas
-- Idempotent: Aman dijalankan berulang kali
-- =====================================================================

-- Pastikan kolom role pada tabel teachers tersedia
alter table public.teachers add column if not exists role varchar(20) not null default 'guru';

-- 1. TABEL: grade_items (Kriteria penilaian kustom per assignment & semester)
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

-- 2. TABEL: student_grades (Nilai angka siswa per kriteria penilaian)
create table if not exists public.student_grades (
  id uuid primary key default gen_random_uuid(),
  grade_item_id uuid not null references public.grade_items(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  nilai smallint not null check (nilai between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (grade_item_id, student_id)
);

-- 3. TABEL: grade_submissions (Status pengajuan nilai semester ke wali kelas)
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

-- 4. INDEKS untuk query performa tinggi
create index if not exists idx_grade_items_assignment_periode on public.grade_items(assignment_id, periode);
create index if not exists idx_student_grades_item on public.student_grades(grade_item_id);
create index if not exists idx_student_grades_student on public.student_grades(student_id);
create index if not exists idx_grade_submissions_assignment_periode on public.grade_submissions(assignment_id, periode);

-- 5. ROW LEVEL SECURITY (RLS)
alter table public.grade_items enable row level security;
alter table public.student_grades enable row level security;
alter table public.grade_submissions enable row level security;

-- Policies: grade_items
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

-- Policies: student_grades
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

-- Policies: grade_submissions
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
