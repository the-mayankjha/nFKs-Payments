-- Run this in your Supabase SQL Editor

-- 1. Create table for storing payment sessions
CREATE TABLE IF NOT EXISTS payment_sessions (
  checkout_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for fast invoice lookup
CREATE INDEX IF NOT EXISTS idx_payment_sessions_invoice_id 
ON payment_sessions ((data->'invoice'->>'invoice_id'));

-- 3. (Optional) Enable RLS if you want to restrict access
-- ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
-- For this backend-only usage, standard access with API keys is sufficient.
