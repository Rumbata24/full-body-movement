-- Seed two exercises needed for the reworked Front Lever Day example plan:
-- negatives (the main skill drill) and front lever pulls (a straight-arm
-- pulling accessory), neither of which existed in the library before.
-- Mirrors 0007_planche_negatives_protraction_dips.sql for the planche line.

insert into exercises (name, category, skill_group, progression_stage, is_custom, sort_order) values
  ('Front Lever Negatives', 'skill', 'front_lever', 'negative', false, 29),
  ('Front Lever Pulls', 'skill', 'front_lever', 'pulls', false, 35);
