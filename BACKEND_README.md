# 🚀 Sistema Profissional de Cadastro - Cloudflare D1 + Pages Functions

Este documento explica como configurar uma solução **profissional e gratuita** usando apenas serviços do Cloudflare.

## ✨ O que você ganha:

- ✅ **Banco de dados SQL real** (D1 - gratuito)
- ✅ **API profissional** com validação robusta
- ✅ **Rate limiting** anti-spam
- ✅ **Logs de auditoria** completos
- ✅ **Painel de administração** web
- ✅ **Notificações por email** automáticas
- ✅ **Escalabilidade** ilimitada
- ✅ **Custo: ZERO** (até limites generosos)

## 📋 Pré-requisitos

1. Conta no [Cloudflare](https://cloudflare.com)
2. Projeto já configurado no Cloudflare Pages
3. Wrangler CLI instalado: `npm install -g wrangler`

## 🛠️ Configuração Passo a Passo

### 1. **Instalar Wrangler CLI**
```bash
npm install -g wrangler
```

### 2. **Login no Cloudflare**
```bash
wrangler auth login
```

### 3. **Criar Banco de Dados D1**
```bash
# Criar o banco de dados
wrangler d1 create icb_cadastros

# Copie o database_id que aparecer e cole no wrangler.toml
```

### 4. **Criar Namespace KV (para rate limiting)**
```bash
# Criar namespace KV
wrangler kv:namespace create "CADASTROS_KV"

# Copie os IDs que aparecerem e cole no wrangler.toml
```

### 5. **Executar Schema do Banco**
```bash
# Aplicar o schema no banco de dados
wrangler d1 execute icb_cadastros --file=schema.sql
```

### 6. **Configurar Email (Opcional)**
Para receber notificações por email, você pode:

**Opção A: Cloudflare Email Routing (Gratuito)**
- Configure seu domínio no painel Cloudflare
- Adicione uma regra de encaminhamento

**Opção B: Zapier Webhook (Fácil)**
- Crie um webhook no Zapier
- Configure para enviar emails
- Adicione `EMAIL_WEBHOOK_URL` nas variáveis de ambiente

### 7. **Deploy das Functions**
```bash
# Deploy das Pages Functions
wrangler pages deployment create . --compatibility-date=2024-01-01
```

## 🎛️ Painel de Administração

Acesse: `https://seu-dominio.pages.dev/api/admin/cadastros`

**Como usar:**
```bash
# Listar cadastros (primeira página)
curl -H "Authorization: Bearer admin-token-temporario" \
     https://seu-dominio.pages.dev/api/admin/cadastros

# Filtrar por status
curl -H "Authorization: Bearer admin-token-temporario" \
     "https://seu-dominio.pages.dev/api/admin/cadastros?status=pendente"

# Atualizar status de cadastro
curl -X PUT \
     -H "Authorization: Bearer admin-token-temporario" \
     -H "Content-Type: application/json" \
     -d '{"status": "contatado", "observacoes": "Contato realizado por telefone"}' \
     https://seu-dominio.pages.dev/api/admin/cadastros/123
```

## 🔧 Configurações Avançadas

### **Variáveis de Ambiente**
No painel Cloudflare Pages, adicione:

```
ADMIN_TOKEN=seu-token-seguro-aqui
EMAIL_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
```

### **Rate Limiting Personalizado**
Edite em `functions/api/cadastro.js`:
```javascript
const RATE_LIMIT_SECONDS = 30; // Altere para o tempo desejado
```

### **Validações Personalizadas**
Edite em `functions/utils/validation.js` para ajustar regras de validação.

## 📊 Recursos Disponíveis

### **Tabelas do Banco:**
- `cadastros` - Dados principais dos cadastros
- `cadastro_logs` - Histórico de ações
- `configuracoes` - Configurações do sistema

### **APIs Disponíveis:**
- `POST /api/cadastro` - Criar cadastro
- `GET /api/admin/cadastros` - Listar cadastros (admin)
- `PUT /api/admin/cadastros/:id` - Atualizar cadastro (admin)

## 💰 Custos

| Serviço | Gratuito até | Custo depois |
|---------|--------------|--------------|
| Cloudflare Pages | Sempre | Sempre gratuito |
| Cloudflare D1 | 500k leituras/dia | $0.001 por 100k leituras extras |
| Cloudflare KV | 100k leituras/dia | Similar ao D1 |
| Email Routing | 1k emails/mês | $0.50 por 1k emails extras |

**Resultado:** Para uma igreja pequena, **sempre gratuito**.

## 🚨 Segurança

- ✅ Dados criptografados em trânsito e repouso
- ✅ Rate limiting anti-abuso
- ✅ Validação robusta de entrada
- ✅ Sanitização de dados
- ✅ Logs de auditoria completos
- ✅ Autenticação para painel admin

## 🔄 Backup e Recuperação

```bash
# Backup do banco de dados
wrangler d1 export icb_cadastros --output=backup.sql

# Restaurar backup
wrangler d1 execute icb_cadastros --file=backup.sql
```

## 🎯 Próximos Passos

1. ✅ Siga o guia de configuração acima
2. ✅ Teste o formulário
3. ✅ Configure notificações por email
4. ✅ Personalize o painel de administração
5. ✅ Configure backup automático

## 🆘 Troubleshooting

### **Erro: "Database not found"**
- Verifique se o database_id está correto no `wrangler.toml`
- Execute: `wrangler d1 list`

### **Erro: "Unauthorized" no admin**
- Verifique se o `ADMIN_TOKEN` está configurado
- Use o token correto no header Authorization

### **Formulário não funciona**
- Verifique se as Pages Functions foram deployadas
- Execute: `wrangler tail` para ver logs

---

**🎉 Pronto!** Você agora tem uma solução profissional, escalável e gratuita para gerenciar cadastros da igreja.

Precisa de ajuda com algum passo? Posso orientar na configuração!
