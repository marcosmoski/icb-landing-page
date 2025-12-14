-- IMPORTANTE: Execute este SQL no Supabase SQL Editor para corrigir o erro 401
-- Este script corrige as políticas RLS para permitir cadastro público

-- 1. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Permitir cadastro público" ON membros_igreja;
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON membros_igreja;
DROP POLICY IF EXISTS "Permitir atualização para autenticados" ON membros_igreja;

-- 2. Criar nova política para INSERT público (permite qualquer pessoa cadastrar)
CREATE POLICY "Enable insert for anon users"
    ON membros_igreja
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 3. Criar política para SELECT (apenas usuários autenticados)
CREATE POLICY "Enable read for authenticated users only"
    ON membros_igreja
    FOR SELECT
    TO authenticated
    USING (true);

-- 4. Criar política para UPDATE (apenas usuários autenticados)
CREATE POLICY "Enable update for authenticated users only"
    ON membros_igreja
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Criar política para DELETE (apenas usuários autenticados)
CREATE POLICY "Enable delete for authenticated users only"
    ON membros_igreja
    FOR DELETE
    TO authenticated
    USING (true);

-- Verificar se RLS está ativo
ALTER TABLE membros_igreja ENABLE ROW LEVEL SECURITY;

-- Comentário
COMMENT ON TABLE membros_igreja IS 'Tabela de cadastro de membros da Igreja ICB Gaia - RLS configurado para permitir INSERT público';
