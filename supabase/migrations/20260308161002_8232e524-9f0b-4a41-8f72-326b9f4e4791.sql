
-- User streaks table
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_check_in_date date,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Users can view own streak
CREATE POLICY "Users can view own streak"
  ON public.user_streaks FOR SELECT
  TO authenticated
  USING (user_id = get_profile_id_from_auth());

-- Function to update streak on check-in
CREATE OR REPLACE FUNCTION public.update_streak_on_checkin()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_profile_id uuid;
  v_last_date date;
  v_current integer;
  v_longest integer;
  v_today date := CURRENT_DATE;
BEGIN
  v_profile_id := NEW.user_id;

  SELECT last_check_in_date, current_streak, longest_streak
    INTO v_last_date, v_current, v_longest
    FROM user_streaks WHERE user_id = v_profile_id;

  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_check_in_date)
    VALUES (v_profile_id, 1, 1, v_today);
    RETURN NEW;
  END IF;

  -- Already checked in today
  IF v_last_date = v_today THEN
    RETURN NEW;
  END IF;

  -- Consecutive day
  IF v_last_date = v_today - 1 THEN
    v_current := v_current + 1;
  ELSE
    v_current := 1;
  END IF;

  IF v_current > v_longest THEN
    v_longest := v_current;
  END IF;

  UPDATE user_streaks
    SET current_streak = v_current, longest_streak = v_longest,
        last_check_in_date = v_today, updated_at = now()
    WHERE user_id = v_profile_id;

  RETURN NEW;
END;
$$;

-- Trigger on check_ins insert
CREATE TRIGGER trg_update_streak
  AFTER INSERT ON public.check_ins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_streak_on_checkin();
