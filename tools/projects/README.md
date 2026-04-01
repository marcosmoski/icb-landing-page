# GitHub Projects V2 — Seed Tools

Automação para criar e popular o **Project V2 "Roadmap Sistema Igreja"** no GitHub,
sem depender de ferramentas MCP com escrita em Projects.

## Por que esta pasta existe?

O agente Copilot inspecionou os tools disponíveis do `github-mcp-server` na sessão
e confirmou que **não existe nenhum tool de escrita para GitHub Projects V2**
(nenhum `projects_create`, `projects_write`, `projects_add_item` ou equivalente).

Como alternativa, esta automação utiliza `gh api graphql` + GitHub Actions
(`workflow_dispatch`) para que você execute o seed manualmente ou via CI.

---

## Arquivos

| Arquivo | Descrição |
|---|---|
| `roadmap.seed.json` | Definição do projeto, campos (single-select) e todos os itens do roadmap |
| `seed-project.sh` | Script Bash que chama a API GraphQL do GitHub para criar/reutilizar o projeto e popular os dados |
| `../../.github/workflows/seed-project.yml` | Workflow `workflow_dispatch` que executa o script via Actions |

---

## Pré-requisitos

### Token necessário

Crie um **Personal Access Token (classic)** com os scopes:

- `project` — leitura e escrita em Projects V2
- `read:org` — se o owner for uma organização

> Fine-grained tokens **não suportam** Projects V2 no momento (limitação do GitHub).

Guarde o token como secret no repositório com o nome **`GH_PROJECT_TOKEN`**:

```
Settings → Secrets and variables → Actions → New repository secret
Name: GH_PROJECT_TOKEN
Value: <seu token>
```

### Ferramentas locais (execução manual)

- [gh CLI](https://cli.github.com/) autenticado (`gh auth login`)
- [jq](https://stedolan.github.io/jq/)

---

## Como executar

### Via GitHub Actions (recomendado)

1. Adicione o secret `GH_PROJECT_TOKEN` no repositório (ver acima).
2. Acesse **Actions → Seed GitHub Project V2 — Roadmap Sistema Igreja**.
3. Clique em **Run workflow**.
4. (Opcional) Marque `dry_run = true` para testar sem criar nada.
5. (Opcional) Preencha `owner` se quiser sobrepor a detecção automática.

### Via linha de comando

```bash
# Autentique com um token que tenha scope "project"
export GH_TOKEN=<seu_token>

# Execução normal
bash tools/projects/seed-project.sh

# Dry-run (só loga, não chama API de escrita)
DRY_RUN=true bash tools/projects/seed-project.sh

# Forçar owner diferente
OWNER=minha-org bash tools/projects/seed-project.sh
```

---

## Roadmap inicial

O arquivo `roadmap.seed.json` contém os seguintes itens:

| Título | Módulo | Prioridade | Esforço | Tipo |
|---|---|---|---|---|
| Padronizar tabelas do painel admin | Admin | High | S | Improvement |
| Implementar permissões por role | Auth | High | L | Feature |
| CRUD de produtos da cantina | Cantina | High | M | Feature |
| CRUD de eventos/data da cantina | Cantina | High | M | Feature |
| Fluxo de pedido com comprovante | Cantina | High | L | Feature |
| Tela admin de retirada de pedidos | Cantina | Medium | M | Feature |
| CRUD de categorias de estoque | Estoque | Medium | S | Feature |
| CRUD de itens de estoque | Estoque | Medium | M | Feature |
| Movimentações de estoque | Estoque | Medium | M | Feature |
| Stock mínimo e alertas | Estoque | Medium | S | Feature |
| Cadastro de patrimônio | Patrimônio | Low | M | Feature |
| Abertura de ocorrência de manutenção | Manutenção | Low | M | Feature |
| Escala de limpeza | Limpeza | Low | S | Feature |
| Controlo de chaves | Chaves | Low | S | Feature |
| Evolução de pedidos de oração | Oração | Medium | M | Feature |
| Novo módulo de pedidos de propósito/jejum | Oração | Low | L | Feature |
| Inscrições e presença em eventos | Eventos | Medium | L | Feature |
| Espaço de ideias e feedback | Geral | Low | S | Feature |
| Financeiro como fase futura | Financeiro | Low | XL | Feature |

---

## Campos criados no Project

| Campo | Tipo | Opções |
|---|---|---|
| Roadmap Status | Single Select | Backlog, Planeado, Em Progresso, Concluído, Bloqueado |
| Module | Single Select | Admin, Auth, Cantina, Estoque, Patrimônio, Manutenção, Limpeza, Chaves, Oração, Eventos, Financeiro, Geral |
| Priority | Single Select | Critical, High, Medium, Low |
| Effort | Single Select | XS, S, M, L, XL |
| Type | Single Select | Feature, Improvement, Bug, Chore |

---

## Idempotência

O script é **idempotente**:
- Se o projeto já existir com o mesmo título, ele é **reutilizado** (não duplicado).
- Se um campo já existir, ele é **ignorado** (não recriado).
- Os itens são sempre **adicionados** (não há verificação de duplicatas nos itens — execute apenas uma vez ou use `DRY_RUN=true` para verificar antes).
