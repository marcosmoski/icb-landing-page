#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# seed-project.sh
# Cria (ou reutiliza) o GitHub Project V2 "Roadmap Sistema Igreja" e popula
# os campos e itens definidos em roadmap.seed.json.
#
# Pré-requisitos:
#   - gh CLI autenticado com um token que possua os scopes:
#       project, read:org  (para orgs)
#       project            (para contas pessoais)
#   - jq instalado
#   - Executar a partir da raiz do repositório ou passar OWNER como variável
#
# Uso:
#   OWNER=marcosmoski bash tools/projects/seed-project.sh
#
# Variáveis de ambiente (opcionais):
#   OWNER          - proprietário do repositório (default: detectado via git remote)
#   SEED_FILE      - caminho para o seed JSON (default: tools/projects/roadmap.seed.json)
#   DRY_RUN        - se "true", apenas exibe o que seria criado sem chamar a API
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_FILE="${SEED_FILE:-${SCRIPT_DIR}/roadmap.seed.json}"
DRY_RUN="${DRY_RUN:-false}"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log()  { echo "[seed-project] $*"; }
warn() { echo "[seed-project] WARN: $*" >&2; }
die()  { echo "[seed-project] ERROR: $*" >&2; exit 1; }

gql() {
  # gql <query_or_mutation_string> [variables_json]
  local query="$1"
  local variables="${2:-{}}"
  gh api graphql -f query="$query" -F variables="$variables" 2>&1
}

# ---------------------------------------------------------------------------
# Detect owner
# ---------------------------------------------------------------------------
if [[ -z "${OWNER:-}" ]]; then
  REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
  if [[ "$REMOTE_URL" =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
    OWNER="${BASH_REMATCH[1]}"
  else
    die "Could not detect OWNER from git remote. Set OWNER env var explicitly."
  fi
fi

log "Owner: $OWNER"
log "Seed file: $SEED_FILE"
[[ -f "$SEED_FILE" ]] || die "Seed file not found: $SEED_FILE"

PROJECT_TITLE="$(jq -r '.project.title' "$SEED_FILE")"
PROJECT_DESC="$(jq -r '.project.shortDescription' "$SEED_FILE")"

# ---------------------------------------------------------------------------
# Determine owner type (User vs Organization) and get node ID
# ---------------------------------------------------------------------------
log "Resolving owner node ID..."
OWNER_QUERY='query($login: String!) {
  repositoryOwner(login: $login) {
    id
    __typename
  }
}'
OWNER_RESULT="$(gql "$OWNER_QUERY" "{\"login\":\"$OWNER\"}")"
OWNER_ID="$(echo "$OWNER_RESULT" | jq -r '.data.repositoryOwner.id')"
OWNER_TYPE="$(echo "$OWNER_RESULT" | jq -r '.data.repositoryOwner.__typename')"
[[ "$OWNER_ID" == "null" || -z "$OWNER_ID" ]] && die "Could not resolve owner '$OWNER'. Check auth scopes."
log "Owner type: $OWNER_TYPE, ID: $OWNER_ID"

# ---------------------------------------------------------------------------
# Find or create the project
# ---------------------------------------------------------------------------
find_project() {
  local search_query
  if [[ "$OWNER_TYPE" == "Organization" ]]; then
    search_query='query($login: String!, $title: String!) {
      organization(login: $login) {
        projectsV2(first: 20, query: $title) {
          nodes { id title }
        }
      }
    }'
    gh api graphql -f query="$search_query" \
      -f login="$OWNER" -f title="$PROJECT_TITLE" \
      --jq '.data.organization.projectsV2.nodes[] | select(.title == "'"$PROJECT_TITLE"'") | .id' \
      2>/dev/null | head -1 || true
  else
    search_query='query($login: String!, $title: String!) {
      user(login: $login) {
        projectsV2(first: 20, query: $title) {
          nodes { id title }
        }
      }
    }'
    gh api graphql -f query="$search_query" \
      -f login="$OWNER" -f title="$PROJECT_TITLE" \
      --jq '.data.user.projectsV2.nodes[] | select(.title == "'"$PROJECT_TITLE"'") | .id' \
      2>/dev/null | head -1 || true
  fi
}

log "Searching for existing project '$PROJECT_TITLE'..."
PROJECT_ID="$(find_project)"

if [[ -n "$PROJECT_ID" ]]; then
  log "Reusing existing project: $PROJECT_ID"
else
  if [[ "$DRY_RUN" == "true" ]]; then
    log "[DRY RUN] Would create project '$PROJECT_TITLE' for owner '$OWNER'"
    exit 0
  fi

  log "Creating project '$PROJECT_TITLE'..."
  CREATE_MUTATION='mutation($ownerId: ID!, $title: String!, $desc: String!) {
    createProjectV2(input: { ownerId: $ownerId, title: $title, shortDescription: $desc }) {
      projectV2 { id }
    }
  }'
  CREATE_RESULT="$(gh api graphql \
    -f query="$CREATE_MUTATION" \
    -f ownerId="$OWNER_ID" \
    -f title="$PROJECT_TITLE" \
    -f desc="$PROJECT_DESC")"
  PROJECT_ID="$(echo "$CREATE_RESULT" | jq -r '.data.createProjectV2.projectV2.id')"
  [[ "$PROJECT_ID" == "null" || -z "$PROJECT_ID" ]] && die "Failed to create project. Response: $CREATE_RESULT"
  log "Created project: $PROJECT_ID"
fi

# ---------------------------------------------------------------------------
# Helper: create a single-select field (idempotent)
# ---------------------------------------------------------------------------
declare -A FIELD_IDS   # field name -> field node ID
declare -A FIELD_OPTS  # "fieldId|optionName" -> option ID

list_existing_fields() {
  gh api graphql \
    -f query='query($proj: ID!) {
      node(id: $proj) {
        ... on ProjectV2 {
          fields(first: 50) {
            nodes {
              ... on ProjectV2SingleSelectField {
                id name
                options { id name }
              }
              ... on ProjectV2Field { id name }
            }
          }
        }
      }
    }' \
    -f proj="$PROJECT_ID" \
    --jq '.data.node.fields.nodes'
}

log "Loading existing fields..."
EXISTING_FIELDS_JSON="$(list_existing_fields)"

# Index existing single-select fields and their options
while IFS=$'\t' read -r fid fname; do
  [[ -z "$fid" || "$fid" == "null" ]] && continue
  FIELD_IDS["$fname"]="$fid"
done < <(echo "$EXISTING_FIELDS_JSON" | jq -r '.[] | select(.options != null) | [.id, .name] | @tsv')

while IFS=$'\t' read -r fid fname oid oname; do
  [[ -z "$fid" || "$fid" == "null" ]] && continue
  FIELD_OPTS["${fid}|${oname}"]="$oid"
done < <(echo "$EXISTING_FIELDS_JSON" | jq -r '.[] | select(.options != null) | .id as $fid | .name as $fname | .options[] | [$fid, $fname, .id, .name] | @tsv')

ensure_single_select_field() {
  local field_name="$1"
  local options_json="$2"   # JSON array of {name, color}

  if [[ -n "${FIELD_IDS[$field_name]:-}" ]]; then
    log "  Field '$field_name' already exists: ${FIELD_IDS[$field_name]}"
    return
  fi

  [[ "$DRY_RUN" == "true" ]] && { log "[DRY RUN] Would create field '$field_name'"; return; }

  log "  Creating field '$field_name'..."

  # Build options JSON array for the GraphQL variable (format required by the API)
  local opts_array
  opts_array="$(echo "$options_json" | jq '[.[] | {name: .name, color: .color, description: ""}]')"

  local payload
  payload="$(jq -n \
    --arg proj  "$PROJECT_ID" \
    --arg name  "$field_name" \
    --argjson opts "$opts_array" \
    '{
      query: "mutation($proj: ID!, $name: String!, $opts: [ProjectV2SingleSelectFieldOptionInput!]!) { createProjectV2Field(input: { projectId: $proj dataType: SINGLE_SELECT name: $name singleSelectOptions: $opts }) { projectV2Field { ... on ProjectV2SingleSelectField { id name options { id name } } } } }",
      variables: { proj: $proj, name: $name, opts: $opts }
    }')"

  local result
  result="$(echo "$payload" | gh api graphql --input - 2>&1 || true)"

  local fid
  fid="$(echo "$result" | jq -r '.data.createProjectV2Field.projectV2Field.id // empty')"
  if [[ -z "$fid" || "$fid" == "null" ]]; then
    warn "Field '$field_name' may not have been created. Response: $result"
    return
  fi
  FIELD_IDS["$field_name"]="$fid"
  # Index the new options
  while IFS=$'\t' read -r oid oname; do
    FIELD_OPTS["${fid}|${oname}"]="$oid"
  done < <(echo "$result" | jq -r '.data.createProjectV2Field.projectV2Field.options[]? | [.id, .name] | @tsv')
  log "  Created field '$field_name': $fid"
}

# ---------------------------------------------------------------------------
# Create all custom fields
# ---------------------------------------------------------------------------
log "Ensuring custom fields exist..."
FIELDS_JSON="$(jq -c '.fields[]' "$SEED_FILE")"
while IFS= read -r field_def; do
  fname="$(echo "$field_def" | jq -r '.name')"
  fopts="$(echo "$field_def" | jq -c '.options')"
  ensure_single_select_field "$fname" "$fopts"
done <<< "$FIELDS_JSON"

# ---------------------------------------------------------------------------
# Reload field/option IDs after creation
# ---------------------------------------------------------------------------
log "Reloading field metadata..."
EXISTING_FIELDS_JSON="$(list_existing_fields)"
while IFS=$'\t' read -r fid fname; do
  [[ -z "$fid" || "$fid" == "null" ]] && continue
  FIELD_IDS["$fname"]="$fid"
done < <(echo "$EXISTING_FIELDS_JSON" | jq -r '.[] | select(.options != null) | [.id, .name] | @tsv')
while IFS=$'\t' read -r fid fname oid oname; do
  [[ -z "$fid" || "$fid" == "null" ]] && continue
  FIELD_OPTS["${fid}|${oname}"]="$oid"
done < <(echo "$EXISTING_FIELDS_JSON" | jq -r '.[] | select(.options != null) | .id as $fid | .name as $fname | .options[] | [$fid, $fname, .id, .name] | @tsv')

# ---------------------------------------------------------------------------
# Add items (draft issues) to the project
# ---------------------------------------------------------------------------
add_item() {
  local title="$1"
  local module="$2"
  local priority="$3"
  local effort="$4"
  local type="$5"
  local status="$6"

  [[ "$DRY_RUN" == "true" ]] && { log "[DRY RUN] Would add item: $title"; return; }

  log "  Adding item: $title"

  ADD_DRAFT='mutation($proj: ID!, $title: String!) {
    addProjectV2DraftIssue(input: { projectId: $proj, title: $title }) {
      projectItem { id }
    }
  }'

  local add_result item_id
  add_result="$(gh api graphql \
    -f query="$ADD_DRAFT" \
    -f proj="$PROJECT_ID" \
    -f title="$title")"
  item_id="$(echo "$add_result" | jq -r '.data.addProjectV2DraftIssue.projectItem.id // empty')"

  if [[ -z "$item_id" || "$item_id" == "null" ]]; then
    warn "Could not add item '$title'. Response: $add_result"
    return
  fi

  UPDATE_FIELD='mutation($proj: ID!, $item: ID!, $field: ID!, $value: ProjectV2FieldValue!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $proj
      itemId: $item
      fieldId: $field
      value: $value
    }) { projectV2Item { id } }
  }'

  set_field() {
    local field_name="$1" option_name="$2"
    local fid="${FIELD_IDS[$field_name]:-}"
    [[ -z "$fid" ]] && { warn "Field '$field_name' not found, skipping."; return; }
    local oid="${FIELD_OPTS["${fid}|${option_name}"]:-}"
    [[ -z "$oid" ]] && { warn "Option '$option_name' in field '$field_name' not found, skipping."; return; }

    gh api graphql \
      -f query="$UPDATE_FIELD" \
      -f proj="$PROJECT_ID" \
      -f item="$item_id" \
      -f field="$fid" \
      -F value="{\"singleSelectOptionId\":\"$oid\"}" \
      > /dev/null 2>&1 || warn "Could not set $field_name=$option_name for '$title'"
  }

  set_field "Roadmap Status" "$status"
  set_field "Module"          "$module"
  set_field "Priority"        "$priority"
  set_field "Effort"          "$effort"
  set_field "Type"            "$type"
}

log "Adding roadmap items..."
while IFS= read -r item; do
  ititle="$(echo "$item" | jq -r '.title')"
  imodule="$(echo "$item" | jq -r '.module')"
  ipriority="$(echo "$item" | jq -r '.priority')"
  ieffort="$(echo "$item" | jq -r '.effort')"
  itype="$(echo "$item" | jq -r '.type')"
  istatus="$(echo "$item" | jq -r '.status')"
  add_item "$ititle" "$imodule" "$ipriority" "$ieffort" "$itype" "$istatus"
done < <(jq -c '.items[]' "$SEED_FILE")

log "Done! Project URL: https://github.com/users/$OWNER/projects (or org equivalent)"
log "Project ID: $PROJECT_ID"
