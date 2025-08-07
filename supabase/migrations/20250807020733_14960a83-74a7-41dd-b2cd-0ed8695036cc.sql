-- Create subscribers table for subscription management
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT DEFAULT 'free',
  subscription_end TIMESTAMPTZ,
  appointment_count INTEGER DEFAULT 0,
  service_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services table for professional services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 60, -- in minutes
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update appointments table to include service reference
ALTER TABLE public.appointments 
ADD COLUMN service_id UUID REFERENCES public.services(id);

-- Enable Row Level Security on new tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscribers
CREATE POLICY "Users can view their own subscription info" ON public.subscribers
FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update their own subscription info" ON public.subscribers
FOR UPDATE USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can insert their own subscription info" ON public.subscribers
FOR INSERT WITH CHECK (user_id = auth.uid() OR email = auth.email());

-- RLS policies for services
CREATE POLICY "Users can view their own services" ON public.services
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own services" ON public.services
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own services" ON public.services
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own services" ON public.services
FOR DELETE USING (user_id = auth.uid());

-- Public policy to view services for booking
CREATE POLICY "Anyone can view active services for booking" ON public.services
FOR SELECT USING (is_active = true);

-- Update triggers for timestamps
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION public.check_subscription_limits(user_id_param UUID, operation_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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