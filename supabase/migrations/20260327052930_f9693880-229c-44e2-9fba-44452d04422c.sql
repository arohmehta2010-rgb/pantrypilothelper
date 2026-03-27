CREATE TABLE public.saved_workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  plan JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plans"
ON public.saved_workout_plans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
ON public.saved_workout_plans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
ON public.saved_workout_plans
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);