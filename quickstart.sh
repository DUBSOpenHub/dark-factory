#!/usr/bin/env bash
set -euo pipefail

SKILL_REPO="DUBSOpenHub/dark-factory"
SKILL_NAME="dark-factory"
SKILL_DIR="$HOME/.copilot/skills/$SKILL_NAME"
SKILL_URL="https://raw.githubusercontent.com/$SKILL_REPO/main/SKILL.md"

echo ""
echo "🏭 Dark Factory"
echo "─────────────────────────────────────────"

if command -v copilot >/dev/null 2>&1; then
  echo "✅ Copilot CLI already installed ($(copilot --version 2>/dev/null || echo 'installed'))"
else
  echo "📦 Installing GitHub Copilot CLI..."
  if [[ "$(uname)" == "Darwin" ]] || [[ "$(uname)" == "Linux" ]]; then
    if command -v brew >/dev/null 2>&1; then
      brew install copilot-cli
    else
      curl -fsSL https://gh.io/copilot-install | bash
    fi
  else
    echo "⚠️  Windows detected — please install manually:"
    echo "   winget install GitHub.Copilot"
    echo "   Then re-run this script."
    exit 1
  fi
  if ! command -v copilot >/dev/null 2>&1; then
    export PATH="$HOME/.local/bin:$PATH"
    if ! command -v copilot >/dev/null 2>&1; then
      echo "❌ Installation failed. Try manually: brew install copilot-cli"
      exit 1
    fi
  fi
  echo "✅ Copilot CLI installed!"
fi

echo "📥 Adding Dark Factory skill..."
mkdir -p "$SKILL_DIR"
if curl -fsSL "$SKILL_URL" -o "$SKILL_DIR/SKILL.md"; then
  echo "✅ Skill installed to $SKILL_DIR"
else
  echo "❌ Failed to download skill. Check your internet connection."
  exit 1
fi

echo ""
echo "─────────────────────────────────────────"
echo "🏭 Launching Copilot CLI..."
echo "   Just type: dark factory"
echo "─────────────────────────────────────────"
echo ""

exec copilot < /dev/tty
