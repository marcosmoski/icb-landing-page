-- Schema para Supabase - Tabela de Membros da Igreja ICB Gaia
-- Execute este SQL no Supabase SQL Editor

-- Criar tabela de membros da igreja
CREATE TABLE IF NOT EXISTS membros_igreja (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    data_nascimento DATE,
    mensagem TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'contatado', 'confirmado', 'cancelado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_membros_email ON membros_igreja(email);
CREATE INDEX IF NOT EXISTS idx_membros_status ON membros_igreja(status);
CREATE INDEX IF NOT EXISTS idx_membros_created_at ON membros_igreja(created_at);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_membros_igreja_updated_at 
    BEFORE UPDATE ON membros_igreja 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Configurar Row Level Security (RLS)
ALTER TABLE membros_igreja ENABLE ROW LEVEL SECURITY;

-- Política: Permitir INSERT público (para o formulário de cadastro)
CREATE POLICY "Permitir cadastro público" 
    ON membros_igreja 
    FOR INSERT 
    TO anon 
    WITH CHECK (true);

-- Política: Permitir SELECT apenas para usuários autenticados (admin)
CREATE POLICY "Permitir leitura para autenticados" 
    ON membros_igreja 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Política: Permitir UPDATE apenas para usuários autenticados (admin)
CREATE POLICY "Permitir atualização para autenticados" 
    ON membros_igreja 
    FOR UPDATE 
    TO authenticated 
    USING (true);

-- Comentários para documentação
COMMENT ON TABLE membros_igreja IS 'Tabela de cadastro de membros da Igreja ICB Gaia';
COMMENT ON COLUMN membros_igreja.status IS 'Status do cadastro: pendente, contatado, confirmado, cancelado';
