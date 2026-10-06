ALTER TABLE public.nutrition_history
  ADD COLUMN analysis_result JSONB NOT NULL DEFAULT '{}'::JSONB;