# Guia de SEO - ICB Gaia

## ✅ O que foi implementado

### 1. Robots.txt
**Arquivo:** [`/public/robots.txt`](file:///Users/marcosalbertocosmoskifilho/Documents/mvps/icb-landing-page/public/robots.txt)

Permite que todos os motores de busca indexem o site, exceto a página de admin.

```
User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://icbgaia.com/sitemap.xml
```

### 2. Sitemap.xml
**Arquivo:** [`/public/sitemap.xml`](file:///Users/marcosalbertocosmoskifilho/Documents/mvps/icb-landing-page/public/sitemap.xml)

Lista todas as páginas públicas do site para facilitar a indexação:
- Home (prioridade 1.0)
- Dízimos (prioridade 0.8)
- Cadastro (prioridade 0.7)

### 3. Meta Tags SEO
**Arquivo:** [`index.html`](file:///Users/marcosalbertocosmoskifilho/Documents/mvps/icb-landing-page/index.html)

#### Meta Tags Básicas
- ✅ Title otimizado: "ICB Gaia - Igreja Casa da Bênção | Vila Nova de Gaia"
- ✅ Description atrativa com palavras-chave
- ✅ Keywords relevantes
- ✅ Canonical URL
- ✅ Robots: index, follow

#### Open Graph (Facebook/WhatsApp)
- ✅ og:title, og:description, og:image
- ✅ og:type: website
- ✅ og:locale: pt_PT
- ✅ Imagem de preview (logo da igreja)

#### Twitter Cards
- ✅ twitter:card: summary_large_image
- ✅ twitter:title, twitter:description
- ✅ twitter:image

#### Geo Tags (Localização)
- ✅ Região: PT-13 (Porto)
- ✅ Cidade: Vila Nova de Gaia
- ✅ Coordenadas GPS: 41.1239, -8.6118

#### Structured Data (JSON-LD)
- ✅ Schema.org tipo "Church"
- ✅ Nome, endereço, telefone
- ✅ Coordenadas geográficas
- ✅ Horários de funcionamento (cultos)
- ✅ Links para redes sociais

## 📊 Próximos Passos para Melhorar o SEO

### 1. Google Search Console
**Obrigatório para indexação rápida**

1. Acesse https://search.google.com/search-console
2. Adicione a propriedade: `https://icbgaia.com`
3. Verifique a propriedade (via DNS ou arquivo HTML)
4. Envie o sitemap: `https://icbgaia.com/sitemap.xml`
5. Solicite indexação das páginas principais

### 2. Google Business Profile
**Essencial para aparecer no Google Maps**

1. Acesse https://business.google.com
2. Crie perfil para "Igreja Casa da Bênção"
3. Adicione:
   - Endereço: Rua João de Deus, 191, Vila Nova de Gaia
   - Telefone: +351 965 169 925
   - Horários dos cultos
   - Fotos da igreja
   - Link do site
4. Verifique o perfil (por correio ou telefone)

### 3. Bing Webmaster Tools
**Para indexação no Bing**

1. Acesse https://www.bing.com/webmasters
2. Adicione o site
3. Envie o sitemap

### 4. Schema.org - Eventos
**Para aparecer nos eventos do Google**

Adicione eventos para cada culto:
```json
{
  "@type": "Event",
  "name": "Culto de Celebração",
  "startDate": "2025-12-21T19:00",
  "location": {
    "@type": "Place",
    "name": "ICB Gaia",
    "address": "Rua João de Deus, 191, Vila Nova de Gaia"
  }
}
```

### 5. Performance
**Melhorar velocidade de carregamento**

- ✅ Imagens já otimizadas
- ⏳ Considerar lazy loading para Instagram feed
- ⏳ Adicionar cache headers no servidor

### 6. Conteúdo
**Criar mais páginas para SEO**

Sugestões de páginas:
- `/sobre` - História da igreja
- `/pastores` - Biografia dos pastores
- `/eventos` - Calendário de eventos
- `/ministerios` - Ministérios da igreja
- `/blog` - Artigos e mensagens

### 7. Backlinks
**Links de outros sites**

- Registrar em diretórios de igrejas em Portugal
- Parcerias com outras igrejas
- Artigos em blogs cristãos
- Redes sociais (Instagram, Facebook)

## 🔍 Palavras-chave Alvo

### Principais
- ICB Gaia
- Igreja Casa da Bênção
- Igreja evangélica Gaia
- Igreja Vila Nova de Gaia

### Secundárias
- Cultos Gaia
- Igreja Portugal
- Igreja evangélica Porto
- Comunidade cristã Gaia

### Long-tail
- "igreja evangélica em Vila Nova de Gaia"
- "onde encontrar igreja em Gaia"
- "horários de cultos Gaia"
- "igreja acolhedora Porto"

## 📱 Redes Sociais

### Instagram
- ✅ @icbgaia (principal)
- ✅ @jaider3614 (pastor)
- ✅ @regiane_carvalho79 (pastora)

### Facebook
- Criar página da igreja
- Postar regularmente
- Eventos de cultos
- Fotos e vídeos

### YouTube
- Canal da igreja
- Transmissões ao vivo
- Mensagens gravadas
- Testemunhos

## 🎯 Métricas para Acompanhar

### Google Search Console
- Impressões
- Cliques
- CTR (taxa de cliques)
- Posição média
- Palavras-chave que trazem tráfego

### Google Analytics
- Visitantes únicos
- Páginas mais visitadas
- Tempo no site
- Taxa de rejeição
- Origem do tráfego

### Google Business
- Visualizações do perfil
- Cliques no site
- Solicitações de direções
- Chamadas telefônicas

## ✅ Checklist de Lançamento

Antes de fazer o deploy final:

- [x] robots.txt criado
- [x] sitemap.xml criado
- [x] Meta tags SEO adicionadas
- [x] Open Graph configurado
- [x] Structured Data (JSON-LD)
- [ ] Google Search Console configurado
- [ ] Google Business Profile criado
- [ ] Sitemap enviado ao Google
- [ ] Páginas indexadas
- [ ] Google Analytics instalado
- [ ] Favicon configurado (já existe)

## 🚀 Após o Deploy

1. **Enviar sitemap ao Google** (Search Console)
2. **Solicitar indexação** das páginas principais
3. **Criar Google Business Profile**
4. **Compartilhar nas redes sociais**
5. **Monitorar resultados** semanalmente

## 📞 Contato

Se precisar de ajuda com SEO:
- Google Search Console: https://search.google.com/search-console
- Google Business: https://business.google.com
- Schema.org: https://schema.org
