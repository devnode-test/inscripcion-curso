-- App settings table to control registration availability
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registrations_open BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed a single row if none exists
INSERT INTO app_settings (registrations_open)
SELECT TRUE
WHERE NOT EXISTS (SELECT 1 FROM app_settings);

-- Enable RLS and allow public read
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to app_settings" ON app_settings
  FOR SELECT USING (true);
