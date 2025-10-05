-- Schema para o banco de dados D1 da Igreja ICB Gaia
-- Cloudflare D1 é gratuito e integrado diretamente no Pages

-- Tabela de cadastros
CREATE TABLE IF NOT EXISTS cadastros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT NOT NULL,
    data_nascimento DATE,
    mensagem TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'contatado', 'confirmado', 'cancelado')),
    fonte TEXT DEFAULT 'website',
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    contato_realizado_em DATETIME,
    observacoes TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cadastros_email ON cadastros(email);
CREATE INDEX IF NOT EXISTS idx_cadastros_status ON cadastros(status);
CREATE INDEX IF NOT EXISTS idx_cadastros_created_at ON cadastros(created_at);

-- Tabela para log de ações (auditoria)
CREATE TABLE IF NOT EXISTS cadastro_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cadastro_id INTEGER,
    acao TEXT NOT NULL, -- 'criado', 'contatado', 'confirmado', 'cancelado'
    detalhes TEXT,
    realizado_por TEXT DEFAULT 'sistema',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cadastro_id) REFERENCES cadastros(id) ON DELETE CASCADE
);

-- Tabela para configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT,
    descricao TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT OR IGNORE INTO configuracoes (chave, valor, descricao) VALUES
('notificacao_email', 'seu@email.com', 'Email para receber notificações de novos cadastros'),
('auto_resposta', 'true', 'Enviar email automático de confirmação'),
('contato_obrigatorio_dias', '7', 'Dias para primeiro contato');

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_cadastros_updated_at
    AFTER UPDATE ON cadastros
BEGIN
    UPDATE cadastros SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
