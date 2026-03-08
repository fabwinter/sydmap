
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS personalization_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS cuisines jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS budget text NOT NULL DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS time_of_day jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS accessibility_needs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS vibe jsonb NOT NULL DEFAULT '[]'::jsonb;
