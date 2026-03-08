
-- Badge auto-awarding function
CREATE OR REPLACE FUNCTION public.award_badges_on_checkin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_total_checkins integer;
  v_category text;
  v_category_count integer;
  v_hour integer;
  v_night_count integer;
BEGIN
  v_user_id := NEW.user_id;

  -- Total check-ins
  SELECT COUNT(*) INTO v_total_checkins FROM check_ins WHERE user_id = v_user_id;

  -- Explorer badge: 20+ total check-ins
  IF v_total_checkins >= 20 THEN
    INSERT INTO user_badges (user_id, badge_name, description)
    VALUES (v_user_id, 'Explorer', 'Checked in to 20+ places')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Get category of checked-in activity
  SELECT category INTO v_category FROM activities WHERE id = NEW.activity_id;

  -- Category-specific counts
  SELECT COUNT(*) INTO v_category_count
  FROM check_ins ci JOIN activities a ON ci.activity_id = a.id
  WHERE ci.user_id = v_user_id AND a.category = v_category;

  -- Foodie badge: 10+ restaurant check-ins
  IF v_category = 'Restaurant' AND v_category_count >= 10 THEN
    INSERT INTO user_badges (user_id, badge_name, description)
    VALUES (v_user_id, 'Foodie', 'Checked in to 10+ restaurants')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Cafe Connoisseur: 10+ cafe check-ins
  IF v_category = 'Cafe' AND v_category_count >= 10 THEN
    INSERT INTO user_badges (user_id, badge_name, description)
    VALUES (v_user_id, 'Cafe Connoisseur', 'Checked in to 10+ cafes')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Beach Lover: 5+ beach check-ins
  IF v_category = 'Beach' AND v_category_count >= 5 THEN
    INSERT INTO user_badges (user_id, badge_name, description)
    VALUES (v_user_id, 'Beach Lover', 'Checked in to 5+ beaches')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Night Owl: 5+ check-ins after 8pm
  SELECT COUNT(*) INTO v_night_count
  FROM check_ins
  WHERE user_id = v_user_id AND EXTRACT(HOUR FROM created_at) >= 20;

  IF v_night_count >= 5 THEN
    INSERT INTO user_badges (user_id, badge_name, description)
    VALUES (v_user_id, 'Night Owl', 'Checked in 5+ times after 8pm')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Add unique constraint for badge deduplication
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_badge_unique UNIQUE (user_id, badge_name);

-- Create trigger
CREATE TRIGGER trigger_award_badges
AFTER INSERT ON check_ins
FOR EACH ROW
EXECUTE FUNCTION award_badges_on_checkin();

-- Also allow the system to insert badges (via trigger which runs as SECURITY DEFINER owner)
-- The trigger function is SECURITY DEFINER so it can insert into user_badges
