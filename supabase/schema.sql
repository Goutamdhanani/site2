-- =========================================================================
-- oddwebs CRM — Database Schema (Supabase / PostgreSQL)
-- =========================================================================

-- Create custom enum types
CREATE TYPE lead_status AS ENUM (
  'New',
  'Contacted',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
  'Archived'
);

CREATE TYPE lead_priority AS ENUM (
  'Low',
  'Medium',
  'High',
  'Critical'
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id TEXT UNIQUE NOT NULL,
  
  -- Status & Priority
  status lead_status DEFAULT 'New' NOT NULL,
  priority lead_priority DEFAULT 'Medium' NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Client Information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  description TEXT,
  
  -- Services & Booking
  services TEXT[] DEFAULT '{}',
  meeting_date TEXT,
  meeting_time TEXT,
  meeting_timezone TEXT,
  
  -- Budget & Timeline
  budget TEXT,
  timeline TEXT,
  
  -- Source & Attribution
  source TEXT DEFAULT 'direct',
  landing_page TEXT,
  referral_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Scoring
  lead_score INTEGER DEFAULT 0,
  spam_score INTEGER DEFAULT 0,
  
  -- Device & Environment
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  device_type TEXT DEFAULT 'desktop',
  screen_size TEXT,
  viewport_size TEXT,
  language TEXT,
  
  -- Location
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  
  -- Identity & Session
  session_id TEXT,
  visitor_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Internal CRM Fields
  assigned_to TEXT DEFAULT 'Unassigned',
  internal_notes JSONB DEFAULT '[]'::jsonb,
  booking_history JSONB DEFAULT '[]'::jsonb,
  
  -- Network & Preferences
  network_type TEXT,
  dark_mode BOOLEAN DEFAULT false,
  touch_device BOOLEAN DEFAULT false,
  connection_speed TEXT,
  
  -- Form Metrics
  form_completion_time TEXT,
  scroll_percentage TEXT,
  time_on_page TEXT,
  visit_number TEXT DEFAULT '1',
  returning_visitor BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_country ON leads(country);
CREATE INDEX idx_leads_name ON leads(name);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Only service_role can access (API routes use service_role key)
CREATE POLICY "Service role full access" ON leads
  FOR ALL
  USING (true)
  WITH CHECK (true);
