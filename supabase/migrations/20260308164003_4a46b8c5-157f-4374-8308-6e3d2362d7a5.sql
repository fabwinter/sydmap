
-- Leaderboard RPC: returns top explorers ranked by check-in count
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_period text DEFAULT 'all',
  p_limit integer DEFAULT 20
)
RETURNS TABLE(
  profile_id uuid,
  name text,
  avatar_url text,
  check_in_count bigint,
  rank bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH filtered AS (
    SELECT ci.user_id, COUNT(*) AS cnt
    FROM check_ins ci
    WHERE
      CASE p_period
        WHEN 'week' THEN ci.created_at >= (now() - interval '7 days')
        WHEN 'month' THEN ci.created_at >= (now() - interval '30 days')
        ELSE true
      END
    GROUP BY ci.user_id
  )
  SELECT
    p.id AS profile_id,
    p.name,
    p.avatar_url,
    COALESCE(f.cnt, 0) AS check_in_count,
    ROW_NUMBER() OVER (ORDER BY COALESCE(f.cnt, 0) DESC) AS rank
  FROM profiles p
  INNER JOIN filtered f ON f.user_id = p.id
  ORDER BY check_in_count DESC
  LIMIT p_limit;
$$;
