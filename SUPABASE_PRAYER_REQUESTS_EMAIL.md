# Pedidos de oração: Setup de e-mail no Supabase

Este projeto agora envia notificação por e-mail ao registrar um pedido de oração.

## 1) Rodar migração SQL

No Supabase SQL Editor, execute o arquivo abaixo:

- `supabase_prayer_requests.sql`

## 2) Criar secrets da Edge Function

No terminal com Supabase CLI:

```bash
supabase functions secrets set RESEND_API_KEY=seu_token_resend
supabase functions secrets set CHURCH_NOTIFICATION_EMAIL=igreja@seudominio.com
supabase functions secrets set RESEND_FROM_EMAIL="ICB Gaia <noreply@seudominio.com>"
```

## 3) Deploy da função

```bash
supabase functions deploy notify-prayer-request --no-verify-jwt
```

`--no-verify-jwt` é útil porque o formulário público usa a chave anon.

## 4) Domínio remetente

Se usar Resend em produção, configure um domínio próprio no painel da Resend e troque `RESEND_FROM_EMAIL`.

## 5) Observação importante

A notificação por e-mail é tentativa não bloqueante:

- Se salvar no banco funcionar e e-mail falhar, o pedido continua registrado.
- O erro de e-mail fica no log da função para auditoria.
