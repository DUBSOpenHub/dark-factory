#!/usr/bin/env bash
# tests/check-gpb.sh — Open validation script for Copilot Skill Builder
# Usage: bash tests/check-gpb.sh [--jargon-only]
#
# Checks:
#   1. YAML parsing for config.yml and catalog.yml
#   2. Catalog agent references exist on disk
#   3. Required Copilot Skill Builder files exist
#   4. Prompt line counts (internal golden-path prompt files must be ≤200 lines each)
#   5. Required config keys are present under golden_path:
#   6. Jargon scan (banned terms must not appear in user-visible Copilot Skill Builder strings)
# Exits 0 on all-pass, non-zero on any failure.

set -euo pipefail

PASS=0
FAIL=0
JARGON_ONLY=false

if [[ "${1:-}" == "--jargon-only" ]]; then
  JARGON_ONLY=true
fi

# ── Helpers ──────────────────────────────────────────────────────────────────

ok()   { echo "  ✅  $*"; ((PASS++)) || true; }
fail() { echo "  ❌  $*"; ((FAIL++)) || true; }
section() { echo ""; echo "── $* ──────────────────────────────────────"; }

# ── 1. YAML Parsing ──────────────────────────────────────────────────────────

if [[ "$JARGON_ONLY" == false ]]; then
  section "1. YAML Parsing"

  if python3 -c "import yaml; yaml.safe_load(open('config.yml'))" 2>/dev/null; then
    ok "config.yml parses as valid YAML"
  else
    fail "config.yml YAML parse error"
  fi

  if python3 -c "import yaml; yaml.safe_load(open('catalog.yml'))" 2>/dev/null; then
    ok "catalog.yml parses as valid YAML"
  else
    fail "catalog.yml YAML parse error"
  fi

  # ── 2. Catalog Agent References ─────────────────────────────────────────────

  section "2. Catalog Agent References"

  agent_paths=$(python3 - <<'EOF'
import yaml, sys
try:
    c = yaml.safe_load(open("catalog.yml"))
    agents = c.get("links", {}).get("agents", [])
    for p in agents:
        print(p)
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
EOF
)

  while IFS= read -r path; do
    if [[ -f "$path" ]]; then
      ok "catalog ref exists: $path"
    else
      fail "catalog ref MISSING: $path"
    fi
  done <<< "$agent_paths"

  # ── 3. Required Files Exist ──────────────────────────────────────────────────

  section "3. Required Copilot Skill Builder Files"

  required_files=(
    "agents/golden-path-intake.md"
    "agents/golden-path-installer.md"
    "templates/plan-card-template.md"
    "tests/check-gpb.sh"
    "config.yml"
    "catalog.yml"
    "SKILL.md"
    "README.md"
    "docs/TESTING.md"
  )

  for f in "${required_files[@]}"; do
    if [[ -f "$f" ]]; then
      ok "file exists: $f"
    else
      fail "MISSING: $f"
    fi
  done

  # ── 4. Prompt Line Counts ────────────────────────────────────────────────────

  section "4. Prompt Line Counts (≤200 each)"

  for f in agents/golden-path-intake.md agents/golden-path-installer.md; do
    if [[ ! -f "$f" ]]; then
      fail "cannot check line count — missing: $f"
      continue
    fi
    count=$(wc -l < "$f")
    if [[ "$count" -le 200 ]]; then
      ok "$f: $count lines (≤200)"
    else
      fail "$f: $count lines — EXCEEDS 200-line limit"
    fi
  done

  # Plan Card template must be ≤12 lines
  if [[ -f "templates/plan-card-template.md" ]]; then
    count=$(wc -l < "templates/plan-card-template.md")
    if [[ "$count" -le 12 ]]; then
      ok "templates/plan-card-template.md: $count lines (≤12)"
    else
      fail "templates/plan-card-template.md: $count lines — EXCEEDS 12-line limit"
    fi
  else
    fail "templates/plan-card-template.md missing — cannot check line count"
  fi

  # ── 5. Config Keys ───────────────────────────────────────────────────────────

  section "5. Required config.yml Keys (golden_path:)"

  required_keys=(
    "golden_path"
    "enabled"
    "max_questions"
    "max_plan_card_lines"
    "max_product_spec_lines"
    "skills_install_dir"
    "undo_manifest_pattern"
    "intake_seeds"
    "intake_model"
    "installer_model"
    "jargon_ban_list"
  )

  config_content=$(cat config.yml)
  for key in "${required_keys[@]}"; do
    if echo "$config_content" | grep -q "^[[:space:]]*${key}[[:space:]]*:"; then
      ok "config key present: $key"
    else
      fail "config key MISSING: $key"
    fi
  done

fi  # end non-jargon-only block

# ── 6. Jargon Scan ───────────────────────────────────────────────────────────

section "6. Jargon Scan (banned terms in user-visible Copilot Skill Builder strings)"

# Read banned terms from config.yml
banned_terms=$(python3 - <<'EOF'
import yaml, sys
try:
    c = yaml.safe_load(open("config.yml"))
    terms = c.get("golden_path", {}).get("jargon_ban_list", [])
    for t in terms:
        print(t)
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
EOF
)

if [[ -z "$banned_terms" ]]; then
  fail "could not read jargon_ban_list from config.yml"
fi

# Extract SKILL.md Copilot Skill Builder section, stripping fenced code blocks
# (bash commands inside code blocks legitimately use technical terms)
extract_golden_section() {
  if [[ ! -f "SKILL.md" ]]; then return; fi
  awk '
    /^## Copilot Skill Builder Mode/ { in_section=1 }
    in_section && /^## / && !/^## Copilot Skill Builder Mode/ { in_section=0 }
    in_section { print }
  ' SKILL.md | awk '
    /^[ \t]*```/ { in_fence = !in_fence; next }
    !in_fence { print }
  '
}

# Extract full content of agent files, stripping fenced code blocks
strip_code_fences() {
  local file="$1"
  if [[ ! -f "$file" ]]; then return; fi
  awk '
    /^[ \t]*```/ { in_fence = !in_fence; next }
    !in_fence { print }
  ' "$file"
}

golden_section_text=$(extract_golden_section)
intake_text=$(strip_code_fences "agents/golden-path-intake.md")
installer_text=$(strip_code_fences "agents/golden-path-installer.md")

scan_text="${golden_section_text}
${intake_text}
${installer_text}"

jargon_found=false
while IFS= read -r term; do
  [[ -z "$term" ]] && continue
  # Use grep with word boundary where possible; multi-word terms use literal match
  if echo "$scan_text" | grep -qi -w "$term" 2>/dev/null || \
     echo "$scan_text" | grep -qi "$term" 2>/dev/null; then
    # Double-check: confirm actual word-level match to reduce false positives
    match=$(echo "$scan_text" | grep -i "$term" | head -3)
    if [[ -n "$match" ]]; then
      fail "banned term found: \"$term\""
      echo "     Context:"
      echo "$match" | head -3 | sed 's/^/       /'
      jargon_found=true
    fi
  else
    ok "no occurrences of banned term: \"$term\""
  fi
done <<< "$banned_terms"

if [[ "$jargon_found" == false && "$JARGON_ONLY" == false ]]; then
  ok "jargon scan complete — zero banned terms in user-visible strings"
fi

# ── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "──────────────────────────────────────────────"
echo "  Results: ${PASS} passed, ${FAIL} failed"
echo "──────────────────────────────────────────────"

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0
