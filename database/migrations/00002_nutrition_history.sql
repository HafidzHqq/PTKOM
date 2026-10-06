CREATE TABLE public.nutrition_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  foods JSONB NOT NULL CHECK (jsonb_typeof(foods) = 'array'),
  calories NUMERIC(10, 2) NOT NULL CHECK (calories >= 0),
  protein_g NUMERIC(10, 2) NOT NULL CHECK (protein_g >= 0),
  fat_g NUMERIC(10, 2) NOT NULL CHECK (fat_g >= 0),
  carbs_g NUMERIC(10, 2) NOT NULL CHECK (carbs_g >= 0),
  fiber_g NUMERIC(10, 2) NOT NULL CHECK (fiber_g >= 0),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX nutrition_history_user_logged_at_idx
  ON public.nutrition_history (user_id, logged_at DESC);

ALTER TABLE public.nutrition_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nutrition history"
  ON public.nutrition_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition history"
  ON public.nutrition_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.nutrition_history TO authenticated;