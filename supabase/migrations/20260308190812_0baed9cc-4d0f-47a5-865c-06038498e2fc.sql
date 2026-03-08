
-- User preferences table for onboarding quiz
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  explore_with text NOT NULL DEFAULT 'solo',
  max_distance integer NOT NULL DEFAULT 5,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT TO authenticated
  USING (user_id = get_profile_id_from_auth());

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_profile_id_from_auth());

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE TO authenticated
  USING (user_id = get_profile_id_from_auth());
