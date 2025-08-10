-- Allow edge functions to read subscriber data for appointment validation
CREATE POLICY "Edge functions can read subscription data for appointments" 
ON public.subscribers 
FOR SELECT 
USING (true);

-- Update the function to handle subscription checks better
CREATE OR REPLACE FUNCTION public.get_user_plan(user_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  subscription_tier TEXT;
  is_active BOOLEAN;
BEGIN
  -- Get subscription data with expiration check
  SELECT 
    s.subscription_tier,
    CASE 
      WHEN s.subscription_end IS NULL THEN false
      WHEN s.subscription_end < now() THEN false
      ELSE s.subscribed
    END
  INTO subscription_tier, is_active
  FROM public.subscribers s
  WHERE s.user_id = user_id_param;
  
  -- Return appropriate plan
  IF subscription_tier IS NULL OR NOT is_active THEN
    RETURN 'free';
  ELSE
    RETURN subscription_tier;
  END IF;
END;
$$;