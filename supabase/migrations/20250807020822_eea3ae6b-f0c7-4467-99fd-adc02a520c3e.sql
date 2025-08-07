-- Fix security warnings by setting search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, slug)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    REPLACE(LOWER(COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)), ' ', '-') || '-' || substr(NEW.id::text, 1, 8)
  );
  
  -- Create initial subscriber record
  INSERT INTO public.subscribers (user_id, email, subscription_tier)
  VALUES (NEW.id, NEW.email, 'free')
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update the subscription limits function with proper search_path
CREATE OR REPLACE FUNCTION public.check_subscription_limits(user_id_param UUID, operation_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  subscription_tier TEXT;
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get subscription tier
  SELECT s.subscription_tier INTO subscription_tier
  FROM public.subscribers s
  WHERE s.user_id = user_id_param;
  
  -- Default to free if no subscription found
  IF subscription_tier IS NULL THEN
    subscription_tier := 'free';
  END IF;
  
  -- Check limits based on operation type
  IF operation_type = 'service' THEN
    SELECT COUNT(*) INTO current_count
    FROM public.services
    WHERE user_id = user_id_param AND is_active = true;
    
    IF subscription_tier = 'free' THEN
      max_allowed := 1;
    ELSE
      max_allowed := 999999; -- Unlimited for premium
    END IF;
    
    RETURN current_count < max_allowed;
    
  ELSIF operation_type = 'appointment' THEN
    SELECT COUNT(*) INTO current_count
    FROM public.appointments
    WHERE provider_id = user_id_param 
    AND DATE_TRUNC('month', appointment_date) = DATE_TRUNC('month', CURRENT_DATE);
    
    IF subscription_tier = 'free' THEN
      max_allowed := 10;
    ELSE
      max_allowed := 999999; -- Unlimited for premium
    END IF;
    
    RETURN current_count < max_allowed;
  END IF;
  
  RETURN true;
END;
$$;