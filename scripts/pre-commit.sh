#!/usr/bin/env bash
# pre-commit.sh — full suite of checks before committing
# Usage: bash scripts/pre-commit.sh
# Add --skip-build to skip the production build (faster, for quick checks)

set -euo pipefail

SKIP_BUILD=false
for arg in "$@"; do
  [[ "$arg" == "--skip-build" ]] && SKIP_BUILD=true
done

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

PASS=0
FAIL=0

run_step() {
  local label="$1"
  shift
  echo -e "\n${CYAN}▶ ${label}${RESET}"
  if "$@"; then
    echo -e "${GREEN}  ✓ ${label} passed${RESET}"
    ((PASS++)) || true
  else
    echo -e "${RED}  ✗ ${label} failed${RESET}"
    ((FAIL++)) || true
  fi
}

echo -e "${CYAN}══════════════════════════════════════════════${RESET}"
echo -e "${CYAN}  Scrollup pre-commit checks${RESET}"
echo -e "${CYAN}══════════════════════════════════════════════${RESET}"

# 1. TypeScript / Astro type check
run_step "TypeScript check (astro check)" npx astro check

# 2. Content validation (frontmatter, sections, duplicates, component coverage, i18n)
run_step "Content validation" npx tsx scripts/check-content.ts

# 3. Internal link check
run_step "Internal links" npx tsx scripts/check-links.ts

# 4. Production build (catches any build-time errors)
if [ "$SKIP_BUILD" = false ]; then
  run_step "Production build" npm run build
else
  echo -e "\n${YELLOW}  ⚠ Skipping production build (--skip-build)${RESET}"
fi

# ── summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}══════════════════════════════════════════════${RESET}"
if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}  ${FAIL} check(s) failed, ${PASS} passed. Fix errors before committing.${RESET}"
  echo -e "${CYAN}══════════════════════════════════════════════${RESET}"
  exit 1
else
  echo -e "${GREEN}  All ${PASS} checks passed. Ready to commit.${RESET}"
  echo -e "${CYAN}══════════════════════════════════════════════${RESET}"
fi
