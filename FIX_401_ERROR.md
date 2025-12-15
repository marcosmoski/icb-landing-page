# 🔧 Como Corrigir o Erro 401 - Passo a Passo

## O Problema

Você está recebendo erro **401 Unauthorized** ao tentar cadastrar porque as políticas RLS (Row Level Security) do Supabase estão bloqueando o INSERT público.

## Solução Rápida (3 minutos)

### 1. Abra o Supabase SQL Editor

1. Acesse seu projeto no Supabase: https://supabase.com
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New query**

### 2. Execute o Script de Correção

1. Abra o arquivo [`supabase_fix_rls.sql`](file:///Users/marcosalbertocosmoskifilho/Documents/mvps/icb-landing-page/supabase_fix_rls.sql)
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
5. Aguarde a mensagem **"Success. No rows returned"**

### 3. Teste o Cadastro

1. Volte para http://localhost:5173/cadastro
2. Preencha o formulário
3. Clique em "Cadastrar"
4. ✅ Deve funcionar agora!

## O que o Script Faz

O script faz 7 passos:

1. ✅ Desabilita RLS temporariamente
2. ✅ Remove TODAS as políticas antigas (que estavam causando o erro)
3. ✅ Reabilita RLS
4. ✅ Cria política para **INSERT público** (permite cadastro sem login)
5. ✅ Cria política para **SELECT autenticado** (apenas admin vê os dados)
6. ✅ Cria política para **UPDATE autenticado** (apenas admin edita)
7. ✅ Cria política para **DELETE autenticado** (apenas admin deleta)

## Verificar se Funcionou

Após executar o script, você pode verificar as políticas criadas:

1. No Supabase SQL Editor, execute:

```sql
SELECT * FROM pg_policies WHERE tablename = 'membros_igreja';
```

2. Você deve ver **4 políticas**:
   - `allow_public_insert` - Permite cadastro público
   - `allow_authenticated_select` - Apenas admin vê dados
   - `allow_authenticated_update` - Apenas admin edita
   - `allow_authenticated_delete` - Apenas admin deleta

## Ainda não Funciona?

### Verifique o `.env`

Certifique-se de que o arquivo `.env` tem as credenciais corretas:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**IMPORTANTE:** Use a **anon key**, NÃO a service_role key!

### Como encontrar as credenciais

1. No Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### Reinicie o servidor

Após alterar o `.env`:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

## Testando no Console do Navegador

Você pode testar se a conexão com Supabase está funcionando:

1. Abra o console do navegador (F12)
2. Cole este código:

```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurada ✅' : 'Não configurada ❌');
```

3. Você deve ver a URL e "Configurada ✅"

## Precisa de Ajuda?

Se ainda não funcionar, me envie:
- O erro exato que aparece no console do navegador (F12)
- Screenshot do erro
- Confirmação de que executou o script SQL
