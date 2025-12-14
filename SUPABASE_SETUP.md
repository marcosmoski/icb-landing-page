# Configuração do Supabase - Igreja ICB Gaia

Este guia explica como configurar o Supabase para o sistema de cadastro de membros da igreja.

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login (ou crie uma conta gratuita)
2. Clique em "New Project"
3. Preencha as informações:
   - **Name**: ICB Gaia Landing Page
   - **Database Password**: Escolha uma senha forte (guarde-a!)
   - **Region**: Europe West (London) - mais próximo de Portugal
4. Clique em "Create new project" e aguarde alguns minutos

## 2. Executar o SQL Schema

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase_schema.sql` deste projeto
4. Cole no editor SQL
5. Clique em "Run" para executar o script
6. Você verá a mensagem "Success. No rows returned"

Isso criará:
- ✅ Tabela `membros_igreja` com todos os campos necessários
- ✅ Índices para performance
- ✅ Trigger para atualizar `updated_at` automaticamente
- ✅ Políticas de segurança (RLS) para permitir cadastro público e acesso admin

## 3. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**: algo como `https://xxxxx.supabase.co`
   - **anon public**: a chave pública (anon key)

3. Crie um arquivo `.env` na raiz do projeto (copie do `.env.example`):

```bash
cp .env.example .env
```

4. Edite o arquivo `.env` e adicione suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## 4. Configurar Autenticação (Opcional - Próximo Passo)

### Email/Password

A autenticação por email/senha já está habilitada por padrão no Supabase.

### Google OAuth

1. No painel do Supabase, vá em **Authentication** → **Providers**
2. Encontre "Google" na lista e clique para expandir
3. Ative o toggle "Enable Sign in with Google"
4. Você precisará criar um projeto no Google Cloud Console:
   - Acesse [Google Cloud Console](https://console.cloud.google.com)
   - Crie um novo projeto ou selecione um existente
   - Vá em **APIs & Services** → **Credentials**
   - Clique em "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure o OAuth consent screen se solicitado
   - Tipo de aplicação: "Web application"
   - Adicione a URL de redirecionamento do Supabase (mostrada no painel)
   - Copie o **Client ID** e **Client Secret**
5. Cole as credenciais no painel do Supabase
6. Clique em "Save"

## 5. Testar a Aplicação

1. Instale as dependências (se ainda não fez):
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse `http://localhost:5173` no navegador

4. Teste o cadastro:
   - Vá para `/cadastro`
   - Preencha o formulário
   - Clique em "Cadastrar"
   - Você deve ver uma mensagem de sucesso

5. Verifique no Supabase:
   - Vá em **Table Editor** → **membros_igreja**
   - Você deve ver o registro que acabou de criar

## 6. Painel Administrativo

Para acessar o painel administrativo em `/admin`, você precisará estar autenticado no Supabase.

**Próximos passos para implementar autenticação:**
- [ ] Criar página de login
- [ ] Adicionar botão de login com Google
- [ ] Proteger rota `/admin` para usuários autenticados
- [ ] Adicionar logout

## Estrutura do Banco de Dados

### Tabela: `membros_igreja`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGSERIAL | ID único (auto-incremento) |
| `nome` | TEXT | Nome completo do membro |
| `email` | TEXT | Email (único) |
| `telefone` | TEXT | Telefone de contato |
| `data_nascimento` | DATE | Data de nascimento (opcional) |
| `mensagem` | TEXT | Mensagem do cadastro (opcional) |
| `status` | TEXT | Status: pendente, contatado, confirmado, cancelado |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

## Segurança (RLS - Row Level Security)

O projeto está configurado com as seguintes políticas de segurança:

- ✅ **INSERT público**: Qualquer pessoa pode se cadastrar (formulário público)
- ✅ **SELECT autenticado**: Apenas usuários autenticados podem ver os cadastros
- ✅ **UPDATE autenticado**: Apenas usuários autenticados podem atualizar status

## Troubleshooting

### Erro: "Cannot find module '../lib/supabaseClient'"

Execute `npm install` novamente para garantir que todas as dependências estão instaladas.

### Erro ao inserir dados

Verifique se:
1. O arquivo `.env` está configurado corretamente
2. As credenciais do Supabase estão corretas
3. O SQL schema foi executado com sucesso
4. As políticas RLS estão ativas

### Não consigo ver os dados no painel admin

Você precisa estar autenticado. Implemente a autenticação primeiro ou temporariamente ajuste as políticas RLS para permitir acesso público (não recomendado para produção).

## Próximos Passos

1. ✅ Configurar Supabase
2. ✅ Testar cadastro de membros
3. 🔄 Implementar autenticação (email/senha + Google)
4. 🔄 Proteger rotas administrativas
5. 🔄 Deploy para produção (Vercel/Netlify)
