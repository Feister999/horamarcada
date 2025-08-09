-- Criar política para permitir visualização pública das configurações de disponibilidade
-- Isso é necessário para que a página de agendamento público funcione
CREATE POLICY "Anyone can view availability settings for booking" 
ON public.availability_settings 
FOR SELECT 
USING (true);

-- Garantir que perfis sejam sempre visíveis publicamente (já existe mas vamos confirmar)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);