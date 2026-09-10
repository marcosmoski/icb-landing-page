-- ========================================
-- Church surveys (dynamic forms)
-- Already applied to the project via migrations:
--   create_surveys_and_survey_responses
--   harden_surveys_rls_and_limits
--   surveys_unlisted_link_access
-- This file is the consolidated, runnable state of that schema.
-- ========================================
--
-- Architecture:
--   surveys           -> survey definition (title, fields as JSONB, status)
--   survey_responses  -> one row per person who answered, answers as JSONB
--
-- Access model: a survey is NOT public. It is shared as an unlisted link whose
-- slug carries a random token. `anon` has no SELECT on `surveys` at all — it can
-- only reach one through get_open_survey(slug), so open surveys cannot be listed
-- or enumerated. Reading answers is restricted to admin_whitelist e-mails.
--
-- Shape of each item inside `surveys.fields`:
-- {
--   "id": "campo_a1b2c3d4",          -- stable key used in survey_responses.answers
--   "type": "multiple_choice",       -- text | long_text | email | phone | date |
--                                    -- single_choice | multiple_choice | yes_no
--   "label": "Em quais áreas gostaria de servir?",
--   "description": "Pode indicar mais de uma",
--   "required": true,
--   "options": ["Limpeza", "Cantina"]   -- single_choice / multiple_choice only
-- }

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========================================
-- Tables
-- ========================================

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
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id, created_at DESC);

-- ========================================
-- Limits on the anonymous write path
-- ========================================

-- CHECK constraints cannot contain subqueries, hence this helper.
CREATE OR REPLACE FUNCTION jsonb_key_count(j jsonb)
RETURNS integer
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT count(*)::int FROM jsonb_object_keys(j);
$$;

ALTER TABLE survey_responses
  DROP CONSTRAINT IF EXISTS survey_responses_answers_size,
  DROP CONSTRAINT IF EXISTS survey_responses_answers_keys;

ALTER TABLE survey_responses
  ADD CONSTRAINT survey_responses_answers_size
    CHECK (pg_column_size(answers) <= 8192),
  ADD CONSTRAINT survey_responses_answers_keys
    CHECK (jsonb_key_count(answers) <= 40);

-- Flood brake: at most 60 answers per minute on the same survey.
CREATE OR REPLACE FUNCTION survey_response_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (
    SELECT count(*) FROM survey_responses
    WHERE survey_id = NEW.survey_id
      AND created_at > NOW() - INTERVAL '1 minute'
  ) >= 60 THEN
    RAISE EXCEPTION 'survey_rate_limit'
      USING HINT = 'Muitos envios seguidos nesta pesquisa. Tente novamente em instantes.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_survey_response_rate_limit ON survey_responses;
CREATE TRIGGER trg_survey_response_rate_limit
  BEFORE INSERT ON survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION survey_response_rate_limit();

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
-- Access functions
-- ========================================

-- Only e-mails listed in admin_whitelist count as admin (see supabase_admin.sql).
-- SECURITY DEFINER because admin_whitelist itself is locked down by RLS.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_whitelist w
    WHERE w.email = auth.jwt() ->> 'email'
  );
$$;

REVOKE ALL ON FUNCTION is_admin() FROM public;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- The public's only door into a survey: requires the exact slug, returns at most
-- one row, and never lists anything.
CREATE OR REPLACE FUNCTION get_open_survey(p_slug text)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  description text,
  fields jsonb,
  status text,
  thank_you_message text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.slug, s.title, s.description, s.fields, s.status, s.thank_you_message
  FROM surveys s
  WHERE s.slug = p_slug AND s.status = 'open';
$$;

REVOKE ALL ON FUNCTION get_open_survey(text) FROM public;
GRANT EXECUTE ON FUNCTION get_open_survey(text) TO anon, authenticated;

-- Keeps the INSERT policy independent of any SELECT policy on `surveys`.
CREATE OR REPLACE FUNCTION survey_is_open(p_survey_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM surveys s
    WHERE s.id = p_survey_id AND s.status = 'open'
  );
$$;

REVOKE ALL ON FUNCTION survey_is_open(uuid) FROM public;
GRANT EXECUTE ON FUNCTION survey_is_open(uuid) TO anon, authenticated;

-- ========================================
-- RLS
-- ========================================
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_public_select_open_surveys ON surveys;
DROP POLICY IF EXISTS allow_authenticated_all_surveys ON surveys;
DROP POLICY IF EXISTS allow_admin_all_surveys ON surveys;
DROP POLICY IF EXISTS allow_public_insert_survey_responses ON survey_responses;
DROP POLICY IF EXISTS allow_link_insert_survey_responses ON survey_responses;
DROP POLICY IF EXISTS allow_authenticated_select_survey_responses ON survey_responses;
DROP POLICY IF EXISTS allow_authenticated_delete_survey_responses ON survey_responses;
DROP POLICY IF EXISTS allow_admin_select_survey_responses ON survey_responses;
DROP POLICY IF EXISTS allow_admin_delete_survey_responses ON survey_responses;

-- No SELECT policy for anon on `surveys`: the public reaches a survey only
-- through get_open_survey(slug), so open surveys cannot be enumerated.
CREATE POLICY allow_admin_all_surveys
ON surveys
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Anyone holding the link can answer, but only while the survey is open.
CREATE POLICY allow_link_insert_survey_responses
ON survey_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (survey_is_open(survey_id));

CREATE POLICY allow_admin_select_survey_responses
ON survey_responses
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY allow_admin_delete_survey_responses
ON survey_responses
FOR DELETE
TO authenticated
USING (is_admin());

COMMENT ON TABLE surveys IS 'Internal church surveys with configurable fields (JSONB), shared as unlisted links';
COMMENT ON COLUMN surveys.slug IS 'Unlisted link token; must stay unguessable — see createSurveySlug() in the frontend';
COMMENT ON COLUMN surveys.fields IS 'JSON array with the form field definitions';
COMMENT ON COLUMN surveys.status IS 'draft (admin only) | open (accepting answers) | closed';
COMMENT ON TABLE survey_responses IS 'Answers submitted per survey; keys of `answers` = field ids';
COMMENT ON FUNCTION get_open_survey(text) IS
  'The public''s only door into a survey: requires the exact slug and returns open surveys only.';

-- ========================================
-- Seed: "áreas para servir" survey
-- ========================================
INSERT INTO surveys (slug, title, description, status, thank_you_message, fields)
VALUES (
  'areas-para-servir-' || encode(gen_random_bytes(5), 'hex'),
  'Áreas para servir',
  'Queremos saber em quais áreas você gostaria de servir na nossa casa. Leva menos de um minuto para responder.',
  'open',
  'Obrigado por se disponibilizar! Nossa equipe vai entrar em contato em breve.',
  '[
    {"id": "nome", "type": "text", "label": "Nome completo", "required": true},
    {"id": "telefone", "type": "phone", "label": "Telefone (WhatsApp)", "required": true},
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
