#!/usr/bin/env bash
#
# Angular UI Skills installer
# Auto-detects supported agents and installs the skills for each.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/mofirojean/angular-ui-skills/master/install.sh | bash
#
# Optional env vars:
#   AUIS_SKILLS    Space-separated list of skills to install (default: both)
#                  e.g. AUIS_SKILLS="primeng-developer" bash install.sh
#   AUIS_REF       Branch/tag to install from (default: master)
#   AUIS_SCOPE     "user" (default) or "workspace" — installs into current directory's
#                  .claude/skills and .gemini/skills if "workspace"
#

set -euo pipefail

REPO="mofirojean/angular-ui-skills"
REF="${AUIS_REF:-master}"
SCOPE="${AUIS_SCOPE:-user}"
SKILLS_ARG="${AUIS_SKILLS:-spartan-ng-developer primeng-developer}"

read -r -a SKILLS <<< "$SKILLS_ARG"

TARBALL_URL="https://github.com/${REPO}/archive/${REF}.tar.gz"
ARCHIVE_PREFIX="angular-ui-skills-${REF}"

# Color helpers (no color if not a tty)
if [ -t 1 ]; then
  GREEN=$(printf '\033[32m'); BOLD=$(printf '\033[1m'); DIM=$(printf '\033[2m'); RESET=$(printf '\033[0m')
else
  GREEN=""; BOLD=""; DIM=""; RESET=""
fi

say() { printf "%s\n" "$*"; }
ok()  { printf "  %s✓%s %s\n" "$GREEN" "$RESET" "$*"; }
hd()  { printf "%s%s%s\n" "$BOLD" "$*" "$RESET"; }
dim() { printf "%s%s%s\n" "$DIM" "$*" "$RESET"; }

# Detect agents and build the target list
declare -a TARGETS=()
declare -a AGENT_NAMES=()

if [ "$SCOPE" = "workspace" ]; then
  CLAUDE_DIR="./.claude"
  GEMINI_DIR="./.gemini"
  CLAUDE_PRESENT_MARKER="./.claude"
  GEMINI_PRESENT_MARKER="./.gemini"
else
  CLAUDE_DIR="${HOME}/.claude"
  GEMINI_DIR="${HOME}/.gemini"
  CLAUDE_PRESENT_MARKER="${HOME}/.claude"
  GEMINI_PRESENT_MARKER="${HOME}/.gemini"
fi

if [ -d "$CLAUDE_PRESENT_MARKER" ]; then
  TARGETS+=("${CLAUDE_DIR}/skills")
  AGENT_NAMES+=("Claude Code")
fi

if [ -d "$GEMINI_PRESENT_MARKER" ]; then
  TARGETS+=("${GEMINI_DIR}/skills")
  AGENT_NAMES+=("Gemini CLI")
fi

if [ ${#TARGETS[@]} -eq 0 ]; then
  cat <<EOF >&2

No supported AI agents detected at ${SCOPE} scope.

This installer looks for:
  - Claude Code:  ${CLAUDE_PRESENT_MARKER}/
  - Gemini CLI:   ${GEMINI_PRESENT_MARKER}/

Install at least one of those CLIs first, or run from a project directory
with AUIS_SCOPE=workspace if you want project-local skills.

For Cursor, Copilot, Codex, or other agents, see the manual recipes at:
  https://github.com/${REPO}#install

EOF
  exit 1
fi

# Pre-flight summary
hd ""
hd "Angular UI Skills installer"
say ""
say "  Scope:   ${SCOPE}"
say "  Source:  ${REPO}@${REF}"
say "  Skills:  ${SKILLS[*]}"
say "  Agents:  ${AGENT_NAMES[*]}"
say ""

# Download tarball once into a temp dir
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

hd "Downloading"
if ! curl -fsSL "$TARBALL_URL" -o "${TMPDIR}/skills.tar.gz"; then
  say "Failed to download $TARBALL_URL" >&2
  exit 1
fi
ok "${REPO}@${REF}"

# Build the list of paths inside the archive to extract
EXTRACT_PATHS=()
for skill in "${SKILLS[@]}"; do
  EXTRACT_PATHS+=("${ARCHIVE_PREFIX}/skills/${skill}")
done

# Extract once into a staging directory, then copy into each target
STAGING="${TMPDIR}/staging"
mkdir -p "$STAGING"
tar -xzf "${TMPDIR}/skills.tar.gz" -C "$STAGING" "${EXTRACT_PATHS[@]}"

# Confirm each requested skill actually exists in the archive
for skill in "${SKILLS[@]}"; do
  if [ ! -d "${STAGING}/${ARCHIVE_PREFIX}/skills/${skill}" ]; then
    say "Skill '${skill}' was not found in the archive at ${REPO}@${REF}." >&2
    exit 1
  fi
done

# Install into every detected agent
say ""
hd "Installing"
for target in "${TARGETS[@]}"; do
  mkdir -p "$target"
  for skill in "${SKILLS[@]}"; do
    src="${STAGING}/${ARCHIVE_PREFIX}/skills/${skill}"
    dst="${target}/${skill}"
    rm -rf "$dst"
    cp -R "$src" "$dst"
    ok "${skill}  →  ${dst}"
  done
done

# Done. Post-install hints per agent.
say ""
hd "Done."
say ""
for agent in "${AGENT_NAMES[@]}"; do
  case "$agent" in
    "Claude Code")
      dim "Claude Code: restart your session for the skills to load."
      ;;
    "Gemini CLI")
      dim "Gemini CLI:  run  /skills reload  then  /skills list  to confirm."
      ;;
  esac
done
say ""
dim "Source:  https://github.com/${REPO}"
dim "Docs:    https://angular-ui-skills-docs.vercel.app"
