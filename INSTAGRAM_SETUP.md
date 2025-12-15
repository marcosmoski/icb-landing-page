# Configuração do Instagram Feed

## Visão Geral

O componente `InstagramFeed` exibe os últimos 5 posts do Instagram da ICB Gaia na home page. Ele usa a **Instagram Basic Display API** para buscar os posts.

## Opções de Implementação

### Opção 1: Instagram Basic Display API (Recomendada)

Esta é a opção implementada no código. Requer configuração inicial mas é gratuita e oficial.

#### Passo a Passo

1. **Criar Facebook App**
   - Acesse https://developers.facebook.com/apps
   - Clique em "Create App"
   - Escolha "Consumer" como tipo de app
   - Preencha os detalhes do app

2. **Adicionar Instagram Basic Display**
   - No painel do app, vá em "Add Product"
   - Selecione "Instagram Basic Display"
   - Clique em "Set Up"

3. **Configurar Instagram Basic Display**
   - Em "Basic Display", clique em "Create New App"
   - Preencha:
     - **Display Name**: ICB Gaia Website
     - **Valid OAuth Redirect URIs**: `https://seu-dominio.com/auth/instagram/callback`
     - **Deauthorize Callback URL**: `https://seu-dominio.com/auth/instagram/deauthorize`
     - **Data Deletion Request URL**: `https://seu-dominio.com/auth/instagram/delete`
   - Clique em "Save Changes"

4. **Adicionar Instagram Tester**
   - Em "Roles" → "Instagram Testers"
   - Clique em "Add Instagram Testers"
   - Digite o username do Instagram da igreja
   - A conta precisa aceitar o convite no Instagram

5. **Gerar Access Token**
   - Em "Basic Display" → "User Token Generator"
   - Clique em "Generate Token" para a conta de teste
   - Copie o **Access Token** gerado

6. **Adicionar Token no .env**
   ```env
   VITE_INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
   ```

7. **Renovar Token (Importante!)**
   - O token expira em 60 dias
   - Para renovar, use este endpoint:
   ```
   https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=SEU_TOKEN
   ```

### Opção 2: Serviços de Terceiros (Mais Fácil)

Se a configuração da API parecer complexa, você pode usar serviços prontos:

#### Juicer.io
- **Prós**: Fácil de configurar, visual bonito
- **Contras**: Plano gratuito limitado
- **Site**: https://www.juicer.io
- **Preço**: Gratuito até 1 feed

#### SnapWidget
- **Prós**: Muito simples, apenas embed
- **Contras**: Marca d'água no plano gratuito
- **Site**: https://snapwidget.com
- **Preço**: Gratuito com limitações

#### Elfsight
- **Prós**: Muitas opções de customização
- **Contras**: Pago
- **Site**: https://elfsight.com/instagram-feed-instashow
- **Preço**: A partir de $5/mês

### Opção 3: Embed Manual (Mais Simples)

Se quiser apenas mostrar o perfil do Instagram sem API:

```tsx
<div className="max-w-7xl mx-auto px-6 pb-16">
  <h2 className="text-3xl font-bold text-white mb-8 text-center">
    Siga-nos no Instagram
  </h2>
  <div className="flex justify-center">
    <iframe
      src="https://www.instagram.com/icbgaia/embed"
      width="400"
      height="480"
      frameBorder="0"
      scrolling="no"
      allowTransparency
    />
  </div>
</div>
```

## Testando

### Com API Configurada

1. Adicione o token no `.env`
2. Reinicie o servidor: `npm run dev`
3. Acesse http://localhost:5173
4. Você deve ver os últimos 5 posts do Instagram

### Sem API (Fallback)

Se o token não estiver configurado, o componente mostra um botão "Seguir @icbgaia" que leva direto para o Instagram.

## Troubleshooting

### "Instagram access token não configurado"

- Verifique se o `.env` tem `VITE_INSTAGRAM_ACCESS_TOKEN`
- Reinicie o servidor após adicionar o token

### "Erro ao buscar posts do Instagram"

- Verifique se o token está válido (não expirou)
- Confirme que a conta Instagram aceitou ser "tester"
- Verifique no console do navegador (F12) para mais detalhes

### Token Expirado

- Tokens expiram em 60 dias
- Use o endpoint de refresh para renovar
- Considere criar um script para renovar automaticamente

## Qual Instagram usar?

No código atual, o link aponta para `@icbgaia`. Se o Instagram da igreja for diferente, atualize em:

1. **InstagramFeed.tsx** - Link "Seguir @icbgaia"
2. **HomePage.tsx** - Links dos pastores (@jaider3614 e @regiane_carvalho79)

## Alternativa Recomendada

Para facilitar, recomendo usar **Juicer.io** (gratuito):

1. Acesse https://www.juicer.io
2. Crie uma conta
3. Conecte o Instagram da igreja
4. Copie o código embed
5. Substitua o componente `InstagramFeed` por:

```tsx
<section className="max-w-7xl mx-auto px-6 pb-16">
  <h2 className="text-3xl font-bold text-white mb-8 text-center">
    📸 Últimas Publicações no Instagram
  </h2>
  <script src="https://assets.juicer.io/embed.js" type="text/javascript"></script>
  <link href="https://assets.juicer.io/embed.css" media="all" rel="stylesheet" type="text/css" />
  <ul className="juicer-feed" data-feed-id="SEU_FEED_ID"></ul>
</section>
```

## Próximos Passos

1. Escolha uma das opções acima
2. Configure conforme as instruções
3. Teste localmente
4. Deploy para produção
5. Configure renovação automática do token (se usar API)
