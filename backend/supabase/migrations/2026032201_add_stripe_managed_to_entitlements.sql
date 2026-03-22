-- Add stripe_managed flag to user_entitlements.
-- When true, the credits-based auto-renewal scheduler will skip this row,
-- because the subscription is managed by Stripe directly.
ALTER TABLE user_entitlements
  ADD COLUMN IF NOT EXISTS stripe_managed BOOLEAN NOT NULL DEFAULT false;

-- Index for fast lookup when filtering in process-membership-renewals
CREATE INDEX IF NOT EXISTS user_entitlements_stripe_managed_idx
  ON user_entitlements (stripe_managed)
  WHERE stripe_managed = false;
