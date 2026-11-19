#!/usr/bin/env bash
# Starts backend (:4000) and frontend (:5173) together; Ctrl+C stops both.
set -euo pipefail
cd "$(dirname "$0")"
for r in backend frontend; do [ -d "$r/node_modules" ] || (cd "$r" && npm install); done
trap 'kill 0' EXIT
(cd backend && npm run dev) &
(cd frontend && npm run dev) &
wait
