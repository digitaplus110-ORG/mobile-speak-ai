-- Create tenants table for multi-tenant businesses
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  business_type TEXT NOT NULL,
  greeting_prompt TEXT NOT NULL DEFAULT 'Hello! Thank you for calling. How can I help you today?',
  working_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "17:00", "enabled": true}, "tuesday": {"start": "09:00", "end": "17:00", "enabled": true}, "wednesday": {"start": "09:00", "end": "17:00", "enabled": true}, "thursday": {"start": "09:00", "end": "17:00", "enabled": true}, "friday": {"start": "09:00", "end": "17:00", "enabled": true}, "saturday": {"start": "10:00", "end": "14:00", "enabled": false}, "sunday": {"start": "10:00", "end": "14:00", "enabled": false}}',
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'owner')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create calls table for call records
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  caller_phone TEXT NOT NULL,
  twilio_call_sid TEXT UNIQUE,
  duration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'incoming' CHECK (status IN ('incoming', 'active', 'completed', 'failed', 'no_answer')),
  intent TEXT CHECK (intent IN ('appointment_booking', 'general_inquiry', 'technical_support', 'billing', 'complaint', 'other')),
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  transcript TEXT,
  recording_url TEXT,
  escalated_to_human BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table for captured lead information
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  email TEXT,
  intent TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create call_transcripts table for real-time transcript storage
CREATE TABLE public.call_transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('caller', 'ai_assistant')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confidence DECIMAL(3,2) DEFAULT 1.0
);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_transcripts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenants
CREATE POLICY "Users can view tenants they belong to" 
ON public.tenants FOR SELECT 
USING (id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Owners can update their tenant" 
ON public.tenants FOR UPDATE 
USING (id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'owner'));

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create RLS policies for calls
CREATE POLICY "Users can view calls for their tenant" 
ON public.calls FOR SELECT 
USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can insert calls" 
ON public.calls FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update calls for their tenant" 
ON public.calls FOR UPDATE 
USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for leads
CREATE POLICY "Users can view leads for their tenant" 
ON public.leads FOR SELECT 
USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert leads for their tenant" 
ON public.leads FOR INSERT 
WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update leads for their tenant" 
ON public.leads FOR UPDATE 
USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for call_transcripts
CREATE POLICY "Users can view transcripts for their tenant calls" 
ON public.call_transcripts FOR SELECT 
USING (call_id IN (SELECT id FROM public.calls WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "System can insert transcripts" 
ON public.call_transcripts FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_calls_tenant_id ON public.calls(tenant_id);
CREATE INDEX idx_calls_created_at ON public.calls(created_at DESC);
CREATE INDEX idx_calls_status ON public.calls(status);
CREATE INDEX idx_leads_tenant_id ON public.leads(tenant_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_call_transcripts_call_id ON public.call_transcripts(call_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON public.calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample tenant data
INSERT INTO public.tenants (name, phone_number, business_type, greeting_prompt) VALUES
('Demo Medical Practice', '+1234567890', 'healthcare', 'Thank you for calling Demo Medical Practice. I''m here to help schedule appointments or answer your questions. How may I assist you today?'),
('Tech Solutions LLC', '+1234567891', 'technology', 'Hello and thank you for calling Tech Solutions LLC. I can help you with technical support, service inquiries, or connect you with our team. What can I do for you?');

-- Enable realtime for live updates
ALTER publication supabase_realtime ADD TABLE public.calls;
ALTER publication supabase_realtime ADD TABLE public.call_transcripts;
ALTER publication supabase_realtime ADD TABLE public.leads;