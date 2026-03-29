-- ========================================
-- Pedidos de oração - tabela + políticas
-- Execute no Supabase SQL Editor
-- ========================================

CREATE TABLE IF NOT EXISTS pedidos_oracao (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  data_nascimento DATE,
  batizado BOOLEAN NOT NULL DEFAULT false,
  pedido_oracao TEXT NOT NULL,
  visita_tipo TEXT NOT NULL DEFAULT 'sim'
    CHECK (visita_tipo IN ('sim', 'nao', 'visitar_igreja')),
  status TEXT NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo', 'em_atendimento', 'atendido', 'encerrado')),
  CONSTRAINT pedidos_oracao_contact_required
    CHECK (
      (telefone IS NOT NULL AND btrim(telefone) <> '')
      OR
      (email IS NOT NULL AND btrim(email) <> '')
    ),
  email_notificado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_oracao_status ON pedidos_oracao(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_oracao_visita_tipo ON pedidos_oracao(visita_tipo);
CREATE INDEX IF NOT EXISTS idx_pedidos_oracao_created_at ON pedidos_oracao(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_oracao_email ON pedidos_oracao(email);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pedidos_oracao_updated_at ON pedidos_oracao;
CREATE TRIGGER update_pedidos_oracao_updated_at
  BEFORE UPDATE ON pedidos_oracao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE pedidos_oracao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_public_insert_prayer ON pedidos_oracao;
DROP POLICY IF EXISTS allow_authenticated_select_prayer ON pedidos_oracao;
DROP POLICY IF EXISTS allow_authenticated_update_prayer ON pedidos_oracao;
DROP POLICY IF EXISTS allow_authenticated_delete_prayer ON pedidos_oracao;

CREATE POLICY allow_public_insert_prayer
ON pedidos_oracao
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY allow_authenticated_select_prayer
ON pedidos_oracao
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY allow_authenticated_update_prayer
ON pedidos_oracao
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY allow_authenticated_delete_prayer
ON pedidos_oracao
FOR DELETE
TO authenticated
USING (true);

COMMENT ON TABLE pedidos_oracao IS 'Pedidos de oração enviados pelo site ICB Gaia';
COMMENT ON COLUMN pedidos_oracao.visita_tipo IS 'Preferência de visita: sim, nao, visitar_igreja';
COMMENT ON COLUMN pedidos_oracao.status IS 'Status de atendimento: novo, em_atendimento, atendido, encerrado';
COMMENT ON COLUMN pedidos_oracao.email IS 'E-mail de contato opcional para retorno da equipe';
COMMENT ON COLUMN pedidos_oracao.telefone IS 'Telefone de contato opcional quando e-mail for informado';
