-- Calisthenics Skill Tracker — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

-- ============================================================================
-- Enums
-- ============================================================================

create type intensity_level as enum ('high', 'moderate', 'recovery');
create type feeling_level as enum ('fresh', 'okay', 'tired', 'sore', 'wiped');
create type exercise_category as enum ('skill', 'strength', 'mobility', 'stretch');

-- ============================================================================
-- profiles — one row per auth user, extends auth.users
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  units text not null default 'metric' check (units in ('metric', 'imperial')),
  display_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles for select
  using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert
  with check (auth.uid() = id);

-- ============================================================================
-- weekly_plans — default intensity per day of week (0 = Sunday .. 6 = Saturday)
-- ============================================================================

create table weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  default_intensity intensity_level not null,
  unique (user_id, day_of_week)
);

alter table weekly_plans enable row level security;

create policy "weekly_plans_all_own" on weekly_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- check_ins — daily feeling + intensity decision
-- ============================================================================

create table check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  feeling feeling_level not null,
  planned_intensity intensity_level not null,
  suggested_intensity intensity_level not null,
  chosen_intensity intensity_level not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table check_ins enable row level security;

create policy "check_ins_all_own" on check_ins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- exercises — global seeded library + per-user custom exercises
-- ============================================================================

create table exercises (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade,
  name text not null,
  category exercise_category not null,
  skill_group text,
  progression_stage text,
  is_custom boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table exercises enable row level security;

-- Everyone (any authenticated user) can see global exercises (owner_id is null)
-- plus their own custom exercises.
create policy "exercises_select_global_or_own" on exercises for select
  using (owner_id is null or auth.uid() = owner_id);

create policy "exercises_insert_own" on exercises for insert
  with check (auth.uid() = owner_id);

create policy "exercises_update_own" on exercises for update
  using (auth.uid() = owner_id);

create policy "exercises_delete_own" on exercises for delete
  using (auth.uid() = owner_id);

-- ============================================================================
-- sessions — a logged workout
-- ============================================================================

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  intensity intensity_level not null,
  check_in_id uuid references check_ins (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

alter table sessions enable row level security;

create policy "sessions_all_own" on sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index sessions_user_date_idx on sessions (user_id, date desc);

-- ============================================================================
-- set_logs — individual sets within a session
-- ============================================================================

create table set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete restrict,
  order_index integer not null default 0,
  reps integer,
  duration_seconds integer,
  rpe smallint check (rpe between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  constraint set_logs_reps_or_duration check (reps is not null or duration_seconds is not null)
);

alter table set_logs enable row level security;

-- set_logs has no user_id directly; scope through the parent session.
create policy "set_logs_select_via_session" on set_logs for select
  using (exists (select 1 from sessions s where s.id = set_logs.session_id and s.user_id = auth.uid()));
create policy "set_logs_insert_via_session" on set_logs for insert
  with check (exists (select 1 from sessions s where s.id = set_logs.session_id and s.user_id = auth.uid()));
create policy "set_logs_update_via_session" on set_logs for update
  using (exists (select 1 from sessions s where s.id = set_logs.session_id and s.user_id = auth.uid()));
create policy "set_logs_delete_via_session" on set_logs for delete
  using (exists (select 1 from sessions s where s.id = set_logs.session_id and s.user_id = auth.uid()));

create index set_logs_session_idx on set_logs (session_id, order_index);
create index set_logs_exercise_idx on set_logs (exercise_id);

-- ============================================================================
-- New user bootstrap — profile row + default weekly plan
-- ============================================================================

create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id) values (new.id);

  -- Sensible default week: Mon/Fri high, Wed/Sun recovery, rest moderate.
  insert into weekly_plans (user_id, day_of_week, default_intensity)
  values
    (new.id, 0, 'recovery'), -- Sunday
    (new.id, 1, 'high'),     -- Monday
    (new.id, 2, 'moderate'), -- Tuesday
    (new.id, 3, 'recovery'), -- Wednesday
    (new.id, 4, 'moderate'), -- Thursday
    (new.id, 5, 'high'),     -- Friday
    (new.id, 6, 'moderate'); -- Saturday

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================================
-- Seed data — global exercise library (owner_id null = visible to everyone)
-- ============================================================================

insert into exercises (name, category, skill_group, progression_stage, is_custom, sort_order) values
  ('Maltese', 'skill', 'maltese', 'full', false, 10),

  ('Planche Lean', 'skill', 'planche', 'foundation', false, 20),
  ('Tuck Planche', 'skill', 'planche', 'tuck', false, 21),
  ('Advanced Tuck Planche', 'skill', 'planche', 'advanced_tuck', false, 22),
  ('Straddle Planche', 'skill', 'planche', 'straddle', false, 23),
  ('Full Planche', 'skill', 'planche', 'full', false, 24),

  ('Tuck Front Lever', 'skill', 'front_lever', 'tuck', false, 30),
  ('Advanced Tuck Front Lever', 'skill', 'front_lever', 'advanced_tuck', false, 31),
  ('Single Leg Front Lever', 'skill', 'front_lever', 'single_leg', false, 32),
  ('Straddle Front Lever', 'skill', 'front_lever', 'straddle', false, 33),
  ('Full Front Lever', 'skill', 'front_lever', 'full', false, 34),

  ('Bar Muscle Up', 'skill', 'muscle_up', 'bar', false, 40),
  ('Ring Muscle Up', 'skill', 'muscle_up', 'rings', false, 41),

  ('Pull-up', 'strength', null, null, false, 50),
  ('Dip', 'strength', null, null, false, 51),
  ('Push-up', 'strength', null, null, false, 52),
  ('Handstand Push-up', 'strength', null, null, false, 53),
  ('Pseudo Planche Push-up', 'strength', null, null, false, 54),
  ('Rows', 'strength', null, null, false, 55),

  ('Shoulder Mobility Routine', 'mobility', null, null, false, 60),
  ('Wrist Mobility Routine', 'mobility', null, null, false, 61),
  ('Hamstring Stretch', 'stretch', null, null, false, 70),
  ('Hip Flexor Stretch', 'stretch', null, null, false, 71);
