-- ========================================
-- Migração: telefone opcional em pedidos_oracao
-- Mantém regra de contato obrigatório: telefone OU e-mail
-- Execute no Supabase SQL Editor
-- ========================================

BEGIN;

-- 1) Adiciona coluna de e-mail para contato (opcional)
ALTER TABLE IF EXISTS pedidos_oracao
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 2) Telefone deixa de ser obrigatório
ALTER TABLE IF EXISTS pedidos_oracao
  ALTER COLUMN telefone DROP NOT NULL;

-- 3) Garante que exista ao menos um meio de contato preenchido
ALTER TABLE IF EXISTS pedidos_oracao
  DROP CONSTRAINT IF EXISTS pedidos_oracao_contact_required;

ALTER TABLE IF EXISTS pedidos_oracao
  ADD CONSTRAINT pedidos_oracao_contact_required
  CHECK (
    (telefone IS NOT NULL AND btrim(telefone) <> '')
    OR
    (email IS NOT NULL AND btrim(email) <> '')
  );

-- 4) Índice para facilitar buscas por e-mail no admin
CREATE INDEX IF NOT EXISTS idx_pedidos_oracao_email
  ON pedidos_oracao(email);

COMMENT ON COLUMN pedidos_oracao.email IS 'E-mail de contato opcional para retorno da equipe';
COMMENT ON COLUMN pedidos_oracao.telefone IS 'Telefone de contato opcional quando e-mail for informado';

COMMIT;
