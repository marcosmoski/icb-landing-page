# 🌱 Roadmap Seed – GitHub Projects v2

Este diretório contém a automação para semear o **GitHub Project v2** do sistema de gestão da Igreja com o roadmap inicial.

---

## Conteúdo

| Arquivo | Descrição |
|---|---|
| `roadmap.seed.json` | Definição de campos, labels e itens do roadmap |
| `seed-project.sh` | Script bash idempotente que executa o seed via `gh` CLI + GraphQL |
| `README.md` | Este ficheiro |

---

## Pré-requisitos

### Token de acesso

Crie um **Personal Access Token (PAT)** ou use um **Fine-grained token** com os seguintes escopos:

| Escopo | Para que serve |
|---|---|
| `project` (classic PAT) ou `Projects: Read and write` (fine-grained) | Criar/atualizar GitHub Projects v2 |
| `repo` (classic PAT) ou `Contents: Read and write` + `Issues: Read and write` (fine-grained) | Criar labels no repositório _(opcional)_ |

> ⚠️ **Nunca commite o token.** Adicione-o como um **Repository Secret** chamado `PROJECTS_TOKEN` em:  
> `Settings → Secrets and variables → Actions → New repository secret`

### Ferramentas necessárias (execução local)

- [`gh` CLI](https://cli.github.com) ≥ 2.x
- [`jq`](https://stedolan.github.io/jq/) ≥ 1.6

---

## Como executar

### Via GitHub Actions (recomendado)

1. Certifique-se de que o secret `PROJECTS_TOKEN` está configurado no repositório.
2. Acesse **Actions → Seed GitHub Project Roadmap**.
3. Clique em **Run workflow**.
4. Preencha os inputs:
   - **owner** – nome do utilizador ou organização GitHub (ex: `marcosmoski`)
   - **project_title** – título do projeto (padrão: `Roadmap Sistema Igreja`)
   - **repo_full_name** _(opcional)_ – `owner/repo` para criar labels (ex: `marcosmoski/icb-landing-page`)
5. Clique em **Run workflow** e acompanhe os logs.

### Via linha de comando (local)

```bash
export GH_TOKEN="ghp_SeuTokenAqui"

cd tools/projects
chmod +x seed-project.sh

# Sem criação de labels:
./seed-project.sh marcosmoski "Roadmap Sistema Igreja"

# Com criação de labels no repositório:
./seed-project.sh marcosmoski "Roadmap Sistema Igreja" marcosmoski/icb-landing-page
```

---

## O que o script faz

1. **Procura** por um projeto existente com o título especificado (user ou org).
2. **Cria** um novo Project v2 se não existir.
3. **Cria** os campos customizados (single-select) se ainda não existirem:
   - `Roadmap Status` – Backlog · Planejado · Em progresso · Concluído · Pausado
   - `Module` – Admin · Cantina · Estoque · Manutenção · Operação · Pastoral · Eventos · Ideias · Financeiro
   - `Priority` – High · Medium · Low
   - `Effort` – XS · S · M · L · XL
   - `Type` – Feature · Tech Debt · Bug
4. **Adiciona draft issues** a partir do `roadmap.seed.json` (ignorando itens já existentes pelo título).
5. **Define os valores dos campos** para cada item adicionado.
6. _(Opcional)_ **Cria labels** no repositório informado (ignorando labels já existentes).

---

## Itens do roadmap

| # | Título | Módulo | Prioridade | Esforço | Tipo | Status |
|---|---|---|---|---|---|---|
| 1 | Padronizar tabelas do painel admin | Admin | High | M | Tech Debt | Planejado |
| 2 | Implementar permissões por role | Admin | High | L | Feature | Planejado |
| 3 | CRUD de produtos da cantina | Cantina | High | M | Feature | Backlog |
| 4 | CRUD de eventos/data da cantina | Cantina | High | M | Feature | Backlog |
| 5 | Fluxo de pedido com comprovante | Cantina | High | L | Feature | Backlog |
| 6 | Tela admin de retirada de pedidos | Cantina | High | M | Feature | Backlog |
| 7 | CRUD de categorias de estoque | Estoque | Medium | S | Feature | Backlog |
| 8 | CRUD de itens de estoque | Estoque | Medium | M | Feature | Backlog |
| 9 | Movimentações de estoque | Estoque | Medium | M | Feature | Backlog |
| 10 | Stock mínimo e alertas | Estoque | Medium | S | Feature | Backlog |
| 11 | Cadastro de património | Manutenção | Medium | M | Feature | Backlog |
| 12 | Abertura de ocorrência de manutenção | Manutenção | Medium | M | Feature | Backlog |
| 13 | Escala de limpeza | Operação | Medium | M | Feature | Backlog |
| 14 | Controlo de chaves | Operação | Medium | S | Feature | Backlog |
| 15 | Evolução de pedidos de oração | Pastoral | High | M | Feature | Planejado |
| 16 | Novo módulo de pedidos de propósito/jejum | Pastoral | Medium | M | Feature | Backlog |
| 17 | Inscrições e presença em eventos | Eventos | Medium | L | Feature | Backlog |
| 18 | Espaço de ideias e feedback | Ideias | Low | M | Feature | Backlog |
| 19 | Financeiro como fase futura | Financeiro | Low | XL | Feature | Backlog |

---

## Idempotência

O script é seguro para ser executado múltiplas vezes:

- **Projeto** – reutilizado se já existir com o mesmo título.
- **Campos** – criados apenas se ainda não existirem.
- **Itens** – adicionados apenas se não houver um item com o mesmo título.
- **Labels** – criadas apenas se ainda não existirem.

> ⚠️ O script **nunca apaga** projetos, campos, itens ou labels.

---

## Limitações conhecidas

1. **Campos de tipo TEXT/NUMBER** não são criados por esta versão (apenas `SINGLE_SELECT` está implementado).
2. **Itens convertidos a issue** – os itens são adicionados como *draft issues*; para convertê-los em issues reais no repositório, utilize a interface do GitHub Projects.
3. **Paginação** – a busca de projetos e itens existentes está limitada a 100 resultados. Se já existirem mais de 100, itens duplicados podem ser adicionados.
4. **Permissões de organização** – tokens fine-grained precisam ser aprovados pelo owner da organização para aceder a Projects de nível org.
5. **Rate limiting** – em projetos muito grandes, a API do GitHub pode retornar erros de rate limit. Aguarde e reexecute.

---

## Próximos passos recomendados

- [ ] Converter draft issues em issues reais no repositório após a revisão do roadmap.
- [ ] Adicionar campo de **Sprint/Iteration** para planeamento de ciclos.
- [ ] Configurar automações nativas do GitHub Projects (ex: mover para "Em progresso" ao abrir PR).
- [ ] Expandir o `roadmap.seed.json` com mais detalhes de aceitação por item.
- [ ] Considerar um script de atualização para sincronizar o JSON com o estado actual do projeto.
