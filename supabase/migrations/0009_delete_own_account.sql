-- Self-service account deletion.
--
-- All user-scoped tables (profiles, weekly_plans, check_ins, exercises,
-- sessions, workout_plans) reference auth.users(id) on delete cascade, and
-- their child tables (set_logs, workout_plan_sets) cascade from those in
-- turn — so deleting the auth.users row cleans up every table in one shot.
--
-- Deleting from auth.users requires elevated privilege the caller's own
-- role doesn't have, so this is security definer (runs as the function
-- owner, e.g. postgres, which does have that privilege in Supabase). It
-- takes no parameters and only ever acts on auth.uid() — the currently
-- authenticated caller — so it can never be used to delete another user.

create or replace function delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;
