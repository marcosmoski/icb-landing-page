-- ========================================
-- Church surveys (dynamic forms)
-- Run in the Supabase SQL Editor
-- ========================================
--
-- Architecture:
--   surveys           -> survey definition (title, fields as JSONB, status)
--   survey_responses  -> one row per person who answered, answers as JSONB
--
-- Shape of each item inside `surveys.fields`:
-- {
--   "id": "areas",                  -- stable key used in survey_responses.answers
--   "type": "multiple_choice",      -- text | long_text | email | phone | date |
--                                   -- single_choice | multiple_choice | yes_no
--   "label": "Em quais áreas gostaria de servir?",
--   "description": "Pode indicar mais de uma",
--   "required": true,
--   "options": ["Limpeza", "Cantina"]   -- single_choice / multiple_choice only
-- }

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'open', 'closed')),
  thank_you_message TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT surveys_fields_is_array CHECK (jsonb_typeof(fields) = 'array')
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id BIGSERIAL PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT survey_responses_answers_is_object CHECK (jsonb_typeof(answers) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_slug ON surveys(slug);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id, created_at DESC);

-- Reuses the updated_at helper already used by the other tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_surveys_updated_at ON surveys;
CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS
-- ========================================
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_public_select_open_surveys ON surveys;
DROP POLICY IF EXISTS allow_authenticated_all_surveys ON surveys;
DROP POLICY IF EXISTS allow_public_insert_survey_responses ON survey_responses;
DROP POLICY IF EXISTS allow_authenticated_select_survey_responses ON survey_responses;
DROP POLICY IF EXISTS allow_authenticated_delete_survey_responses ON survey_responses;

-- Visitors only see surveys that are open
CREATE POLICY allow_public_select_open_surveys
ON surveys
FOR SELECT
TO anon, authenticated
USING (status = 'open');

-- Logged-in admin manages everything
CREATE POLICY allow_authenticated_all_surveys
ON surveys
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Only accepts answers while the survey is open
CREATE POLICY allow_public_insert_survey_responses
ON survey_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM surveys s
    WHERE s.id = survey_id AND s.status = 'open'
  )
);

CREATE POLICY allow_authenticated_select_survey_responses
ON survey_responses
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY allow_authenticated_delete_survey_responses
ON survey_responses
FOR DELETE
TO authenticated
USING (true);

COMMENT ON TABLE surveys IS 'Internal church surveys with configurable fields (JSONB)';
COMMENT ON COLUMN surveys.fields IS 'JSON array with the form field definitions';
COMMENT ON COLUMN surveys.status IS 'draft (admin only) | open (accepting answers) | closed';
COMMENT ON TABLE survey_responses IS 'Answers submitted per survey; keys of `answers` = field ids';

-- ========================================
-- Seed: "áreas para servir" survey
-- ========================================
INSERT INTO surveys (slug, title, description, status, thank_you_message, fields)
VALUES (
  'areas-para-servir',
  'Áreas para servir',
  'Queremos saber em quais áreas você gostaria de servir na nossa casa. Leva menos de um minuto para responder.',
  'open',
  'Obrigado por se disponibilizar! Nossa equipe vai entrar em contato em breve.',
  '[
    {
      "id": "nome",
      "type": "text",
      "label": "Nome completo",
      "required": true
    },
    {
      "id": "telefone",
      "type": "phone",
      "label": "Telefone (WhatsApp)",
      "required": true
    },
    {
      "id": "areas",
      "type": "multiple_choice",
      "label": "Em quais áreas gostaria de servir?",
      "description": "Pode indicar mais de uma opção.",
      "required": true,
      "options": ["Limpeza", "Cantina", "Portaria", "Mídia", "Kids"]
    }
  ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
