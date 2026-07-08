-- Atomic session + set_logs creation, called via supabase.rpc('create_session', ...).
-- security invoker (default) so RLS still applies using the caller's auth.uid().

create or replace function create_session(
  p_date date,
  p_intensity intensity_level,
  p_check_in_id uuid,
  p_notes text,
  p_sets jsonb
) returns uuid
language plpgsql
security invoker
as $$
declare
  v_session_id uuid;
  v_set jsonb;
begin
  insert into sessions (user_id, date, intensity, check_in_id, notes)
  values (auth.uid(), p_date, p_intensity, p_check_in_id, p_notes)
  returning id into v_session_id;

  for v_set in select * from jsonb_array_elements(p_sets)
  loop
    insert into set_logs (session_id, exercise_id, order_index, reps, duration_seconds, rpe, notes)
    values (
      v_session_id,
      (v_set->>'exercise_id')::uuid,
      coalesce((v_set->>'order_index')::int, 0),
      (v_set->>'reps')::int,
      (v_set->>'duration_seconds')::int,
      (v_set->>'rpe')::smallint,
      v_set->>'notes'
    );
  end loop;

  return v_session_id;
end;
$$;
