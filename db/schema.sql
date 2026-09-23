-- ─────────────────────────────────────────────────────────────────────────────
-- SPtLDV.belajar — Skema Database (PostgreSQL / Neon)
-- Salin SELURUH isi file ini ke Neon Dashboard → SQL Editor → Run.
-- Aman dijalankan berulang kali (idempotent, semua CREATE ... IF NOT EXISTS).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists teachers (
  id serial primary key,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id serial primary key,
  teacher_id integer not null references teachers(id) on delete cascade,
  class_code text not null,
  class_name text not null,
  is_locked boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists classes_code_uq on classes(class_code);
create index if not exists classes_teacher_idx on classes(teacher_id);

create table if not exists students (
  id serial primary key,
  name text not null,
  password_hash text not null,
  class_id integer not null references classes(id) on delete cascade,
  current_subbab integer not null default 1,
  completed_subbabs jsonb not null default '[]'::jsonb,
  streak_correct integer not null default 0,
  consecutive_errors integer not null default 0,
  status text not null default 'AKTIF',
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists students_class_name_uq on students(class_id, name);
create index if not exists students_class_idx on students(class_id);

create table if not exists sessions (
  token text primary key,
  teacher_id integer references teachers(id) on delete cascade,
  student_id integer references students(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists sessions_student_idx on sessions(student_id);
create index if not exists sessions_teacher_idx on sessions(teacher_id);

create table if not exists activity_logs (
  id serial primary key,
  student_id integer not null references students(id) on delete cascade,
  subbab integer not null,
  template_id text not null,
  is_correct boolean not null,
  error_detail text,
  hint_level integer not null default 0,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists logs_student_idx on activity_logs(student_id);
create index if not exists logs_subbab_idx on activity_logs(subbab);

create table if not exists tutor_sessions (
  id serial primary key,
  class_id integer not null references classes(id) on delete cascade,
  requester_id integer not null references students(id) on delete cascade,
  tutor_id integer references students(id) on delete cascade,
  subbab integer not null,
  status text not null default 'REQUESTED',
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
create index if not exists tutor_sessions_class_idx on tutor_sessions(class_id);
create index if not exists tutor_sessions_tutor_idx on tutor_sessions(tutor_id);
create index if not exists tutor_sessions_requester_idx on tutor_sessions(requester_id);

create table if not exists teacher_calls (
  id serial primary key,
  class_id integer not null references classes(id) on delete cascade,
  tutor_id integer not null references students(id) on delete cascade,
  message text not null default '',
  status text not null default 'OPEN',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists teacher_calls_class_idx on teacher_calls(class_id);

create table if not exists summative_assessments (
  id serial primary key,
  student_id integer not null references students(id) on delete cascade,
  soal_1_answer jsonb not null,
  soal_2_answer jsonb not null,
  score_details jsonb not null,
  total_score integer not null,
  submitted_at timestamptz not null default now()
);
create unique index if not exists summative_student_uq on summative_assessments(student_id);
