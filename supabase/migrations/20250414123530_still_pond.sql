/*
  # Add Internal Reference Field

  1. Changes
    - Add internal_reference column to:
      - documents
      - tests
      - materials
      - non_conformities
      - checklists
      - rfis
    
  2. Description
    - Adds a text field for storing internal reference codes
    - Allows linking records to external codes, zones, or structures
    - Enables cross-referencing with Excel sheets and external documents
    - Supports search and filtering by reference
*/

-- Add internal_reference column to all relevant tables
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS internal_reference text;

ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS internal_reference text;

ALTER TABLE materials 
ADD COLUMN IF NOT EXISTS internal_reference text;

ALTER TABLE non_conformities 
ADD COLUMN IF NOT EXISTS internal_reference text;

ALTER TABLE checklists 
ADD COLUMN IF NOT EXISTS internal_reference text;

ALTER TABLE rfis 
ADD COLUMN IF NOT EXISTS internal_reference text;

-- Create indexes for efficient searching
CREATE INDEX IF NOT EXISTS idx_documents_ref ON documents(internal_reference);
CREATE INDEX IF NOT EXISTS idx_tests_ref ON tests(internal_reference);
CREATE INDEX IF NOT EXISTS idx_materials_ref ON materials(internal_reference);
CREATE INDEX IF NOT EXISTS idx_ncs_ref ON non_conformities(internal_reference);
CREATE INDEX IF NOT EXISTS idx_checklists_ref ON checklists(internal_reference);
CREATE INDEX IF NOT EXISTS idx_rfis_ref ON rfis(internal_reference);