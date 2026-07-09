-- Seed two exercises needed for the reworked Planche Day example plan:
-- negatives (the main skill drill) and protraction dips (a scapular
-- protraction accessory), neither of which existed in the library before.

insert into exercises (name, category, skill_group, progression_stage, is_custom, sort_order) values
  ('Planche Negatives', 'skill', 'planche', 'negative', false, 19),
  ('Protraction Dips', 'strength', null, null, false, 56);
