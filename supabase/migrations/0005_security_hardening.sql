-- Security hardening pass.
--
-- update_workout_plan previously relied entirely on RLS to block a caller
-- from modifying another user's plan: the UPDATE would silently affect 0
-- rows (blocked by "user_id = auth.uid()"), but the subsequent DELETE/INSERT
-- into workout_plan_sets would then raise a raw RLS policy-violation error
-- instead of failing cleanly. RLS already made this safe against actually
-- reading/writing another user's data, but this makes the failure explicit
-- and well-formed instead of leaking a Postgres internals error to the client.

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
  if not exists (
    select 1 from workout_plans where id = p_plan_id and user_id = auth.uid()
  ) then
    raise exception 'Plan not found' using errcode = 'PGRST';
  end if;

  update workout_plans set name = p_name where id = p_plan_id;

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
