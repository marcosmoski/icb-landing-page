# Fix para Erro 401 - RLS Policy

## Problema

Ao tentar cadastrar um novo membro, você recebe o erro **401 Unauthorized**. Isso acontece porque as políticas de Row Level Security (RLS) do Supabase estão bloqueando o INSERT público.

## Solução

Execute o SQL abaixo no **Supabase SQL Editor** para corrigir as políticas RLS:

### Passo a Passo

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor** (menu lateral)
3. Clique em "New query"
4. Cole o conteúdo do arquivo [`supabase_fix_rls.sql`](file:///Users/marcosalbertocosmoskifilho/Documents/mvps/icb-landing-page/supabase_fix_rls.sql)
5. Clique em **Run**
6. Aguarde a confirmação "Success"

### O que o script faz

- ✅ Remove as políticas antigas que estavam causando o erro 401
- ✅ Cria nova política permitindo INSERT para usuários anônimos (`anon`)
- ✅ Mantém SELECT/UPDATE/DELETE apenas para usuários autenticados (admin)
- ✅ Garante que o RLS está ativo

## Proteção contra Spam

Para evitar que o formulário seja usado para spam, implementamos **rate limiting** no frontend:

- ⏱️ **Cooldown de 60 segundos** entre cadastros
- 💾 Usa `localStorage` para rastrear o último envio
- 🔔 Mostra contador visual no botão
- ⚠️ Exibe mensagem de aviso se tentar enviar antes do tempo

### Como funciona

1. Usuário preenche e envia o formulário
2. Timestamp é salvo no `localStorage`
3. Botão fica desabilitado por 60 segundos
4. Contador regressivo é exibido: "Aguarde 60s"
5. Após 60 segundos, o botão é reativado

## Testando

Após executar o SQL fix:

1. Acesse http://localhost:5173/cadastro
2. Preencha o formulário
3. Clique em "Cadastrar"
4. Você deve ver a mensagem de sucesso ✅
5. Tente cadastrar novamente - verá o contador de 60s

## Verificar no Supabase

1. Vá em **Table Editor** → **membros_igreja**
2. Você deve ver o novo registro
3. O status deve estar como "pendente"

## Troubleshooting

### Ainda recebo 401

Verifique se:
- O SQL fix foi executado com sucesso
- As variáveis de ambiente no `.env` estão corretas
- Você está usando a `VITE_SUPABASE_ANON_KEY` (não a service_role key)

### O rate limiting não funciona

- Limpe o `localStorage` do navegador
- Ou abra uma aba anônima para testar
- O rate limiting é por navegador/dispositivo

### Quero mudar o tempo de cooldown

Edite o arquivo [`src/components/RegistrationPage.tsx`](file:///Users/marcosalbertocosmoskifilho/Documents/mvps/icb-landing-page/src/components/RegistrationPage.tsx):

```typescript
const waitTime = 60000; // 60 segundos (60000ms)
```

Altere para o valor desejado em milissegundos:
- 30 segundos = 30000
- 2 minutos = 120000
- 5 minutos = 300000
