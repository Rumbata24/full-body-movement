-- Reusable workout plan templates — designed ahead of training, loaded into
-- the log flow as a pre-filled, fully editable starting point.

create table workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table workout_plans enable row level security;

create policy "workout_plans_all_own" on workout_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index workout_plans_user_idx on workout_plans (user_id, created_at desc);

-- ============================================================================

create table workout_plan_sets (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references workout_plans (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete restrict,
  order_index integer not null default 0,
  reps integer,
  duration_seconds integer,
  constraint workout_plan_sets_reps_or_duration check (reps is not null or duration_seconds is not null)
);

alter table workout_plan_sets enable row level security;

-- workout_plan_sets has no user_id directly; scope through the parent plan.
create policy "workout_plan_sets_select_via_plan" on workout_plan_sets for select
  using (exists (select 1 from workout_plans p where p.id = workout_plan_sets.plan_id and p.user_id = auth.uid()));
create policy "workout_plan_sets_insert_via_plan" on workout_plan_sets for insert
  with check (exists (select 1 from workout_plans p where p.id = workout_plan_sets.plan_id and p.user_id = auth.uid()));
create policy "workout_plan_sets_update_via_plan" on workout_plan_sets for update
  using (exists (select 1 from workout_plans p where p.id = workout_plan_sets.plan_id and p.user_id = auth.uid()));
create policy "workout_plan_sets_delete_via_plan" on workout_plan_sets for delete
  using (exists (select 1 from workout_plans p where p.id = workout_plan_sets.plan_id and p.user_id = auth.uid()));

create index workout_plan_sets_plan_idx on workout_plan_sets (plan_id, order_index);

-- ============================================================================
-- create_workout_plan — atomic plan + plan_sets creation.
-- ============================================================================

create or replace function create_workout_plan(
  p_name text,
  p_sets jsonb
) returns uuid
language plpgsql
security invoker
as $$
declare
  v_plan_id uuid;
  v_set jsonb;
begin
  insert into workout_plans (user_id, name)
  values (auth.uid(), p_name)
  returning id into v_plan_id;

  for v_set in select * from jsonb_array_elements(p_sets)
  loop
    insert into workout_plan_sets (plan_id, exercise_id, order_index, reps, duration_seconds)
    values (
      v_plan_id,
      (v_set->>'exercise_id')::uuid,
      coalesce((v_set->>'order_index')::int, 0),
      (v_set->>'reps')::int,
      (v_set->>'duration_seconds')::int
    );
  end loop;

  return v_plan_id;
end;
$$;

-- ============================================================================
-- update_workout_plan — replaces name + full set of plan_sets atomically.
-- ============================================================================

create or replace function update_workout_plan(
  p_plan_id uuid,
  p_name text,
  p_sets jsonb
) returns void
language plpgsql
security invoker
as $$
declare
  v_set jsonb;
begin
  update workout_plans set name = p_name where id = p_plan_id and user_id = auth.uid();

  delete from workout_plan_sets where plan_id = p_plan_id;

  for v_set in select * from jsonb_array_elements(p_sets)
  loop
    insert into workout_plan_sets (plan_id, exercise_id, order_index, reps, duration_seconds)
    values (
      p_plan_id,
      (v_set->>'exercise_id')::uuid,
      coalesce((v_set->>'order_index')::int, 0),
      (v_set->>'reps')::int,
      (v_set->>'duration_seconds')::int
    );
  end loop;
end;
$$;
