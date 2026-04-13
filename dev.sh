#!/usr/bin/env bash
# Start dev processes for the monorepo.
# Milestone 1: only apps/dashboard has a dev server. Extended in later milestones.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "dev.sh — milestone 1: dashboard only"
echo "later milestones will add: api (8500), wrangler (8501), wrangler-ui (8511)"
echo ""

cd "$ROOT/apps/dashboard"
exec npm run dev
