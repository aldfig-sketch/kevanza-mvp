-- Create test table
CREATE TABLE IF NOT EXISTS test (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data
INSERT INTO test (name) VALUES
  ('KEVANZA MVP Setup Complete'),
  ('Ready for development')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE test ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access (for development)
CREATE POLICY "Allow anonymous read access"
  ON test FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert"
  ON test FOR INSERT
  WITH CHECK (true);
