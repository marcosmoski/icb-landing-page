-- Tabela de Whitelist de Admins
-- Apenas emails listados aqui terão acesso aos dados dos membros
CREATE TABLE IF NOT EXISTS admin_whitelist (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na whitelist (ninguém deve ler isso publicamente)
ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

-- Política: Ninguém lê a whitelist publicamente (segurança por obscuridade + RLS)
-- Apenas o servidor/service_role ou o próprio usuário poderia ver (se necessário via func)
-- Por enquanto, bloqueamos tudo para 'anon' e 'authenticated' padrão.
CREATE POLICY "Ninguém lê whitelist publicamente"
    ON admin_whitelist
    FOR ALL
    TO anon, authenticated
    USING (false);

-- Atualizar políticas da tabela de MEMBROS (membros_igreja)

-- 1. Remover políticas antigas se existirem (para evitar conflitos ou duplicatas)
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON membros_igreja;
DROP POLICY IF EXISTS "Permitir atualização para autenticados" ON membros_igreja;
DROP POLICY IF EXISTS "Admin pode ver membros" ON membros_igreja;
DROP POLICY IF EXISTS "Admin pode atualizar membros" ON membros_igreja;

-- 2. Criar nova política de SELECT:
-- Só permite se o email do usuário logado (auth.uid() -> auth.users.email) 
-- existir na tabela admin_whitelist
CREATE POLICY "Admin pode ver membros"
    ON membros_igreja
    FOR SELECT
    TO authenticated
    USING (
        (SELECT COUNT(*) 
         FROM admin_whitelist 
         WHERE admin_whitelist.email = auth.jwt() ->> 'email') > 0
    );

-- 3. Criar nova política de UPDATE:
CREATE POLICY "Admin pode atualizar membros"
    ON membros_igreja
    FOR UPDATE
    TO authenticated
    USING (
        (SELECT COUNT(*) 
         FROM admin_whitelist 
         WHERE admin_whitelist.email = auth.jwt() ->> 'email') > 0
    );

-- 4. Criar política de DELETE (opcional, mas bom ter):
CREATE POLICY "Admin pode deletar membros"
    ON membros_igreja
    FOR DELETE
    TO authenticated
    USING (
        (SELECT COUNT(*) 
         FROM admin_whitelist 
         WHERE admin_whitelist.email = auth.jwt() ->> 'email') > 0
    );

-- Inserir seu email como primeiro admin (Substitua pelo seu email real se diferente)
INSERT INTO admin_whitelist (email) 
VALUES ('marcosmoski@gmail.com') -- Substitua pelo seu email de login
ON CONFLICT (email) DO NOTHING;
