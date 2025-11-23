-- Create calculations table
CREATE TABLE IF NOT EXISTS calculations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  project VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Aktiv', 'Avslutad')),
  amount VARCHAR(50) NOT NULL,
  created DATE NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  revision VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_calculations_status ON calculations(status);

-- Create index on created date
CREATE INDEX IF NOT EXISTS idx_calculations_created ON calculations(created);

