-- Seed demo topic groups for PREDICTA Arena launch
-- These groups are referenced by the demo market seeder script (scripts/seed-demo-markets.mjs)
-- Run once against production Supabase before seeding markets.

INSERT INTO groups (id, slug, name, privacy_status, creator_id, total_members, importance_score, about)
VALUES
  (
    'c1a2b3d4-0001-0000-0000-000000000001',
    'politics',
    'Politics',
    'public',
    'Q1p1thjviqU9Fd5yzT0mlgR2Jr53',
    0,
    90,
    '"Politics"'
  ),
  (
    'c1a2b3d4-0002-0000-0000-000000000002',
    'technology',
    'Technology',
    'public',
    'Q1p1thjviqU9Fd5yzT0mlgR2Jr53',
    0,
    85,
    '"Technology"'
  ),
  (
    'c1a2b3d4-0003-0000-0000-000000000003',
    'sports',
    'Sports',
    'public',
    'Q1p1thjviqU9Fd5yzT0mlgR2Jr53',
    0,
    88,
    '"Sports"'
  ),
  (
    'c1a2b3d4-0004-0000-0000-000000000004',
    'economics',
    'Economics',
    'public',
    'Q1p1thjviqU9Fd5yzT0mlgR2Jr53',
    0,
    80,
    '"Economics"'
  ),
  (
    'c1a2b3d4-0005-0000-0000-000000000005',
    'world',
    'World Events',
    'public',
    'Q1p1thjviqU9Fd5yzT0mlgR2Jr53',
    0,
    82,
    '"World Events"'
  )
ON CONFLICT (id) DO NOTHING;
