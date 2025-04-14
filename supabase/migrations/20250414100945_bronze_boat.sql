/*
  # Create projects table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `nome` (text, not null)
      - `localizacao` (text, not null)
      - `cliente` (text, not null)
      - `estado` (text, not null)
      - `dataInicio` (date, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `projects` table
    - Add policies for authenticated users to read all projects
    - Add policies for admin and fiscal roles to create/update projects
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  localizacao text NOT NULL,
  cliente text NOT NULL,
  estado text NOT NULL CHECK (estado IN ('Em Curso', 'Planeada', 'Concluída', 'Suspensa')),
  dataInicio date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow read access for all authenticated users"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow create/update for admin and fiscal"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'fiscal')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'fiscal')
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();