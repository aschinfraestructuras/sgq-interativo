/*
  # Add relationships between modules

  1. New Tables
    - `relationships`
      - `id` (uuid, primary key)
      - `source_type` (text, not null)
      - `source_id` (uuid, not null)
      - `target_type` (text, not null)
      - `target_id` (uuid, not null)
      - `created_at` (timestamptz, default now())
      - `created_by` (uuid, not null, references auth.users)
      - `project_id` (uuid, not null, references projects)

  2. Security
    - Enable RLS on `relationships` table
    - Add policies for authenticated users to read relationships
    - Add policies for admin and fiscal roles to create/delete relationships

  3. Indexes
    - Add indexes for efficient querying of relationships
*/

CREATE TYPE module_type AS ENUM (
  'document',
  'test',
  'material',
  'nc',
  'checklist',
  'rfi'
);

CREATE TABLE IF NOT EXISTS relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type module_type NOT NULL,
  source_id uuid NOT NULL,
  target_type module_type NOT NULL,
  target_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  project_id uuid NOT NULL REFERENCES projects(id),
  UNIQUE(source_type, source_id, target_type, target_id)
);

-- Enable RLS
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

-- Create indexes for efficient querying
CREATE INDEX idx_relationships_source ON relationships(source_type, source_id);
CREATE INDEX idx_relationships_target ON relationships(target_type, target_id);
CREATE INDEX idx_relationships_project ON relationships(project_id);

-- Policies
CREATE POLICY "Allow read access for all authenticated users"
  ON relationships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow create/delete for admin and fiscal"
  ON relationships
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'fiscal')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'fiscal')
  );

-- Add relationship fields to existing tables
ALTER TABLE documents ADD COLUMN IF NOT EXISTS references jsonb DEFAULT '[]'::jsonb;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS material_id uuid REFERENCES materials(id);
ALTER TABLE non_conformities ADD COLUMN IF NOT EXISTS document_ids uuid[] DEFAULT '{}';
ALTER TABLE non_conformities ADD COLUMN IF NOT EXISTS test_ids uuid[] DEFAULT '{}';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS test_ids uuid[] DEFAULT '{}';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS document_ids uuid[] DEFAULT '{}';