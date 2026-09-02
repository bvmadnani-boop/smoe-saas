#!/usr/bin/env bash
# Install the corporate skills collection at user level (~/.claude/skills),
# making it available in every project on this machine.
#
#   bash .claude/skills/install-corporate-skills.sh
#
set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DST="${1:-$HOME/.claude/skills}"
mkdir -p "$DST"
count=0
for d in "$SRC"/*/; do
  name=$(basename "$d")
  [ -f "$d/SKILL.md" ] || continue
  rm -rf "${DST:?}/$name"
  cp -r "$d" "$DST/"
  count=$((count + 1))
done
echo "Installed $count skills into $DST"
echo "Restart Claude Code (or /clear) to pick them up."
