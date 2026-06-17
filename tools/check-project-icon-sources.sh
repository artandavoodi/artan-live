#!/usr/bin/env bash
set -euo pipefail

JSON_FILE="docs/assets/data/projects/projects.json"
MEDIA_ROOT="docs/assets/media/projects"

if [ ! -f "$JSON_FILE" ]; then
  echo "Project icon source check skipped: $JSON_FILE missing"
  exit 0
fi

python3 - <<'PY'
import json
from pathlib import Path

p = Path("docs/assets/data/projects/projects.json")
d = json.loads(p.read_text())

violations = []

for item in d.get("items", []):
    item_id = item.get("id", "unknown")

    icon_paths = []

    cover_icon = (item.get("cover") or {}).get("icon")
    media_icon = (item.get("media") or {}).get("icon")

    if cover_icon:
        icon_paths.append(("cover.icon", cover_icon))
    if media_icon:
        icon_paths.append(("media.icon", media_icon))

    for key, value in (item.get("links") or {}).items():
        if isinstance(value, dict) and value.get("icon"):
            icon_paths.append((f"links.{key}.icon", value["icon"]))

    for label, path in icon_paths:
        if not str(path).startswith("/registry/icons/"):
            violations.append(f"{item_id}: {label} must reference /registry/icons/, got {path}")

if violations:
    print("Project icon source violations:")
    for violation in violations:
        print(violation)
    raise SystemExit(1)

print("Project icon source check passed")
PY

if [ -d "$MEDIA_ROOT" ]; then
  MEDIA_SVGS="$(find "$MEDIA_ROOT" -type f -name '*.svg' | sort)"
  if [ -n "$MEDIA_SVGS" ]; then
    echo "Project media contains copied SVG icons/media:"
    echo "$MEDIA_SVGS"
    echo "Project SVG icons must remain source-owned in docs/registry/icons."
    exit 1
  fi
fi

echo "Project media SVG check passed"
