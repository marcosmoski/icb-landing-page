-- ========================================
-- FIX DEFINITIVO PARA ERRO 401 - RLS POLICY
-- ========================================
-- Execute este SQL no Supabase SQL Editor
-- Isso vai permitir que qualquer pessoa se cadastre (INSERT público)
-- mas apenas usuários autenticados podem ver/editar os dados

-- PASSO 1: Desabilitar RLS temporariamente para limpar tudo
ALTER TABLE membros_igreja DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Permitir cadastro público" ON membros_igreja;
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON membros_igreja;
DROP POLICY IF EXISTS "Permitir atualização para autenticados" ON membros_igreja;
DROP POLICY IF EXISTS "Enable insert for anon users" ON membros_igreja;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON membros_igreja;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON membros_igreja;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON membros_igreja;

-- PASSO 3: Reabilitar RLS
ALTER TABLE membros_igreja ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar política SIMPLES para INSERT público
-- Esta política permite que QUALQUER PESSOA (anon ou authenticated) faça INSERT
CREATE POLICY "allow_public_insert"
ON membros_igreja
FOR INSERT
TO public
WITH CHECK (true);

-- PASSO 5: Criar política para SELECT (apenas autenticados)
CREATE POLICY "allow_authenticated_select"
ON membros_igreja
FOR SELECT
TO authenticated
USING (true);

-- PASSO 6: Criar política para UPDATE (apenas autenticados)
CREATE POLICY "allow_authenticated_update"
ON membros_igreja
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- PASSO 7: Criar política para DELETE (apenas autenticados)
CREATE POLICY "allow_authenticated_delete"
ON membros_igreja
FOR DELETE
TO authenticated
USING (true);

-- ========================================
-- VERIFICAÇÃO
-- ========================================
-- Execute este SELECT para verificar as políticas criadas:
-- SELECT * FROM pg_policies WHERE tablename = 'membros_igreja';

-- Você deve ver 4 políticas:
-- 1. allow_public_insert (INSERT para public)
-- 2. allow_authenticated_select (SELECT para authenticated)
-- 3. allow_authenticated_update (UPDATE para authenticated)
-- 4. allow_authenticated_delete (DELETE para authenticated)
