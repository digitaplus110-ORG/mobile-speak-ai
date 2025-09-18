import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callStatus = formData.get('CallStatus') as string;

    console.log('Incoming call:', { callSid, from, to, callStatus });

    // Find tenant by phone number
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('phone_number', to)
      .single();

    if (tenantError || !tenant) {
      console.error('Tenant not found:', tenantError);
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Sorry, this number is not configured for our service.</Say>
          <Hangup/>
        </Response>`, {
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    // Create call record
    const { data: call, error: callError } = await supabase
      .from('calls')
      .insert({
        tenant_id: tenant.id,
        caller_phone: from,
        twilio_call_sid: callSid,
        status: 'incoming'
      })
      .select()
      .single();

    if (callError) {
      console.error('Error creating call record:', callError);
    }

    // Generate TwiML response with greeting
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">${tenant.greeting_prompt}</Say>
        <Gather action="https://irudsiapgsuqbfaymjbw.functions.supabase.co/twilio-gather" method="POST" timeout="10" speechTimeout="3">
          <Say voice="alice">Please speak after the tone.</Say>
        </Gather>
        <Say voice="alice">I didn't hear anything. Please call back when you're ready to speak.</Say>
        <Hangup/>
      </Response>`;

    return new Response(twimlResponse, {
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error('Error in twilio-webhook:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Sorry, there was an error processing your call.</Say>
        <Hangup/>
      </Response>`, {
      headers: { 'Content-Type': 'text/xml' },
      status: 500
    });
  }
});