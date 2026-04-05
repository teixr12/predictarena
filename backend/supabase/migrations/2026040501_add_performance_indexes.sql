-- Performance indexes for common query patterns
-- contract_bets: fast lookups by market and by user
CREATE INDEX IF NOT EXISTS contract_bets_contract_created
  ON contract_bets(contract_id, created_time DESC);

CREATE INDEX IF NOT EXISTS contract_bets_user_created
  ON contract_bets(user_id, created_time DESC);

-- contract_comments: fast lookups per market (public only)
CREATE INDEX IF NOT EXISTS contract_comments_contract_created
  ON contract_comments(contract_id, created_time DESC)
  WHERE visibility = 'public';

-- txns: fast category-based lookups (economy queries, leaderboards)
CREATE INDEX IF NOT EXISTS txns_category_created
  ON txns(category, created_time DESC);
