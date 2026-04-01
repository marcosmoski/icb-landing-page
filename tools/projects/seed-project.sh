#!/usr/bin/env bash
# seed-project.sh
# Idempotent seed script for GitHub Projects v2 (Church Management Roadmap).
# Usage: ./seed-project.sh <owner> <project_title> [repo_full_name]
#
# Environment variables:
#   GH_TOKEN  - GitHub token with 'project' scope (and 'repo' scope if creating labels).
#               The workflow sets this from the PROJECTS_TOKEN secret.
#
# The script:
#   1. Creates (or reuses) a GitHub Project v2 for the given owner/org.
#   2. Creates custom single-select fields (idempotent – skips if already present).
#   3. Adds draft issues from roadmap.seed.json (idempotent – skips duplicates by title).
#   4. Sets custom field values for every added item.
#   5. If repo_full_name is provided, creates any missing repository labels.
#
# Requirements: gh CLI (authenticated via GH_TOKEN), jq.

set -euo pipefail

# ─── Arguments ────────────────────────────────────────────────────────────────
OWNER="${1:?Usage: $0 <owner> <project_title> [repo_full_name]}"
PROJECT_TITLE="${2:?Usage: $0 <owner> <project_title> [repo_full_name]}"
REPO_FULL_NAME="${3:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_FILE="${SCRIPT_DIR}/roadmap.seed.json"

# ─── Helpers ──────────────────────────────────────────────────────────────────
log()  { echo "[seed] $*"; }
die()  { echo "[seed] ERROR: $*" >&2; exit 1; }

# Wrapper around gh api graphql.
# Prints GraphQL errors to stderr and returns the raw JSON for the caller to inspect.
gql() {
  local query="$1"
  shift
  local response
  response=$(gh api graphql -f query="$query" "$@")
  local gql_errors
  gql_errors=$(echo "$response" | jq -r '.errors // empty | .[].message' 2>/dev/null || true)
  if [[ -n "$gql_errors" ]]; then
    echo "[seed] GraphQL errors: $gql_errors" >&2
  fi
  echo "$response"
}

# ─── Validate prerequisites ───────────────────────────────────────────────────
command -v gh  >/dev/null 2>&1 || die "'gh' CLI not found. Install it from https://cli.github.com"
command -v jq  >/dev/null 2>&1 || die "'jq' not found. Install it with your package manager."
[[ -f "$SEED_FILE" ]] || die "Seed file not found: $SEED_FILE"

log "Owner:         $OWNER"
log "Project title: $PROJECT_TITLE"
[[ -n "$REPO_FULL_NAME" ]] && log "Repo:          $REPO_FULL_NAME"

# ─── 1. Create or reuse project ───────────────────────────────────────────────
log "Looking for existing project..."

# Try as user first, then as org.
EXISTING=$(gql '
  query($login: String!) {
    user(login: $login) {
      projectsV2(first: 100) {
        nodes { id title }
      }
    }
  }' -f login="$OWNER" 2>/dev/null | jq -r --arg t "$PROJECT_TITLE" \
    '.data.user.projectsV2.nodes[] | select(.title == $t) | .id' || true)

if [[ -z "$EXISTING" ]]; then
  EXISTING=$(gql '
    query($login: String!) {
      organization(login: $login) {
        projectsV2(first: 100) {
          nodes { id title }
        }
      }
    }' -f login="$OWNER" 2>/dev/null | jq -r --arg t "$PROJECT_TITLE" \
      '.data.organization.projectsV2.nodes[] | select(.title == $t) | .id' || true)
fi

if [[ -n "$EXISTING" ]]; then
  PROJECT_ID="$EXISTING"
  log "Reusing existing project: $PROJECT_ID"
else
  log "Creating new project..."
  # Resolve owner node ID (user or org).
  OWNER_ID=$(gql '
    query($login: String!) {
      user(login: $login) { id }
    }' -f login="$OWNER" 2>/dev/null | jq -r '.data.user.id // empty' || true)

  if [[ -z "$OWNER_ID" ]]; then
    OWNER_ID=$(gql '
      query($login: String!) {
        organization(login: $login) { id }
      }' -f login="$OWNER" 2>/dev/null | jq -r '.data.organization.id // empty' || true)
  fi

  [[ -n "$OWNER_ID" ]] || die "Could not resolve owner node ID for '$OWNER'."

  PROJECT_ID=$(gql '
    mutation($ownerId: ID!, $title: String!) {
      createProjectV2(input: { ownerId: $ownerId, title: $title }) {
        projectV2 { id }
      }
    }' -f ownerId="$OWNER_ID" -f title="$PROJECT_TITLE" \
    | jq -r '.data.createProjectV2.projectV2.id')

  log "Created project: $PROJECT_ID"
fi

# ─── 2. Create custom fields (idempotent) ─────────────────────────────────────
log "Fetching existing project fields..."
EXISTING_FIELDS=$(gql '
  query($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        fields(first: 50) {
          nodes {
            ... on ProjectV2Field { id name }
            ... on ProjectV2SingleSelectField { id name options { id name } }
            ... on ProjectV2IterationField { id name }
          }
        }
      }
    }
  }' -f projectId="$PROJECT_ID" | jq '.data.node.fields.nodes')

# Read field definitions from the seed JSON.
FIELDS=$(jq -c '.custom_fields[]' "$SEED_FILE")

declare -A FIELD_IDS   # name -> field node ID
declare -A OPTION_IDS  # "fieldName||optionName" -> option ID

# Populate maps from existing fields.
while IFS= read -r field; do
  fname=$(echo "$field" | jq -r '.name // empty')
  fid=$(echo "$field" | jq -r '.id // empty')
  [[ -n "$fname" && -n "$fid" ]] && FIELD_IDS["$fname"]="$fid"

  # Populate option IDs for single-select fields.
  while IFS= read -r opt; do
    oname=$(echo "$opt" | jq -r '.name')
    oid=$(echo "$opt" | jq -r '.id')
    OPTION_IDS["${fname}||${oname}"]="$oid"
  done < <(echo "$field" | jq -c '.options[]? // empty')
done < <(echo "$EXISTING_FIELDS" | jq -c '.[]')

while IFS= read -r field_def; do
  fname=$(echo "$field_def" | jq -r '.name')
  ftype=$(echo "$field_def" | jq -r '.type')

  if [[ -n "${FIELD_IDS[$fname]:-}" ]]; then
    log "  Field '$fname' already exists – skipping."
  else
    log "  Creating field '$fname' ($ftype)..."

    if [[ "$ftype" == "SINGLE_SELECT" ]]; then
      # Build options array for the mutation.
      OPTIONS_ARG=$(echo "$field_def" | jq -c '[.options[] | {name: ., color: "GRAY", description: ""}]')

      FIELD_RESP=$(gql '
        mutation($projectId: ID!, $name: String!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
          createProjectV2Field(input: {
            projectId: $projectId,
            dataType: SINGLE_SELECT,
            name: $name,
            singleSelectOptions: $options
          }) {
            projectV2Field {
              ... on ProjectV2SingleSelectField { id name options { id name } }
            }
          }
        }' -f projectId="$PROJECT_ID" -f name="$fname" \
           --field "options=$OPTIONS_ARG" \
           --input-stdin 2>/dev/null <<< "" || true)

      fid=$(echo "$FIELD_RESP" | jq -r '.data.createProjectV2Field.projectV2Field.id // empty')
      if [[ -n "$fid" ]]; then
        FIELD_IDS["$fname"]="$fid"
        log "    Created field '$fname': $fid"
        while IFS= read -r opt; do
          oname=$(echo "$opt" | jq -r '.name')
          oid=$(echo "$opt" | jq -r '.id')
          OPTION_IDS["${fname}||${oname}"]="$oid"
        done < <(echo "$FIELD_RESP" | jq -c '.data.createProjectV2Field.projectV2Field.options[]? // empty')
      else
        log "    WARNING: could not create field '$fname'. Response: $(echo "$FIELD_RESP" | jq -c '.errors // .data')"
      fi
    else
      log "    Skipping unsupported field type: $ftype"
    fi
  fi
done <<< "$FIELDS"

# ─── 3. Add draft issues (idempotent by title) ───────────────────────────────
log "Fetching existing project items..."
EXISTING_ITEMS_JSON=$(gql '
  query($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: 100) {
          nodes {
            content {
              ... on DraftIssue { title }
              ... on Issue { title }
              ... on PullRequest { title }
            }
          }
        }
      }
    }
  }' -f projectId="$PROJECT_ID")

# Build an associative array of existing titles for O(1) lookup (handles titles with special chars).
declare -A EXISTING_TITLE_MAP
while IFS= read -r existing_title; do
  [[ -n "$existing_title" ]] && EXISTING_TITLE_MAP["$existing_title"]=1
done < <(echo "$EXISTING_ITEMS_JSON" | jq -r '[.data.node.items.nodes[].content.title | select(. != null)] | .[]' || true)

ITEMS=$(jq -c '.items[]' "$SEED_FILE")

while IFS= read -r item; do
  title=$(echo "$item" | jq -r '.title')
  body=$(echo "$item" | jq -r '.body')
  module=$(echo "$item" | jq -r '.module')
  priority=$(echo "$item" | jq -r '.priority')
  effort=$(echo "$item" | jq -r '.effort')
  itype=$(echo "$item" | jq -r '.type')
  rstatus=$(echo "$item" | jq -r '.roadmap_status')

  if [[ -n "${EXISTING_TITLE_MAP[$title]:-}" ]]; then
    log "  Item '$title' already exists – skipping."
    continue
  fi

  log "  Adding draft issue: '$title'..."
  ITEM_RESP=$(gql '
    mutation($projectId: ID!, $title: String!, $body: String!) {
      addProjectV2DraftIssue(input: {
        projectId: $projectId,
        title: $title,
        body: $body
      }) {
        projectItem { id }
      }
    }' -f projectId="$PROJECT_ID" -f title="$title" -f body="$body")

  ITEM_ID=$(echo "$ITEM_RESP" | jq -r '.data.addProjectV2DraftIssue.projectItem.id // empty')

  if [[ -z "$ITEM_ID" ]]; then
    log "    WARNING: could not add item '$title'. $(echo "$ITEM_RESP" | jq -c '.errors // .data')"
    continue
  fi

  # ── 4. Set custom field values ─────────────────────────────────────────────
  set_single_select() {
    local field_name="$1"
    local option_name="$2"
    local fid="${FIELD_IDS[$field_name]:-}"
    local oid="${OPTION_IDS["${field_name}||${option_name}"]:-}"

    if [[ -z "$fid" || -z "$oid" ]]; then
      log "    WARNING: field '$field_name' or option '$option_name' not found – skipping."
      return
    fi

    gql '
      mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
        updateProjectV2ItemFieldValue(input: {
          projectId: $projectId,
          itemId: $itemId,
          fieldId: $fieldId,
          value: { singleSelectOptionId: $optionId }
        }) {
          projectV2Item { id }
        }
      }' -f projectId="$PROJECT_ID" -f itemId="$ITEM_ID" \
         -f fieldId="$fid" -f optionId="$oid" > /dev/null
  }

  set_single_select "Roadmap Status" "$rstatus"
  set_single_select "Module"         "$module"
  set_single_select "Priority"       "$priority"
  set_single_select "Effort"         "$effort"
  set_single_select "Type"           "$itype"

  log "    Item added and fields set."
done <<< "$ITEMS"

# ─── 5. Create repository labels (idempotent) ────────────────────────────────
if [[ -n "$REPO_FULL_NAME" ]]; then
  log "Creating/verifying repository labels on $REPO_FULL_NAME..."
  EXISTING_LABELS=$(gh label list --repo "$REPO_FULL_NAME" --json name -q '.[].name' 2>/dev/null || true)

  while IFS= read -r label; do
    lname=$(echo "$label" | jq -r '.name')
    lcolor=$(echo "$label" | jq -r '.color')
    ldesc=$(echo "$label" | jq -r '.description')

    if echo "$EXISTING_LABELS" | grep -qxF "$lname"; then
      log "  Label '$lname' already exists – skipping."
    else
      log "  Creating label '$lname'..."
      gh label create "$lname" \
        --color "$lcolor" \
        --description "$ldesc" \
        --repo "$REPO_FULL_NAME" || log "    WARNING: could not create label '$lname'."
    fi
  done < <(jq -c '.labels[]' "$SEED_FILE")
fi

# ─── Done ─────────────────────────────────────────────────────────────────────
log ""
log "✅ Seed completed successfully!"
log "   Project ID: $PROJECT_ID"
log "   View it at: https://github.com/orgs/${OWNER}/projects (org) or https://github.com/users/${OWNER}/projects (user)"
