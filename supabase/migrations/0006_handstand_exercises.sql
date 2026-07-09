-- Seed a Handstand progression line. Previously the only handstand-related
-- seed exercise was "Handstand Push-up" (a strength accessory) — there was no
-- skill exercise for the hold itself, needed for the Handstand example plan.

insert into exercises (name, category, skill_group, progression_stage, is_custom, sort_order) values
  ('Wall Handstand Hold', 'skill', 'handstand', 'wall', false, 15),
  ('Chest-to-Wall Handstand Hold', 'skill', 'handstand', 'chest_to_wall', false, 16),
  ('Freestanding Handstand Hold', 'skill', 'handstand', 'freestanding', false, 17);
