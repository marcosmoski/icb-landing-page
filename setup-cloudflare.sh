#!/bin/bash

# 🚀 Script de Setup Automático - Cloudflare D1 + Pages Functions
# Execute este script para configurar tudo automaticamente

set -e  # Para o script se houver erro

echo "🚀 Iniciando configuração do sistema de cadastro ICB Gaia..."
echo ""

# Verificar se wrangler está instalado
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI não encontrado. Instale com: npm install -g wrangler"
    exit 1
fi

# Verificar se está logado
echo "🔐 Verificando login no Cloudflare..."
if ! wrangler auth status &> /dev/null; then
    echo "❌ Você não está logado no Cloudflare. Execute: wrangler auth login"
    exit 1
fi

echo "✅ Login verificado!"
echo ""

# Criar banco de dados D1
echo "🗄️ Criando banco de dados D1..."
DB_OUTPUT=$(wrangler d1 create icb_cadastros)
DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)

if [ -z "$DB_ID" ]; then
    echo "❌ Erro ao criar banco de dados. Verifique a saída acima."
    exit 1
fi

echo "✅ Banco de dados criado! ID: $DB_ID"
echo ""

# Criar namespace KV
echo "🔑 Criando namespace KV para rate limiting..."
KV_OUTPUT=$(wrangler kv:namespace create "CADASTROS_KV")
KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | head -1 | cut -d'"' -f2)
KV_PREVIEW_ID=$(echo "$KV_OUTPUT" | grep -o 'preview_id = "[^"]*"' | head -1 | cut -d'"' -f2)

if [ -z "$KV_ID" ]; then
    echo "❌ Erro ao criar namespace KV. Verifique a saída acima."
    exit 1
fi

echo "✅ Namespace KV criado! ID: $KV_ID"
echo ""

# Atualizar wrangler.toml
echo "📝 Atualizando configuração wrangler.toml..."

# Backup do arquivo original
cp wrangler.toml wrangler.toml.backup 2>/dev/null || true

# Substituir os IDs
sed -i.tmp "s/database_id = \"your-database-id-here\"/database_id = \"$DB_ID\"/g" wrangler.toml
sed -i.tmp "s/id = \"your-kv-namespace-id-here\"/id = \"$KV_ID\"/g" wrangler.toml
sed -i.tmp "s/preview_id = \"your-kv-preview-id-here\"/preview_id = \"$KV_PREVIEW_ID\"/g" wrangler.toml

# Limpar arquivos temporários
rm -f wrangler.toml.tmp

echo "✅ Configuração atualizada!"
echo ""

# Aplicar schema no banco
echo "🏗️ Aplicando schema do banco de dados..."
wrangler d1 execute icb_cadastros --file=schema.sql --local

echo "✅ Schema aplicado!"
echo ""

# Deploy das functions
echo "🚀 Fazendo deploy das Pages Functions..."
wrangler pages deployment create . --compatibility-date=2024-01-01

echo ""
echo "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Configure seu domínio no Cloudflare Pages"
echo "2. Teste o formulário: https://seu-dominio.pages.dev/cadastro"
echo "3. Configure notificações por email (opcional)"
echo "4. Acesse o painel admin: https://seu-dominio.pages.dev/api/admin/cadastros"
echo ""
echo "🔐 Token admin temporário: admin-token-temporario"
echo "⚠️  ALTERE este token nas variáveis de ambiente do Pages!"
echo ""
echo "📖 Leia o BACKEND_README.md para mais detalhes"
echo ""
echo "❓ Dúvidas? Verifique o troubleshooting no BACKEND_README.md"
