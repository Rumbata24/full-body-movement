-- Populate profiles.display_name from signup metadata.
-- supabase.auth.signUp() is called with options.data.display_name, which
-- Supabase writes to auth.users.raw_user_meta_data before this trigger runs.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');

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
