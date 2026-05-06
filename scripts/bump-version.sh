#!/bin/bash
#
# Sankofa — bump semantic version.
# Uso: bash scripts/bump-version.sh [patch|minor|major]
# Default: patch
#
# Atualiza:
#   - package.json
#   - data/version.js (window.SANKOFA_VERSION + BUILD_DATE)
#   - sw.js (VERSION constant — força refresh do cache)
#   - CHANGELOG.md (move [Unreleased] → [X.Y.Z] data atual)
# Cria commit + tag git.
#
set -e
cd "$(dirname "$0")/.."

LEVEL="${1:-patch}"

if [[ ! "$LEVEL" =~ ^(patch|minor|major)$ ]]; then
  echo "Uso: $0 [patch|minor|major]" >&2
  exit 1
fi

# Leitura da versão atual
CURRENT=$(node -e "console.log(require('./package.json').version)")
IFS='.' read -r MAJ MIN PAT <<< "$CURRENT"

case "$LEVEL" in
  patch) PAT=$((PAT + 1)) ;;
  minor) MIN=$((MIN + 1)); PAT=0 ;;
  major) MAJ=$((MAJ + 1)); MIN=0; PAT=0 ;;
esac

NEW="${MAJ}.${MIN}.${PAT}"
DATE=$(date +%Y-%m-%d)

echo "→ $CURRENT  ⇒  $NEW  ($LEVEL)"

# Verificar workdir limpa
if [[ -n "$(git status --porcelain)" ]]; then
  echo "✗ Working dir não está limpa. Commita ou stash antes de bumpar." >&2
  git status --short
  exit 1
fi

# package.json
node -e "
const fs=require('fs');
const p=require('./package.json');
p.version='$NEW';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
"

# data/version.js
cat > data/version.js <<EOF
// Versão atual do Sankofa.
// Atualizada automaticamente por scripts/bump-version.sh.
window.SANKOFA_VERSION = "$NEW";
window.SANKOFA_BUILD_DATE = "$DATE";
EOF

# sw.js
sed -i.bak -E "s/^const VERSION = \"v[0-9.]+\";/const VERSION = \"v$NEW\";/" sw.js
rm -f sw.js.bak

# CHANGELOG.md — move [Unreleased] para nova entrada com data
python3 - <<EOF
import re, pathlib
p = pathlib.Path('CHANGELOG.md')
text = p.read_text(encoding='utf-8')
new_entry = f"## [Unreleased]\n\n## [$NEW] — $DATE\n"
text = re.sub(r'## \[Unreleased\]\n', new_entry, text, count=1)
p.write_text(text, encoding='utf-8')
EOF

# Commit + tag
git add package.json data/version.js sw.js CHANGELOG.md
git commit -m "chore(release): v$NEW

- $LEVEL bump: $CURRENT → $NEW
- Atualiza package.json, data/version.js, sw.js, CHANGELOG.md"

git tag -a "v$NEW" -m "Sankofa v$NEW"

echo ""
echo "✓ Versão bumpada para $NEW"
echo "✓ Commit + tag v$NEW criados"
echo ""
echo "Próximo passo:"
echo "  git push --follow-tags"
