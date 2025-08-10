import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AppointmentRequest {
  provider_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseServiceRoleKey 
    });
    
    const supabase = createClient(
      supabaseUrl ?? '',
      supabaseServiceRoleKey ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const appointmentData: AppointmentRequest = await req.json();
    console.log('Validating appointment limit for provider:', appointmentData.provider_id);

    // Get provider's subscription status using the database function
    const { data: planData, error: planError } = await supabase
      .rpc('get_user_plan', { user_id_param: appointmentData.provider_id });

    if (planError) {
      console.error('Error fetching user plan:', planError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to check subscription status',
          details: planError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const currentPlan = planData || 'free';
    console.log('Provider plan:', currentPlan);

    // If professional or premium plan, allow unlimited appointments
    if (currentPlan === 'professional' || currentPlan === 'premium') {
      console.log('Professional plan - unlimited appointments allowed');
      
      // Create the appointment
      const { data: appointmentResult, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          provider_id: appointmentData.provider_id,
          client_name: appointmentData.client_name,
          client_email: appointmentData.client_email,
          client_phone: appointmentData.client_phone,
          appointment_date: appointmentData.appointment_date,
          start_time: appointmentData.start_time,
          end_time: appointmentData.end_time,
          notes: appointmentData.notes,
          status: 'confirmed'
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to create appointment',
            details: appointmentError.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          appointment: appointmentResult,
          message: 'Appointment created successfully'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // For free plan, check monthly limit
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const { data: monthlyAppointments, error: countError } = await supabase
      .from('appointments')
      .select('id')
      .eq('provider_id', appointmentData.provider_id)
      .gte('appointment_date', `${currentMonth}-01`)
      .lt('appointment_date', `${currentMonth}-32`);

    if (countError) {
      console.error('Error counting appointments:', countError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to check appointment limit',
          details: countError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const appointmentCount = monthlyAppointments?.length || 0;
    console.log('Current month appointments:', appointmentCount);

    if (appointmentCount >= 10) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Monthly appointment limit reached', 
          limit: 10,
          current: appointmentCount,
          message: 'O limite de 10 agendamentos mensais foi atingido. Considere upgradar para o plano Profissional.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create the appointment for free plan
    const { data: appointmentResult, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        provider_id: appointmentData.provider_id,
        client_name: appointmentData.client_name,
        client_email: appointmentData.client_email,
        client_phone: appointmentData.client_phone,
        appointment_date: appointmentData.appointment_date,
        start_time: appointmentData.start_time,
        end_time: appointmentData.end_time,
        notes: appointmentData.notes,
        status: 'confirmed'
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to create appointment',
          details: appointmentError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        appointment: appointmentResult,
        message: 'Appointment created successfully',
        remainingAppointments: 10 - (appointmentCount + 1)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});