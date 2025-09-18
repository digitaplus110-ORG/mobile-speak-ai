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
    const speechResult = formData.get('SpeechResult') as string;

    console.log('Speech received:', { callSid, speechResult });

    // Find the call record
    const { data: call, error: callError } = await supabase
      .from('calls')
      .select('*, tenants(*)')
      .eq('twilio_call_sid', callSid)
      .single();

    if (callError || !call) {
      console.error('Call not found:', callError);
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Sorry, there was an error processing your request.</Say>
          <Hangup/>
        </Response>`, {
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    // Update call status
    await supabase
      .from('calls')
      .update({ status: 'active' })
      .eq('id', call.id);

    // Add transcript entry
    await supabase
      .from('call_transcripts')
      .insert({
        call_id: call.id,
        speaker: 'caller',
        message: speechResult
      });

    // Process with AI (simplified for MVP)
    const aiResponse = await processWithAI(speechResult, call.tenants);
    
    // Add AI response to transcript
    await supabase
      .from('call_transcripts')
      .insert({
        call_id: call.id,
        speaker: 'ai_assistant',
        message: aiResponse.message
      });

    // Update call with intent and confidence
    await supabase
      .from('calls')
      .update({
        intent: aiResponse.intent,
        confidence_score: aiResponse.confidence
      })
      .eq('id', call.id);

    // Create lead if applicable
    if (aiResponse.intent === 'appointment_booking' || aiResponse.intent === 'general_inquiry') {
      await supabase
        .from('leads')
        .insert({
          call_id: call.id,
          tenant_id: call.tenant_id,
          phone: call.caller_phone,
          intent: aiResponse.intent,
          notes: speechResult
        });
    }

    // Generate TwiML response
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">${aiResponse.message}</Say>
        ${aiResponse.needsMoreInfo ? `
          <Gather action="https://irudsiapgsuqbfaymjbw.functions.supabase.co/twilio-gather" method="POST" timeout="10" speechTimeout="3">
            <Say voice="alice">Please continue speaking.</Say>
          </Gather>
        ` : `
          <Say voice="alice">Thank you for calling. Have a great day!</Say>
          <Hangup/>
        `}
      </Response>`;

    return new Response(twimlResponse, {
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error('Error in twilio-gather:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Sorry, there was an error processing your request.</Say>
        <Hangup/>
      </Response>`, {
      headers: { 'Content-Type': 'text/xml' },
      status: 500
    });
  }
});

// Simplified AI processing for MVP
async function processWithAI(userMessage: string, tenant: any) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Simple intent detection
  let intent = 'other';
  let confidence = 0.5;
  let message = "I understand. How else can I help you today?";
  let needsMoreInfo = false;

  if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
    intent = 'appointment_booking';
    confidence = 0.9;
    message = "I'd be happy to help you schedule an appointment. What day works best for you?";
    needsMoreInfo = true;
  } else if (lowerMessage.includes('question') || lowerMessage.includes('information')) {
    intent = 'general_inquiry';
    confidence = 0.8;
    message = "I can help answer your questions. What would you like to know?";
    needsMoreInfo = true;
  } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
    intent = 'technical_support';
    confidence = 0.8;
    message = "I'm sorry to hear you're having an issue. Let me connect you with our support team.";
    needsMoreInfo = false;
  }

  return { intent, confidence, message, needsMoreInfo };
}