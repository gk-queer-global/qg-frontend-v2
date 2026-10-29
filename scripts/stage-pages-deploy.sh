#!/usr/bin/env bash
# Copy CRA build output and Pages Functions into a single deploy directory.
#
# Usage: stage-pages-deploy.sh <build-dir> <dest-dir>
set -euo pipefail

usage() { echo "usage: $0 <build-dir> <dest-dir>" >&2; exit 64; }
if [ $# -ne 2 ]; then usage; fi
BUILD=$1
DEST=$2
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

if [ ! -d "$BUILD" ]; then
  echo "::error::build directory not found: $BUILD" >&2
  exit 1
fi
if [ ! -f "$ROOT/functions/_middleware.js" ]; then
  echo "::error::functions/_middleware.js not found" >&2
  exit 1
fi

mkdir -p "$DEST/functions"
cp -a "$BUILD"/. "$DEST"/
cp -a "$ROOT/functions/." "$DEST/functions/"
echo "staged deploy tree at $DEST (build + functions)"
