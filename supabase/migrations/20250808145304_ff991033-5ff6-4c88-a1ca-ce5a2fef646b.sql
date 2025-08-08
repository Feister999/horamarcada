-- Create edge function to check subscription status
CREATE OR REPLACE FUNCTION public.get_subscription_status(user_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  subscription_data json;
  is_expired boolean := false;
BEGIN
  -- Get subscription data
  SELECT json_build_object(
    'subscribed', s.subscribed,
    'subscription_tier', s.subscription_tier,
    'subscription_end', s.subscription_end,
    'is_active', CASE 
      WHEN s.subscription_end IS NULL THEN false
      WHEN s.subscription_end < now() THEN false
      ELSE s.subscribed
    END
  ) INTO subscription_data
  FROM public.subscribers s
  WHERE s.user_id = user_id_param;
  
  -- Check if subscription is expired and update it
  SELECT CASE 
    WHEN s.subscription_end IS NOT NULL AND s.subscription_end < now() 
    THEN true 
    ELSE false 
  END INTO is_expired
  FROM public.subscribers s
  WHERE s.user_id = user_id_param;
  
  -- Auto-expire subscription if needed
  IF is_expired THEN
    UPDATE public.subscribers 
    SET 
      subscription_tier = 'free',
      subscribed = false
    WHERE user_id = user_id_param;
    
    -- Return updated data
    SELECT json_build_object(
      'subscribed', false,
      'subscription_tier', 'free',
      'subscription_end', s.subscription_end,
      'is_active', false
    ) INTO subscription_data
    FROM public.subscribers s
    WHERE s.user_id = user_id_param;
  END IF;
  
  RETURN subscription_data;
END;
$function$;