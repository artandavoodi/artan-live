#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-docs}"

if [ ! -d "$ROOT" ]; then
  echo "Duplicate asset check skipped: $ROOT does not exist"
  exit 0
fi

DUPES="$(find "$ROOT" -type f \( \
  -name '* [0-9].svg' -o \
  -name '* [0-9].png' -o \
  -name '* [0-9].jpg' -o \
  -name '* [0-9].jpeg' -o \
  -name '* [0-9].webp' -o \
  -name '* [0-9].ico' -o \
  -name '* copy.svg' -o \
  -name '* copy.png' -o \
  -name '* copy.jpg' -o \
  -name '* copy.jpeg' -o \
  -name '* copy.webp' -o \
  -name '* copy.ico' -o \
  -name '* copy [0-9].svg' -o \
  -name '* copy [0-9].png' -o \
  -name '* copy [0-9].jpg' -o \
  -name '* copy [0-9].jpeg' -o \
  -name '* copy [0-9].webp' -o \
  -name '* copy [0-9].ico' -o \
  -name '*-copy.svg' -o \
  -name '*-copy.png' -o \
  -name '*-copy.jpg' -o \
  -name '*-copy.jpeg' -o \
  -name '*-copy.webp' -o \
  -name '*-copy.ico' \
\) | sort)"

if [ -n "$DUPES" ]; then
  echo "Duplicate asset files detected:"
  echo "$DUPES"
  echo
  echo "Fix before commit. These are usually Finder/macOS duplicate copies."
  exit 1
fi

echo "Duplicate asset check passed"
